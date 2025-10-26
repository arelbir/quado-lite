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
  name: string | null;
  email: string | null;
  userRoles?: Array<{
    role?: {
      code?: string;
      name?: string;
    };
  }>;
}

// ❌ REMOVED: Legacy UserRole type - Use multi-role system instead
// Roles are now fetched from userRoles array with role.code

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
  status: "Assigned" | "InProgress" | "Completed" | "Cancelled"; // UPDATED: Workflow integration
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
    | "Completed"  // UPDATED: Workflow integration
    | "Cancelled"; // UPDATED: Added exit state
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
// ORGANIZATION TYPES
// ============================================

export interface Company {
  id: string;
  name: string;
  code: string;
  legalName: string | null;
  taxNumber: string | null;
  description: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdById: string | null;
  deletedById: string | null;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: string;
  country: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email?: string | null;
  description?: string | null;
  managerId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdById: string | null;
  deletedById: string | null;
}

export interface Department {
  id: string;
  branchId: string | null;
  name: string;
  code: string;
  description: string | null;
  parentDepartmentId: string | null;
  managerId: string | null;
  costCenter: string | null;
  budget: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdById: string | null;
  deletedById: string | null;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  description: string | null;
  level: string | null;
  category: string | null;
  salaryGrade: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  createdById: string | null;
  deletedById: string | null;
}

// Organization types with relations
export interface BranchWithRelations extends Branch {
  manager?: Pick<User, 'id' | 'name' | 'email'> | null;
  _count?: {
    departments: number;
  };
}

export interface DepartmentWithRelations extends Department {
  manager?: Pick<User, 'id' | 'name' | 'email'> | null;
  children?: Department[];
}

// ============================================
// RESPONSE TYPES
// ============================================

export type ActionResponse<T = void> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; message?: string };

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
