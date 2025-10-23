/**
 * REPORTING SYSTEM - Core Types
 * Centralized type definitions for all reports
 */

// ============================================
// REPORT METADATA
// ============================================

export type ReportType = "audit" | "action" | "dof" | "finding";
export type ReportFormat = "excel" | "pdf";

/**
 * Simplified user info for reports
 */
export interface ReportUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export interface ReportMetadata {
  title: string;
  generatedAt: Date;
  generatedBy: ReportUser;
  reportType: ReportType;
  format: ReportFormat;
  description?: string;
}

// ============================================
// COLUMN DEFINITIONS
// ============================================

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  style?: any;
}

// ============================================
// REPORT SECTIONS
// ============================================

export interface ReportSection {
  title: string;
  data: any[];
  columns: ColumnDefinition[];
  summary?: Record<string, any>;
  chartData?: ChartData;
}

export interface ChartData {
  type: "pie" | "bar" | "line";
  data: any[];
  labels: string[];
}

// ============================================
// REPORT OPTIONS
// ============================================

export interface ReportOptions {
  metadata: ReportMetadata;
  sections: ReportSection[];
  includeLogo?: boolean;
  includeCharts?: boolean;
  includeTimeline?: boolean;
  includeStatistics?: boolean;
}

// ============================================
// EXCEL SPECIFIC
// ============================================

export interface ExcelReportOptions extends ReportOptions {
  multiSheet?: boolean;
  autoFilter?: boolean;
  freezeHeader?: boolean;
}

// ============================================
// PDF SPECIFIC
// ============================================

export interface PdfReportOptions extends ReportOptions {
  orientation?: "portrait" | "landscape";
  pageSize?: "a4" | "letter";
  headerHeight?: number;
  footerHeight?: number;
}

// ============================================
// REPORT DATA INTERFACES
// ============================================

export interface AuditReportData {
  audit: any;
  findings: any[];
  actions: any[];
  dofs: any[];
  statistics: AuditStatistics;
}

export interface AuditStatistics {
  totalFindings: number;
  findingsByStatus: Record<string, number>;
  findingsByRisk: Record<string, number>;
  totalActions: number;
  completedActions: number;
  totalDofs: number;
  completedDofs: number;
  avgCompletionTime?: number;
}

export interface ActionReportData {
  actions: any[];
  timeline: any[];
  statistics: ActionStatistics;
}

export interface ActionStatistics {
  total: number;
  byStatus: Record<string, number>;
  byAssignee: Record<string, number>;
  avgCompletionTime: number;
  completionRate: number;
}

export interface DofReportData {
  dof: any;
  activities: any[];
  timeline: any[];
  rootCauseAnalysis: any;
  statistics: DofStatistics;
}

export interface DofStatistics {
  totalActivities: number;
  completedActivities: number;
  correctiveActivities: number;
  preventiveActivities: number;
  currentStep: string;
  daysOpen: number;
}
