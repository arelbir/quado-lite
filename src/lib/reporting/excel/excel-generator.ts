/**
 * Excel Generator - ExcelJS Wrapper
 * 
 * Centralized Excel generation logic
 * Separates Excel concerns from PDF
 */

"use server";

import type { ReportMetadata, ReportSection } from '../core/report-types';

/**
 * Generate Excel Workbook
 */
export async function generateExcel(
  metadata: ReportMetadata,
  sections: ReportSection[]
): Promise<Buffer> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  
  // Create worksheets for each section
  sections.forEach((section) => {
    // Limit worksheet name to 31 characters (Excel limit)
    const sheetName = section.title.substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName);
    
    // Add title row
    const titleRow = worksheet.addRow([section.title]);
    titleRow.font = { size: 16, bold: true };
    titleRow.height = 30;
    
    worksheet.addRow([]); // Empty row
    
    // Add columns
    worksheet.columns = section.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));
    
    // Style header row
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Add data rows
    section.data.forEach((item) => {
      worksheet.addRow(item);
    });
    
    // Add summary if exists
    if (section.summary) {
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow(['Özet']);
      summaryRow.font = { bold: true };
      
      Object.entries(section.summary).forEach(([key, value]) => {
        worksheet.addRow([key, value]);
      });
    }
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
