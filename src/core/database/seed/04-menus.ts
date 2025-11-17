import { db } from "@/core/database/client"
import { menuTable } from "@/core/database/schema"

export async function seedMenus(adminId: string) {
  console.log("\n📋 SEEDING: Modern Menu Structure...");

  const menus = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/users", label: "Users", icon: "Users", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/roles", label: "Roles", icon: "Shield", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/companies", label: "Companies", icon: "Building2", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/branches", label: "Branches", icon: "GitBranch", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/departments", label: "Departments", icon: "FolderTree", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/organization/positions", label: "Positions", icon: "Briefcase", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/teams", label: "Teams", icon: "Users", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/workflows", label: "Workflows", icon: "Workflow", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
    { path: "/admin/settings", label: "Settings", icon: "Settings", parentId: null, status: "active" as const, createBy: adminId, type: "menu" as const },
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