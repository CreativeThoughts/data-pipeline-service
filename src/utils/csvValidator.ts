import fs from 'fs';
import { parse } from 'csv-parse';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export interface CsvValidationOptions {
  requiredColumns?: string[];
  columnTypes?: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
  maxRowLength?: number;
  allowEmptyValues?: boolean;
}

export interface ValidationError {
  row: number;
  column?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  columnCount: number;
  rowCount: number;
}

/**
 * Validates the structure and content of a CSV file
 */
export async function validateCsvFile(
  filePath: string,
  options: CsvValidationOptions = {}
): Promise<ValidationResult> {
  try {
    const fileContent = await readFile(filePath, 'utf-8');
    return validateCsvContent(fileContent, options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read CSV file: ${errorMessage}`);
  }
}

/**
 * Validates CSV content provided as a string
 */
export async function validateCsvContent(
  csvContent: string,
  options: CsvValidationOptions = {}
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    columnCount: 0,
    rowCount: 0
  };

  return new Promise((resolve, reject) => {
    let firstRow = true;
    // First, validate the headers
    const firstLine = csvContent.split('\n')[0];
    const headerRow = firstLine.split(',').map(h => h.trim());
    
    if (options.requiredColumns) {
      const missingColumns = options.requiredColumns.filter(
        col => !headerRow.includes(col)
      );
      if (missingColumns.length > 0) {
        result.errors.push({
          row: 0,
          message: `Missing required columns: ${missingColumns.join(', ')}`
        });
        reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
        return;
      }
    }

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: false, // Don't allow inconsistent columns
      trim: true,
      relax_quotes: true,
      on_record: (record: Record<string, string>, context: { lines: number }) => {
        // Validate data types
        if (options.columnTypes) {
          for (const [column, expectedType] of Object.entries(options.columnTypes)) {
            const value = record[column];
            if (value !== undefined && value.trim() !== '') {
              if (!validateDataType(value.trim(), expectedType)) {
                result.errors.push({
                  row: context.lines,
                  column,
                  message: `Invalid ${expectedType} value '${value}' in column '${column}'`
                });
                throw new Error(`Invalid ${expectedType} value '${value}' in column '${column}'`);
              }
            }
          }
        }
        return record;
      }
    });

    let headers: string[] = [];
    let rowIndex = 0;

    parser.on('headers', (headerRow: string[]) => {
      headers = headerRow.filter(h => h !== ''); // Filter out empty columns
      result.columnCount = headers.length;
      firstRow = false;
    });

    parser.on('data', (row: Record<string, string>) => {
      rowIndex++;
      
      // Skip validation for first row as it's the header
      if (firstRow) {
        firstRow = false;
        return;
      }

      // Validate data types
      if (options.columnTypes) {
        Object.entries(options.columnTypes).forEach(([column, expectedType]) => {
          const value = row[column];
          if (value !== undefined && value.trim() !== '') {
            if (!validateDataType(value.trim(), expectedType)) {
              result.errors.push({
                row: rowIndex,
                column,
                message: `Invalid ${expectedType} value '${value}' in column '${column}'`
              });
              reject(new Error(`Invalid ${expectedType} value '${value}' in column '${column}'`));
              return;
            }
          }
        });
      }

      // Check for empty values
      if (!options.allowEmptyValues) {
        Object.entries(row).forEach(([column, value]) => {
          if (value === undefined || value.trim() === '') {
            result.errors.push({
              row: rowIndex,
              column,
              message: `Empty value not allowed in column '${column}'`
            });
          }
        });
      }

      // Check maximum row length
      const currentRowLength = Object.keys(row).length;
      if (options.maxRowLength && currentRowLength > options.maxRowLength) {
        result.errors.push({
          row: rowIndex,
          message: `Row exceeds maximum length of ${options.maxRowLength}`
        });
      }

      // Validate data types and empty values
      for (const [column, value] of Object.entries(row)) {
        // Check for empty values
        if (!options.allowEmptyValues && !value.trim()) {
          result.errors.push({
            row: rowIndex,
            column,
            message: `Empty value not allowed in column '${column}'`
          });
          reject(new Error(`Empty value not allowed in column '${column}'`));
          return;
        }

        // Validate data types
        if (options.columnTypes?.[column]) {
          const type = options.columnTypes[column];
          if (!validateDataType(value, type)) {
            result.errors.push({
              row: rowIndex,
              column,
              message: `Invalid ${type} value '${value}' in column '${column}'`
            });
            reject(new Error(`Invalid ${type} value '${value}' in column '${column}'`));
            return;
          }
        }
      }
    });

    parser.on('end', () => {
      result.rowCount = rowIndex;
      result.isValid = result.errors.length === 0;
      
      // If there are validation errors, reject the promise
      if (!result.isValid) {
        const errorMessage = result.errors
          .map(err => `Row ${err.row}${err.column ? `, Column ${err.column}` : ''}: ${err.message}`)
          .join('\n');
        reject(new Error(`CSV validation failed:\n${errorMessage}`));
        return;
      }
      
      resolve(result);
    });

    parser.on('error', (error) => {
      result.errors.push({
        row: rowIndex,
        message: `Parsing error: ${error.message}`
      });
      result.isValid = false;
      reject(new Error(`CSV parsing error: ${error.message}`));
    });

    parser.write(csvContent);
    parser.end();
  });
}

function validateDataType(value: string, type: string): boolean {
  const trimmedValue = value.trim();
  switch (type) {
    case 'number':
      return !isNaN(Number(trimmedValue)) && trimmedValue !== '';
    case 'boolean':
      return ['true', 'false', '0', '1'].includes(trimmedValue.toLowerCase());
    case 'date':
      return !isNaN(Date.parse(trimmedValue));
    case 'string':
      return trimmedValue !== '';
    default:
      return false;
  }
}
