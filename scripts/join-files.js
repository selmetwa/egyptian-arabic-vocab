import fs from "fs";
import path from "path";

const csvDir = '/Users/sherifelmetwally/Desktop/scraping/csv';

// List all CSV files in the directory
const csvFiles = fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'));
console.log(csvFiles);
let combinedData = '';
let headersSet = false;

csvFiles.forEach((file, index) => {
  const filePath = path.join(csvDir, file);
  const fileData = fs.readFileSync(filePath, 'utf8');

  const [headers, ...rows] = fileData.split('\n').filter(Boolean);

  if (!headersSet) {
    combinedData += headers + '\n';
    headersSet = true;
  }

  combinedData += rows.join('\n') + '\n';
});

// Save the combined data to a new CSV file
const outputFilePath = path.join(csvDir, 'combined.csv');
fs.writeFileSync(outputFilePath, combinedData.trim(), 'utf8');

console.log(`Combined CSV saved as ${outputFilePath}`);