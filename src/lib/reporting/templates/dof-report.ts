/**
 * DOF REPORT TEMPLATE
 * Comprehensive CAPA report with 8-step process documentation
 */

"use server";

import { db } from "@/drizzle/db";
import { dofs, dofActivities } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { exportToExcel } from "@/lib/export/excel-export-service";
import { generateExcel } from "../excel/excel-generator";
import { createBaseReport } from "./base-report";
import type { ReportSection, ReportMetadata } from "../core/report-types";
import { formatDate, formatStatus } from "../formatters";

/**
 * Generate DOF (CAPA) report
 */
export async function generateDofReport(
  dofId: string,
  format: "excel" | "pdf" = "excel"
): Promise<Buffer> {
  // Fetch data
  const dof = await db.query.dofs.findFirst({
    where: eq(dofs.id, dofId),
    with: {
      finding: true,
      assignedTo: true,
      manager: true,
      createdBy: true,
    } as any,
  }) as any;

  if (!dof) {
    throw new Error("DOF not found");
  }

  // Fetch activities separately
  const activities = await db.query.dofActivities.findMany({
    where: eq(dofActivities.dofId, dofId),
    orderBy: (dofActivities: any, { asc }: any) => [asc(dofActivities.createdAt)],
  });

  // Build report sections
  const sections: ReportSection[] = [
    buildDofSummarySection(dof),
    buildProblemDefinitionSection(dof),
    buildRootCauseSection(dof),
    buildActivitiesSection(activities),
    buildEffectivenessSection(dof),
  ];

  // Build metadata
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const metadata: ReportMetadata = {
    title: `DÖF Raporu - ${dof.problemTitle}`,
    generatedAt: new Date(),
    generatedBy: {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
    },
    reportType: "dof",
    format,
  };

  // Generate report based on format
  if (format === "excel") {
    return generateDofReportExcel(metadata, sections);
  } else {
    // Use base report template with React-PDF + Roboto font
    return createBaseReport({ metadata, sections });
  }
}

/**
 * Section 1: DOF Summary
 */
function buildDofSummarySection(dof: any): ReportSection {
  const summaryData = [
    { field: "Problem Başlığı", value: dof.problemTitle },
    { field: "Durum", value: formatStatus(dof.status, "dof") },
    { field: "Sorumlu", value: dof.assignedTo?.name || "-" },
    { field: "Yönetici", value: dof.manager?.name || "-" },
    { field: "İlgili Bulgu", value: dof.finding?.details.substring(0, 50) || "-" },
    { field: "Oluşturulma", value: formatDate(dof.createdAt, "datetime") },
    { field: "Güncel Adım", value: getStepName(dof.status) },
  ];

  return {
    title: "DÖF Özeti",
    data: summaryData,
    columns: [
      { header: "Alan", key: "field", width: 25 },
      { header: "Değer", key: "value", width: 60 },
    ],
  };
}

/**
 * Section 2: Problem Definition (5N1K)
 */
function buildProblemDefinitionSection(dof: any): ReportSection {
  const problemData = [
    { soru: "NE?", cevap: dof.problemWhat || "-" },
    { soru: "NEREDE?", cevap: dof.problemWhere || "-" },
    { soru: "NE ZAMAN?", cevap: dof.problemWhen || "-" },
    { soru: "KİM?", cevap: dof.problemWho || "-" },
    { soru: "NASIL?", cevap: dof.problemHow || "-" },
    { soru: "NİÇİN?", cevap: dof.problemWhy || "-" },
    { soru: "Detaylar", cevap: dof.problemDetails || "-" },
  ];

  return {
    title: "Problem Tanımı (5N1K)",
    data: problemData,
    columns: [
      { header: "Soru", key: "soru", width: 20 },
      { header: "Cevap", key: "cevap", width: 65 },
    ],
  };
}

/**
 * Section 3: Root Cause Analysis
 */
function buildRootCauseSection(dof: any): ReportSection {
  const rootCauseData = [];

  // Add analysis method
  rootCauseData.push({
    yontem: "Analiz Yöntemi",
    bilgi: dof.rootCauseMethod || "Belirtilmemiş",
  });

  // 5 Why analysis
  if (dof.rootCauseMethod === "5why") {
    rootCauseData.push({ yontem: "5 Why Analizi", bilgi: "" });
    rootCauseData.push({ yontem: "Neden 1", bilgi: dof.rootCauseWhy1 || "-" });
    rootCauseData.push({ yontem: "Neden 2", bilgi: dof.rootCauseWhy2 || "-" });
    rootCauseData.push({ yontem: "Neden 3", bilgi: dof.rootCauseWhy3 || "-" });
    rootCauseData.push({ yontem: "Neden 4", bilgi: dof.rootCauseWhy4 || "-" });
    rootCauseData.push({ yontem: "Neden 5", bilgi: dof.rootCauseWhy5 || "-" });
    rootCauseData.push({ yontem: "Kök Neden", bilgi: dof.rootCauseRoot || "-" });
  }

  // Fishbone
  if (dof.rootCauseMethod === "fishbone") {
    rootCauseData.push({ yontem: "Fishbone Diagram", bilgi: dof.rootCauseFishbone || "-" });
  }

  // Freeform
  if (dof.rootCauseMethod === "freeform") {
    rootCauseData.push({ yontem: "Analiz Detayları", bilgi: dof.rootCauseFreeform || "-" });
  }

  return {
    title: "Kök Neden Analizi",
    data: rootCauseData,
    columns: [
      { header: "Yöntem/Adım", key: "yontem", width: 25 },
      { header: "Bilgi", key: "bilgi", width: 60 },
    ],
  };
}

/**
 * Section 4: Activities
 */
function buildActivitiesSection(activities: any[]): ReportSection {
  const activitiesData = activities.map((activity) => ({
    tip: activity.type === "Corrective" ? "Düzeltici" : "Önleyici",
    aciklama: activity.description,
    sorumlu: activity.responsible,
    tarih: formatDate(activity.targetDate, "short"),
    durum: activity.isCompleted ? "Tamamlandı" : "Devam Ediyor",
    tamamlanma: activity.completedAt ? formatDate(activity.completedAt, "short") : "-",
  }));

  const correctiveCount = activities.filter(a => a.type === "Corrective").length;
  const preventiveCount = activities.filter(a => a.type === "Preventive").length;
  const completedCount = activities.filter(a => a.isCompleted).length;

  return {
    title: "Faaliyetler",
    data: activitiesData,
    columns: [
      { header: "Tip", key: "tip", width: 15 },
      { header: "Açıklama", key: "aciklama", width: 40 },
      { header: "Sorumlu", key: "sorumlu", width: 20 },
      { header: "Hedef Tarih", key: "tarih", width: 15 },
      { header: "Durum", key: "durum", width: 15 },
      { header: "Tamamlanma", key: "tamamlanma", width: 15 },
    ],
    summary: {
      "Toplam Faaliyet": activities.length,
      "Düzeltici": correctiveCount,
      "Önleyici": preventiveCount,
      "Tamamlanan": completedCount,
      "Tamamlanma Oranı": `${Math.round((completedCount / activities.length) * 100)}%`,
    },
  };
}

/**
 * Section 5: Effectiveness Check
 */
function buildEffectivenessSection(dof: any): ReportSection {
  const effectivenessData = [
    { alan: "Etkinlik Değerlendirmesi", deger: dof.effectivenessCheck || "-" },
    { alan: "Değerlendirme Tarihi", deger: dof.effectivenessDate ? formatDate(dof.effectivenessDate, "short") : "-" },
    { alan: "Sonuç", deger: dof.effectivenessResult || "-" },
  ];

  return {
    title: "Etkinlik Kontrolü",
    data: effectivenessData,
    columns: [
      { header: "Alan", key: "alan", width: 30 },
      { header: "Değer", key: "deger", width: 55 },
    ],
  };
}

/**
 * Helper: Get step name from status
 */
function getStepName(status: string): string {
  const stepNames: Record<string, string> = {
    "Step1_Problem": "Adım 1: Problem Tanımı",
    "Step2_TempMeasures": "Adım 2: Geçici Önlemler",
    "Step3_RootCause": "Adım 3: Kök Neden Analizi",
    "Step4_Activities": "Adım 4: Faaliyet Belirleme",
    "Step5_Implementation": "Adım 5: Uygulama",
    "Step6_EffectivenessCheck": "Adım 6: Etkinlik Kontrolü",
    "PendingManagerApproval": "Adım 7: Yönetici Onayı",
    "Completed": "Tamamlandı",
  };
  return stepNames[status] || status;
}

/**
 * Generate Excel report
 */
async function generateDofReportExcel(
  metadata: ReportMetadata,
  sections: ReportSection[]
): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  sections.forEach((section) => {
    const worksheet = workbook.addWorksheet(section.title.substring(0, 31));

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
      worksheet.addRow([]);
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
