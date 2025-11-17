import { db } from "@/core/database/client"
import { menuTable } from "@/core/database/schema"

export async function seedMenus(adminId: string) {
  console.log("\n📋 SEEDING: Modern Menu Structure...");

  const menus = [
    { path: "/admin/dashboard", label: "dashboard", icon: "LayoutDashboard", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/users", label: "users", icon: "Users", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/roles", label: "roles", icon: "Shield", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/companies", label: "companies", icon: "Building2", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/branches", label: "branches", icon: "GitBranch", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/departments", label: "departments", icon: "FolderTree", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/positions", label: "positions", icon: "Briefcase", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/teams", label: "teams", icon: "Users", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/groups", label: "groups", icon: "UsersRound", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/workflows", label: "workflows", icon: "Workflow", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/system/menus", label: "systemMenus", icon: "Menu", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/settings", label: "settings", icon: "Settings", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
  ];

  for (const menu of menus) {
    try {
      await db.insert(menuTable).values(menu).onConflictDoNothing();
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log("✅ Menu seed completed -", menus.length, "menus");
}