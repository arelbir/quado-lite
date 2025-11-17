/**
 * ROLE-MENU DATA ACCESS
 * Functions to get menus based on user roles
 * 
 * This replaces the old user_menu table approach
 */

import { db } from "@/core/database/client";
import { user, userRoles, roles, roleMenus, menuTable } from "@/core/database/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get menus by user's roles (NEW SYSTEM)
 */
export async function getMenusByUserRoles(userId: string) {
  try {
    console.log("🔍 [getMenusByUserRoles] Called for userId:", userId);
    
    // Manual join query to avoid circular dependency
    const results = await db
      .select({
        menuId: menuTable.id,
        menuLabel: menuTable.label,
        menuPath: menuTable.path,
        menuType: menuTable.type,
        menuStatus: menuTable.status,
        menuIcon: menuTable.icon,
        menuParentId: menuTable.parentId,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(roleMenus, eq(roles.id, roleMenus.roleId))
      .innerJoin(menuTable, eq(roleMenus.menuId, menuTable.id))
      .where(and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)));

    console.log("🔍 [getMenusByUserRoles] Raw results count:", results.length);

    // Remove duplicates
    const menuMap = new Map();
    results.forEach((row) => {
      menuMap.set(row.menuId, {
        id: row.menuId,
        label: row.menuLabel,
        path: row.menuPath,
        type: row.menuType,
        status: row.menuStatus,
        icon: row.menuIcon,
        parentId: row.menuParentId,
      });
    });

    const menus = Array.from(menuMap.values());
    console.log("🔍 [getMenusByUserRoles] Unique menus count:", menus.length);
    
    return menus;
  } catch (error) {
    console.error('❌ [getMenusByUserRoles] Error fetching menus by user roles:', error);
    return [];
  }
}

/**
 * Get user's roles
 */
export async function getUserRoles(userId: string) {
  try {
    // Manual join query to avoid circular dependency
    const results = await db
      .select({
        id: roles.id,
        name: roles.name,
        code: roles.code,
        category: roles.category,
        isSystem: roles.isSystem,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)));

    return results;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Check if user has a specific role
 */
export async function userHasRole(userId: string, roleCode: string) {
  try {
    const roles = await getUserRoles(userId);
    return roles.some((role: any) => role.code === roleCode);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if user is super admin (has SUPER_ADMIN role)
 */
export async function isSuperAdmin(userId: string) {
  return await userHasRole(userId, 'SUPER_ADMIN');
}
