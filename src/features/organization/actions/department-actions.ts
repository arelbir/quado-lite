"use server";

import { db } from "@/core/database/client";
import { departments } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ActionResponse, User } from "@/types/domain";
import {
  withAuth,
  createNotFoundError,
  createValidationError,
  createPermissionError,
} from "@/lib/helpers";
import { checkPermission } from "@/core/permissions/unified-permission-checker";
import { revalidatePath } from "next/cache";

// Validation schema
const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  branchId: z.string().uuid().nullable(),
  parentDepartmentId: z.string().uuid().nullable(),
  managerId: z.string().uuid().nullable(),
  isActive: z.boolean(),
});

type DepartmentInput = z.infer<typeof departmentSchema>;

export async function createDepartment(data: DepartmentInput): Promise<ActionResponse<any>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "department",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Validate input
    let validated;
    try {
      validated = departmentSchema.parse(data);
    } catch (error) {
      return createValidationError("Invalid department data");
    }

    const [department] = await db
      .insert(departments)
      .values({
        name: validated.name,
        code: validated.code,
        branchId: validated.branchId,
        parentDepartmentId: validated.parentDepartmentId,
        managerId: validated.managerId,
        isActive: validated.isActive,
      })
      .returning();

    revalidatePath("/admin/organization/departments");
    return { success: true, data: department };
  });
}

export async function updateDepartment(id: string, data: DepartmentInput): Promise<ActionResponse<any>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "department",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Check if department exists
    const existing = await db.query.departments.findFirst({
      where: eq(departments.id, id),
    });

    if (!existing) {
      return createNotFoundError("Department");
    }

    // Validate input
    let validated;
    try {
      validated = departmentSchema.parse(data);
    } catch (error) {
      return createValidationError("Invalid department data");
    }

    const [department] = await db
      .update(departments)
      .set({
        name: validated.name,
        code: validated.code,
        branchId: validated.branchId,
        parentDepartmentId: validated.parentDepartmentId,
        managerId: validated.managerId,
        isActive: validated.isActive,
      })
      .where(eq(departments.id, id))
      .returning();

    revalidatePath("/admin/organization/departments");
    return { success: true, data: department };
  });
}

export async function deleteDepartment(id: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "department",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Check if department exists
    const existing = await db.query.departments.findFirst({
      where: eq(departments.id, id),
    });

    if (!existing) {
      return createNotFoundError("Department");
    }

    // Check if department has sub-departments
    const subDepartments = await db.query.departments.findMany({
      where: eq(departments.parentDepartmentId, id),
    });

    if (subDepartments.length > 0) {
      return createValidationError(
        "Cannot delete department with sub-departments. Please delete or reassign sub-departments first."
      );
    }

    // Soft delete by setting isActive to false
    await db
      .update(departments)
      .set({ isActive: false })
      .where(eq(departments.id, id));

    revalidatePath("/admin/organization/departments");
    return { success: true, data: undefined };
  });
}

export async function getDepartmentById(id: string): Promise<ActionResponse<any>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "department",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const department = await db.query.departments.findFirst({
      where: eq(departments.id, id),
      with: {
        branch: true,
        manager: true,
      },
    });

    if (!department) {
      return createNotFoundError("Department");
    }

    return { success: true, data: department };
  });
}
