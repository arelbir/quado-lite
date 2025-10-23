/**
 * Simple Test - Minimal PDF to debug
 */

"use server";

import type { ReportMetadata } from '../core/report-types';
import { renderPDF, createElement, getReactPDFComponents } from '../core/pdf-engine';

export async function generateSimpleTestPDF(): Promise<Buffer> {
  try {
    console.log('[PDF] Starting simple test PDF generation...');
    
    // Import React-PDF
    const ReactPDF = await import('@react-pdf/renderer');
    const React = await import('react');
    console.log('[PDF] Components loaded successfully');
    
    const { Document, Page, Text, View, Font } = ReactPDF;
    
    // Register Roboto font for Turkish character support (from Google Fonts CDN)
    Font.register({
      family: 'Roboto',
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
    });
    
    // Create document synchronously (no async!)
    const doc = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4' },
        React.createElement(
          View,
          { style: { padding: 30, fontFamily: 'Roboto' } },
          React.createElement(
            Text,
            { style: { fontSize: 20, fontFamily: 'Roboto' } },
            'Test: İç Denetimi - Üretim Bölümü'
          ),
          React.createElement(
            Text,
            { style: { fontSize: 12, marginTop: 10, fontFamily: 'Roboto' } },
            'Çevre Yönetimi Denetimi'
          ),
          React.createElement(
            Text,
            { style: { fontSize: 12, marginTop: 10, fontFamily: 'Roboto' } },
            'İş Sağlığı ve Güvenliği'
          )
        )
      )
    );
    
    console.log('[PDF] Document created, rendering...');
    const buffer = await ReactPDF.renderToBuffer(doc);
    console.log('[PDF] Rendered successfully, buffer size:', buffer.length);
    
    return Buffer.from(buffer);
  } catch (error) {
    console.error('[PDF] ERROR:', error);
    console.error('[PDF] ERROR STACK:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}
