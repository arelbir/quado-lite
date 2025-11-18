/**
 * Authentication & Authorization Helpers
 * DRY: Tüm action dosyalarında kullanılacak ortak auth logic
 * 
 * 🔥 UPDATED: Week 3 - Multi-role permission system support
 * - Backward compatible with legacy admin checks
 * - New: Permission-based authorization
 * - Context-aware permission checking
 */

import { currentUser } from "@/lib/auth/server";
import type { User, ActionResponse } from "@/types/domain";
import { createPermissionChecker, type PermissionCheck } from "@/lib/auth/permission-checker";
import { handleError } from '@/lib/monitoring/error-handler';

/**
 * HELPER: User authentication check
 * Returns authenticated user or error
 */
export async function requireUser(): Promise<{ user: User } | { error: string }> {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }
  return { user: user as User };
}

/**
 * HELPER: Admin yetkisi kontrolü
 * Returns true if user is admin or superAdmin
 * Uses new multi-role system
 */
export function requireAdmin(user: User): boolean {
  // Check session roles (string array from JWT)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
  }
  
  // Fallback: Check userRoles relation (if loaded)
  if (user.userRoles) {
    return user.userRoles.some((ur: any) => 
      ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN'
    );
  }
  
  return false;
}

/**
 * HELPER: Creator veya admin kontrolü
 * Returns true if user is creator or admin
 */
export function requireCreatorOrAdmin(user: User, creatorId: string): boolean {
  return user.id === creatorId || requireAdmin(user);
}

/**
 * HELPER: Auth wrapper - DRY authentication pattern
 * Wraps action functions with authentication and error handling
 * 
 * 🔥 ENHANCED: Now supports both legacy admin checks AND new permission system
 * 
 * @example Legacy (still works):
 * ```typescript
 * export async function deleteUser(id: string) {
 *   return withAuth(async (user) => {
 *     // Business logic
 *   }, { requireAdmin: true });
 * }
 * ```
 * 
 * @example New (permission-based):
 * ```typescript
 * export async function approveAudit(id: string) {
 *   return withAuth(async (user) => {
 *     // Business logic
 *   }, { 
 *     requirePermission: { 
 *       resource: 'Audit', 
 *       action: 'Approve' 
 *     }
 *   });
 * }
 * ```
 * 
 * @example Both systems:
 * ```typescript
 * export async function complexAction(id: string) {
 *   return withAuth(async (user) => {
 *     // Business logic
 *   }, { 
 *     requireAdmin: true, // OLD: Fallback check
 *     requirePermission: { // NEW: Primary check
 *       resource: 'Action', 
 *       action: 'Execute' 
 *     }
 *   });
 * }
 * ```
 */
export async function withAuth<T>(
  callback: (user: User) => Promise<ActionResponse<T>>,
  options?: { 
    requireAdmin?: boolean;
    requirePermission?: PermissionCheck;
  }
): Promise<ActionResponse<T>> {
  const userResult = await requireUser();
  if ('error' in userResult) {
    return { success: false, error: userResult.error };
  }
  
  const user = userResult.user;
  
  // 🔥 NEW: Permission-based check (primary)
  if (options?.requirePermission) {
    try {
      const checker = createPermissionChecker(user.id);
      const result = await checker.canWithReason(options.requirePermission);
      
      if (!result.granted) {
        return { 
          success: false, 
          error: `Permission denied: ${options.requirePermission.resource}.${options.requirePermission.action}${
            result.reason ? ` (${result.reason})` : ''
          }`
        };
      }
    } catch (error) {
      handleError(error as Error, {
        context: 'permission-check',
        userId: user.id,
        permission,
      });
      return { success: false, error: "Permission check failed" };
    }
  }
  
  // 🔵 LEGACY: Admin check (still supported for backward compatibility)
  if (options?.requireAdmin && !requireAdmin(user)) {
    return { success: false, error: "Admin access required" };
  }
  
  try {
    return await callback(user);
  } catch (error) {
    handleError(error as Error, {
      context: 'authenticated-operation',
      userId: user.id,
    });
    return { success: false, error: "Operation failed" };
  }
}
