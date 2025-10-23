/**
 * AUDIT REPORT TEMPLATE
 * Comprehensive audit report with findings, actions, DOFs, and statistics
 */

"use server";

import { db } from "@/drizzle/db";
import { audits, findings, actions, dofs } from "@/drizzle/schema";
import { eq, and, not } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { generateExcel } from "../excel/excel-generator";
import { createBaseReport } from "./base-report";
import { renderPDF } from "../core/pdf-engine";
import type { AuditReportData, AuditStatistics, ReportSection, ReportMetadata } from "../core/report-types";
import { formatDate, formatStatus, formatPercentage, calculatePercentage } from "../formatters";

/**
 * Generate comprehensive audit report
 * 
 * @param auditId - Audit ID
 * @param format - Export format (excel or pdf)
 * @returns Buffer of generated report
 */
export async function generateAuditReport(
  auditId: string,
  format: "excel" | "pdf" = "excel"
): Promise<Buffer> {
  // Fetch data
  const data = await fetchAuditReportData(auditId);
  
  // Build report sections
  const sections = buildAuditReportSections(data);
  
  // Build metadata
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const metadata: ReportMetadata = {
    title: `Denetim Raporu - ${data.audit.title}`,
    generatedAt: new Date(),
    generatedBy: {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
    },
    reportType: "audit",
    format,
    description: data.audit.description,
  };

  // Generate report based on format
  if (format === "excel") {
    return generateExcel(metadata, sections);
  } else {
    // Use base report template with React-PDF + Roboto font
    return createBaseReport({ metadata, sections });
  }
}

/**
 * Fetch all data needed for audit report
 */
async function fetchAuditReportData(auditId: string): Promise<AuditReportData> {
  // Fetch audit with relations
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, auditId),
    with: {
      createdBy: true,
      auditor: true,
    },
  });

  if (!audit) {
    throw new Error("Audit not found");
  }

  // Fetch findings
  const auditFindings = await db.query.findings.findMany({
    where: eq(findings.auditId, auditId),
    with: {
      assignedTo: true,
      createdBy: true,
    },
    orderBy: (findings, { desc }) => [desc(findings.createdAt)],
  });

  // Fetch actions
  const auditActions = await db.query.actions.findMany({
    where: eq(actions.findingId, auditFindings[0]?.id ?? ""),
    with: {
      assignedTo: true,
      manager: true,
      finding: true,
    },
  });

  // Fetch DOFs
  const auditDofs = await db.query.dofs.findMany({
    where: eq(dofs.findingId, auditFindings[0]?.id ?? ""),
    with: {
      assignedTo: true,
      manager: true,
    },
  });

  // Calculate statistics
  const statistics = calculateAuditStatistics(auditFindings, auditActions, auditDofs);

  return {
    audit,
    findings: auditFindings,
    actions: auditActions,
    dofs: auditDofs,
    statistics,
  };
}

/**
 * Calculate audit statistics
 */
function calculateAuditStatistics(
  findings: any[],
  actions: any[],
  dofs: any[]
): AuditStatistics {
  // Finding statistics
  const findingsByStatus: Record<string, number> = {};
  const findingsByRisk: Record<string, number> = {};

  findings.forEach((finding) => {
    findingsByStatus[finding.status] = (findingsByStatus[finding.status] || 0) + 1;
    if (finding.riskType) {
      findingsByRisk[finding.riskType] = (findingsByRisk[finding.riskType] || 0) + 1;
    }
  });

  // Action statistics
  const completedActions = actions.filter((a) => a.status === "Completed").length;

  // DOF statistics
  const completedDofs = dofs.filter((d) => d.status === "Completed").length;

  return {
    totalFindings: findings.length,
    findingsByStatus,
    findingsByRisk,
    totalActions: actions.length,
    completedActions,
    totalDofs: dofs.length,
    completedDofs,
  };
}

/**
 * Build report sections
 */
function buildAuditReportSections(data: AuditReportData): ReportSection[] {
  return [
    buildSummarySection(data),
    buildFindingsSection(data.findings),
    buildActionsSection(data.actions),
    buildDofsSection(data.dofs),
    buildStatisticsSection(data.statistics),
  ];
}

/**
 * Section 1: Summary
 */
function buildSummarySection(data: AuditReportData): ReportSection {
  const summaryData = [
    { field: "Denetim Adı", value: data.audit.title },
    { field: "Açıklama", value: data.audit.description || "-" },
    { field: "Durum", value: formatStatus(data.audit.status, "audit") },
    { field: "Denetçi", value: data.audit.auditor?.name || "-" },
    { field: "Denetim Tarihi", value: formatDate(data.audit.auditDate, "long") },
    { field: "Oluşturulma", value: formatDate(data.audit.createdAt, "datetime") },
    { field: "Toplam Bulgu", value: data.statistics.totalFindings.toString() },
    { field: "Toplam Aksiyon", value: data.statistics.totalActions.toString() },
    { field: "Toplam DÖF", value: data.statistics.totalDofs.toString() },
  ];

  return {
    title: "Denetim Özeti",
    data: summaryData,
    columns: [
      { header: "Alan", key: "field", width: 30 },
      { header: "Değer", key: "value", width: 50 },
    ],
  };
}

/**
 * Section 2: Findings
 */
function buildFindingsSection(findings: any[]): ReportSection {
  const findingsData = findings.map((finding) => ({
    bulgu: finding.details,
    durum: formatStatus(finding.status, "finding"),
    risk: finding.riskType || "-",
    sorumlu: finding.assignedTo?.name || "-",
    tarih: formatDate(finding.createdAt),
  }));

  return {
    title: "Bulgular",
    data: findingsData,
    columns: [
      { header: "Bulgu Detayı", key: "bulgu", width: 50 },
      { header: "Durum", key: "durum", width: 20 },
      { header: "Risk", key: "risk", width: 15 },
      { header: "Sorumlu", key: "sorumlu", width: 25 },
      { header: "Tarih", key: "tarih", width: 15 },
    ],
    summary: {
      "Toplam Bulgu": findings.length,
    },
  };
}

/**
 * Section 3: Actions
 */
function buildActionsSection(actions: any[]): ReportSection {
  const actionsData = actions.map((action) => ({
    aksiyon: action.details,
    durum: formatStatus(action.status, "action"),
    sorumlu: action.assignedTo?.name || "-",
    yonetici: action.manager?.name || "-",
    bulgu: action.finding?.details.substring(0, 30) + "..." || "-",
    tarih: formatDate(action.createdAt),
  }));

  const completed = actions.filter((a) => a.status === "Completed").length;

  return {
    title: "Aksiyonlar",
    data: actionsData,
    columns: [
      { header: "Aksiyon", key: "aksiyon", width: 40 },
      { header: "Durum", key: "durum", width: 20 },
      { header: "Sorumlu", key: "sorumlu", width: 20 },
      { header: "Yönetici", key: "yonetici", width: 20 },
      { header: "İlgili Bulgu", key: "bulgu", width: 30 },
      { header: "Tarih", key: "tarih", width: 15 },
    ],
    summary: {
      "Toplam Aksiyon": actions.length,
      "Tamamlanan": completed,
      "Tamamlanma Oranı": formatPercentage(calculatePercentage(completed, actions.length)),
    },
  };
}

/**
 * Section 4: DOFs
 */
function buildDofsSection(dofs: any[]): ReportSection {
  const dofsData = dofs.map((dof) => ({
    problem: dof.problemTitle,
    durum: formatStatus(dof.status, "dof"),
    sorumlu: dof.assignedTo?.name || "-",
    tarih: formatDate(dof.createdAt),
  }));

  return {
    title: "DÖF'ler (CAPA)",
    data: dofsData,
    columns: [
      { header: "Problem Tanımı", key: "problem", width: 50 },
      { header: "Durum", key: "durum", width: 25 },
      { header: "Sorumlu", key: "sorumlu", width: 25 },
      { header: "Tarih", key: "tarih", width: 15 },
    ],
    summary: {
      "Toplam DÖF": dofs.length,
    },
  };
}

/**
 * Section 5: Statistics
 */
function buildStatisticsSection(stats: AuditStatistics): ReportSection {
  const statsData = [
    { metric: "Toplam Bulgu", value: stats.totalFindings.toString() },
    { metric: "Yeni Bulgular", value: (stats.findingsByStatus["New"] || 0).toString() },
    { metric: "Atanan Bulgular", value: (stats.findingsByStatus["Assigned"] || 0).toString() },
    { metric: "Tamamlanan Bulgular", value: (stats.findingsByStatus["Completed"] || 0).toString() },
    { metric: "Toplam Aksiyon", value: stats.totalActions.toString() },
    { metric: "Tamamlanan Aksiyon", value: stats.completedActions.toString() },
    { metric: "Aksiyon Tamamlanma", value: formatPercentage(calculatePercentage(stats.completedActions, stats.totalActions)) },
    { metric: "Toplam DÖF", value: stats.totalDofs.toString() },
    { metric: "Tamamlanan DÖF", value: stats.completedDofs.toString() },
  ];

  return {
    title: "İstatistikler",
    data: statsData,
    columns: [
      { header: "Metrik", key: "metric", width: 40 },
      { header: "Değer", key: "value", width: 20 },
    ],
  };
}

/**
 * Generate Excel report (multi-sheet)
 */
async function generateAuditReportExcel(
  metadata: ReportMetadata,
  sections: ReportSection[]
): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  // Create a sheet for each section
  sections.forEach((section) => {
    const worksheet = workbook.addWorksheet(section.title.substring(0, 31)); // Max 31 chars

    // Title
    const titleRow = worksheet.addRow([section.title]);
    titleRow.font = { size: 16, bold: true };
    titleRow.height = 30;

    worksheet.addRow([]); // Empty row

    // Columns
    worksheet.columns = section.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Header styling
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Data
    section.data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Summary
    if (section.summary) {
      worksheet.addRow([]); // Empty row
      const summaryRow = worksheet.addRow(["Özet"]);
      summaryRow.font = { bold: true };

      Object.entries(section.summary).forEach(([key, value]) => {
        worksheet.addRow([key, value]);
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
