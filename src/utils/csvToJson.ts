import { parse } from 'csv-parse';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

interface CsvToJsonOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  headers?: string[] | boolean;
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
