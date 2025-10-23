/**
 * PDF Section Component
 * Wrapper for report sections with title
 */

"use server";

import { createElement, getReactPDFComponents } from '../../core/pdf-engine';
import { createPDFStyles } from '../../styles/pdf-styles';

export interface SectionProps {
  title: string;
  children: any;
  wrap?: boolean;
}

/**
 * Create PDF Section
 */
export async function createSection(props: SectionProps) {
  const { View, Text } = await getReactPDFComponents();
  const styles = await createPDFStyles();
  
  const { wrap = false } = props;
  
  return createElement(
    View,
    { style: styles.section, wrap },
    createElement(Text, { style: styles.sectionTitle }, props.title),
    props.children
  );
}
