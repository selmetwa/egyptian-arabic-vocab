import puppeteer from "puppeteer";
import fs from "fs";

// nouns for now
const pages = [
  'animals', 'house', 'city', 'clothes', 'colors', 'education', 'emotions_pers', 'food',
  'geog', 'body', 'mankind', 'arts', 'medicine', 'nature', 'religion', 'sports', 'tech',
  'time', 'work', 'm_gen', 'm_gen2', 'm_gen3', 'm_crime', 'm_govt', 'm_war',
]

const scrapePage = async(page, index) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const webpage = await browser.newPage();

  await webpage.goto(`https://arabic.desert-sky.net/${page}.html`, {
    waitUntil: "domcontentloaded",
  });

  const title = await webpage.title();

  function cleanAndConvertToSnakeCase(inputText, wordsToRemove) {
    const nonEnglishRegex = /[^a-zA-Z\s]/g;

    // Remove non-English text
    let cleanedText = inputText.replace(nonEnglishRegex, '');

    // Remove specified words
    wordsToRemove.forEach(word => {
      const wordRegex = new RegExp('\\b' + word + '\\b', 'gi');
      cleanedText = cleanedText.replace(wordRegex, '');
    });

    // Convert to snake case
    let snakeCaseText = cleanedText.toLowerCase().replace(/\s/g, '_');

    // Remove leading and trailing underscores
    snakeCaseText = snakeCaseText.replace(/^_+|_+$/g, '');

    return snakeCaseText;
  }

  const anglifiedTitle = cleanAndConvertToSnakeCase(title, ['Arabic', 'vocabulary']);

  // Wait for the table to be rendered
  await webpage.waitForSelector('table');

  // Extract data from the table
  const data = await webpage.$$eval('table tr', rows => {
    return rows.map(row => {
      return Array.from(row.getElementsByTagName('td')).map(column => column.textContent.trim());
    });
  });

  const output = []

  function isEmpty(str) {
    return (!str || str.length === 0 || str === "''");
  }

  function isPluralTransliteration(str) {
    if (!str) return false;

    return str.includes('(pl.)');
  }

  function generateStandardArabic(standardArabic, egyptianArabic) {
    if (!!standardArabic && !isEmpty(standardArabic.trim())) {
      return standardArabic.trim().replace(/\([^()]*\)/g, '');
    }

    if (!!egyptianArabic && !isEmpty(egyptianArabic.trim())) {
      return egyptianArabic.trim().replace(/\([^()]*\)/g, '');
    }

    return ''
  }

  function generateStandardArabicTransliteration(standardArabic, egyptianArabic) {
    if (standardArabic && !isEmpty(standardArabic.trim())) {
      return standardArabic.trim().replace(/\([^()]*\)/g, '');
    }

    if (egyptianArabic && !isEmpty(egyptianArabic.trim())) {
      return egyptianArabic.trim().replace(/\([^()]*\)/g, '');
    }

    return ''
  }

  function generateEgyptianArabic(standardArabic, egyptianArabic) {
    if (egyptianArabic && !isEmpty(egyptianArabic.trim())) {
      return egyptianArabic.trim().replace(/\([^()]*\)/g, '');
    }

    if (standardArabic && !isEmpty(standardArabic.trim())) {
      return standardArabic.trim().replace(/\([^()]*\)/g, '');
    }

    return ''
  }

  function generateEgyptianArabicTransliteration(standardArabic, egyptianArabic) {
    if (egyptianArabic && !isEmpty(egyptianArabic.trim())) {
      return egyptianArabic.trim().replace(/\([^()]*\)/g, '');
    }

    if (standardArabic && !isEmpty(standardArabic.trim())) {
      return standardArabic.trim().replace(/\([^()]*\)/g, '');
    }

    return ''
  }

  for (const row of data) {
    const english = row[0];
    const standardArabic = row[1];
    const standardArabicTransliteration = row[2];
    const egyptianArabic = row[3];
    const egyptianArabicTransliteration = row[4];

    const shouldIgnore = standardArabicTransliteration &&
      (
        standardArabicTransliteration.includes('(a)') ||
        standardArabicTransliteration.includes('-') ||
        english === '' ||
        standardArabicTransliteration.includes('s.t.')
      );

    if (isPluralTransliteration(standardArabicTransliteration) || isPluralTransliteration(egyptianArabicTransliteration) && !shouldIgnore) {
      const firstObj = {}
      const secondObj = {};

      // split the string into singular and plural
      let splitStandardArabic = standardArabic && standardArabic.split("(ج)");
      let splitStandardArabicTransliteration = standardArabicTransliteration && standardArabicTransliteration.split("(pl.)");
      let splitEgyptianArabic = egyptianArabic && egyptianArabic.split("(ج)");
      let splitEgyptianArabicTransliteration = egyptianArabicTransliteration && egyptianArabicTransliteration.split("(pl.)");

      firstObj.english = english;
      firstObj.standardArabic = generateStandardArabic((splitEgyptianArabic && splitStandardArabic[0]), (splitEgyptianArabic && splitStandardArabic[0]));
      firstObj.standardArabicTransliteration = generateStandardArabicTransliteration(
        (splitStandardArabicTransliteration && splitStandardArabicTransliteration[0]),
        (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[0])
      );
      firstObj.egyptianArabic = generateEgyptianArabic((splitEgyptianArabic && splitEgyptianArabic[0]), (splitStandardArabic && splitStandardArabic[0]));
      firstObj.egyptianArabicTransliteration = generateEgyptianArabicTransliteration(
        (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[0]),
        (splitStandardArabicTransliteration && splitStandardArabicTransliteration[0])
      );

      // assign plural values
      secondObj.english = english + 's';
      secondObj.standardArabic = generateStandardArabic((splitStandardArabic && splitStandardArabic[1]), (splitEgyptianArabic && splitEgyptianArabic[1]));
      secondObj.standardArabicTransliteration = generateStandardArabicTransliteration(
        (splitStandardArabicTransliteration && splitStandardArabicTransliteration[1]),
        (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[1])
      );
      secondObj.egyptianArabic = generateEgyptianArabic((splitEgyptianArabic && splitEgyptianArabic[1]), (splitStandardArabic && splitStandardArabic[1]));
      secondObj.egyptianArabicTransliteration = generateEgyptianArabicTransliteration(
        (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[1]),
        (splitStandardArabicTransliteration && splitStandardArabicTransliteration[1])
      );

      if (firstObj.english !== '' && firstObj.english !== 's') {
        output.push(firstObj);
      }
      if (secondObj.english !== '' && secondObj.english !== 's') {
        output.push(secondObj);
      }
    } else if (!shouldIgnore) {
      const obj = {};
      obj.english = english;
      obj.standardArabic = generateStandardArabic(standardArabic, egyptianArabic);
      obj.standardArabicTransliteration = generateStandardArabicTransliteration(standardArabicTransliteration, egyptianArabicTransliteration);
      obj.egyptianArabic = generateEgyptianArabic(standardArabic, egyptianArabic);
      obj.egyptianArabicTransliteration = generateEgyptianArabicTransliteration(standardArabicTransliteration, egyptianArabicTransliteration);

      if (obj.english !== '' && obj.english !== 's') {
        output.push(obj);
      }
    }
  }

  function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.slice(1).map(it => {
      return Object.values(it).toString()
    }).join('\n')
  }

  const csv = convertToCSV(output);

  fs.writeFile(`csv/${anglifiedTitle}_${index}.csv`, csv, function(err) {
    if (err) return console.log(err);
    console.log(`file saved ${page}.csv`);
  });

  await browser.close();
};

for (const page of pages) {
  await scrapePage(page, pages.indexOf(page));
}