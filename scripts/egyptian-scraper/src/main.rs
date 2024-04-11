use csv::Writer;
use scraper::{Html, Node, Selector};

#[derive(serde::Serialize)]
struct Proverb {
    arabic_text: String,
    phonetic_transcription: String,
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

    let edge_case_translation_selector = Selector::parse("span[dir='ltr']").unwrap();
    let mut edge_case_translation_selector_iter = document.select(&edge_case_translation_selector);

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
            phonetic_transcription = edge_case_translation_selector_iter
                .next()
                .unwrap()
                .text()
                .collect();
        }

        let mut english_translation = String::new();
        let mut next_sibling = arabic_element.next_sibling();
        while let Some(node) = next_sibling {
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
    writer.write_record(&["Arabic proverb", "Translation", "English Translation"])?;
    for proverb in proverbs {
        writer.serialize(&proverb)?;
    }

    Ok(())
}
