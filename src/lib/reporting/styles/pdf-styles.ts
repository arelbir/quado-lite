/**
 * PDF Styles - StyleSheet Definitions
 * 
 * Centralized StyleSheet using theme system
 * All PDF components use these styles
 */

"use server";

import { theme } from './theme';
import { getReactPDFComponents } from '../core/pdf-engine';

/**
 * Create PDF StyleSheet
 * Dynamic creation to avoid SSR issues
 */
export async function createPDFStyles() {
  const { StyleSheet, Font } = await getReactPDFComponents();
  
  // Register Roboto font for Turkish character support
  Font.register({
    family: 'Roboto',
    src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
  });
  
  return StyleSheet.create({
    // ========================================
    // PAGE & LAYOUT
    // ========================================
    page: {
      padding: theme.layout.pageMargin,
      fontFamily: theme.fonts.primary,
      fontSize: theme.fontSizes.base,
      color: theme.colors.text.primary,
      lineHeight: theme.lineHeights.normal,
    },
    
    pageLarge: {
      padding: theme.layout.pageMarginLarge,
    },
    
    container: {
      flex: 1,
    },
    
    // ========================================
    // HEADER & FOOTER
    // ========================================
    header: {
      marginBottom: theme.spacing['2xl'],
      paddingBottom: theme.spacing.md,
      borderBottomWidth: theme.borderWidths.default,
      borderBottomColor: theme.colors.border.light,
    },
    
    footer: {
      position: 'absolute',
      bottom: theme.spacing['2xl'],
      left: theme.layout.pageMargin,
      right: theme.layout.pageMargin,
      textAlign: 'center',
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.muted,
      paddingTop: theme.spacing.md,
      borderTopWidth: theme.borderWidths.thin,
      borderTopColor: theme.colors.border.light,
    },
    
    // ========================================
    // TYPOGRAPHY
    // ========================================
    title: {
      fontSize: theme.fontSizes['3xl'],
      fontFamily: theme.fonts.bold,
      marginBottom: theme.spacing.md,
      color: theme.colors.primary,
      lineHeight: theme.lineHeights.tight,
    },
    
    subtitle: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.fonts.bold,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.secondary,
    },
    
    sectionTitle: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.fonts.bold,
      marginBottom: theme.spacing.md,
      color: theme.colors.primary,
      paddingBottom: theme.spacing.xs,
      borderBottomWidth: theme.borderWidths.default,
      borderBottomColor: theme.colors.border.light,
    },
    
    heading: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fonts.bold,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary,
    },
    
    text: {
      fontSize: theme.fontSizes.base,
      lineHeight: theme.lineHeights.normal,
      color: theme.colors.text.primary,
    },
    
    textBold: {
      fontFamily: theme.fonts.bold,
    },
    
    textMuted: {
      color: theme.colors.text.muted,
    },
    
    textSmall: {
      fontSize: theme.fontSizes.sm,
    },
    
    label: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.fonts.bold,
    },
    
    metadata: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.muted,
      marginBottom: theme.spacing.xs,
    },
    
    // ========================================
    // SECTIONS
    // ========================================
    section: {
      marginTop: theme.layout.sectionGap,
      marginBottom: theme.spacing.md,
    },
    
    sectionLarge: {
      marginTop: theme.layout.sectionGapLarge,
      marginBottom: theme.spacing.xl,
    },
    
    // ========================================
    // TABLES
    // ========================================
    table: {
      display: 'flex',
      width: 'auto',
      marginVertical: theme.spacing.md,
      borderWidth: theme.borderWidths.default,
      borderColor: theme.colors.table.border,
    },
    
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.table.header,
      borderBottomWidth: theme.borderWidths.default,
      borderBottomColor: theme.colors.primary,
      minHeight: theme.layout.tableHeaderHeight,
      alignItems: 'center',
    },
    
    tableHeaderCell: {
      padding: theme.layout.tableCellPadding,
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fonts.bold,
      color: theme.colors.table.headerText,
    },
    
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: theme.borderWidths.thin,
      borderBottomColor: theme.colors.table.border,
      minHeight: theme.layout.tableRowHeight,
      alignItems: 'center',
    },
    
    tableRowAlt: {
      backgroundColor: theme.colors.table.rowAlt,
    },
    
    tableCell: {
      padding: theme.layout.tableCellPadding,
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.primary,
    },
    
    // ========================================
    // BOXES & CONTAINERS
    // ========================================
    box: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: theme.borderWidths.default,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.md,
    },
    
    infoBox: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background.light,
      borderLeftWidth: theme.borderWidths.thick,
      borderLeftColor: theme.colors.info,
    },
    
    warningBox: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: '#fef3c7',
      borderLeftWidth: theme.borderWidths.thick,
      borderLeftColor: theme.colors.warning,
    },
    
    successBox: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: '#d1fae5',
      borderLeftWidth: theme.borderWidths.thick,
      borderLeftColor: theme.colors.success,
    },
    
    dangerBox: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: '#fee2e2',
      borderLeftWidth: theme.borderWidths.thick,
      borderLeftColor: theme.colors.danger,
    },
    
    // ========================================
    // SUMMARY
    // ========================================
    summary: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.gray,
      borderRadius: theme.borderRadius.md,
    },
    
    summaryTitle: {
      fontSize: theme.fontSizes.base,
      fontFamily: theme.fonts.bold,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary,
    },
    
    summaryItem: {
      fontSize: theme.fontSizes.sm,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.secondary,
    },
    
    // ========================================
    // BADGES & CHIPS
    // ========================================
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      fontSize: theme.fontSizes.xs,
      fontFamily: theme.fonts.bold,
    },
    
    badgePrimary: {
      backgroundColor: theme.colors.primary,
      color: '#ffffff',
    },
    
    badgeSuccess: {
      backgroundColor: theme.colors.success,
      color: '#ffffff',
    },
    
    badgeWarning: {
      backgroundColor: theme.colors.warning,
      color: '#ffffff',
    },
    
    badgeDanger: {
      backgroundColor: theme.colors.danger,
      color: '#ffffff',
    },
    
    // ========================================
    // UTILITIES
    // ========================================
    separator: {
      borderBottomWidth: theme.borderWidths.default,
      borderBottomColor: theme.colors.border.light,
      marginVertical: theme.spacing.md,
    },
    
    divider: {
      borderBottomWidth: theme.borderWidths.thin,
      borderBottomColor: theme.colors.border.light,
      marginVertical: theme.spacing.sm,
    },
    
    emptyState: {
      fontSize: theme.fontSizes.sm,
      fontStyle: 'italic',
      color: theme.colors.text.muted,
      padding: theme.spacing.md,
      textAlign: 'center',
    },
    
    // ========================================
    // GRID & FLEX
    // ========================================
    row: {
      flexDirection: 'row',
    },
    
    column: {
      flexDirection: 'column',
    },
    
    flexGrow: {
      flexGrow: 1,
    },
    
    flexShrink: {
      flexShrink: 1,
    },
    
    // ========================================
    // SPACING UTILITIES
    // ========================================
    mt: {
      marginTop: theme.spacing.md,
    },
    
    mb: {
      marginBottom: theme.spacing.md,
    },
    
    mv: {
      marginVertical: theme.spacing.md,
    },
    
    p: {
      padding: theme.spacing.md,
    },
  });
}

/**
 * Export type for autocomplete
 */
export type PDFStyles = Awaited<ReturnType<typeof createPDFStyles>>;
