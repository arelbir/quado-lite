/**
 * Common Types - Central Type Definitions
 * DRY: Tüm type'lar tek bir dosyada
 * SOLID: Single source of truth
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  role: "admin" | "superAdmin" | "user";
  name: string | null;
  email: string | null;
}

export type UserRole = User["role"];

// ============================================
// PLAN TYPES
// ============================================

export interface Plan {
  id: string;
  title: string;
  description: string | null;
  status: "Pending" | "Created" | "Cancelled";
  createdById: string | null;
  templateId: string | null;
  scheduledDate: Date | null;
  [key: string]: any; // For additional fields from DB
}

export type PlanStatus = Plan["status"];

// ============================================
// ACTION TYPES
// ============================================

export interface Action {
  id: string;
  title: string;
  description: string | null;
  status: "Assigned" | "PendingManagerApproval" | "Completed" | "Rejected" | "Cancelled";
  type: "Simple" | "Corrective" | "Preventive";
  assignedToId: string | null;
  managerId: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
  [key: string]: any;
}

export type ActionStatus = Action["status"];
export type ActionType = Action["type"];

// ============================================
// FINDING TYPES
// ============================================

export interface Finding {
  id: string;
  title: string;
  description: string | null;
  status: "New" | "Assigned" | "InProgress" | "PendingAuditorClosure" | "Completed" | "Rejected";
  riskType: "Kritik" | "Yüksek" | "Orta" | "Düşük";
  assignedToId: string | null;
  auditorId: string | null;
  [key: string]: any;
}

export type FindingStatus = Finding["status"];
export type RiskType = Finding["riskType"];

// ============================================
// DOF TYPES
// ============================================

export interface DOF {
  id: string;
  title: string;
  description: string | null;
  status: 
    | "Step1_Problem"
    | "Step2_TempMeasures"
    | "Step3_RootCause"
    | "Step4_Activities"
    | "Step5_Implementation"
    | "Step6_EffectivenessCheck"
    | "PendingManagerApproval"
    | "Completed"
    | "Rejected";
  activityType: "Düzeltici" | "Önleyici";
  assignedToId: string | null;
  managerId: string | null;
  [key: string]: any;
}

export type DOFStatus = DOF["status"];
export type ActivityType = DOF["activityType"];

// ============================================
// AUDIT TYPES
// ============================================

export interface Audit {
  id: string;
  title: string;
  description: string | null;
  status: "Active" | "InReview" | "PendingClosure" | "Closed" | "Archived";
  auditDate: Date;
  createdById: string;
  [key: string]: any;
}

export type AuditStatus = Audit["status"];

// ============================================
// RESPONSE TYPES
// ============================================

export type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// HELPER TYPE UTILITIES
// ============================================

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make specific properties optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Pick only the specified properties
 */
export type PickProps<T, K extends keyof T> = Pick<T, K>;
