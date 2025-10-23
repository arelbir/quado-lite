/**
 * PDF Summary Box Component
 * Displays summary statistics
 */

"use server";

import { createElement, getReactPDFComponents } from '../../core/pdf-engine';
import { createPDFStyles } from '../../styles/pdf-styles';

export interface SummaryBoxProps {
  title?: string;
  items: Record<string, string | number>;
}

/**
 * Create Summary Box
 */
export async function createSummaryBox(props: SummaryBoxProps) {
  const { View, Text } = await getReactPDFComponents();
  const styles = await createPDFStyles();
  
  const { title = 'Özet', items } = props;
  
  return createElement(
    View,
    { style: styles.summary },
    createElement(Text, { style: styles.summaryTitle }, title),
    ...Object.entries(items).map(([key, value], i) =>
      createElement(
        Text,
        { key: i, style: styles.summaryItem },
        `${key}: ${value}`
      )
    )
  );
}
