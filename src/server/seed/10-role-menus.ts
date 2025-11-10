/**
 * ROLE-MENUS SEED
 * Map menus to roles
 * 
 * This seed connects roles with menus.
 * When a user has a role, they automatically get the role's menus.
 * 
 * Created: 2025-01-26
 * Phase: Role-Menu Integration
 */

import { db } from "@/drizzle/db";
import { roles, roleMenus, menuTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function seedRoleMenus(adminId: string) {
  console.log("\n🔗 SEEDING: Role-Menu Mappings...");

  try {
    // 1. Get all roles
    const allRoles = await db.query.roles.findMany();
    
    if (allRoles.length === 0) {
      console.log("  ⚠️  No roles found. Run role seed first!");
      return;
    }

    // 2. Get all menus
    const allMenus = await db.query.menuTable.findMany();
    
    if (allMenus.length === 0) {
      console.log("  ⚠️  No menus found. Run menu seed first!");
      return;
    }

    // 3. Map roles to menus (UPDATED for new menu structure)
    const roleMenuMappings: { roleCode: string; menuPaths: string[] }[] = [
      {
        roleCode: 'SUPER_ADMIN',
        menuPaths: ['all'], // Special: All menus
      },
      {
        roleCode: 'QUALITY_MANAGER',
        menuPaths: [
          '/',                    // Dashboard (1 menu)
          '/audit-system',        // Audit System parent (1 menu)
          '/denetim',             // Audit System children (9 menus)
          '/workflow-operations', // Workflow Operations parent (1 menu)
          '/administration',      // Administration parent (1 menu)
          '/admin',               // Administration children (15 menus: /admin/users, /admin/roles, etc.)
          '/system',              // System parent + children (1 menu: /settings)
        ],
      },
      {
        roleCode: 'PROCESS_OWNER',
        menuPaths: [
          '/',                    // Dashboard
          '/audit-system',        // Audit System parent
          '/denetim',             // Audit System children
          '/workflow-operations', // Workflow Operations parent
          '/administration',      // Administration parent
          '/admin',               // Administration children (for user/team management)
        ],
      },
      {
        roleCode: 'AUDITOR',
        menuPaths: [
          '/',                    // Dashboard
          '/audit-system',        // Audit System parent
          '/denetim',             // Audit System children (read-only focus)
        ],
      },
      {
        roleCode: 'ACTION_OWNER',
        menuPaths: [
          '/',                            // Dashboard
          '/admin/workflows/my-tasks',    // Only My Tasks
        ],
      },
    ];

    let totalMappings = 0;

    // 4. Create mappings
    for (const mapping of roleMenuMappings) {
      const role = allRoles.find(r => r.code === mapping.roleCode);
      
      if (!role) {
        console.log(`  ⚠️  Role not found: ${mapping.roleCode}`);
        continue;
      }

      // Get menus for this role
      let menusForRole = allMenus;
      
      if (mapping.menuPaths[0] !== 'all') {
        // Filter menus by paths
        // IMPORTANT: Use strict matching to avoid '/' matching everything
        menusForRole = allMenus.filter(menu => 
          mapping.menuPaths.some(path => {
            if (path === '/') {
              // Exact match for root dashboard only
              return menu.path === '/';
            }
            // For other paths, use startsWith but ensure not exact '/'
            return menu.path?.startsWith(path) && menu.path !== '/';
          })
        );
      }

      // Create role-menu records
      const roleMenuRecords = menusForRole.map(menu => ({
        roleId: role.id,
        menuId: menu.id,
        createdById: adminId,
      }));

      await db.insert(roleMenus).values(roleMenuRecords);

      console.log(`  ✅ ${role.code}: ${menusForRole.length} menus assigned`);
      totalMappings += menusForRole.length;
    }

    console.log("\n  📊 ROLE-MENU SUMMARY:");
    console.log(`    Total mappings: ${totalMappings}`);
    console.log(`    Roles configured: ${roleMenuMappings.length}`);

  } catch (error) {
    console.error("  ❌ Role-Menu seed failed:", error);
    throw error;
  }
}

/**
 * HELPER: Get menus by user ID (using roles)
 * This replaces the old user-menu table approach
 */
export async function getMenusByUserRoles(userId: string) {
  // 1. Get user's active roles
  const userWithRoles = await db.query.user.findFirst({
    where: (users: any, { eq }: any) => eq(users.id, userId),
    with: {
      userRoles: {
        where: (ur: any, { eq }: any) => eq(ur.isActive, true),
        with: {
          role: {
            with: {
              menus: {
                with: {
                  menu: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithRoles) {
    return [];
  }

  // 2. Collect all unique menus from all roles
  const menuMap = new Map();
  
  for (const userRole of userWithRoles.userRoles || []) {
    for (const roleMenu of userRole.role?.menus || []) {
      if (roleMenu.menu) {
        menuMap.set(roleMenu.menu.id, roleMenu.menu);
      }
    }
  }

  return Array.from(menuMap.values());
}
