import { csvToJson, csvStringToJson } from './csvToJson';
import { CsvValidationOptions } from './csvValidator';
import path from 'path';

async function testCsvConversion() {
  try {
    console.log('1. Testing valid CSV file conversion:');
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
      validation: validationOptions,
      trimValues: true
    });
    console.log('✓ Success! Converted data:', JSON.stringify(jsonFromFile, null, 2));

    console.log('\n2. Testing CSV string conversion:');
    const csvString = `name,age,city
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago`;
    
    const jsonFromString = await csvStringToJson(csvString, {
      validation: validationOptions,
      trimValues: true
    });
    console.log('✓ Success! Converted data:', JSON.stringify(jsonFromString, null, 2));

    console.log('\n3. Testing invalid data validation:');
    console.log('Testing with invalid age type...');
    const invalidCsvString = `name,age,city
John Doe,invalid,New York`;
    try {
      await csvStringToJson(invalidCsvString, {
        validation: validationOptions
      });
      console.log('✗ Error: Should have failed validation');
    } catch (error) {
      console.log('✓ Success! Caught validation error:', error instanceof Error ? error.message : String(error));
    }

    console.log('\nTesting with missing required column...');
    const missingColumnCsv = `name,city
John Doe,New York`;
    try {
      await csvStringToJson(missingColumnCsv, {
        validation: validationOptions
      });
      console.log('✗ Error: Should have failed validation');
    } catch (error) {
      console.log('✓ Success! Caught validation error:', error instanceof Error ? error.message : String(error));
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error:', errorMessage);
  }
}

testCsvConversion();
