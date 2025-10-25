"use server";

import { db } from "@/drizzle/db";
import { exportToExcel } from "@/lib/export/excel-export-service";

// Helper functions for status labels
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    New: "Yeni",
    Assigned: "Atandı",
    InProgress: "İşlemde",
    PendingAuditorClosure: "Onay Bekliyor",
    Completed: "Tamamlandı",
    Rejected: "Reddedildi",
  };
  return labels[status] || status;
}

function getActionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    Assigned: "Atandı",
    InProgress: "İşlemde",
    Completed: "Tamamlandı",
    Cancelled: "İptal Edildi",
  };
  return labels[status] || status;
}

/**
 * Bulguları Excel'e export et
 */
export async function exportFindingsToExcel(): Promise<Buffer> {
  // Fetch findings with relations for export
  const findingsData = await db.query.findings.findMany({
    with: {
      createdBy: { columns: { id: true, name: true } },
    },
  });

  // Type assertion needed because relations aren't fully inferred
  const data = findingsData.map((finding: any) => ({
    bulgu: finding.details,
    durum: getStatusLabel(finding.status),
    risk: finding.riskType || "-",
    denetim: "-", // Audit title - TODO: Add audit relation if needed
    surecSahibi: "-", // Assigned user - TODO: Add assignedTo relation if needed
    tarih: new Date(finding.createdAt).toLocaleDateString("tr-TR"),
  }));

  return exportToExcel({
    filename: `bulgular_${Date.now()}.xlsx`,
    sheetName: "Bulgular",
    title: "Denetim Bulguları Raporu",
    data,
    columns: [
      { header: "Bulgu Detayı", key: "bulgu", width: 50 },
      { header: "Durum", key: "durum", width: 20 },
      { header: "Risk Seviyesi", key: "risk", width: 15 },
      { header: "Denetim", key: "denetim", width: 30 },
      { header: "Süreç Sahibi", key: "surecSahibi", width: 25 },
      { header: "Tarih", key: "tarih", width: 15 },
    ],
    includeTimestamp: true,
  });
}

/**
 * Aksiyonları Excel'e export et
 */
export async function exportActionsToExcel(): Promise<Buffer> {
  // Fetch actions with relations for export
  const actionsData = await db.query.actions.findMany({
    with: {
      createdBy: { columns: { id: true, name: true } },
    },
  });

  // Type assertion needed because relations aren't fully inferred
  const data = actionsData.map((action: any) => ({
    aksiyon: action.details,
    durum: getActionStatusLabel(action.status),
    sorumlu: "-", // Assigned user - TODO: Add assignedTo relation if needed
    yonetici: "-", // Manager - TODO: Add manager relation if needed
    bulgu: "-", // Finding - TODO: Add finding relation if needed
    tarih: new Date(action.createdAt).toLocaleDateString("tr-TR"),
  }));

  return exportToExcel({
    filename: `aksiyonlar_${Date.now()}.xlsx`,
    sheetName: "Aksiyonlar",
    title: "Aksiyonlar Raporu",
    data,
    columns: [
      { header: "Aksiyon Detayı", key: "aksiyon", width: 50 },
      { header: "Durum", key: "durum", width: 20 },
      { header: "Sorumlu", key: "sorumlu", width: 25 },
      { header: "Yönetici", key: "yonetici", width: 25 },
      { header: "İlgili Bulgu", key: "bulgu", width: 50 },
      { header: "Tarih", key: "tarih", width: 15 },
    ],
    includeTimestamp: true,
  });
}

/**
 * Denetim detaylı raporu (çoklu sheet)
 */
export async function exportAuditReport(auditId: string): Promise<Buffer> {
  // TODO: Implement audit report export
  // This will include multiple sheets: audit info, findings, actions, etc.
  return Buffer.from("");
}
