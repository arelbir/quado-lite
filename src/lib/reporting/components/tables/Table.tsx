/**
 * PDF Table Component
 * Reusable table with header and data rows
 */

"use server";

import type { ReportSection } from '../../core/report-types';
import { createElement, getReactPDFComponents } from '../../core/pdf-engine';
import { createPDFStyles } from '../../styles/pdf-styles';

export interface TableProps {
  section: ReportSection;
  alternateRows?: boolean;
}

/**
 * Create PDF Table
 */
export async function createTable(props: TableProps) {
  const { View, Text } = await getReactPDFComponents();
  const styles = await createPDFStyles();
  
  const { section, alternateRows = true } = props;
  
  if (section.data.length === 0) {
    return createElement(
      Text,
      { style: styles.emptyState },
      'Veri bulunamadı.'
    );
  }
  
  return createElement(
    View,
    { style: styles.table },
    // Header
    createElement(
      View,
      { style: styles.tableHeader },
      ...section.columns.map((col, i) =>
        createElement(
          Text,
          {
            key: i,
            style: [
              styles.tableHeaderCell,
              { flex: col.width ? col.width / 20 : 1 },
            ],
          },
          col.header
        )
      )
    ),
    // Rows
    ...section.data.map((row, rowIndex) =>
      createElement(
        View,
        {
          key: rowIndex,
          style: [
            styles.tableRow,
            alternateRows && rowIndex % 2 === 1 ? styles.tableRowAlt : null,
          ],
        },
        ...section.columns.map((col, colIndex) =>
          createElement(
            Text,
            {
              key: colIndex,
              style: [
                styles.tableCell,
                { flex: col.width ? col.width / 20 : 1 },
              ],
            },
            String(row[col.key] ?? '-')
          )
        )
      )
    )
  );
}
