import puppeteer from "puppeteer";
import fs from "fs";

const egyptian_sections = [
  "egyptian-arabic/adjectives/",
  "egyptian-arabic/verbs/",
  "egyptian-arabic/adverbs/",
  "egyptian-arabic/numbers/",
  "egyptian-arabic/animals/",
  "egyptian-arabic/weather/",
  "egyptian-arabic/language/",
  "egyptian-arabic/recreation-and-relaxation/",
  "egyptian-arabic/cars-and-other-transportation/",
  "egyptian-arabic/health-and-medicine/",
  "egyptian-arabic/school-and-education/",
  "egyptian-arabic/work-and-professions/",
  "egyptian-arabic/food-and-drink/",
  "egyptian-arabic/around-the-house/",
  "egyptian-arabic/clothing-jewelry-and-accessories/",
  "egyptian-arabic/the-human-body-and-describing-people/",
  "egyptian-arabic/family/",
  "egyptian-arabic/life-and-death/",
]
const levantine_sections = [
  "levantine-arabic/clothing-jewelry-and-accessories-2/",
  "levantine-arabic/the-human-body-and-describing-people-2/",
  "levantine-arabic/family-2/",
  "levantine-arabic/numbers-2/",
  "levantine-arabic/school-and-education-2/",
  "levantine-arabic/work-and-professions/",
  "levantine-arabic/health-and-medicine-2/",
  "levantine-arabic/food-and-drink-2/",
  "levantine-arabic/cars-and-other-transportation-2/",
  "levantine-arabic/recreation-and-relaxation-2/",
  "levantine-arabic/animals-2/",
  "levantine-arabic/adjectives-2/",
  "levantine-arabic/adverbs-2/",
  "levantine-arabic/verbs-2/",
  "levantine-arabic/weather-2/",
  "levantine-arabic/language-2/",
  "levantine-arabic/life-and-death-2/",
  "levantine-arabic/around-the-house-2/",
  "levantine-arabic/cars-and-other-transportation-2/",
  "levantine-arabic/health-and-medicine-2/",
  "levantine-arabic/school-and-education-2/",
  "levantine-arabic/work-and-professions-2/",
  "levantine-arabic/food-and-drink-2/",
]
const darija_sections = [
  "maghrebi-arabic/numbers-6/",
  "maghrebi-arabic/work-and-professions-4/",
  "maghrebi-arabic/clothing-jewelry-and-accessories-5/",
  "maghrebi-arabic/school-and-education-5/",
  "maghrebi-arabic/the-human-body-and-describing-people-5/",
  "maghrebi-arabic/food-and-drink-5/",
  "maghrebi-arabic/family-5/",
  "maghrebi-arabic/life-and-death-5/",
  "maghrebi-arabic/recreation-and-relaxation-5/",
  "maghrebi-arabic/verbs-5/",
  "maghrebi-arabic/animals-5/",
  "maghrebi-arabic/weather-5/",
  "maghrebi-arabic/language-5/",
  "maghrebi-arabic/cars-and-other-transportation-5/",
  "maghrebi-arabic/health-and-medicine-5/",
  "maghrebi-arabic/adverbs-5/",
  "maghrebi-arabic/adjectives-5/",
  "maghrebi-arabic/around-the-house-4/"
]
const BASE_URL = "https://resources.lingualism.com/";

const scrapePage = async (section, dialectName) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const webpage = await browser.newPage();

  const fullUrl = `${BASE_URL}${section}`;
  console.log(`Scraping: ${fullUrl}`);

  await webpage.goto(fullUrl, {
    waitUntil: "domcontentloaded",
  });

  // Wait for the table to be rendered
  await webpage.waitForSelector('tbody.row-striping');

  // Extract data from the table
  const data = await webpage.$$eval('tbody.row-striping tr', rows => {
    return rows.map(row => {
      const columns = row.querySelectorAll('td');
      if (columns.length < 4) return null;

      // Extract the audio URL from the onclick attribute
      let audioUrl = '';
      const audioButton = columns[3].querySelector('input[onclick*="play_mp3"]');
      if (audioButton) {
        const onclickValue = audioButton.getAttribute('onclick');
        if (onclickValue) {
          const urlMatch = onclickValue.match(/'(http[^']+\.mp3)'/);
          if (urlMatch) {
            audioUrl = urlMatch[1];
          }
        }
      }

      return {
        english: columns[0]?.textContent?.trim() || '',
        transliteration: columns[1]?.textContent?.trim() || '',
        arabic: columns[2]?.textContent?.trim() || '',
        audioUrl: audioUrl
      };
    }).filter(item => item !== null && item.english !== '');
  });

  console.log(`Found ${data.length} entries for ${section}`);

  const output = []; // Array to store vocabulary entries

  for (const row of data) {
    if (!row) continue; // Skip null rows
    
    // Simply add each row as-is without plural handling
    const entry = {
      english: row.english,
      transliteration: row.transliteration,
      arabic: row.arabic,
      audioUrl: row.audioUrl
    };
    // @ts-ignore
    output.push(entry);
  }

  // Generate clean filename from section
  const cleanSectionName = section
    .replace(/egyptian-arabic\//, '')
    .replace(/levantine-arabic\//, '')
    .replace(/maghrebi-arabic\//, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_');

  // Save as JSON
  const jsonString = JSON.stringify(output, null, 2);
  const jsonPath = `csv-v2/${dialectName}/json/${cleanSectionName}.json`;
  
  // Ensure directory exists
  if (!fs.existsSync(`csv-v2/${dialectName}/json`)) {
    fs.mkdirSync(`csv-v2/${dialectName}/json`, { recursive: true });
  }
  
  fs.writeFileSync(jsonPath, jsonString);
  console.log(`JSON file saved: ${jsonPath}`);

  // Convert to CSV
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

  // Save as CSV
  const csv = convertToCSV(output);
  const csvPath = `csv-v2/${dialectName}/csv/${cleanSectionName}.csv`;
  
  // Ensure directory exists
  if (!fs.existsSync(`csv-v2/${dialectName}/csv`)) {
    fs.mkdirSync(`csv-v2/${dialectName}/csv`, { recursive: true });
  }
  
  fs.writeFileSync(csvPath, csv);
  console.log(`CSV file saved: ${csvPath}`);

  await browser.close();
  return output;
};

// Main execution
const scrapeAllSections = async () => {
  const dialectConfigs = [
    { name: 'egyptian', sections: egyptian_sections },
    { name: 'levantine', sections: levantine_sections },
    { name: 'darija', sections: darija_sections }
  ];

  const totalSections = dialectConfigs.reduce((sum, config) => sum + config.sections.length, 0);
  console.log(`Starting to scrape ${totalSections} sections across ${dialectConfigs.length} dialects...`);
  
  for (const dialectConfig of dialectConfigs) {
    console.log(`\n🔄 Starting ${dialectConfig.name} dialect (${dialectConfig.sections.length} sections)...`);
    
    for (const section of dialectConfig.sections) {
      try {
        await scrapePage(section, dialectConfig.name);
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error scraping ${section}:`, error);
      }
    }
    
    console.log(`✅ Completed ${dialectConfig.name} dialect!`);
  }
  
  console.log('\n🎉 All scraping completed!');
};

// Run the scraper
scrapeAllSections().catch(console.error);