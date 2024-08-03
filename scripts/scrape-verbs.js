import puppeteer from "puppeteer";
import pluralize from "pluralize";
import fs from "fs";

const scrapePage = async(page) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const webpage = await browser.newPage();

  await webpage.goto(`https://arabic.desert-sky.net/verbs.html`, {
    waitUntil: "domcontentloaded",
  });

  // Wait for the table to be rendered
  await webpage.waitForSelector('table');

  // Extract data from the table
  const data = await webpage.$$eval('table tr', rows => {
    return rows.map(row => {
      return Array.from(row.getElementsByTagName('td')).map(column => column.textContent.trim());
    });
  });

  function isEmpty(str) {
    return (!str || str.length === 0 || str === "''");
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

  function generateEgyptianArabic(egyptianArabic, standardArabic) {
    if (egyptianArabic && !isEmpty(egyptianArabic.trim())) {
      return egyptianArabic.trim().replace(/\([^()]*\)/g, '');
    }

    if (standardArabic && !isEmpty(standardArabic.trim())) {
      return standardArabic.trim().replace(/\([^()]*\)/g, '');
    }

    return ''
  }

  function generateEgyptianArabicTransliteration(egyptianArabic, standardArabic) {
    if (egyptianArabic && !isEmpty(egyptianArabic.trim())) {
      return egyptianArabic.trim().replace(/\([^()]*\)/g, '');
    }

    if (standardArabic && !isEmpty(standardArabic.trim())) {
      return standardArabic.trim().replace(/\([^()]*\)/g, '');
    }

    return ''
  }

  function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.slice(1).map(it => {
      return Object.values(it).toString()
    }).join('\n')
  }

  const output = [];
  for (const row of data) {
    const english = row[0].split(',')[0];
    const standardArabic = row[1];
    const standardArabicTransliteration = row[2];
    const egyptianArabic = row[3];
    const egyptianArabicTransliteration = row[4];

    const obj = {};
    obj.english = english.replace(/\([^()]*\)/g, '');
    obj.standardArabic = generateStandardArabic(standardArabic, egyptianArabic);
    obj.standardArabicTransliteration = generateStandardArabicTransliteration(standardArabicTransliteration, egyptianArabicTransliteration);
    obj.egyptianArabic = generateEgyptianArabic(egyptianArabic, standardArabic);
    obj.egyptianArabicTransliteration = generateEgyptianArabicTransliteration(egyptianArabicTransliteration, standardArabicTransliteration);

    if (obj.english !== '' && obj.english !== 's') {
      output.push(obj);
    }
  }

  const jsonString = JSON.stringify(output)
  fs.writeFile(`json/verbs.json`, jsonString, function(err) {
    if (err) return console.log(err);
    console.log(`file saved verbs.json`);
  });

  const csv = convertToCSV(output);

  fs.writeFile(`csv/verbs.csv`, csv, function(err) {
    if (err) return console.log(err);
    console.log(`file saved verbs.csv`);
  });
  console.log({ data })
  await browser.close();
};

await scrapePage();