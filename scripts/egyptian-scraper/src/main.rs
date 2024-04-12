use csv::Writer;
use scraper::{Html, Node, Selector};

#[derive(serde::Serialize)]
struct Proverb {
    #[serde(rename = "Arabic proverb")]
    arabic_text: String,
    #[serde(rename = "Phonetic Transcription")]
    phonetic_transcription: String,
    #[serde(rename = "English Translation")]
    english_translation: String,
}

impl std::fmt::Display for Proverb {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Arabic proverb: {}\nPhonetic Transcription: {}\nEnglish Translation: {}",
            self.arabic_text, self.phonetic_transcription, self.english_translation
        )
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://arabic.desert-sky.net/coll_proverbs.html";
    let response = reqwest::blocking::get(url).unwrap();

    let document = Html::parse_document(&response.text().unwrap());
    let arabic_span_selector = Selector::parse("span.arabic").unwrap();

    let edge_case_phonetic_transcription = Selector::parse("span[dir='ltr']").unwrap();
    let mut edge_case_phonetic_transcription_iter =
        document.select(&edge_case_phonetic_transcription);

    let mut proverbs = Vec::new();

    for arabic_element in document.select(&arabic_span_selector) {
        let arabic_text = arabic_element.text().collect::<String>();

        let mut phonetic_transcription = arabic_element
            .next_sibling()
            .unwrap()
            .value()
            .as_text()
            .unwrap()
            .trim()
            .to_string();
        if phonetic_transcription.is_empty() {
            phonetic_transcription = edge_case_phonetic_transcription_iter
                .next()
                .unwrap()
                .text()
                .collect();
        }
        // remove parenthesis
        phonetic_transcription.pop();
        phonetic_transcription.remove(0);

        let mut english_translation = String::new();
        let mut next_sibling = arabic_element.next_sibling();
        while let Some(node) = next_sibling {
            // takes only Text nodes and ignores Elements nodes like <br>
            if let Node::Text(text_node) = node.value() {
                let text = text_node.trim();
                if !text.is_empty() && !text.starts_with('(') {
                    english_translation = text.to_string();
                    break;
                }
            }
            next_sibling = node.next_sibling();
        }

        let proverb = Proverb {
            arabic_text,
            phonetic_transcription,
            english_translation,
        };

        proverbs.push(proverb);
    }

    // for proverb in proverbs {
    //     println!("{}", proverb);
    //     println!("---");
    // }

    let mut writer = Writer::from_path("proverbs.csv")?;
    for proverb in proverbs {
        writer.serialize(&proverb)?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn general_case() {
        // Arrange
        // Create a sample HTML document with an edge case scenario
        let html = r#"
<br /><br /><span class="arabic" dir="rtl">القرد في عين أمه غزال.</span> (il-'ird fi 3ein ummu ġazaal.)
<br />In his mother’s eye, the monkey is (as beautiful as) a gazelle.  (Comment about mothers' bias or partiality to their children.)
        "#;

        // Act
        // Parse the HTML document
        let document = Html::parse_fragment(html);

        // Extract the arabic proverb
        let arabic_span_selector = Selector::parse("span.arabic").unwrap();
        let arabic_element = document.select(&arabic_span_selector).next().unwrap();
        let arabic_text: String = arabic_element.text().collect();

        // Extract the phonetic transcription
        let phonetic_transcription = arabic_element
            .next_sibling()
            .unwrap()
            .value()
            .as_text()
            .unwrap()
            .trim()
            .to_string();

        // Extract the English translation
        let mut english_translation = String::new();
        let mut next_sibling = arabic_element.next_sibling();
        while let Some(node) = next_sibling {
            // takes only Text nodes and ignores Elements nodes like <br>
            if let Node::Text(text_node) = node.value() {
                let text = text_node.trim();
                // avoids taking phonetic_transcription "(la yuldaġ il-mo'men min goHr marratein.)"
                // the empty string happens in the edge case like the next test fn
                if
                /* !text.is_empty() && */
                !text.starts_with('(') {
                    english_translation = text.to_string();
                    break;
                }
            }
            next_sibling = node.next_sibling();
        }

        // could also iterate on next_siblings not next_sibling and skip 2 nodes to reach the
        // English translation
        let english_translation_with_skip = arabic_element
            .next_siblings()
            .skip(2)
            .next()
            .unwrap()
            .value()
            .as_text()
            .unwrap()
            .trim()
            .to_string();

        // Assert
        assert_eq!(arabic_text, "القرد في عين أمه غزال.");
        assert_eq!(phonetic_transcription, "(il-'ird fi 3ein ummu ġazaal.)");
        assert_eq!(
            english_translation,
            "In his mother’s eye, the monkey is (as beautiful as) a gazelle.  (Comment about mothers' bias or partiality to their children.)"
        );
        assert_eq!(
            english_translation_with_skip,
            "In his mother’s eye, the monkey is (as beautiful as) a gazelle.  (Comment about mothers' bias or partiality to their children.)"
        );
    }

    #[test]
    fn phonetice_transcription_span_edge_case_that_affects_also_english_translation() {
        // Arrange
        // the edge case is in <span dir="ltr">(la yuldaġ il-mo'men min goHr marratein.)</span>,
        // which is normally not wrapped in a span
        let html = r#"
<br /><br /><span class="arabic" dir="rtl">لا يلدغ المؤمن من جحر مرتين.</span> <span dir="ltr">(la yuldaġ il-mo'men min goHr marratein.)</span>
<br />The believer is not bitten from the same hole twice.  (Fool me once, shame on you; fool me twice, shame on me.)
        "#;

        // Act
        let document = Html::parse_fragment(html);

        let arabic_span_selector = Selector::parse("span.arabic").unwrap();
        let arabic_element = document.select(&arabic_span_selector).next().unwrap();
        let arabic_text: String = arabic_element.text().collect();

        let edge_case_phonetic_transcription = Selector::parse("span[dir='ltr']").unwrap();
        let mut edge_case_phonetic_transcription_iter =
            document.select(&edge_case_phonetic_transcription);
        let phonetic_transcription: String = edge_case_phonetic_transcription_iter
            .next()
            .unwrap()
            .text()
            .collect();

        let mut english_translation = String::new();
        let mut next_sibling = arabic_element.next_sibling();
        while let Some(node) = next_sibling {
            // takes only Text nodes and ignores Elements nodes like <br>
            if let Node::Text(text_node) = node.value() {
                let text = text_node.trim();
                // avoids taking phonetic_transcription "(la yuldaġ il-mo'men min goHr marratein.)"
                // and the emtpy text happens because of the phonetic_transcription edge case wich
                // is wrapped in a span
                if !text.is_empty() && !text.starts_with('(') {
                    english_translation = text.to_string();
                    break;
                }
            }
            next_sibling = node.next_sibling();
        }

        // Assert
        assert_eq!(arabic_text, "لا يلدغ المؤمن من جحر مرتين.");
        assert_eq!(
            phonetic_transcription,
            "(la yuldaġ il-mo'men min goHr marratein.)"
        );
        assert_eq!(
            english_translation,
            "The believer is not bitten from the same hole twice.  (Fool me once, shame on you; fool me twice, shame on me.)"
        );
    }
}
