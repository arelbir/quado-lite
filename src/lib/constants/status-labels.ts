/**
 * Central Status Labels & Configurations
 * Tüm status label'ları ve renk mapping'leri tek bir dosyada
 * DRY & SOLID prensipleri: Single source of truth
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Audit Status Types
 */
export type AuditStatus = "Active" | "InReview" | "PendingClosure" | "Closed" | "Archived";

/**
 * Plan Status Types
 */
export type PlanStatus = "Pending" | "Created" | "Cancelled";

/**
 * Finding Status Types
 */
export type FindingStatus = "New" | "Assigned" | "InProgress" | "PendingAuditorClosure" | "Completed" | "Rejected";

/**
 * Action Status Types
 */
export type ActionStatus = "Assigned" | "PendingManagerApproval" | "Completed" | "Rejected" | "Cancelled";

/**
 * Action Type Categories
 */
export type ActionType = "Simple" | "Corrective" | "Preventive";

/**
 * DOF Status Types
 */
export type DofStatus = 
  | "Step1_Problem" 
  | "Step2_TempMeasures" 
  | "Step3_RootCause" 
  | "Step4_Activities" 
  | "Step5_Implementation" 
  | "Step6_EffectivenessCheck" 
  | "PendingManagerApproval" 
  | "Completed" 
  | "Rejected";

/**
 * Risk Type Levels
 */
export type RiskType = "Kritik" | "Yüksek" | "Orta" | "Düşük";

/**
 * Activity Types (DOF)
 */
export type ActivityType = "Düzeltici" | "Önleyici";

// ============================================
// AUDIT STATUS
// ============================================
export const AUDIT_STATUS_LABELS = {
  Active: "Devam Ediyor",
  InReview: "İnceleme Aşamasında",
  PendingClosure: "Kapanış Bekliyor",
  Closed: "Tamamlandı",
  Archived: "Arşivlendi",
} as const;

export const AUDIT_STATUS_COLORS = {
  Active: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  InReview: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  PendingClosure: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  Closed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  Archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
} as const;

// ============================================
// AUDIT PLAN STATUS
// ============================================
export const PLAN_STATUS_LABELS = {
  Pending: "Plan Bekliyor",
  Created: "Oluşturuldu",
  Cancelled: "İptal Edildi",
} as const;

export const PLAN_STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  Created: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
} as const;

// ============================================
// FINDING STATUS
// ============================================
export const FINDING_STATUS_LABELS = {
  New: "Yeni",
  Assigned: "Atandı",
  InProgress: "İşlemde",
  PendingAuditorClosure: "Onay Bekliyor",
  Completed: "Tamamlandı",
  Rejected: "Reddedildi",
} as const;

export const FINDING_STATUS_COLORS = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  Assigned: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
  InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  PendingAuditorClosure: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
} as const;

// ============================================
// ACTION STATUS (UPDATED: Workflow integration)
// ============================================
export const ACTION_STATUS_LABELS = {
  Assigned: "Atandı",
  InProgress: "Devam Ediyor",
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi",
} as const;

export const ACTION_STATUS_COLORS = {
  Assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  Cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
} as const;

// ============================================
// ACTION TYPE
// ============================================
export const ACTION_TYPE_LABELS = {
  Simple: "Basit",
  Corrective: "Düzeltici",
  Preventive: "Önleyici",
} as const;

export const ACTION_TYPE_COLORS = {
  Simple: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400",
  Corrective: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  Preventive: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
} as const;

// ============================================
// DOF STATUS
// ============================================
export const DOF_STATUS_LABELS = {
  Step1_Problem: "1. Problem Tanımı",
  Step2_TempMeasures: "2. Geçici Önlemler",
  Step3_RootCause: "3. Kök Neden Analizi",
  Step4_Activities: "4. Faaliyetler",
  Step5_Implementation: "5. Uygulama",
  Step6_EffectivenessCheck: "6. Etkinlik Kontrolü",
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi",
} as const;

export const DOF_STATUS_COLORS = {
  Step1_Problem: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  Step2_TempMeasures: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400",
  Step3_RootCause: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
  Step4_Activities: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  Step5_Implementation: "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400",
  Step6_EffectivenessCheck: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  Cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
} as const;

// ============================================
// RISK TYPES
// ============================================
export const RISK_TYPE_LABELS = {
  Kritik: "Kritik",
  Yüksek: "Yüksek",
  Orta: "Orta",
  Düşük: "Düşük",
} as const;

export const RISK_TYPE_COLORS = {
  Kritik: "text-red-600 font-bold",
  Yüksek: "text-orange-600 font-semibold",
  Orta: "text-yellow-600 font-medium",
  Düşük: "text-green-600 font-normal",
} as const;

// ============================================
// ACTIVITY TYPE (DOF)
// ============================================
export const ACTIVITY_TYPE_LABELS = {
  Düzeltici: "Düzeltici",
  Önleyici: "Önleyici",
} as const;

export const ACTIVITY_TYPE_COLORS = {
  Düzeltici: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  Önleyici: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
} as const;

// ============================================
// QUESTION BANK STATUS
// ============================================
export const QUESTION_BANK_STATUS_LABELS = {
  active: "Aktif",
  inactive: "Pasif",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Audit status için label döndürür
 */
export function getAuditStatusLabel(status: string): string {
  return AUDIT_STATUS_LABELS[status as keyof typeof AUDIT_STATUS_LABELS] || status;
}

/**
 * Audit status için renk class döndürür
 */
export function getAuditStatusColor(status: string): string {
  return AUDIT_STATUS_COLORS[status as keyof typeof AUDIT_STATUS_COLORS] || "bg-gray-100 text-gray-800";
}

/**
 * Finding status için label döndürür
 */
export function getFindingStatusLabel(status: string): string {
  return FINDING_STATUS_LABELS[status as keyof typeof FINDING_STATUS_LABELS] || status;
}

/**
 * Finding status için renk class döndürür
 */
export function getFindingStatusColor(status: string): string {
  return FINDING_STATUS_COLORS[status as keyof typeof FINDING_STATUS_COLORS] || "bg-gray-100 text-gray-800";
}

/**
 * Action status için label döndürür
 */
export function getActionStatusLabel(status: string): string {
  return ACTION_STATUS_LABELS[status as keyof typeof ACTION_STATUS_LABELS] || status;
}

/**
 * Action status için renk class döndürür
 */
export function getActionStatusColor(status: string): string {
  return ACTION_STATUS_COLORS[status as keyof typeof ACTION_STATUS_COLORS] || "bg-gray-100 text-gray-800";
}

/**
 * DOF status için label döndürür
 */
export function getDofStatusLabel(status: string): string {
  return DOF_STATUS_LABELS[status as keyof typeof DOF_STATUS_LABELS] || status;
}

/**
 * DOF status için renk class döndürür
 */
export function getDofStatusColor(status: string): string {
  return DOF_STATUS_COLORS[status as keyof typeof DOF_STATUS_COLORS] || "bg-gray-100 text-gray-800";
}

/**
 * Risk type için label döndürür
 */
export function getRiskTypeLabel(riskType: string): string {
  return RISK_TYPE_LABELS[riskType as keyof typeof RISK_TYPE_LABELS] || riskType;
}

/**
 * Risk type için renk class döndürür
 */
export function getRiskTypeColor(riskType: string): string {
  return RISK_TYPE_COLORS[riskType as keyof typeof RISK_TYPE_COLORS] || "text-gray-600";
}

/**
 * Action type için label döndürür
 */
export function getActionTypeLabel(type: string): string {
  return ACTION_TYPE_LABELS[type as keyof typeof ACTION_TYPE_LABELS] || type;
}

/**
 * Action type için renk class döndürür
 */
export function getActionTypeColor(type: string): string {
  return ACTION_TYPE_COLORS[type as keyof typeof ACTION_TYPE_COLORS] || "bg-gray-100 text-gray-800";
}
