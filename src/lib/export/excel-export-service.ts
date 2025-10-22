"use server";

import ExcelJS from 'exceljs';

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  style?: Partial<ExcelJS.Style>;
}

export interface ExportOptions {
  filename: string;
  sheetName: string;
  data: any[];
  columns: ColumnDefinition[];
  title?: string;
  includeTimestamp?: boolean;
}

/**
 * Ana export fonksiyonu
 * Styled Excel dosyası oluşturur
 */
export async function exportToExcel(options: ExportOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName);

  // Worksheet properties
  worksheet.properties.defaultRowHeight = 20;

  let currentRow = 1;

  // Title (opsiyonel)
  if (options.title) {
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = options.title;
    titleRow.getCell(1).font = { size: 16, bold: true };
    titleRow.height = 30;
    currentRow += 2;
  }

  // Timestamp (opsiyonel)
  if (options.includeTimestamp) {
    const timestampRow = worksheet.getRow(currentRow);
    timestampRow.getCell(1).value = `Oluşturulma: ${new Date().toLocaleString('tr-TR')}`;
    timestampRow.getCell(1).font = { size: 10, italic: true };
    currentRow += 2;
  }

  // Columns
  worksheet.columns = options.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
    style: col.style || {},
  }));

  // Header styling
  const headerRow = worksheet.getRow(currentRow);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }, // Blue
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Data rows
  options.data.forEach((item, index) => {
    const row = worksheet.addRow(item);
    
    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' }, // Light gray
      };
    }
    
    row.alignment = { vertical: 'middle' };
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: currentRow, column: 1 },
    to: { row: currentRow, column: options.columns.length },
  };

  // Borders
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= currentRow) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Multi-sheet export
 * Birden fazla sheet içeren Excel dosyası oluşturur
 */
export async function exportMultiSheet(sheets: ExportOptions[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheetOptions of sheets) {
    const worksheet = workbook.addWorksheet(sheetOptions.sheetName);
    worksheet.properties.defaultRowHeight = 20;

    // Columns
    worksheet.columns = sheetOptions.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Data
    sheetOptions.data.forEach((item) => {
      worksheet.addRow(item);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * CSV export (daha hafif alternatif)
 */
export async function exportToCSV(options: ExportOptions): Promise<string> {
  const headers = options.columns.map((col) => col.header).join(',');
  const rows = options.data.map((item) => {
    return options.columns
      .map((col) => {
        const value = item[col.key];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return [headers, ...rows].join('\n');
}
