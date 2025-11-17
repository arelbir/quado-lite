import { db } from "@/core/database/client"
import { menuTable } from "@/core/database/schema"

/**
 * MODERN MENU STRUCTURE - 2025
 * 
 * Organized by functionality:
 * 1. Dashboard & Quick Access
 * 2. Workflow Operations (Actions, DOFs, Findings)
 * 3. Audit Management
 * 4. Infrastructure (Non-workflow - Templates, Question Banks)
 * 5. Administration (Users, Roles, Organization)
 * 6. System Settings
 */

const getMenus = (adminId: string) => [
  // ================== DASHBOARD & HOME ==================
  {
    path: '/',
    label: "dashboard",
    icon: "LayoutDashboard",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'menu',
  },
  {
    path: '/admin/workflows/my-tasks',
    label: "myTasks",
    icon: "CheckSquare",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'menu',
  },
  
  // ================== AUDIT SYSTEM ==================
  {
    path: "/audit-system",
    label: "auditSystem",
    icon: "ClipboardCheck",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'dir',
    children: [
      {
        path: "/denetim/audits",
        label: "allAudits",
        icon: "ClipboardCheck",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/denetim/my-audits",
        label: "myAudits",
        icon: "FileCheck",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/denetim/plans",
        label: "auditPlans",
        icon: "Calendar",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
    ],
  },
  
  // ================== WORKFLOW OPERATIONS ==================
  {
    path: "/workflow-operations",
    label: "workflowOperations",
    icon: "Workflow",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'dir',
    children: [
      {
        path: "/denetim/findings",
        label: "findings",
        icon: "AlertCircle",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/denetim/actions",
        label: "actions",
        icon: "CheckCircle2",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/denetim/dofs",
        label: "dofs",
        icon: "Target",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/workflows",
        label: "workflowList",
        icon: "List",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/workflows/builder",
        label: "workflowBuilder",
        icon: "Workflow",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/workflows/analytics",
        label: "workflowAnalytics",
        icon: "BarChart3",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
    ],
  },
  
  // ================== INFRASTRUCTURE (Non-workflow) ==================
  {
    path: "/infrastructure",
    label: "infrastructure",
    icon: "Database",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'dir',
    children: [
      {
        path: "/denetim/question-banks",
        label: "questionBanks",
        icon: "HelpCircle",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/denetim/templates",
        label: "auditTemplates",
        icon: "FileText",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/organization/companies",
        label: "companies",
        icon: "Building",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/organization/branches",
        label: "branches",
        icon: "Building2",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/organization/departments",
        label: "departments",
        icon: "Layers",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/organization/positions",
        label: "positions",
        icon: "Briefcase",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
    ],
  },
  
  // ================== ADMINISTRATION ==================
  {
    path: "/administration",
    label: "administration",
    icon: "Shield",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'dir',
    children: [
      {
        path: "/admin/users",
        label: "userManagement",
        icon: "Users",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/roles",
        label: "rolesPermissions",
        icon: "ShieldCheck",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/organization/org-chart",
        label: "organizationChart",
        icon: "Network",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/hr-sync",
        label: "hrIntegration",
        icon: "RefreshCw",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/custom-fields/AUDIT",
        label: "customFields",
        icon: "Settings",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/admin/menus",
        label: "menuManagement",
        icon: "Menu",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
    ],
  },
  
  // ================== SYSTEM & SETTINGS ==================
  {
    path: "/system",
    label: "system",
    icon: "Settings",
    parentId: null,
    status: "active",
    createBy: adminId,
    type: 'dir',
    children: [
      {
        path: "/settings",
        label: "settings",
        icon: "Settings",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
      {
        path: "/settings/appearance",
        label: "appearance",
        icon: "Palette",
        status: "active",
        createBy: adminId,
        type: 'menu',
      },
    ],
  },
]

async function runSeed(adminId: string) {
  console.log("⏳ Running modern menu seed...")

  const menus = getMenus(adminId);

  await db.transaction(async (tx) => {
    const start = Date.now()

    // 1. Insert parent menus (type: 'menu' or 'dir')
    const parentMenus = menus.filter((menu: any) => !menu.children)
    const result = await tx.insert(menuTable).values(parentMenus as any).returning()

    // 2. Insert directory placeholders and get their IDs
    const dirMenus = menus.filter((menu: any) => menu.type === 'dir')
    const dirResults = await tx.insert(menuTable).values(
      dirMenus.map((menu: any) => ({
        path: menu.path,
        label: menu.label,
        icon: menu.icon,
        parentId: menu.parentId,
        status: menu.status,
        createBy: menu.createBy,
        type: menu.type,
      })) as any
    ).returning()

    // 3. Insert child menus with correct parentId
    const childMenus = dirMenus.flatMap((menu: any) => {
      const parent = dirResults.find((m) => m.path === menu.path)
      return menu.children?.map((child: any) => ({
        ...child,
        parentId: parent?.id,
        createBy: adminId,
        type: 'menu',
        status: 'active',
      })) || []
    })

    if (childMenus.length > 0) {
      await tx.insert(menuTable).values(childMenus as any).returning()
    }

    const end = Date.now()
    console.log(`✅ Menu seed completed in ${end - start}ms`)
    console.log(`   📊 Total menus: ${parentMenus.length + dirResults.length + childMenus.length}`)
  })
}

// Export for master seed
export async function seedMenus(adminId: string) {
  console.log("\n📋 SEEDING: Modern Menu Structure...");
  await runSeed(adminId);
  console.log("  ✅ Menus created with new structure");
}
