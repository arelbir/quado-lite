/**
 * Central Helper Exports
 * Tüm helper functions'ı tek yerden export et
 */

// Auth Helpers
export {
  requireUser,
  requireAdmin,
  requireCreatorOrAdmin,
  withAuth,
} from "./auth-helpers";

// 🔥 NEW: Permission System (Week 3)
export {
  createPermissionChecker,
  requirePermission,
  canCreateAudit,
  canApproveAudit,
  canCreateFinding,
  canCloseFinding,
  canApproveAction,
  canApproveDOF,
  canManageUsers,
  canManageRoles,
  type PermissionCheck,
  type PermissionResult,
  PermissionChecker,
} from "@/lib/auth/permission-checker";

// Error Helpers
export {
  createActionError,
  createValidationError,
  createNotFoundError,
  createPermissionError,
} from "./error-helpers";

// Revalidation Helpers
export {
  revalidateAuditPaths,
  revalidateActionPaths,
  revalidateFindingPaths,
  revalidateDOFPaths,
  revalidateOrganizationPaths,
  revalidateCommonPaths,
} from "./revalidation-helpers";
