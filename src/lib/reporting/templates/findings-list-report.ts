/**
 * FINDINGS LIST REPORT TEMPLATE
 * Simple list export of all findings
 */

"use server";

import { db } from "@/drizzle/db";
import { findings } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { generateExcel } from "../excel/excel-generator";
import type { ReportSection, ReportMetadata } from "../core/report-types";
import { formatDate, formatStatus } from "../formatters";

/**
 * Generate findings list report
 * 
 * @param format - Export format (excel or pdf)
 * @returns Buffer of generated report
 */
export async function generateFindingsListReport(
  format: "excel" | "pdf" = "excel"
): Promise<Buffer> {
  // Fetch all findings with relations
  const allFindings = await db.query.findings.findMany({
    with: {
      // @ts-ignore - Drizzle relation type inference limitation
      audit: {
        columns: {
          id: true,
          title: true,
        },
      },
      // @ts-ignore - Drizzle relation type inference limitation
      assignedTo: {
        columns: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (findings, { desc }) => [desc(findings.createdAt)],
  });

  // Build sections
  const sections: ReportSection[] = [
    {
      title: "Bulgular Listesi",
      data: allFindings.map((finding: any) => ({
        bulgu: finding.details,
        durum: formatStatus(finding.status, "finding"),
        risk: finding.riskType || "-",
        denetim: finding.audit?.title || "-",
        surecSahibi: finding.assignedTo?.name || "-",
        olusturan: finding.createdBy?.name || "-",
        tarih: formatDate(finding.createdAt),
      })),
      columns: [
        { header: "Bulgu Detayı", key: "bulgu", width: 50 },
        { header: "Durum", key: "durum", width: 20 },
        { header: "Risk Seviyesi", key: "risk", width: 15 },
        { header: "Denetim", key: "denetim", width: 30 },
        { header: "Süreç Sahibi", key: "surecSahibi", width: 25 },
        { header: "Oluşturan", key: "olusturan", width: 25 },
        { header: "Tarih", key: "tarih", width: 15 },
      ],
      summary: {
        "Toplam Bulgu": allFindings.length,
        "Yeni": allFindings.filter(f => f.status === "New").length,
        "Atanan": allFindings.filter(f => f.status === "Assigned").length,
        "Tamamlanan": allFindings.filter(f => f.status === "Completed").length,
      },
    },
  ];

  // Build metadata
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const metadata: ReportMetadata = {
    title: "Bulgular Listesi Raporu",
    generatedAt: new Date(),
    generatedBy: {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
    },
    reportType: "finding",
    format,
    description: `Toplam ${allFindings.length} bulgu`,
  };

  // Generate Excel
  return generateExcel(metadata, sections);
}
