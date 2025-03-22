import { parse } from 'csv-parse';
import fs from 'fs';
import { promisify } from 'util';
import { validateCsvFile, validateCsvContent, CsvValidationOptions } from './csvValidator';

const readFile = promisify(fs.readFile);

interface CsvToJsonOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  headers?: string[] | boolean;
  validation?: CsvValidationOptions;
}

/**
 * Converts a CSV file to JSON
 * @param filePath - Path to the CSV file
 * @param options - Conversion options
 * @returns Promise resolving to an array of objects representing the CSV data
 */
export async function csvToJson(
  filePath: string, 
  options: CsvToJsonOptions = {}
): Promise<Record<string, any>[]> {
  try {
    // Validate the CSV file if validation options are provided
    if (options.validation) {
      const validationResult = await validateCsvFile(filePath, options.validation);
      if (!validationResult.isValid) {
        throw new Error(
          `CSV validation failed:\n${validationResult.errors
            .map(err => `Row ${err.row}${err.column ? `, Column ${err.column}` : ''}: ${err.message}`)
            .join('\n')}`
        );
      }
    }

    // Read the CSV file
    const fileContent = await readFile(filePath, 'utf-8');

    // Default options
    const parseOptions = {
      delimiter: options.delimiter || ',',
      skip_empty_lines: options.skipEmptyLines !== false,
      trim: options.trimValues !== false,
      columns: options.headers === false ? false : true
    };

    // Return a promise that resolves with the parsed JSON
    return new Promise((resolve, reject) => {
      parse(fileContent, parseOptions, (error, records) => {
        if (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        } else {
          resolve(records);
        }
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read or parse CSV file: ${errorMessage}`);
  }
}

/**
 * Converts a CSV string to JSON
 * @param csvString - CSV content as a string
 * @param options - Conversion options
 * @returns Promise resolving to an array of objects representing the CSV data
 */
export async function csvStringToJson(
  csvString: string,
  options: CsvToJsonOptions = {}
): Promise<Record<string, any>[]> {
  try {
    // Validate the CSV content if validation options are provided
    if (options.validation) {
      const validationResult = await validateCsvContent(csvString, options.validation);
      if (!validationResult.isValid) {
        throw new Error(
          `CSV validation failed:\n${validationResult.errors
            .map(err => `Row ${err.row}${err.column ? `, Column ${err.column}` : ''}: ${err.message}`)
            .join('\n')}`
        );
      }
    }
    // Default options
    const parseOptions = {
      delimiter: options.delimiter || ',',
      skip_empty_lines: options.skipEmptyLines !== false,
      trim: options.trimValues !== false,
      columns: options.headers === false ? false : true
    };

    // Return a promise that resolves with the parsed JSON
    return new Promise((resolve, reject) => {
      parse(csvString, parseOptions, (error, records) => {
        if (error) {
          reject(new Error(`Failed to parse CSV string: ${error.message}`));
        } else {
          resolve(records);
        }
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse CSV string: ${errorMessage}`);
  }
}
