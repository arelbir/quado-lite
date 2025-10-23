/**
 * Authentication & Authorization Helpers
 * DRY: Tüm action dosyalarında kullanılacak ortak auth logic
 */

import { currentUser } from "@/lib/auth";
import type { User, ActionResponse } from "@/lib/types";

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
 */
export function requireAdmin(user: User): boolean {
  return user.role === "admin" || user.role === "superAdmin";
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
 * @example
 * ```typescript
 * export async function myAction(data: any): Promise<ActionResponse> {
 *   return withAuth(async (user) => {
 *     // Business logic here
 *     return { success: true, data: result };
 *   }, { requireAdmin: true });
 * }
 * ```
 */
export async function withAuth<T>(
  callback: (user: User) => Promise<ActionResponse<T>>,
  options?: { requireAdmin?: boolean }
): Promise<ActionResponse<T>> {
  const userResult = await requireUser();
  if ('error' in userResult) {
    return { success: false, error: userResult.error };
  }
  
  if (options?.requireAdmin && !requireAdmin(userResult.user)) {
    return { success: false, error: "Admin access required" };
  }
  
  try {
    return await callback(userResult.user);
  } catch (error) {
    console.error("Error in authenticated operation:", error);
    return { success: false, error: "Operation failed" };
  }
}
