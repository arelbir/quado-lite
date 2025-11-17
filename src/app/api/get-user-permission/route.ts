import { getMenusByUserId } from "@/core/database/queries/menu";
import { getUserByEmail } from "@/core/database/queries/user";
import { getMenusByUserRoles, getUserRoles, isSuperAdmin } from "@/core/database/queries/role-menu";
import { NextRequest, NextResponse } from "next/server";
import { getMenuHierarchy } from "@/lib/core/array";
import { MenuWithChildren } from "@/core/database/schema";

export async function GET(request: NextRequest) {

  const params = request.nextUrl.searchParams
  const email = params.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const userinfo = await getUserByEmail(email);
  if (!userinfo) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // NEW: Get menus from user's roles (role-based menu system)
  const roleMenus = await getMenusByUserRoles(userinfo.id);
  
  // FALLBACK: If no role menus, try old user_menu table
  let menus = roleMenus.length > 0 ? roleMenus : await getMenusByUserId(userinfo.id);
  
  // Build menu hierarchy (parent-child structure)
  menus = getMenuHierarchy(menus as MenuWithChildren[]);

  // NEW: Get user's roles
  const userSystemRoles = await getUserRoles(userinfo.id);
  const isUserSuperAdmin = await isSuperAdmin(userinfo.id);

  return NextResponse.json({ 
    menus,
    // Multi-role system (NEW)
    roles: userSystemRoles,
    isSuperAdmin: isUserSuperAdmin,
  });

}
