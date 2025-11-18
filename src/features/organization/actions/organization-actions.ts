/**
 * ORGANIZATION ACTIONS
 * Server actions for organization management
 * 
 * Features:
 * - Company CRUD
 * - Branch CRUD
 * - Department CRUD
 * - Position CRUD
 * 
 * Pattern: withAuth + Type-Safe + DRY + SOLID
 * Refactored: 2025-01-25 (Week 7-8 Completion)
 */

"use server";

import { db } from "@/core/database/client";
import { companies, branches, departments, positions } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { 
  withAuth, 
  revalidateOrganizationPaths,
  createNotFoundError,
  createValidationError,
  createPermissionError
} from "@/lib/helpers";
import { checkPermission } from "@/core/permissions/unified-permission-checker";
import type { ActionResponse, User, Company, Branch, Department, Position } from "@/types/domain";

// ============================================
// COMPANY ACTIONS
// ============================================

export async function createCompany(data: {
  name: string;
  code: string;
  legalName?: string;
  taxNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "company",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [company] = await db.insert(companies).values({
      ...data,
      isActive: true,
      createdById: user.id,
    }).returning({ id: companies.id });

    revalidateOrganizationPaths({ companies: true });
    
    return {
      success: true,
      data: { id: company!.id },
      message: "Company created successfully",
    };
  });
}

export async function updateCompany(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    legalName: string;
    taxNumber: string;
    country: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    isActive: boolean;
  }>
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "company",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db.update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id));

    revalidateOrganizationPaths({ companies: true, specificCompany: id });
    
    return {
      success: true,
      data: undefined,
      message: "Company updated successfully",
    };
  });
}

export async function deleteCompany(id: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "company",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db.delete(companies).where(eq(companies.id, id));

    revalidateOrganizationPaths({ companies: true });
    
    return {
      success: true,
      data: undefined,
      message: "Company deleted successfully",
    };
  });
}

// ============================================
// BRANCH ACTIONS
// ============================================

export async function createBranch(data: {
  companyId: string;
  name: string;
  code: string;
  type: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  managerId?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "branch",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [branch] = await db.insert(branches).values({
      ...data,
      isActive: true,
      createdById: user.id,
    }).returning({ id: branches.id });

    revalidateOrganizationPaths({ branches: true });
    
    return {
      success: true,
      data: { id: branch!.id },
      message: "Branch created successfully",
    };
  });
}

export async function updateBranch(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    type: string;
    country: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    description: string;
    managerId: string;
    isActive: boolean;
  }>
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "branch",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db.update(branches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(branches.id, id));

    revalidateOrganizationPaths({ branches: true, specificBranch: id });
    
    return {
      success: true,
      data: undefined,
      message: "Branch updated successfully",
    };
  });
}

export async function deleteBranch(id: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "branch",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db.delete(branches).where(eq(branches.id, id));

    revalidateOrganizationPaths({ branches: true });
    
    return {
      success: true,
      data: undefined,
      message: "Branch deleted successfully",
    };
  });
}

// ============================================
// DEPARTMENT ACTIONS
// ============================================

export async function createDepartment(data: {
  branchId?: string;
  name: string;
  code: string;
  parentDepartmentId?: string;
  managerId?: string;
  description?: string;
  costCenter?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth(async (user) => {
    // Permission check: Department.Create
    const perm = await checkPermission({
      user: user as any,
      resource: 'Department',
      action: 'Create',
    });

    if (!perm.allowed) {
      return { success: false, error: 'Permission denied: Department.Create' };
    }

    const [department] = await db.insert(departments).values({
      ...data,
      isActive: true,
      createdById: user.id,
    }).returning({ id: departments.id });

    revalidateOrganizationPaths({ departments: true });
    
    return {
      success: true,
      data: { id: department!.id },
      message: "Department created successfully",
    };
  });
}

export async function updateDepartment(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    branchId: string;
    parentDepartmentId: string;
    managerId: string;
    description: string;
    costCenter: string;
    isActive: boolean;
  }>
): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Permission check: Department.Update
    const perm = await checkPermission({
      user: user as any,
      resource: 'Department',
      action: 'Update',
    });

    if (!perm.allowed) {
      return { success: false, error: 'Permission denied: Department.Update' };
    }

    await db.update(departments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(departments.id, id));

    revalidateOrganizationPaths({ departments: true, specificDepartment: id });
    
    return {
      success: true,
      data: undefined,
      message: "Department updated successfully",
    };
  });
}

export async function deleteDepartment(id: string): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Check if department has children
    const children = await db.query.departments.findMany({
      where: eq(departments.parentDepartmentId, id),
    });

    if (children.length > 0) {
      return createValidationError("Cannot delete department with sub-departments");
    }

    // Permission check: Department.Delete
    const perm = await checkPermission({
      user: user as any,
      resource: 'Department',
      action: 'Delete',
    });

    if (!perm.allowed) {
      return { success: false, error: 'Permission denied: Department.Delete' };
    }

    await db.delete(departments).where(eq(departments.id, id));

    revalidateOrganizationPaths({ departments: true });
    
    return {
      success: true,
      data: undefined,
      message: "Department deleted successfully",
    };
  });
}

// ============================================
// POSITION ACTIONS
// ============================================

export async function createPosition(data: {
  name: string;
  code: string;
  level: string;
  category?: string;
  description?: string;
  salaryGrade?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "position",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [position] = await db.insert(positions).values({
      ...data,
      isActive: true,
      createdById: user.id,
    }).returning({ id: positions.id });

    revalidateOrganizationPaths({ positions: true });
    
    return {
      success: true,
      data: { id: position!.id },
      message: "Position created successfully",
    };
  });
}

export async function updatePosition(
  id: string,
  data: Partial<{
    name: string;
    code: string;
    level: string;
    category: string;
    description: string;
    salaryGrade: string;
    isActive: boolean;
  }>
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "position",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db.update(positions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(positions.id, id));

    revalidateOrganizationPaths({ positions: true, specificPosition: id });
    
    return {
      success: true,
      data: undefined,
      message: "Position updated successfully",
    };
  });
}

export async function deletePosition(id: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "position",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db.delete(positions).where(eq(positions.id, id));

    revalidateOrganizationPaths({ positions: true });
    
    return {
      success: true,
      data: undefined,
      message: "Position deleted successfully",
    };
  });
}
