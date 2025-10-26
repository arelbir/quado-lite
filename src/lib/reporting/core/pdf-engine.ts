/**
 * PDF Engine - Core React-PDF Wrapper
 * 
 * Centralizes all React-PDF imports and rendering logic
 * Provides a clean, type-safe interface for PDF generation
 */

"use server";

import type { ReactElement } from 'react';

/**
 * Render a React element to PDF buffer
 * 
 * @param component - React element to render (or Promise of React element)
 * @returns PDF buffer
 */
export async function renderPDF(component: ReactElement | Promise<ReactElement>): Promise<Buffer> {
  const ReactPDF = await import('@react-pdf/renderer');
  
  // Await component if it's a Promise
  const resolvedComponent = await Promise.resolve(component);
  
  const buffer = await ReactPDF.renderToBuffer(resolvedComponent);
  return buffer;
}

/**
 * Get React-PDF components (dynamic import)
 * Avoids SSR issues by importing on-demand
 * 
 * @returns React-PDF component library
 */
export async function getReactPDFComponents() {
  const ReactPDF = await import('@react-pdf/renderer');
  
  return {
    Document: ReactPDF.Document,
    Page: ReactPDF.Page,
    Text: ReactPDF.Text,
    View: ReactPDF.View,
    StyleSheet: ReactPDF.StyleSheet,
    Image: ReactPDF.Image,
    Link: ReactPDF.Link,
    Font: ReactPDF.Font,
  };
}

/**
 * Get React library (dynamic import)
 * 
 * @returns React with createElement
 */
export async function getReact() {
  const React = await import('react');
  return React;
}

/**
 * Create PDF element helper
 * Wrapper around React.createElement for type safety
 */
export async function createElement(
  type: any,
  props?: any,
  ...children: any[]
) {
  const React = await getReact();
  return React.createElement(type, props, ...children);
}
