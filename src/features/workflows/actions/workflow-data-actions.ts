'use server';

/**
 * WORKFLOW DATA ACTIONS
 * Provides data for workflow builder UI
 * - Roles, Users, Departments for assignment
 * - Custom fields for conditions
 */

import { db } from '@/core/database/client';
import { roles, user, departments } from '@/core/database/schema';
import { eq } from 'drizzle-orm';
import type { ActionResponse } from '@/lib/types';
import { withAuth, createPermissionError } from '@/lib/helpers';
import { checkPermission } from '@/core/permissions/unified-permission-checker';

/**
 * Get all active roles for workflow assignment
 */
export async function getWorkflowRoles(): Promise<ActionResponse<Array<{ value: string; label: string; description?: string }>>> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {
      const rolesList = await db
      .select({
        code: roles.code,
        name: roles.name,
        description: roles.description,
      })
      .from(roles)
      .where(eq(roles.isActive, true))
      .orderBy(roles.name);

    const formattedRoles = rolesList.map(role => ({
      value: role.code,
      label: role.name,
      description: role.description || undefined,
    }));

      return { success: true, data: formattedRoles };
    } catch (error) {
      console.error('Error fetching workflow roles:', error);
      return { success: false, error: 'Failed to fetch roles' };
    }
  });
}

/**
 * Get all active users for specific assignment
 */
export async function getWorkflowUsers(): Promise<ActionResponse<Array<{ value: string; label: string; email?: string }>>> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {
      const usersList = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.status, 'active'))
      .orderBy(user.name)
      .limit(100); // Limit to prevent huge lists

    const formattedUsers = usersList.map(u => ({
      value: `user:${u.id}`,
      label: u.name || u.email || 'Unknown User',
      email: u.email || undefined,
    }));

      return { success: true, data: formattedUsers };
    } catch (error) {
      console.error('Error fetching workflow users:', error);
      return { success: false, error: 'Failed to fetch users' };
    }
  });
}

/**
 * Get all departments for manager assignment
 */
export async function getWorkflowDepartments(): Promise<ActionResponse<Array<{ value: string; label: string }>>> {
  return withAuth(async (user: any) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user,
      resource: "workflow",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    try {
      const departmentsList = await db
      .select({
        id: departments.id,
        name: departments.name,
      })
      .from(departments)
      .where(eq(departments.isActive, true))
      .orderBy(departments.name);

    const formattedDepartments = departmentsList.map(dept => ({
      value: `dept:${dept.id}`,
      label: `${dept.name} Manager`,
    }));

      return { success: true, data: formattedDepartments };
    } catch (error) {
      console.error('Error fetching workflow departments:', error);
      return { success: false, error: 'Failed to fetch departments' };
    }
  });
}

// Note: Dynamic assignment templates moved to RoleSelector.tsx
// No need for server action as they are static data
