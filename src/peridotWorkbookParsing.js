/*
 * Workbook and table parsing helper.
 * 
 * This module isolates CSV/TSV/XLSX/XLS parsing into a normalized workbook model. It detects file type, parses sheets, normalizes display rows/headers, removes empty rows/columns, and avoids preserving spreadsheet formatting that Peridot does not use.
 * 
 * Important relationships:
 * - `App.jsx` calls this when a user uploads a table/workbook.
 * - `peridotWorkbookMapping.js` consumes the normalized workbook model for user-guided mapping.
 * 
 * Maintenance cautions:
 * - Keep parser output plain and predictable. Avoid carrying spreadsheet formatting, formulas, or unsafe prototype-bearing objects into app state.
 */

/**
 * Peridot workbook/table parsing helper.
 *
 * Pass E1 scope:
 * - isolate the Excel parser dependency in one helper module;
 * - parse CSV, TSV, XLSX, and XLS into a common workbook-like model;
 * - expose all Excel sheets rather than silently choosing one;
 * - ignore formatting and merged-cell styling;
 * - read saved/displayed cell values only; do not recalculate formulas;
 * - ignore empty rows and empty columns;
 * - warn about blank, duplicate, or malformed headers;
 * - keep this module pure and unmounted. No React state, no upload UI changes,
 *   no mapping-modal changes, and no import behavior changes yet.
 *
 * Research-data rule:
 * CSV/TSV files are represented as one-sheet workbooks. Excel files are
 * represented as multi-sheet workbooks. Later passes can use this shared shape
 * to build workbook-aware mapping, Letter_ID joins, and exact person/place
 * lookup joins.
 *
 * Dependency note:
 * Excel parsing is isolated here so the parser dependency can be replaced later
 * if Peridot moves beyond local/research-prototype use.
 */

import * as XLSX from 'xlsx';

export const PERIDOT_SUPPORTED_TABLE_EXTENSIONS = Object.freeze([
  'csv',
  'tsv',
  'xlsx',
  'xls',
]);

export const PERIDOT_TABLE_FILE_TYPES = Object.freeze({
  csv: 'csv',
  tsv: 'tsv',
  excel: 'excel',
  unsupported: 'unsupported',
});

export const PERIDOT_WORKBOOK_WARNINGS = Object.freeze({
  formulasNotRecalculated:
    'Peridot reads saved workbook values only. It does not recalculate Excel formulas. If your workbook contains formulas, save it from Excel after recalculation before upload.',
  formattingIgnored:
    'Peridot ignores Excel formatting, merged-cell styling, hidden rows/columns, colors, and cell comments.',
  firstRowHeaders:
    'Peridot treats the first non-empty row in each sheet as the header row. Sheets with title rows above the headers should be cleaned before upload.',
});

function asText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  return String(value).trim();
}

function getFileExtension(fileName = '') {
  const cleanName = asText(fileName).toLowerCase();
  const match = cleanName.match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

export function detectPeridotTableFileType(fileName = '') {
  const extension = getFileExtension(fileName);

  if (extension === 'csv') return PERIDOT_TABLE_FILE_TYPES.csv;
  if (extension === 'tsv' || extension === 'tab') return PERIDOT_TABLE_FILE_TYPES.tsv;
  if (extension === 'xlsx' || extension === 'xls') return PERIDOT_TABLE_FILE_TYPES.excel;

  return PERIDOT_TABLE_FILE_TYPES.unsupported;
}

function stripUnsafeObjectKey(value) {
  const key = asText(value);
  if (!key) return '';
  if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
    return `_${key}`;
  }
  return key;
}

function makePlainObject(entries = []) {
  return Object.assign(
    Object.create(null),
    Object.fromEntries(entries.map(([key, value]) => [stripUnsafeObjectKey(key), value]))
  );
}

function isEmptyCell(value) {
  return asText(value) === '';
}

function isEmptyRow(row = []) {
  return row.every(isEmptyCell);
}

function normalize2dRows(rows = []) {
  return rows.map((row) => (Array.isArray(row) ? row : []).map((cell) => asText(cell)));
}

function removeTrailingEmptyRows(rows = []) {
  const cleaned = [...rows];

  while (cleaned.length && isEmptyRow(cleaned[cleaned.length - 1])) {
    cleaned.pop();
  }

  return cleaned;
}

function getNonEmptyColumnIndexes(rows = []) {
  const indexes = new Set();

  rows.forEach((row) => {
    row.forEach((cell, index) => {
      if (!isEmptyCell(cell)) indexes.add(index);
    });
  });

  return Array.from(indexes).sort((a, b) => a - b);
}

function keepColumns(rows = [], indexes = []) {
  return rows.map((row) => indexes.map((index) => row[index] ?? ''));
}

function findFirstNonEmptyRowIndex(rows = []) {
  return rows.findIndex((row) => !isEmptyRow(row));
}

function uniqueHeaderName(header, index, seenCounts, warnings) {
  const raw = asText(header);
  const baseName = raw || `Column_${index + 1}`;

  if (!raw) {
    warnings.push({
      code: 'blank_header',
      message: `Blank header found in column ${index + 1}; Peridot renamed it to ${baseName}.`,
      columnIndex: index,
      replacementHeader: baseName,
    });
  }

  const currentCount = seenCounts.get(baseName) || 0;
  seenCounts.set(baseName, currentCount + 1);

  if (currentCount === 0) return baseName;

  const deduped = `${baseName}_${currentCount + 1}`;
  warnings.push({
    code: 'duplicate_header',
    message: `Duplicate header “${baseName}” found; Peridot renamed the duplicate to “${deduped}”.`,
    columnIndex: index,
    originalHeader: baseName,
    replacementHeader: deduped,
  });
  return deduped;
}

function buildRowsFromMatrix(matrix = [], sheetName = 'Uploaded table') {
  const warnings = [];
  const normalized = removeTrailingEmptyRows(normalize2dRows(matrix));
  const firstNonEmptyRowIndex = findFirstNonEmptyRowIndex(normalized);

  if (firstNonEmptyRowIndex === -1) {
    return {
      sheetName,
      headers: [],
      rows: [],
      previewRows: [],
      rowCount: 0,
      columnCount: 0,
      headerRowIndex: null,
      warnings: [
        {
          code: 'empty_sheet',
          message: `Sheet “${sheetName}” does not contain any usable rows.`,
        },
      ],
    };
  }

  if (firstNonEmptyRowIndex > 0) {
    warnings.push({
      code: 'leading_empty_rows_ignored',
      message: `Sheet “${sheetName}” has ${firstNonEmptyRowIndex} leading empty row(s). Peridot used the first non-empty row as headers.`,
      ignoredRowCount: firstNonEmptyRowIndex,
    });
  }

  const usableMatrix = normalized.slice(firstNonEmptyRowIndex);
  const nonEmptyColumnIndexes = getNonEmptyColumnIndexes(usableMatrix);
  const compactMatrix = keepColumns(usableMatrix, nonEmptyColumnIndexes);
  const headerCells = compactMatrix[0] || [];
  const seenCounts = new Map();
  const headers = headerCells.map((header, index) => uniqueHeaderName(header, index, seenCounts, warnings));

  if (!headers.length) {
    warnings.push({
      code: 'missing_headers',
      message: `Sheet “${sheetName}” does not contain a usable header row.`,
    });
  }

  const dataRows = compactMatrix
    .slice(1)
    .filter((row) => !isEmptyRow(row))
    .map((row) =>
      makePlainObject(
        headers.map((header, index) => [header, asText(row[index])])
      )
    );

  return {
    sheetName,
    headers,
    rows: dataRows,
    previewRows: dataRows.slice(0, 5),
    rowCount: dataRows.length,
    columnCount: headers.length,
    headerRowIndex: firstNonEmptyRowIndex,
    warnings,
  };
}

/**
 * Parse a delimited text string into a simple 2D matrix.
 *
 * This parser supports quoted fields, escaped double-quotes, CRLF/LF line
 * endings, and configurable delimiters. It intentionally does not attempt to
 * auto-clean or infer scholarly data values.
 */
export function parseDelimitedTextToMatrix(text = '', delimiter = ',') {
  const input = String(text ?? '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows;
}

export function parseDelimitedWorkbook({ text = '', fileName = 'Uploaded table', delimiter = ',' } = {}) {
  const fileType = delimiter === '\t' ? PERIDOT_TABLE_FILE_TYPES.tsv : PERIDOT_TABLE_FILE_TYPES.csv;
  const sheet = buildRowsFromMatrix(parseDelimitedTextToMatrix(text, delimiter), 'Uploaded table');

  return {
    fileType,
    fileName,
    workbookName: fileName,
    sheets: [sheet],
    sheetCount: 1,
    warnings: [],
  };
}

function worksheetToDisplayMatrix(worksheet) {
  if (!worksheet) return [];

  return XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  });
}

function workbookHasFormulas(workbook) {
  return (workbook?.SheetNames || []).some((sheetName) => {
    const sheet = workbook.Sheets?.[sheetName];
    if (!sheet) return false;

    return Object.keys(sheet).some((cellAddress) => {
      if (cellAddress.startsWith('!')) return false;
      return Boolean(sheet[cellAddress]?.f);
    });
  });
}

function getExcelWorkbookWarnings(workbook) {
  const warnings = [
    {
      code: 'excel_saved_values_only',
      message: PERIDOT_WORKBOOK_WARNINGS.formulasNotRecalculated,
    },
    {
      code: 'excel_formatting_ignored',
      message: PERIDOT_WORKBOOK_WARNINGS.formattingIgnored,
    },
    {
      code: 'first_non_empty_row_headers',
      message: PERIDOT_WORKBOOK_WARNINGS.firstRowHeaders,
    },
  ];

  if (workbookHasFormulas(workbook)) {
    warnings.push({
      code: 'formulas_detected',
      message:
        'This workbook appears to contain formulas. Peridot will use saved/displayed values and will not recalculate those formulas.',
    });
  }

  return warnings;
}

export function parseExcelWorkbookArrayBuffer(arrayBuffer, fileName = 'Uploaded workbook') {
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: false,
    cellFormula: true,
    cellNF: false,
    cellStyles: false,
    WTF: false,
  });

  const sheets = (workbook.SheetNames || []).map((sheetName) =>
    buildRowsFromMatrix(worksheetToDisplayMatrix(workbook.Sheets[sheetName]), sheetName)
  );

  return {
    fileType: PERIDOT_TABLE_FILE_TYPES.excel,
    fileName,
    workbookName: fileName,
    sheets,
    sheetCount: sheets.length,
    warnings: getExcelWorkbookWarnings(workbook),
  };
}

export async function parsePeridotTableFile(file) {
  const fileName = file?.name || 'Uploaded table';
  const fileType = detectPeridotTableFileType(fileName);

  if (fileType === PERIDOT_TABLE_FILE_TYPES.unsupported) {
    return {
      fileType,
      fileName,
      workbookName: fileName,
      sheets: [],
      sheetCount: 0,
      warnings: [
        {
          code: 'unsupported_file_type',
          message: 'Peridot supports CSV, TSV, XLSX, and XLS files for mapped table imports.',
        },
      ],
    };
  }

  if (fileType === PERIDOT_TABLE_FILE_TYPES.csv || fileType === PERIDOT_TABLE_FILE_TYPES.tsv) {
    const text = await file.text();
    return parseDelimitedWorkbook({
      text,
      fileName,
      delimiter: fileType === PERIDOT_TABLE_FILE_TYPES.tsv ? '\t' : ',',
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  return parseExcelWorkbookArrayBuffer(arrayBuffer, fileName);
}

export function summarizePeridotWorkbook(workbookModel) {
  const sheets = workbookModel?.sheets || [];
  const totalRows = sheets.reduce((sum, sheet) => sum + (sheet.rowCount || 0), 0);
  const totalColumns = sheets.reduce((sum, sheet) => sum + (sheet.columnCount || 0), 0);
  const sheetWarnings = sheets.flatMap((sheet) =>
    (sheet.warnings || []).map((warning) => ({
      ...warning,
      sheetName: sheet.sheetName,
    }))
  );

  return {
    fileType: workbookModel?.fileType || PERIDOT_TABLE_FILE_TYPES.unsupported,
    fileName: workbookModel?.fileName || '',
    sheetCount: sheets.length,
    totalRows,
    totalColumns,
    sheets: sheets.map((sheet) => ({
      sheetName: sheet.sheetName,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      headers: sheet.headers,
      warningCount: (sheet.warnings || []).length,
    })),
    warnings: [...(workbookModel?.warnings || []), ...sheetWarnings],
  };
}

export function flattenWorkbookHeaders(workbookModel) {
  return (workbookModel?.sheets || []).flatMap((sheet) =>
    (sheet.headers || []).map((header) => ({
      sheetName: sheet.sheetName,
      header,
      key: `${sheet.sheetName}::${header}`,
    }))
  );
}
