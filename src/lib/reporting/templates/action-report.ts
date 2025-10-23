/**
 * ACTION REPORT TEMPLATE
 * Detailed action report with timeline, progress notes, and statistics
 */

"use server";

import { db } from "@/drizzle/db";
import { actions, actionProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { exportToExcel } from "@/lib/export/excel-export-service";
import { generateExcel } from "../excel/excel-generator";
import { createBaseReport } from "./base-report";
import type { ReportSection, ReportMetadata } from "../core/report-types";
import { formatDate, formatStatus } from "../formatters";

/**
 * Generate action report
 */
export async function generateActionReport(
  actionId: string,
  format: "excel" | "pdf" = "excel"
): Promise<Buffer> {
  // Fetch data
  const action = await db.query.actions.findFirst({
    where: eq(actions.id, actionId),
    with: {
      finding: true,
      assignedTo: true,
      manager: true,
      createdBy: true,
      progressNotes: {
        with: {
          createdBy: true,
        },
        orderBy: (actionProgress, { asc }) => [asc(actionProgress.createdAt)],
      },
    },
  });

  if (!action) {
    throw new Error("Action not found");
  }

  // Build report sections
  const sections: ReportSection[] = [
    buildActionDetailsSection(action),
    buildProgressNotesSection(action.progressNotes),
    buildTimelineSection(action),
  ];

  // Build metadata
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const metadata: ReportMetadata = {
    title: `Aksiyon Raporu - ${action.details.substring(0, 50)}`,
    generatedAt: new Date(),
    generatedBy: {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
    },
    reportType: "action",
    format,
  };

  // Generate report based on format
  if (format === "excel") {
    return generateActionReportExcel(metadata, sections);
  } else {
    // Use base report template with React-PDF + Roboto font
    return createBaseReport({ metadata, sections });
  }
}

/**
 * Section 1: Action Details
 */
function buildActionDetailsSection(action: any): ReportSection {
  const detailsData = [
    { field: "Aksiyon Detayı", value: action.details },
    { field: "Durum", value: formatStatus(action.status, "action") },
    { field: "Sorumlu", value: action.assignedTo?.name || "-" },
    { field: "Yönetici", value: action.manager?.name || "-" },
    { field: "İlgili Bulgu", value: action.finding?.details.substring(0, 50) || "-" },
    { field: "Oluşturulma", value: formatDate(action.createdAt, "datetime") },
    { field: "Tamamlanma", value: action.completedAt ? formatDate(action.completedAt, "datetime") : "-" },
    { field: "Tamamlanma Notu", value: action.completionNotes || "-" },
    { field: "Red Nedeni", value: action.rejectionReason || "-" },
  ];

  return {
    title: "Aksiyon Detayları",
    data: detailsData,
    columns: [
      { header: "Alan", key: "field", width: 25 },
      { header: "Değer", key: "value", width: 60 },
    ],
  };
}

/**
 * Section 2: Progress Notes
 */
function buildProgressNotesSection(progressNotes: any[]): ReportSection {
  const notesData = progressNotes.map((note) => ({
    tarih: formatDate(note.createdAt, "datetime"),
    kisi: note.createdBy?.name || note.createdBy?.email || "-",
    not: note.note,
  }));

  return {
    title: "İlerleme Notları",
    data: notesData,
    columns: [
      { header: "Tarih", key: "tarih", width: 20 },
      { header: "Kişi", key: "kisi", width: 25 },
      { header: "Not", key: "not", width: 60 },
    ],
    summary: {
      "Toplam Not": progressNotes.length,
    },
  };
}

/**
 * Section 3: Timeline
 */
function buildTimelineSection(action: any): ReportSection {
  const timeline = [];

  // Created
  timeline.push({
    tarih: formatDate(action.createdAt, "datetime"),
    olay: "Aksiyon Oluşturuldu",
    kisi: action.createdBy?.name || "-",
    detay: `Sorumlu: ${action.assignedTo?.name || "-"}`,
  });

  // Progress notes
  action.progressNotes?.forEach((note: any) => {
    timeline.push({
      tarih: formatDate(note.createdAt, "datetime"),
      olay: "İlerleme Notu Eklendi",
      kisi: note.createdBy?.name || "-",
      detay: note.note.substring(0, 50),
    });
  });

  // Completed
  if (action.completedAt) {
    timeline.push({
      tarih: formatDate(action.completedAt, "datetime"),
      olay: "Aksiyon Tamamlandı",
      kisi: action.assignedTo?.name || "-",
      detay: action.completionNotes?.substring(0, 50) || "-",
    });
  }

  // Rejected
  if (action.rejectionReason) {
    timeline.push({
      tarih: formatDate(action.updatedAt, "datetime"),
      olay: "Aksiyon Reddedildi",
      kisi: action.manager?.name || "-",
      detay: action.rejectionReason.substring(0, 50),
    });
  }

  return {
    title: "Zaman Çizelgesi",
    data: timeline,
    columns: [
      { header: "Tarih", key: "tarih", width: 20 },
      { header: "Olay", key: "olay", width: 25 },
      { header: "Kişi", key: "kisi", width: 20 },
      { header: "Detay", key: "detay", width: 40 },
    ],
  };
}

/**
 * Generate Excel report
 */
async function generateActionReportExcel(
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
