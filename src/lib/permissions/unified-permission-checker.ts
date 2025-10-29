/**
 * UNIFIED PERMISSION SYSTEM
 * Single source of truth for ALL permissions
 * 
 * Features:
 * - Role-based permissions (from Permissions table)
 * - Workflow-based permissions (from WorkflowInstance)
 * - Ownership-based permissions
 * - JSON constraint evaluation
 * - Admin bypass
 * 
 * Created: 2025-01-29
 * Pattern: DRY + SOLID + Type-Safe
 */

import { db } from "@/drizzle/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  permissions,
  rolePermissions,
  stepAssignments,
  user,
} from "@/drizzle/schema";

/**
 * TYPES
 */

export interface PermissionUser {
  id: string;
  email?: string | null;
  userRoles?: Array<{
    role: {
      id: string;
      code: string;
      name: string;
    };
  }>;
}

export interface PermissionEntity {
  id: string;
  createdById?: string | null;
  assignedToId?: string | null;
  managerId?: string | null; // For approval workflows
  status?: string;
  departmentId?: string | null;
  workflowInstanceId?: string | null;
}

export interface PermissionContext {
  user: PermissionUser;
  resource: string; // "audit", "finding", "action", "dof", "user", etc.
  action: string; // "create", "read", "update", "delete", "approve", "reject", "submit", "cancel"
  entity?: PermissionEntity;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  source?: "admin" | "role" | "workflow" | "ownership" | "denied";
}

/**
 * MAIN PERMISSION CHECKER
 * Single function to check all permissions
 */
export async function checkPermission(
  context: PermissionContext
): Promise<PermissionResult> {
  const { user: inputUser, resource, action, entity } = context;

  // Validate user
  if (!inputUser || !inputUser.id) {
    return {
      allowed: false,
      reason: "User not authenticated",
      source: "denied",
    };
  }

  // ✅ Load userRoles if not provided (for session users)
  let userWithRoles = inputUser;
  if (!userWithRoles.userRoles || userWithRoles.userRoles.length === 0) {
    const fullUser = await db.query.user.findFirst({
      where: eq(user.id, inputUser.id),
      with: {
        userRoles: {
          with: {
            role: true,
          },
        },
      },
    });
    
    if (fullUser?.userRoles) {
      userWithRoles = { ...inputUser, userRoles: fullUser.userRoles as any };
    }
  }

  // 1️⃣ ADMIN BYPASS (Super Admin can do everything)
  if (isAdmin(userWithRoles)) {
    return {
      allowed: true,
      source: "admin",
    };
  }

  // 2️⃣ ROLE-BASED PERMISSIONS (From Permissions table)
  const rolePermission = await checkRolePermission(userWithRoles, resource, action, entity);
  if (rolePermission.allowed) {
    return rolePermission;
  }

  // 3️⃣ WORKFLOW-BASED PERMISSIONS (From WorkflowInstance)
  if (entity?.workflowInstanceId) {
    const workflowPermission = await checkWorkflowPermission(
      userWithRoles,
      entity.workflowInstanceId,
      action
    );
    if (workflowPermission.allowed) {
      return workflowPermission;
    }
  }

  // 4️⃣ OWNERSHIP-BASED PERMISSIONS (Own records)
  const ownershipPermission = checkOwnershipPermission(userWithRoles, action, entity);
  if (ownershipPermission.allowed) {
    return ownershipPermission;
  }

  // ❌ DEFAULT: DENY
  return {
    allowed: false,
    reason: `User does not have permission: ${resource}.${action}`,
    source: "denied",
  };
}

/**
 * Check if user is admin
 */
function isAdmin(user: PermissionUser): boolean {
  return (
    user.userRoles?.some(
      (ur) =>
        ur.role?.code === "SUPER_ADMIN" || ur.role?.code === "ADMIN"
    ) ?? false
  );
}

/**
 * Check role-based permissions from Permissions table
 */
async function checkRolePermission(
  user: PermissionUser,
  resource: string,
  action: string,
  entity?: PermissionEntity
): Promise<PermissionResult> {
  // Get user's role IDs
  const userRoleIds = user.userRoles?.map((ur) => ur.role.id) ?? [];

  if (userRoleIds.length === 0) {
    return { allowed: false, source: "denied" };
  }

  try {
    // Query: RolePermissions with constraints
    const rolePerms = await db
      .select({
        permissionCode: permissions.code,
        permissionResource: permissions.resource,
        permissionAction: permissions.action,
        constraints: rolePermissions.constraints,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(permissions.resource, resource),
          eq(permissions.action, action),
          inArray(rolePermissions.roleId, userRoleIds)
        )
      );

    if (rolePerms.length === 0) {
      return { allowed: false, source: "denied" };
    }

    // Check constraints (JSON)
    for (const perm of rolePerms) {
      if (!perm.constraints) {
        // No constraints → Allowed
        return {
          allowed: true,
          source: "role",
        };
      }

      // Evaluate constraints
      const constraints = perm.constraints as any;
      if (evaluateConstraints(constraints, entity, user)) {
        return {
          allowed: true,
          source: "role",
        };
      }
    }

    return {
      allowed: false,
      reason: "Permission constraints not satisfied",
      source: "denied",
    };
  } catch (error) {
    console.error("[checkRolePermission] Error:", error);
    return { allowed: false, source: "denied" };
  }
}

/**
 * Check workflow-based permissions
 */
async function checkWorkflowPermission(
  user: PermissionUser,
  workflowInstanceId: string,
  action: string
): Promise<PermissionResult> {
  try {
    // Get current step assignment
    const assignment = await db.query.stepAssignments.findFirst({
      where: and(
        eq(stepAssignments.workflowInstanceId, workflowInstanceId),
        eq(stepAssignments.status, "in_progress")
      ),
      with: {
        workflowInstance: true,
      },
    });

    if (!assignment) {
      return { allowed: false, source: "denied" };
    }

    // Check if user is assigned to this step
    const isAssignedUser = assignment.assignedUserId === user.id;
    const isAssignedRole =
      assignment.assignedRole &&
      user.userRoles?.some((ur) => ur.role.code === assignment.assignedRole);

    if (isAssignedUser || isAssignedRole) {
      // Workflow step actions
      if (["approve", "reject", "complete", "submit", "update"].includes(action)) {
        return {
          allowed: true,
          source: "workflow",
        };
      }
    }

    return { allowed: false, source: "denied" };
  } catch (error) {
    console.error("[checkWorkflowPermission] Error:", error);
    return { allowed: false, source: "denied" };
  }
}

/**
 * Check ownership-based permissions
 */
function checkOwnershipPermission(
  user: PermissionUser,
  action: string,
  entity?: PermissionEntity
): PermissionResult {
  if (!entity) {
    return { allowed: false, source: "denied" };
  }

  // Owner can view and edit their own records
  const isOwner = entity.createdById === user.id;
  const isAssigned = entity.assignedToId === user.id;

  if (isOwner || isAssigned) {
    if (["read", "update"].includes(action)) {
      return {
        allowed: true,
        source: "ownership",
      };
    }
  }

  return { allowed: false, source: "denied" };
}

/**
 * Evaluate JSON constraints
 * 
 * Supported constraints:
 * - department: "own" | "any"
 * - status: ["Active", "InProgress", ...]
 * - owner: "self" | "any"
 * - assigned: "self" | "any"
 */
function evaluateConstraints(
  constraints: Record<string, any>,
  entity: PermissionEntity | undefined,
  user: PermissionUser
): boolean {
  if (!constraints || Object.keys(constraints).length === 0) {
    return true;
  }

  // Department constraint
  if (constraints.department === "own") {
    if (!entity?.departmentId || entity.departmentId !== (user as any).departmentId) {
      return false;
    }
  }

  // Status constraint
  if (constraints.status && Array.isArray(constraints.status)) {
    if (!entity?.status || !constraints.status.includes(entity.status)) {
      return false;
    }
  }

  // Owner constraint
  if (constraints.owner === "self") {
    if (!entity?.createdById || entity.createdById !== user.id) {
      return false;
    }
  }

  // Assigned constraint
  if (constraints.assigned === "self") {
    if (!entity?.assignedToId || entity.assignedToId !== user.id) {
      return false;
    }
  }

  return true;
}

/**
 * SHORTHAND HELPERS
 * Backward compatible with existing code
 */

export async function canCreate(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "create",
    entity,
  });
  return result.allowed;
}

export async function canRead(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "read",
    entity,
  });
  return result.allowed;
}

export async function canUpdate(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "update",
    entity,
  });
  return result.allowed;
}

export async function canDelete(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "delete",
    entity,
  });
  return result.allowed;
}

export async function canApprove(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "approve",
    entity,
  });
  return result.allowed;
}

export async function canReject(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "reject",
    entity,
  });
  return result.allowed;
}

export async function canSubmit(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "submit",
    entity,
  });
  return result.allowed;
}

export async function canCancel(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<boolean> {
  const result = await checkPermission({
    user,
    resource,
    action: "cancel",
    entity,
  });
  return result.allowed;
}

/**
 * BATCH PERMISSION CHECK
 * Check multiple permissions at once
 */
export async function checkMultiplePermissions(
  user: PermissionUser,
  checks: Array<{
    resource: string;
    action: string;
    entity?: PermissionEntity;
  }>
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const check of checks) {
    const key = `${check.resource}.${check.action}`;
    const result = await checkPermission({
      user,
      resource: check.resource,
      action: check.action,
      entity: check.entity,
    });
    results[key] = result.allowed;
  }

  return results;
}

/**
 * GET USER PERMISSIONS FOR ENTITY
 * Returns all available actions for a specific entity
 */
export async function getUserPermissionsForEntity(
  user: PermissionUser,
  resource: string,
  entity?: PermissionEntity
): Promise<{
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canSubmit: boolean;
  canCancel: boolean;
}> {
  const actions = ["create", "read", "update", "delete", "approve", "reject", "submit", "cancel"];
  
  const results = await Promise.all(
    actions.map(async (action) => {
      const result = await checkPermission({
        user,
        resource,
        action,
        entity,
      });
      return [action, result.allowed] as [string, boolean];
    })
  );

  return {
    canCreate: results.find(([a]) => a === "create")?.[1] ?? false,
    canRead: results.find(([a]) => a === "read")?.[1] ?? false,
    canUpdate: results.find(([a]) => a === "update")?.[1] ?? false,
    canDelete: results.find(([a]) => a === "delete")?.[1] ?? false,
    canApprove: results.find(([a]) => a === "approve")?.[1] ?? false,
    canReject: results.find(([a]) => a === "reject")?.[1] ?? false,
    canSubmit: results.find(([a]) => a === "submit")?.[1] ?? false,
    canCancel: results.find(([a]) => a === "cancel")?.[1] ?? false,
  };
}
