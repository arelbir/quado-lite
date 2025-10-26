/**
 * ACTIONS LIST REPORT TEMPLATE
 * Simple list export of all actions
 */

"use server";

import { db } from "@/drizzle/db";
import { actions } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { generateExcel } from "../excel/excel-generator";
import type { ReportSection, ReportMetadata } from "../core/report-types";
import { formatDate, formatStatus, formatPercentage, calculatePercentage } from "../formatters";

/**
 * Generate actions list report
 * 
 * @param format - Export format (excel or pdf)
 * @returns Buffer of generated report
 */
export async function generateActionsListReport(
  format: "excel" | "pdf" = "excel"
): Promise<Buffer> {
  // Fetch all actions with relations
  const allActions = await db.query.actions.findMany({
    with: {
      // @ts-ignore - Drizzle relation type inference limitation
      assignedTo: {
        columns: {
          id: true,
          name: true,
        },
      },
      // @ts-ignore - Drizzle relation type inference limitation
      manager: {
        columns: {
          id: true,
          name: true,
        },
      },
      // @ts-ignore - Drizzle relation type inference limitation
      finding: {
        columns: {
          id: true,
          details: true,
        },
      },
      createdBy: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (actions, { desc }) => [desc(actions.createdAt)],
  });

  const completed = allActions.filter((a: any) => a.status === "Completed").length;
  const completionRate = calculatePercentage(completed, allActions.length);

  // Build sections
  const sections: ReportSection[] = [
    {
      title: "Aksiyonlar Listesi",
      data: allActions.map((action: any) => ({
        aksiyon: action.details,
        durum: formatStatus(action.status, "action"),
        tip: action.type || "-",
        sorumlu: action.assignedTo?.name || "-",
        yonetici: action.manager?.name || "-",
        bulgu: action.finding?.details?.substring(0, 50) || "-",
        olusturan: action.createdBy?.name || "-",
        tarih: formatDate(action.createdAt),
      })),
      columns: [
        { header: "Aksiyon Detayı", key: "aksiyon", width: 50 },
        { header: "Durum", key: "durum", width: 20 },
        { header: "Tip", key: "tip", width: 15 },
        { header: "Sorumlu", key: "sorumlu", width: 25 },
        { header: "Yönetici", key: "yonetici", width: 25 },
        { header: "İlgili Bulgu", key: "bulgu", width: 50 },
        { header: "Oluşturan", key: "olusturan", width: 25 },
        { header: "Tarih", key: "tarih", width: 15 },
      ],
      summary: {
        "Toplam Aksiyon": allActions.length,
        "Tamamlanan": completed,
        "İşlemde": allActions.filter((a: any) => a.status === "InProgress").length,
        "Tamamlanma Oranı": formatPercentage(completionRate),
      },
    },
  ];

  // Build metadata
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const metadata: ReportMetadata = {
    title: "Aksiyonlar Listesi Raporu",
    generatedAt: new Date(),
    generatedBy: {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      role: user.role,
    },
    reportType: "action",
    format,
    description: `Toplam ${allActions.length} aksiyon (${formatPercentage(completionRate)} tamamlandı)`,
  };

  // Generate Excel
  return generateExcel(metadata, sections);
}
