/**
 * PDF Theme System
 * 
 * Centralized colors, fonts, spacing, and sizing
 * Ensures consistency across all PDF reports
 */

export const theme = {
  /**
   * Color Palette
   */
  colors: {
    // Brand colors
    primary: '#2563EB',      // Blue
    secondary: '#64748b',    // Slate
    accent: '#8b5cf6',       // Purple
    
    // Status colors
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    danger: '#ef4444',       // Red
    info: '#0ea5e9',         // Sky
    
    // Text colors
    text: {
      primary: '#1f2937',    // Gray 800
      secondary: '#6b7280',  // Gray 500
      muted: '#9ca3af',      // Gray 400
      disabled: '#d1d5db',   // Gray 300
    },
    
    // Background colors
    background: {
      white: '#ffffff',
      gray: '#f3f4f6',       // Gray 100
      light: '#f9fafb',      // Gray 50
      dark: '#111827',       // Gray 900
    },
    
    // Border colors
    border: {
      light: '#e5e7eb',      // Gray 200
      default: '#d1d5db',    // Gray 300
      dark: '#9ca3af',       // Gray 400
      darker: '#6b7280',     // Gray 500
    },
    
    // Table colors
    table: {
      header: '#2563EB',     // Primary blue
      headerText: '#ffffff',
      row: '#ffffff',
      rowAlt: '#f9fafb',     // Alternating row
      border: '#e5e7eb',
    },
  },
  
  /**
   * Typography
   */
  fonts: {
    primary: 'Roboto',
    bold: 'Roboto',
    italic: 'Roboto',
    boldItalic: 'Roboto',
  },
  
  /**
   * Font Sizes
   */
  fontSizes: {
    xs: 7,
    sm: 8,
    base: 9,
    md: 10,
    lg: 12,
    xl: 14,
    '2xl': 16,
    '3xl': 18,
    '4xl': 20,
    '5xl': 24,
  },
  
  /**
   * Font Weights
   */
  fontWeights: {
    normal: 'normal' as const,
    bold: 'bold' as const,
  },
  
  /**
   * Line Heights
   */
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  /**
   * Spacing Scale
   */
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
  },
  
  /**
   * Border Widths
   */
  borderWidths: {
    thin: 0.5,
    default: 1,
    thick: 2,
  },
  
  /**
   * Border Radius
   */
  borderRadius: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 6,
    xl: 8,
    full: 9999,
  },
  
  /**
   * Layout Dimensions
   */
  layout: {
    // Page settings
    pageMargin: 30,
    pageMarginLarge: 40,
    
    // Section spacing
    sectionGap: 15,
    sectionGapLarge: 20,
    
    // Table settings
    tableRowHeight: 25,
    tableHeaderHeight: 30,
    tableCellPadding: 5,
    
    // Header/Footer
    headerHeight: 60,
    footerHeight: 30,
  },
  
  /**
   * Shadows (for future use with Image components)
   */
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
} as const;

/**
 * Theme Type
 */
export type Theme = typeof theme;

/**
 * Helper: Get color by path
 * Example: getColor('text.primary') => '#1f2937'
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return theme.colors.text.primary; // Fallback
  }
  
  return value as string;
}

/**
 * Helper: Get spacing value
 */
export function getSpacing(size: keyof typeof theme.spacing): number {
  return theme.spacing[size];
}

/**
 * Helper: Get font size
 */
export function getFontSize(size: keyof typeof theme.fontSizes): number {
  return theme.fontSizes[size];
}
