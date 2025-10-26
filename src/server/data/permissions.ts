import { db } from "@/drizzle/db";
import { MenuWithChildren, user } from "@/drizzle/schema";
import { SQL, eq } from "drizzle-orm";
import { getMenuHierarchy } from '@/lib/array-util'
import { getMenusByUserId } from "./menu";
import { getMenusByUserRoles } from "./role-menu";


export const getUserPermissions = async ({ userId, email, menusWhere }: { userId?: string, email?: string, menusWhere?: SQL }) => {
  const where = userId ? eq(user.id, userId) : email ? eq(user.email, email) : undefined
  const res = await db.query.user.findFirst({
    where,
    columns: {
      id: true,
    },
  });
  
  if (!res) return null
  
  // NEW: Use role-based menu system
  const roleMenus = await getMenusByUserRoles(res.id);
  
  // FALLBACK: If no role menus, try old user_menu table
  let menus = roleMenus.length > 0 ? roleMenus : await getMenusByUserId(res.id);
  
  // Build menu hierarchy
  menus = getMenuHierarchy(menus as MenuWithChildren[]) 
  
  return {
    role: null, // Deprecated - use getUserRoles from role-menu.ts instead
    menus: menus as MenuWithChildren[],
  }
}


