/**
 * FINDING PERMISSIONS
 * Centralized permission logic for finding-related actions
 * 
 * MIGRATION STATUS:
 * ✅ Migrated to unified permission system
 * ✅ Uses checkPermission() from unified-permission-checker
 * ✅ Backward compatible (same function signatures)
 * 
 * DRY + SOLID principles
 */

import type { User } from "@/lib/types";
import { checkPermission, type PermissionUser, type PermissionEntity } from "./unified-permission-checker";

interface Finding {
  id: string;
  assignedToId: string | null;
  status: string;
  createdById: string | null;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.userRoles?.some(
    (ur: any) => ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN'
  ) ?? false;
}

/**
 * Check if user is the process owner (assigned to finding)
 */
export function isProcessOwner(user: User, finding: Finding): boolean {
  return finding.assignedToId === user.id;
}

/**
 * Check if user is the finding creator
 */
export function isFindingCreator(user: User, finding: Finding): boolean {
  return finding.createdById === user.id;
}

/**
 * Check if user can create actions for this finding
 * Rule: Uses unified permission system (action.create)
 * ✅ MIGRATED to unified system
 */
export async function canCreateAction(user: User, finding: Finding): Promise<boolean> {
  const result = await checkPermission({
    user: user as PermissionUser,
    resource: "action",
    action: "create",
    entity: {
      id: finding.id,
      assignedToId: finding.assignedToId,
      createdById: finding.createdById,
      status: finding.status,
    } as PermissionEntity,
  });
  return result.allowed;
}

/**
 * Check if user can create DOF for this finding
 * Rule: Uses unified permission system (dof.create)
 * ✅ MIGRATED to unified system
 */
export async function canCreateDOF(user: User, finding: Finding): Promise<boolean> {
  const result = await checkPermission({
    user: user as PermissionUser,
    resource: "dof",
    action: "create",
    entity: {
      id: finding.id,
      assignedToId: finding.assignedToId,
      createdById: finding.createdById,
      status: finding.status,
    } as PermissionEntity,
  });
  return result.allowed;
}

/**
 * Check if user can edit this finding
 * Rule: Uses unified permission system (finding.update)
 * ✅ MIGRATED to unified system
 */
export async function canEditFinding(user: User, finding: Finding): Promise<boolean> {
  const result = await checkPermission({
    user: user as PermissionUser,
    resource: "finding",
    action: "update",
    entity: {
      id: finding.id,
      assignedToId: finding.assignedToId,
      createdById: finding.createdById,
      status: finding.status,
    } as PermissionEntity,
  });
  return result.allowed;
}

/**
 * Check if user can close this finding
 * Rule: Uses unified permission system (finding.submit)
 * ✅ MIGRATED to unified system
 */
export async function canCloseFinding(user: User, finding: Finding): Promise<boolean> {
  const result = await checkPermission({
    user: user as PermissionUser,
    resource: "finding",
    action: "submit",
    entity: {
      id: finding.id,
      assignedToId: finding.assignedToId,
      createdById: finding.createdById,
      status: finding.status,
    } as PermissionEntity,
  });
  return result.allowed;
}

/**
 * Check if user can view this finding
 * Rule: Uses unified permission system (finding.read)
 * ✅ MIGRATED to unified system
 */
export async function canViewFinding(user: User, finding: Finding): Promise<boolean> {
  const result = await checkPermission({
    user: user as PermissionUser,
    resource: "finding",
    action: "read",
    entity: {
      id: finding.id,
      assignedToId: finding.assignedToId,
      createdById: finding.createdById,
      status: finding.status,
    } as PermissionEntity,
  });
  return result.allowed;
}

/**
 * Get permission summary for UI
 * ⚠️ ASYNC now - returns Promise
 * ✅ FULLY MIGRATED - All checks use unified system
 */
export async function getFindingPermissions(user: User, finding: Finding) {
  // Run all permission checks in parallel for performance
  const [
    canViewResult,
    canEditResult,
    canCloseResult,
    canCreateActionResult,
    canCreateDOFResult,
  ] = await Promise.all([
    canViewFinding(user, finding),
    canEditFinding(user, finding),
    canCloseFinding(user, finding),
    canCreateAction(user, finding),
    canCreateDOF(user, finding),
  ]);

  return {
    canView: canViewResult,
    canEdit: canEditResult,
    canClose: canCloseResult,
    canCreateAction: canCreateActionResult,
    canCreateDOF: canCreateDOFResult,
    isProcessOwner: isProcessOwner(user, finding),
    isCreator: isFindingCreator(user, finding),
    isAdmin: isAdmin(user),
  };
}
