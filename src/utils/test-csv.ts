import { csvToJson, csvStringToJson } from './csvToJson';
import { CsvValidationOptions } from './csvValidator';
import path from 'path';

async function testCsvConversion() {
  try {
    // Define validation options
    const validationOptions: CsvValidationOptions = {
      requiredColumns: ['name', 'age', 'city'],
      columnTypes: {
        age: 'number',
        name: 'string',
        city: 'string'
      },
      allowEmptyValues: false
    };

    // Test file conversion with validation
    const filePath = path.join(__dirname, 'example.csv');
    const jsonFromFile = await csvToJson(filePath, {
      validation: validationOptions
    });
    console.log('Converted from file:', JSON.stringify(jsonFromFile, null, 2));

    // Test string conversion with validation
    const csvString = `name,age,city
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago`;
    
    const jsonFromString = await csvStringToJson(csvString, {
      validation: validationOptions
    });
    console.log('\nConverted from string:', JSON.stringify(jsonFromString, null, 2));

    // Test with invalid data to demonstrate validation
    const invalidCsvString = `name,age,city
John Doe,invalid,New York`;
    try {
      await csvStringToJson(invalidCsvString, {
        validation: validationOptions
      });
    } catch (error) {
      console.log('\nValidation error (expected):', error instanceof Error ? error.message : String(error));
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error:', errorMessage);
  }
}

testCsvConversion();
