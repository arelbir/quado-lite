/**
 * PERMISSION CHECKER SERVICE
 * Context-aware permission evaluation with caching
 * 
 * Features:
 * - Multi-role support
 * - Context-based evaluation (department, project)
 * - Constraint checking (JSON constraints)
 * - Performance caching
 * - Type-safe
 * 
 * Created: 2025-01-24
 * Sprint: Week 3 - Permission System Implementation
 */

import { db } from "@/core/database/client";
import { userRoles, rolePermissions, permissions } from "@/core/database/schema/role-system";
import { user } from "@/core/database/schema/user";
import { eq, and } from "drizzle-orm";

/**
 * Permission Check Request
 */
export interface PermissionCheck {
  resource: string;
  action: string;
  context?: {
    departmentId?: string;
    branchId?: string;
    type?: 'own' | 'any';
    [key: string]: any;
  };
}

/**
 * Permission Check Result
 */
export interface PermissionResult {
  granted: boolean;
  reason?: string;
  matchedRole?: string;
  matchedPermission?: string;
}

/**
 * PERMISSION CHECKER CLASS
 * Handles permission evaluation for a user
 */
export class PermissionChecker {
  private userId: string;
  private cache: Map<string, boolean> = new Map();
  private userContextCache: {
    departmentId?: string;
    branchId?: string;
    companyId?: string;
  } | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Main permission check method
   */
  async can(check: PermissionCheck): Promise<boolean> {
    const cacheKey = this.getCacheKey(check);
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = await this.evaluatePermission(check);
    
    // Cache result (5 min TTL in production, you'd use Redis)
    this.cache.set(cacheKey, result.granted);
    
    return result.granted;
  }

  /**
   * Detailed permission check (with reason)
   */
  async canWithReason(check: PermissionCheck): Promise<PermissionResult> {
    return this.evaluatePermission(check);
  }

  /**
   * Check multiple permissions (AND logic)
   */
  async canAll(checks: PermissionCheck[]): Promise<boolean> {
    const results = await Promise.all(checks.map(c => this.can(c)));
    return results.every(r => r);
  }

  /**
   * Check multiple permissions (OR logic)
   */
  async canAny(checks: PermissionCheck[]): Promise<boolean> {
    const results = await Promise.all(checks.map(c => this.can(c)));
    return results.some(r => r);
  }

  /**
   * CORE: Evaluate permission
   */
  private async evaluatePermission(check: PermissionCheck): Promise<PermissionResult> {
    try {
      // 1. Get user's active roles with permissions
      const userRolesList = await db.query.userRoles.findMany({
        where: and(
          eq(userRoles.userId, this.userId),
          eq(userRoles.isActive, true)
        ),
        with: {
          role: {
            with: {
              permissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        } as any,
      }) as any[];

      if (userRolesList.length === 0) {
        return {
          granted: false,
          reason: "User has no active roles",
        };
      }

      // 2. Check each role's permissions
      for (const userRole of userRolesList) {
        const role = userRole.role;

        // Check if role is active
        if (!role.isActive) continue;

        // Check time-based role validity
        if (userRole.validFrom && new Date(userRole.validFrom) > new Date()) {
          continue; // Role not yet valid
        }
        if (userRole.validTo && new Date(userRole.validTo) < new Date()) {
          continue; // Role expired
        }

        // Check role permissions
        for (const rolePerm of role.permissions) {
          const perm = rolePerm.permission;

          // Match permission (resource + action)
          if (perm.resource === check.resource && perm.action === check.action) {
            // Check context constraints
            const contextValid = await this.checkContext(
              userRole,
              rolePerm.constraints as any,
              check.context
            );

            if (contextValid) {
              return {
                granted: true,
                matchedRole: role.name,
                matchedPermission: perm.code,
              };
            }
          }
        }
      }

      return {
        granted: false,
        reason: `No permission found for ${check.resource}.${check.action}`,
      };
    } catch (error) {
      console.error("Permission check error:", error);
      return {
        granted: false,
        reason: "Permission check failed",
      };
    }
  }

  /**
   * Check context constraints
   */
  private async checkContext(
    userRole: any,
    constraints: Record<string, any> | null,
    requestContext?: PermissionCheck['context']
  ): Promise<boolean> {
    // No constraints = permission granted
    if (!constraints) return true;

    // No request context but constraints exist
    if (!requestContext && constraints) {
      // Check if constraints require context
      if (constraints.department || constraints.branch) {
        return false; // Context required but not provided
      }
      return true;
    }

    // Load user context if needed
    if (!this.userContextCache) {
      await this.loadUserContext();
    }

    // Check department constraint
    if (constraints.department) {
      if (constraints.department === 'own') {
        // User must be in the same department as the resource
        if (requestContext?.departmentId) {
          if (this.userContextCache?.departmentId !== requestContext.departmentId) {
            return false; // Different department
          }
        }
      } else if (constraints.department === 'any') {
        // User can access any department (no restriction)
        return true;
      }
    }

    // Check branch constraint
    if (constraints.branch) {
      if (constraints.branch === 'own') {
        if (requestContext?.branchId) {
          if (this.userContextCache?.branchId !== requestContext.branchId) {
            return false;
          }
        }
      }
    }

    // Check role context (if role is department-scoped)
    if (userRole.contextType === 'Department' && userRole.contextId) {
      // Role only applies in specific department
      if (requestContext?.departmentId !== userRole.contextId) {
        return false; // Wrong department
      }
    }

    // Check custom constraints
    if (constraints.status && requestContext?.status) {
      if (Array.isArray(constraints.status)) {
        if (!constraints.status.includes(requestContext.status)) {
          return false; // Status not in allowed list
        }
      }
    }

    return true; // All checks passed
  }

  /**
   * Load user organization context
   */
  private async loadUserContext(): Promise<void> {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, this.userId),
      columns: {
        departmentId: true,
        branchId: true,
        companyId: true,
      },
    });

    this.userContextCache = {
      departmentId: userRecord?.departmentId || undefined,
      branchId: userRecord?.branchId || undefined,
      companyId: userRecord?.companyId || undefined,
    };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(check: PermissionCheck): string {
    return `${check.resource}.${check.action}:${JSON.stringify(check.context || {})}`;
  }

  /**
   * Clear cache (call after role/permission changes)
   */
  clearCache(): void {
    this.cache.clear();
    this.userContextCache = null;
  }

  /**
   * Get user's all permissions (for debugging/display)
   */
  async getAllPermissions(): Promise<string[]> {
    const userRolesList = await db.query.userRoles.findMany({
      where: and(
        eq(userRoles.userId, this.userId),
        eq(userRoles.isActive, true)
      ),
      with: {
        role: {
          with: {
            permissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      } as any,
    }) as any[];

    const permissionCodes = new Set<string>();
    for (const userRole of userRolesList) {
      for (const rolePerm of userRole.role.permissions) {
        permissionCodes.add(rolePerm.permission.code);
      }
    }

    return Array.from(permissionCodes);
  }

  /**
   * Get user's roles
   */
  async getRoles(): Promise<Array<{ code: string; name: string; context?: string }>> {
    const userRolesList = await db.query.userRoles.findMany({
      where: and(
        eq(userRoles.userId, this.userId),
        eq(userRoles.isActive, true)
      ),
      with: {
        role: true,
      } as any,
    }) as any[];

    return userRolesList.map((ur: any) => ({
      code: ur.role.code,
      name: ur.role.name,
      context: ur.contextType !== 'Global' ? `${ur.contextType}:${ur.contextId}` : undefined,
    }));
  }
}

/**
 * FACTORY FUNCTIONS
 */

/**
 * Create permission checker for user
 */
export function createPermissionChecker(userId: string): PermissionChecker {
  return new PermissionChecker(userId);
}

/**
 * Quick permission check (throws error if denied)
 */
export async function requirePermission(
  userId: string,
  check: PermissionCheck
): Promise<void> {
  const checker = new PermissionChecker(userId);
  const result = await checker.canWithReason(check);
  
  if (!result.granted) {
    throw new Error(
      `Permission denied: ${check.resource}.${check.action}${
        result.reason ? ` (${result.reason})` : ''
      }`
    );
  }
}

/**
 * SHORTHAND HELPERS
 * Common permission checks
 */

export async function canCreateAudit(userId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ resource: 'Audit', action: 'Create' });
}

export async function canApproveAudit(userId: string, auditId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ 
    resource: 'Audit', 
    action: 'Approve',
    context: { id: auditId }
  });
}

export async function canCreateFinding(userId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ resource: 'Finding', action: 'Create' });
}

export async function canCloseFinding(userId: string, findingId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ 
    resource: 'Finding', 
    action: 'Close',
    context: { id: findingId }
  });
}

export async function canApproveAction(userId: string, actionId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ 
    resource: 'Action', 
    action: 'Approve',
    context: { id: actionId }
  });
}

export async function canApproveDOF(userId: string, dofId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ 
    resource: 'DOF', 
    action: 'Approve',
    context: { id: dofId }
  });
}

export async function canManageUsers(userId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.canAny([
    { resource: 'User', action: 'Create' },
    { resource: 'User', action: 'Update' },
    { resource: 'User', action: 'Delete' },
  ]);
}

export async function canManageRoles(userId: string): Promise<boolean> {
  const checker = new PermissionChecker(userId);
  return checker.can({ resource: 'Role', action: 'Create' });
}
