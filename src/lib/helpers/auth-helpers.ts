/**
 * Authentication & Authorization Helpers
 * DRY: Tüm action dosyalarında kullanılacak ortak auth logic
 * 
 * Multi-role permission system:
 * - Permission-based authorization
 * - Context-aware permission checking
 * - Role-based access control
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
 * HELPER: Auth wrapper - DRY authentication pattern
 * Wraps action functions with authentication and error handling
 * 
 * Permission-based authorization system
 * 
 * @example
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
 */
export async function withAuth<T>(
  callback: (user: User) => Promise<ActionResponse<T>>,
  options?: { 
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
        resource: options.requirePermission.resource,
        action: options.requirePermission.action,
      });
      return { success: false, error: "Permission check failed" };
    }
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
