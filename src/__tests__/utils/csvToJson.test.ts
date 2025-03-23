import { csvToJson, csvStringToJson } from '../../utils/csvToJson';
import { CsvValidationOptions } from '../../utils/csvValidator';
import path from 'path';

describe('CSV to JSON Conversion', () => {
  const validationOptions: CsvValidationOptions = {
    requiredColumns: ['name', 'age', 'city'],
    columnTypes: {
      age: 'number',
      name: 'string',
      city: 'string'
    },
    allowEmptyValues: false
  };

  describe('File Conversion', () => {
    const filePath = path.join(__dirname, '../../utils/example.csv');

    it('should successfully convert a valid CSV file to JSON', async () => {
      const result = await csvToJson(filePath, {
        validation: validationOptions,
        trimValues: true
      });
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        name: 'John Doe',
        age: '30',
        city: 'New York'
      });
    });
  });

  describe('String Conversion', () => {
    it('should successfully convert a valid CSV string to JSON', async () => {
      const csvString = `name,age,city
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago`;

      const result = await csvStringToJson(csvString, {
        validation: validationOptions,
        trimValues: true
      });

      expect(result).toHaveLength(3);
      expect(result[1]).toEqual({
        name: 'Jane Smith',
        age: '25',
        city: 'Los Angeles'
      });
    });
  });

  describe('Validation', () => {
    it('should reject invalid data types', async () => {
      const invalidCsvString = `name,age,city
John Doe,invalid,New York`;

      await expect(csvStringToJson(invalidCsvString, {
        validation: validationOptions
      })).rejects.toThrow('Invalid number value');
    });

    it('should reject missing required columns', async () => {
      const missingColumnCsv = `name,city
John Doe,New York`;

      await expect(csvStringToJson(missingColumnCsv, {
        validation: validationOptions
      })).rejects.toThrow('Missing required columns');
    });
  });
});
