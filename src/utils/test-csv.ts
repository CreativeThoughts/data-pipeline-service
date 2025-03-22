import { csvToJson, csvStringToJson } from './csvToJson';
import path from 'path';

async function testCsvConversion() {
  try {
    // Test file conversion
    const filePath = path.join(__dirname, 'example.csv');
    const jsonFromFile = await csvToJson(filePath);
    console.log('Converted from file:', JSON.stringify(jsonFromFile, null, 2));

    // Test string conversion
    const csvString = `name,age,city
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago`;
    
    const jsonFromString = await csvStringToJson(csvString);
    console.log('\nConverted from string:', JSON.stringify(jsonFromString, null, 2));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error:', errorMessage);
  }
}

testCsvConversion();
