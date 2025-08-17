import puppeteer from "puppeteer";
import pluralize from "pluralize";
import fs from "fs";

// nouns for now
const pages = [
  'animals', 'house', 'city', 'clothes', 'colors', 'education', 'emotions_pers', 'food',
  'geog', 'body', 'mankind', 'arts', 'medicine', 'nature', 'religion', 'sports', 'tech',
  'time', 'work', 'm_gen', 'm_gen2', 'm_gen3', 'm_crime', 'm_govt', 'm_war',
]

const scrapePage = async(page) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const webpage = await browser.newPage();

  await webpage.goto(`https://arabic.desert-sky.net/${page}.html`, {
    waitUntil: "domcontentloaded",
  });

  const pageTitle = await webpage.$$eval('h1', element => element[0].textContent.trim());
  const cleanPageTitle = pageTitle.toLowerCase()
    .replace(/ /g, '_')
    .replace(/\//g, '_and_')
    .replace(/&/g, '_and_');

  // Wait for the table to be rendered
  await webpage.waitForSelector('table');

  // Extract data from the table
  const data = await webpage.$$eval('table tr', rows => {
    return rows.map(row => {
      return Array.from(row.getElementsByTagName('td')).map(column => column.textContent.trim());
    });
  });

  const egyptianOutput = []; // For Egyptian Arabic data
  const msaOutput = []; // For Modern Standard Arabic data

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

  for (const row of data) {
    const english = row[0]?.split(',')[0] || '';
    const standardArabic = row[1] || '';
    const standardArabicTransliteration = row[2] || '';
    const egyptianArabic = row[3] || '';
    const egyptianArabicTransliteration = row[4] || '';

    const shouldIgnore = standardArabicTransliteration &&
      (
        standardArabicTransliteration.includes('(a)') ||
        standardArabicTransliteration.includes('-') ||
        english === '' ||
        standardArabicTransliteration.includes('s.t.')
      );

    if (shouldIgnore) continue;

    if (isPluralTransliteration(standardArabicTransliteration) || isPluralTransliteration(egyptianArabicTransliteration)) {
      // Handle plural forms
      let splitStandardArabic = standardArabic && standardArabic.split("(ج)");
      let splitStandardArabicTransliteration = standardArabicTransliteration && standardArabicTransliteration.split("(pl.)");
      let splitEgyptianArabic = egyptianArabic && egyptianArabic.split("(ج)");
      let splitEgyptianArabicTransliteration = egyptianArabicTransliteration && egyptianArabicTransliteration.split("(pl.)");

      // Singular forms
      const cleanEnglish = english.replace(/\([^()]*\)/g, '');
      const pluralEnglish = pluralize(cleanEnglish);

      // Egyptian Arabic - Singular
      if (cleanEnglish !== '' && cleanEnglish !== 's') {
        egyptianOutput.push({
          english: cleanEnglish,
          transliteration: generateEgyptianArabicTransliteration(
            (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[0]),
            (splitStandardArabicTransliteration && splitStandardArabicTransliteration[0])
          ),
          arabic: generateEgyptianArabic(
            (splitEgyptianArabic && splitEgyptianArabic[0]), 
            (splitStandardArabic && splitStandardArabic[0])
          )
        });
      }

      // Egyptian Arabic - Plural
      if (pluralEnglish !== '' && pluralEnglish !== 's') {
        egyptianOutput.push({
          english: pluralEnglish,
          transliteration: generateEgyptianArabicTransliteration(
            (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[1]),
            (splitStandardArabicTransliteration && splitStandardArabicTransliteration[1])
          ),
          arabic: generateEgyptianArabic(
            (splitEgyptianArabic && splitEgyptianArabic[1]), 
            (splitStandardArabic && splitStandardArabic[1])
          )
        });
      }

      // Modern Standard Arabic - Singular
      if (cleanEnglish !== '' && cleanEnglish !== 's') {
        msaOutput.push({
          english: cleanEnglish,
          transliteration: generateStandardArabicTransliteration(
            (splitStandardArabicTransliteration && splitStandardArabicTransliteration[0]),
            (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[0])
          ),
          arabic: generateStandardArabic(
            (splitStandardArabic && splitStandardArabic[0]), 
            (splitEgyptianArabic && splitEgyptianArabic[0])
          )
        });
      }

      // Modern Standard Arabic - Plural
      if (pluralEnglish !== '' && pluralEnglish !== 's') {
        msaOutput.push({
          english: pluralEnglish,
          transliteration: generateStandardArabicTransliteration(
            (splitStandardArabicTransliteration && splitStandardArabicTransliteration[1]),
            (splitEgyptianArabicTransliteration && splitEgyptianArabicTransliteration[1])
          ),
          arabic: generateStandardArabic(
            (splitStandardArabic && splitStandardArabic[1]), 
            (splitEgyptianArabic && splitEgyptianArabic[1])
          )
        });
      }
    } else {
      // Handle regular (non-plural) entries
      const cleanEnglish = english.replace(/\([^()]*\)/g, '');
      
      if (cleanEnglish !== '' && cleanEnglish !== 's') {
        // Egyptian Arabic entry
        egyptianOutput.push({
          english: cleanEnglish,
          transliteration: generateEgyptianArabicTransliteration(egyptianArabicTransliteration, standardArabicTransliteration),
          arabic: generateEgyptianArabic(egyptianArabic, standardArabic)
        });

        // Modern Standard Arabic entry
        msaOutput.push({
          english: cleanEnglish,
          transliteration: generateStandardArabicTransliteration(standardArabicTransliteration, egyptianArabicTransliteration),
          arabic: generateStandardArabic(standardArabic, egyptianArabic)
        });
      }
    }
  }

  function convertToCSV(arr) {
    if (arr.length === 0) return '';
    
    const headers = Object.keys(arr[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of arr) {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  function generateTitle(pageTitle) {
    if (page.includes('m_gen') && page !== 'm_gen') {
      const numberMatch = page.match(/\d+/);
      return `${pageTitle.replace(/arabic_|_vocabulary/gi, '')}_${parseInt(numberMatch[0])}`;
    }
    return pageTitle.replace(/arabic_|_vocabulary/gi, '');
  }

  const formattedPageTitle = generateTitle(cleanPageTitle);

  // Save Egyptian Arabic data
  if (egyptianOutput.length > 0) {
    // Ensure directories exist
    if (!fs.existsSync('csv-v2/egyptian/json')) {
      fs.mkdirSync('csv-v2/egyptian/json', { recursive: true });
    }
    if (!fs.existsSync('csv-v2/egyptian/csv')) {
      fs.mkdirSync('csv-v2/egyptian/csv', { recursive: true });
    }

    // Save JSON
    const egyptianJsonString = JSON.stringify(egyptianOutput, null, 2);
    fs.writeFileSync(`csv-v2/egyptian/json/${formattedPageTitle}.json`, egyptianJsonString);
    console.log(`✅ Egyptian JSON saved: ${formattedPageTitle}.json (${egyptianOutput.length} entries)`);

    // Save CSV
    const egyptianCsv = convertToCSV(egyptianOutput);
    fs.writeFileSync(`csv-v2/egyptian/csv/${formattedPageTitle}.csv`, egyptianCsv);
    console.log(`✅ Egyptian CSV saved: ${formattedPageTitle}.csv`);
  }

  // Save Modern Standard Arabic data
  if (msaOutput.length > 0) {
    // Ensure directories exist
    if (!fs.existsSync('csv-v2/modern-standard-arabic/json')) {
      fs.mkdirSync('csv-v2/modern-standard-arabic/json', { recursive: true });
    }
    if (!fs.existsSync('csv-v2/modern-standard-arabic/csv')) {
      fs.mkdirSync('csv-v2/modern-standard-arabic/csv', { recursive: true });
    }

    // Save JSON
    const msaJsonString = JSON.stringify(msaOutput, null, 2);
    fs.writeFileSync(`csv-v2/modern-standard-arabic/json/${formattedPageTitle}.json`, msaJsonString);
    console.log(`✅ MSA JSON saved: ${formattedPageTitle}.json (${msaOutput.length} entries)`);

    // Save CSV
    const msaCsv = convertToCSV(msaOutput);
    fs.writeFileSync(`csv-v2/modern-standard-arabic/csv/${formattedPageTitle}.csv`, msaCsv);
    console.log(`✅ MSA CSV saved: ${formattedPageTitle}.csv`);
  }

  await browser.close();
};

// Main execution
const scrapeAllPages = async () => {
  console.log(`🚀 Starting to scrape ${pages.length} pages from arabic.desert-sky.net...`);
  console.log(`📁 Saving Egyptian Arabic → csv-v2/egyptian/`);
  console.log(`📁 Saving Modern Standard Arabic → csv-v2/modern-standard-arabic/`);
  console.log(`\n`);

  for (const page of pages) {
    try {
      console.log(`🔄 Scraping: ${page}.html`);
      await scrapePage(page);
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`❌ Error scraping ${page}:`, error);
    }
  }
  
  console.log('\n🎉 All pages scraped and organized!');
};

scrapeAllPages().catch(console.error);
