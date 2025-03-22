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

  return new Promise((resolve) => {
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: false, // Don't allow inconsistent columns
      trim: true
    });

    let headers: string[] = [];
    let rowIndex = 0;

    parser.on('header', (headerRow: string[]) => {
      headers = headerRow.filter(h => h !== ''); // Filter out empty columns
      result.columnCount = headers.length;

      // Validate required columns
      if (options.requiredColumns) {
        const missingColumns = options.requiredColumns.filter(
          col => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          result.errors.push({
            row: 0,
            message: `Missing required columns: ${missingColumns.join(', ')}`
          });
        }
      }
    });

    parser.on('data', (row: Record<string, string>) => {
      rowIndex++;
      const rowValues = Object.values(row).filter(v => v !== '');
      const rowLength = rowValues.length;

      // Check row length consistency
      if (rowLength !== result.columnCount) {
        result.errors.push({
          row: rowIndex,
          message: `Inconsistent column count: expected ${result.columnCount}, got ${rowLength}`
        });
      }

      // Check maximum row length
      if (options.maxRowLength && rowLength > options.maxRowLength) {
        result.errors.push({
          row: rowIndex,
          message: `Row exceeds maximum length of ${options.maxRowLength}`
        });
      }

      // Validate data types and empty values
      Object.entries(row).forEach(([column, value]) => {
        // Check for empty values
        if (!options.allowEmptyValues && !value.trim()) {
          result.errors.push({
            row: rowIndex,
            column,
            message: `Empty value not allowed in column '${column}'`
          });
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
          }
        }
      });
    });

    parser.on('end', () => {
      result.rowCount = rowIndex;
      result.isValid = result.errors.length === 0;
      resolve(result);
    });

    parser.on('error', (error) => {
      result.errors.push({
        row: rowIndex,
        message: `Parsing error: ${error.message}`
      });
      result.isValid = false;
      resolve(result);
    });

    parser.write(csvContent);
    parser.end();
  });
}

function validateDataType(value: string, type: string): boolean {
  switch (type) {
    case 'number':
      return !isNaN(Number(value)) && value.trim() !== '';
    case 'boolean':
      return ['true', 'false', '0', '1'].includes(value.toLowerCase());
    case 'date':
      return !isNaN(Date.parse(value));
    case 'string':
      return true;
    default:
      return false;
  }
}
