/**
 * USER ACTIONS
 * Server actions for user management
 * 
 * Features:
 * - Update user (name, department, position, status)
 * - Delete user (soft delete)
 * - Get user by ID
 * 
 * Pattern: withAuth + Type-Safe + DRY + SOLID
 * Created: 2025-01-25
 */

"use server";

import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { userRoles, roles } from "@/drizzle/schema/role-system";
import { getUserWithRoles } from "@/lib/db/query-helpers";
import { eq, and } from "drizzle-orm";
import { 
  withAuth, 
  createNotFoundError,
  createValidationError 
} from "@/lib/helpers";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/lib/types";

// ============================================
// USER ACTIONS
// ============================================

export async function createUser(
  data: {
    name: string;
    email: string;
    password: string;
    companyId?: string;
    branchId?: string;
    departmentId?: string;
    positionId?: string;
    managerId?: string;
    employeeNumber?: string;
    status?: "active" | "inactive";
  }
): Promise<ActionResponse<{ id: string }>> {
  return withAuth(async (currentUser) => {
    // Check if email already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, data.email),
    });

    if (existingUser) {
      return {
        success: false,
        data: undefined,
        error: "User with this email already exists",
      };
    }

    // Create user
    const [newUser] = await db.insert(user).values({
      name: data.name,
      email: data.email,
      password: data.password, // Should be hashed in production
      companyId: data.companyId,
      branchId: data.branchId,
      departmentId: data.departmentId,
      positionId: data.positionId,
      managerId: data.managerId,
      employeeNumber: data.employeeNumber,
      status: data.status || "active",
      createdById: currentUser.id,
    }).returning({ id: user.id });

    revalidatePath("/admin/users");
    
    return {
      success: true,
      data: { id: newUser!.id },
      message: "User created successfully",
    };
  }, { requireAdmin: true });
}

export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    email: string;
    companyId: string;
    branchId: string;
    departmentId: string;
    positionId: string;
    managerId: string;
    employeeNumber: string;
    status: "active" | "inactive";
  }>
): Promise<ActionResponse> {
  return withAuth(async (currentUser) => {
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return createNotFoundError("User");
    }

    // Update user
    const updateData: any = { ...data, updatedAt: new Date() };
    await db.update(user)
      .set(updateData)
      .where(eq(user.id, userId));

    // Revalidate paths
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    
    return {
      success: true,
      data: undefined,
      message: "User updated successfully",
    };
  }, { requireAdmin: true });
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  return withAuth(async (currentUser) => {
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return createNotFoundError("User");
    }

    // Don't allow deleting yourself
    if (userId === currentUser.id) {
      return createValidationError("You cannot delete your own account");
    }

    // Soft delete: set deletedAt
    await db.update(user)
      .set({ 
        deletedAt: new Date(),
        deletedById: currentUser.id,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));

    // Revalidate paths
    revalidatePath("/admin/users");
    
    return {
      success: true,
      data: undefined,
      message: "User deleted successfully",
    };
  }, { requireAdmin: true });
}

export async function getUserById(userId: string): Promise<ActionResponse<any>> {
  return withAuth(async (currentUser) => {
    const userData = await getUserWithRoles(userId);

    if (!userData) {
      return createNotFoundError("User");
    }
    
    return {
      success: true,
      data: userData,
      message: "User retrieved successfully",
    };
  }, { requireAdmin: true });
}

// ============================================
// ROLE MANAGEMENT ACTIONS
// ============================================

/**
 * ASSIGN ROLE TO USER
 * Adds a role to a user
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string,
  options?: {
    contextType?: "Global" | "Company" | "Branch" | "Department";
    contextId?: string;
    validFrom?: Date;
    validTo?: Date;
  }
): Promise<ActionResponse<{ userId: string; userName: string; roleName: string }>> {
  return withAuth(async (currentUser) => {
    // Check if user exists
    const userExists = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userExists) {
      return {
        success: false,
        error: "User not found",
        message: "User not found",
      } as any;
    }

    // Check if role exists
    const roleExists = await db.query.roles.findFirst({
      where: eq(roles.id, roleId),
    });

    if (!roleExists) {
      return {
        success: false,
        error: "Role not found",
        message: "Role not found",
      } as any;
    }

    // Check if user already has this role
    const existingAssignment = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId),
        eq(userRoles.isActive, true)
      ),
    });

    if (existingAssignment) {
      return {
        success: false,
        error: "Already assigned",
        message: `Already has role "${roleExists.name}"`,
        data: {
          userId: userExists.id,
          userName: userExists.name || userExists.email,
          roleName: roleExists.name,
        },
      } as any;
    }

    // Assign role
    await db.insert(userRoles).values({
      userId,
      roleId,
      contextType: options?.contextType || "Global",
      contextId: options?.contextId,
      validFrom: options?.validFrom,
      validTo: options?.validTo,
      isActive: true,
      assignedBy: currentUser.id,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/roles");
    
    return {
      success: true,
      data: {
        userId: userExists.id,
        userName: userExists.name || userExists.email,
        roleName: roleExists.name,
      },
      message: `Role "${roleExists.name}" assigned successfully`,
    };
  }, { requireAdmin: true });
}

/**
 * REMOVE ROLE FROM USER
 * Removes a role assignment from a user
 */
export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<ActionResponse> {
  return withAuth(async (currentUser) => {
    // Get role name first
    const roleRecord = await db.query.roles.findFirst({
      where: eq(roles.id, roleId),
    });

    if (!roleRecord) {
      return createNotFoundError("Role");
    }

    // Check if assignment exists
    const assignment = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId),
        eq(userRoles.isActive, true)
      ),
    });

    if (!assignment) {
      return createNotFoundError("Role assignment");
    }

    // Delete assignment
    await db.delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      );

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/roles");
    
    return {
      success: true,
      data: undefined,
      message: `Role "${roleRecord.name}" removed successfully`,
    };
  }, { requireAdmin: true });
}

/**
 * GET USER ROLES
 * Fetch all roles assigned to a user
 */
export async function getUserRoles(userId: string): Promise<ActionResponse<any[]>> {
  return withAuth(async () => {
    const assignments = await db.query.userRoles.findMany({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.isActive, true)
      ),
      with: {
        role: true,
      },
    });

    return {
      success: true,
      data: assignments,
      message: "User roles retrieved successfully",
    };
  }, { requireAdmin: true });
}
