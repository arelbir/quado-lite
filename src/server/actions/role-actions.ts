"use server";

import { db } from "@/core/database/client";
import { 
  roles, 
  rolePermissions, 
  roleMenus, 
  userRoles 
} from "@/core/database/schema";
import { getRoleWithRelations } from "@/lib/db/query-helpers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/helpers/auth-helpers";
import { 
  createValidationError, 
  createNotFoundError, 
  createPermissionError 
} from "@/lib/helpers/error-helpers";
import { checkPermission } from "@/core/permissions/unified-permission-checker";
import type { User } from "@/lib/types";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

/**
 * CREATE ROLE
 * Create a new role with permissions
 */
export async function createRole(data: CreateRoleData): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "role",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Validate input
    if (!data.name || data.name.trim().length < 2) {
      return createValidationError("Role name must be at least 2 characters");
    }

    if (!data.permissions || data.permissions.length === 0) {
      return createValidationError("At least one permission must be selected");
    }

    // Check if role name already exists
    const existing = await db.query.roles.findFirst({
      where: eq(roles.name, data.name.trim()),
    });

    if (existing) {
      return createValidationError("Role name already exists");
    }

    // Create role
    const [newRole] = await db.insert(roles).values({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      code: data.name.trim().toUpperCase().replace(/\s+/g, '_'),
      category: "Custom",
      scope: "Global",
      isSystem: false,
      isActive: true,
      createdById: user.id,
    }).returning();

    // Assign permissions
    if (newRole && data.permissions.length > 0) {
      await db.insert(rolePermissions).values(
        data.permissions.map(permissionId => ({
          roleId: newRole.id,
          permissionId,
        }))
      );
    }

    revalidatePath("/admin/roles");

    return {
      success: true,
      message: "Role created successfully",
      data: newRole,
    };
  });
}

/**
 * UPDATE ROLE
 * Update role information and permissions
 */
export async function updateRole(
  roleId: string,
  data: UpdateRoleData
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "role",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Fetch role
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, roleId),
    });

    if (!role) {
      return createNotFoundError("Role");
    }

    // Check if system role
    if (role.isSystem) {
      return createPermissionError("System roles cannot be modified");
    }

    // Validate name if provided
    if (data.name) {
      if (data.name.trim().length < 2) {
        return createValidationError("Role name must be at least 2 characters");
      }

      // Check if name already exists (excluding current role)
      const existing = await db.query.roles.findFirst({
        where: and(
          eq(roles.name, data.name.trim()),
          // Note: We'd need to add a NOT condition here in production
        ),
      });

      if (existing && existing.id !== roleId) {
        return createValidationError("Role name already exists");
      }
    }

    // Update role
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;

    await db.update(roles)
      .set(updateData)
      .where(eq(roles.id, roleId));

    // Update permissions if provided
    if (data.permissions) {
      // Delete existing permissions
      await db.delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId));

      // Insert new permissions
      if (data.permissions.length > 0) {
        await db.insert(rolePermissions).values(
          data.permissions.map(permissionId => ({
            roleId,
            permissionId,
          }))
        );
      }
    }

    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${roleId}`);

    return {
      success: true,
      message: "Role updated successfully",
      data: null,
    };
  });
}

/**
 * DELETE ROLE
 * Soft delete a role
 */
export async function deleteRole(roleId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "role",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Fetch role
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, roleId),
      with: {
        userRoles: true,
      } as any,
    });

    if (!role) {
      return createNotFoundError("Role");
    }

    // Check if system role
    if (role.isSystem) {
      return createPermissionError("System roles cannot be deleted");
    }

    // Check if role is assigned to users
    const roleData = role as any;
    if (roleData.userRoles && roleData.userRoles.length > 0) {
      return createValidationError(
        `Role is assigned to ${roleData.userRoles.length} user(s). Please reassign users before deleting.`
      );
    }

    // Delete role permissions first
    await db.delete(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    // Delete role
    await db.delete(roles)
      .where(eq(roles.id, roleId));

    revalidatePath("/admin/roles");

    return {
      success: true,
      message: "Role deleted successfully",
      data: null,
    };
  });
}

/**
 * GET ROLE BY ID
 * Fetch role with permissions, menus, and users
 */
export async function getRoleById(roleId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "role",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const roleData = await getRoleWithRelations(roleId);

    if (!roleData || !roleData.id) {
      return createNotFoundError("Role");
    }

    return {
      success: true,
      data: roleData,
    };
  });
}

/**
 * GET ALL ROLES
 * Fetch all active roles (for dropdowns, assignments, etc.)
 */
export async function getAllRoles(): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "role",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const rolesList = await db.query.roles.findMany({
      where: eq(roles.isActive, true),
      orderBy: (roles, { asc }) => [asc(roles.name)],
      columns: {
        id: true,
        name: true,
        code: true,
        description: true,
      },
    });

    return {
      success: true,
      data: rolesList,
    };
  });
}

/**
 * UPDATE ROLE PERMISSIONS
 * Update the permissions assigned to a role
 */
export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[]
) {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "role",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Validate role exists
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, roleId),
    });

    if (!role) {
      return createNotFoundError("Role");
    }

    // Prevent updating system roles
    if (role.isSystem) {
      return createValidationError("Cannot modify system role permissions");
    }

    try {
      // Start transaction
      await db.transaction(async (tx) => {
        // Remove all existing permissions for this role
        await tx
          .delete(rolePermissions)
          .where(eq(rolePermissions.roleId, roleId));

        // Add new permissions
        if (permissionIds.length > 0) {
          await tx.insert(rolePermissions).values(
            permissionIds.map(permissionId => ({
              roleId,
              permissionId,
            }))
          );
        }
      });

      revalidatePath("/admin/roles");
      revalidatePath("/admin/permissions");

      return {
        success: true,
        message: `Updated ${permissionIds.length} permissions for role ${role.name}`,
        data: undefined,
      };

    } catch (error) {
      console.error(`Failed to update permissions for role ${roleId}:`, error);
      return {
        success: false,
        error: "Failed to update role permissions",
      };
    }
  });
}
