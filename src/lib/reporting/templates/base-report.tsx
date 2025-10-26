/**
 * Base Report Template
 * Foundation template that all reports extend
 */

"use server";

import type { ReportMetadata, ReportSection } from '../core/report-types';

export interface BaseReportOptions {
  metadata: ReportMetadata;
  sections: ReportSection[];
  pageSize?: 'A4' | 'LETTER';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Create Base Report
 * All report templates use this as foundation
 * Uses direct React.createElement (no async components!)
 */
export async function createBaseReport(options: BaseReportOptions): Promise<Buffer> {
  const { metadata, sections, pageSize = 'A4', orientation = 'portrait' } = options;
  
  // Import React-PDF
  const ReactPDF = await import('@react-pdf/renderer');
  const React = await import('react');
  const { Document, Page, Text, View, Font } = ReactPDF;
  
  // Register Roboto font for Turkish support
  Font.register({
    family: 'Roboto',
    src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
  });
  
  // Build document synchronously (no async!)
  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: pageSize, orientation, style: { padding: 30, fontFamily: 'Roboto', fontSize: 10 } },
      // Header
      React.createElement(
        View,
        { style: { marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 } },
        React.createElement(
          Text,
          { style: { fontSize: 18, marginBottom: 10, fontFamily: 'Roboto' } },
          metadata.title
        ),
        React.createElement(
          Text,
          { style: { fontSize: 9, color: '#666', fontFamily: 'Roboto' } },
          `Oluşturulma: ${metadata.generatedAt.toLocaleString('tr-TR')}`
        ),
        React.createElement(
          Text,
          { style: { fontSize: 9, color: '#666', fontFamily: 'Roboto' } },
          `Oluşturan: ${metadata.generatedBy.name ?? metadata.generatedBy.email}`
        )
      ),
      // Sections
      ...sections.map((section, sIndex) =>
        React.createElement(
          View,
          { key: sIndex, style: { marginTop: 15 } },
          React.createElement(
            Text,
            { style: { fontSize: 14, marginBottom: 8, fontFamily: 'Roboto', color: '#2563EB' } },
            section.title
          ),
          section.data.length > 0
            ? React.createElement(
                View,
                { style: { marginVertical: 10, border: '1px solid #e5e7eb' } },
                // Table Header
                React.createElement(
                  View,
                  { style: { flexDirection: 'row', backgroundColor: '#2563EB', minHeight: 25, alignItems: 'center' } },
                  ...section.columns.map((col, cIndex) =>
                    React.createElement(
                      Text,
                      {
                        key: cIndex,
                        style: {
                          padding: 5,
                          fontSize: 9,
                          color: '#fff',
                          fontFamily: 'Roboto',
                          flex: col.width ? col.width / 20 : 1,
                        },
                      },
                      col.header
                    )
                  )
                ),
                // Table Rows
                ...section.data.map((row, rIndex) =>
                  React.createElement(
                    View,
                    {
                      key: rIndex,
                      style: {
                        flexDirection: 'row',
                        borderBottom: '1px solid #e5e7eb',
                        minHeight: 25,
                        alignItems: 'center',
                        backgroundColor: rIndex % 2 === 1 ? '#f9fafb' : '#fff',
                      },
                    },
                    ...section.columns.map((col, cIndex) =>
                      React.createElement(
                        Text,
                        {
                          key: cIndex,
                          style: {
                            padding: 5,
                            fontSize: 8,
                            fontFamily: 'Roboto',
                            flex: col.width ? col.width / 20 : 1,
                          },
                        },
                        String(row[col.key] ?? '-')
                      )
                    )
                  )
                )
              )
            : React.createElement(
                Text,
                { style: { fontSize: 9, color: '#999', padding: 10, fontFamily: 'Roboto' } },
                'Veri bulunamadı.'
              ),
          // Summary
          section.summary
            ? React.createElement(
                View,
                { style: { marginTop: 10, padding: 8, backgroundColor: '#f3f4f6' } },
                React.createElement(
                  Text,
                  { style: { fontSize: 9, marginBottom: 4, fontFamily: 'Roboto' } },
                  'Özet:'
                ),
                ...Object.entries(section.summary).map(([key, value], i) =>
                  React.createElement(
                    Text,
                    { key: i, style: { fontSize: 8, marginBottom: 2, fontFamily: 'Roboto' } },
                    `${key}: ${value}`
                  )
                )
              )
            : null
        )
      ),
      // Footer
      React.createElement(
        Text,
        {
          style: {
            position: 'absolute',
            bottom: 20,
            left: 30,
            right: 30,
            textAlign: 'center',
            fontSize: 8,
            color: '#999',
            fontFamily: 'Roboto',
          },
          fixed: true,
        },
        `${metadata.generatedAt.toLocaleDateString('tr-TR')}`
      )
    )
  );
  
  // Render to buffer
  const buffer = await ReactPDF.renderToBuffer(doc);
  return buffer;
}
