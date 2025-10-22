"use server";

import { getFindings } from "./finding-actions";
import { getMyActions } from "./action-actions";
import { exportToExcel } from "@/lib/export/excel-export-service";

/**
 * Bulguları Excel'e export et
 */
export async function exportFindingsToExcel(): Promise<Buffer> {
  const findings = await getFindings();

  const data = findings.map((finding) => ({
    bulgu: finding.details,
    durum: getStatusLabel(finding.status),
    risk: finding.riskType || "-",
    denetim: finding.audit?.title || "-",
    surecSahibi: finding.assignedTo?.name || "-",
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
  const actions = await getMyActions();

  const data = actions.map((action) => ({
    aksiyon: action.details,
    durum: getActionStatusLabel(action.status),
    sorumlu: action.assignedTo?.name || "-",
    yonetici: action.manager?.name || "-",
    bulgu: action.finding?.details.substring(0, 50) + "..." || "-",
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
  // Bu fonksiyonu daha sonra implement edeceğiz
  // Şimdilik placeholder
  return Buffer.from("");
}

// Helper functions
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
    PendingManagerApproval: "Onay Bekliyor",
    Completed: "Tamamlandı",
    Rejected: "Reddedildi",
  };
  return labels[status] || status;
}
