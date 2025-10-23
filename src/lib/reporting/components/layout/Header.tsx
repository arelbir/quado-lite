/**
 * PDF Header Component
 * Reusable header for all PDF reports
 */

"use server";

import type { ReportMetadata } from '../../core/report-types';
import { createElement, getReactPDFComponents } from '../../core/pdf-engine';
import { createPDFStyles } from '../../styles/pdf-styles';

export interface HeaderProps {
  metadata: ReportMetadata;
}

/**
 * Create PDF Header
 */
export async function createHeader(props: HeaderProps) {
  const { View, Text } = await getReactPDFComponents();
  const styles = await createPDFStyles();
  
  return createElement(
    View,
    { style: styles.header },
    createElement(Text, { style: styles.title }, props.metadata.title),
    createElement(
      Text,
      { style: styles.metadata },
      `Oluşturulma: ${props.metadata.generatedAt.toLocaleString('tr-TR')}`
    ),
    createElement(
      Text,
      { style: styles.metadata },
      `Oluşturan: ${props.metadata.generatedBy.name ?? props.metadata.generatedBy.email}`
    )
  );
}
