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
import { eq } from "drizzle-orm";
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
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        department: {
          columns: {
            id: true,
            name: true,
          },
        },
        position: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!userRecord) {
      return createNotFoundError("User");
    }
    
    return {
      success: true,
      data: userRecord,
      message: "User retrieved successfully",
    };
  }, { requireAdmin: true });
}
