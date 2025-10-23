/**
 * PDF Footer Component
 * Reusable footer with page numbers and date
 */

"use server";

import type { ReportMetadata } from '../../core/report-types';
import { createElement, getReactPDFComponents } from '../../core/pdf-engine';
import { createPDFStyles } from '../../styles/pdf-styles';

export interface FooterProps {
  metadata: ReportMetadata;
  showPageNumbers?: boolean;
}

/**
 * Create PDF Footer
 */
export async function createFooter(props: FooterProps) {
  const { Text } = await getReactPDFComponents();
  const styles = await createPDFStyles();
  
  const { showPageNumbers = true } = props;
  
  const footerText = showPageNumbers
    ? `Sayfa | ${props.metadata.generatedAt.toLocaleDateString('tr-TR')}`
    : props.metadata.generatedAt.toLocaleDateString('tr-TR');
  
  return createElement(
    Text,
    { style: styles.footer, fixed: true },
    footerText
  );
}
