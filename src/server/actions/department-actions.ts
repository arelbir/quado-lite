"use server";

import { db } from "@/drizzle/db";
import { departments } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function createDepartment(data: DepartmentInput) {
  try {
    const validated = departmentSchema.parse(data);

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
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: "Failed to create department" };
  }
}

export async function updateDepartment(id: string, data: DepartmentInput) {
  try {
    const validated = departmentSchema.parse(data);

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
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, error: "Failed to update department" };
  }
}

export async function deleteDepartment(id: string) {
  try {
    // Check if department has sub-departments
    const subDepartments = await db.query.departments.findMany({
      where: eq(departments.parentDepartmentId, id),
    });

    if (subDepartments.length > 0) {
      return {
        success: false,
        error: "Cannot delete department with sub-departments. Please delete or reassign sub-departments first.",
      };
    }

    // Soft delete by setting isActive to false
    await db
      .update(departments)
      .set({ isActive: false })
      .where(eq(departments.id, id));

    revalidatePath("/admin/organization/departments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: "Failed to delete department" };
  }
}

export async function getDepartmentById(id: string) {
  try {
    const department = await db.query.departments.findFirst({
      where: eq(departments.id, id),
      with: {
        branch: true,
        manager: true,
      },
    });

    return { success: true, data: department };
  } catch (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: "Failed to fetch department" };
  }
}
