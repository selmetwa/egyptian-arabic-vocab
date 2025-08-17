import fs from "fs";
import path from "path";

const BASE_DIR = "csv-v2";
const DIALECTS = ["egyptian", "levantine", "darija", "modern-standard-arabic"];

const combineFiles = async () => {
  console.log("🚀 Starting to combine all vocabulary files...\n");

  for (const dialect of DIALECTS) {
    console.log(`📁 Processing ${dialect}...`);
    
    const csvDir = path.join(BASE_DIR, dialect, "csv");
    const jsonDir = path.join(BASE_DIR, dialect, "json");

    // Check if directories exist
    if (!fs.existsSync(csvDir) || !fs.existsSync(jsonDir)) {
      console.log(`⚠️  Skipping ${dialect} - directories don't exist`);
      continue;
    }

    await combineCsvFiles(csvDir, dialect);
    await combineJsonFiles(jsonDir, dialect);
    
    console.log(`✅ Completed ${dialect}\n`);
  }

  console.log("🎉 All files combined successfully!");
};

const combineCsvFiles = async (csvDir, dialect) => {
  const csvFiles = fs.readdirSync(csvDir).filter(file => 
    file.endsWith('.csv') && file !== 'all.csv'
  );

  if (csvFiles.length === 0) {
    console.log(`   📄 No CSV files found in ${dialect}`);
    return;
  }

  console.log(`   📄 Combining ${csvFiles.length} CSV files...`);

  let allCsvData = [];
  let hasAudioUrl = false;

  // Process each CSV file
  for (const csvFile of csvFiles) {
    const filePath = path.join(csvDir, csvFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    if (lines.length <= 1) continue; // Skip empty files or header-only files

    const headers = lines[0].split(',');
    const hasAudio = headers.includes('audioUrl');
    if (hasAudio) hasAudioUrl = true;

    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      if (row.length < 3) continue; // Skip invalid rows

      const entry = {
        english: row[0] || '',
        transliteration: row[1] || '',
        arabic: row[2] || '',
        audioUrl: hasAudio ? (row[3] || '') : '',
        source: path.basename(csvFile, '.csv') // Add source file info
      };

      // Skip duplicate or empty entries
      if (entry.english && !isDuplicate(allCsvData, entry)) {
        allCsvData.push(entry);
      }
    }
  }

  // Generate CSV content
  const csvHeaders = hasAudioUrl 
    ? ['english', 'transliteration', 'arabic', 'audioUrl', 'source']
    : ['english', 'transliteration', 'arabic', 'source'];
  
  const csvRows = [csvHeaders.join(',')];
  
  for (const entry of allCsvData) {
    const values = csvHeaders.map(header => {
      const value = entry[header] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  // Write combined CSV
  const outputPath = path.join(csvDir, 'all.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'));
  console.log(`   ✅ CSV: ${allCsvData.length} entries → all.csv`);
};

const combineJsonFiles = async (jsonDir, dialect) => {
  const jsonFiles = fs.readdirSync(jsonDir).filter(file => 
    file.endsWith('.json') && file !== 'all.json'
  );

  if (jsonFiles.length === 0) {
    console.log(`   📄 No JSON files found in ${dialect}`);
    return;
  }

  console.log(`   📄 Combining ${jsonFiles.length} JSON files...`);

  let allJsonData = [];

  // Process each JSON file
  for (const jsonFile of jsonFiles) {
    const filePath = path.join(jsonDir, jsonFile);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      if (Array.isArray(jsonData)) {
        // Add source info to each entry
        const entriesWithSource = jsonData.map(entry => ({
          ...entry,
          source: path.basename(jsonFile, '.json')
        }));
        
        // Filter duplicates
        for (const entry of entriesWithSource) {
          if (entry.english && !isDuplicate(allJsonData, entry)) {
            allJsonData.push(entry);
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error reading ${jsonFile}: ${error.message}`);
    }
  }

  // Write combined JSON
  const outputPath = path.join(jsonDir, 'all.json');
  fs.writeFileSync(outputPath, JSON.stringify(allJsonData, null, 2));
  console.log(`   ✅ JSON: ${allJsonData.length} entries → all.json`);
};

// Helper function to parse CSV row (handles quoted fields)
const parseCSVRow = (row) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

// Helper function to check for duplicates
const isDuplicate = (arr, newEntry) => {
  return arr.some(existing => 
    existing.english === newEntry.english && 
    existing.transliteration === newEntry.transliteration &&
    existing.arabic === newEntry.arabic
  );
};

// Run the combiner
combineFiles().catch(console.error);
