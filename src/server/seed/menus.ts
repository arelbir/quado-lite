import { db } from "@/drizzle/db"
import { menuTable, userMenuTable } from "@/drizzle/schema"

const superAdminId = process.env.SUPER_ADMIN_UUID as string
const menus = [
  {
    path: '/',
    label: "dashboard",
    icon: "Home",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'menu',
  },
  {
    path: '/tasks',
    label: 'tasks',
    icon: "Package",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'menu',
  },
  {
    path: '/settings',
    label: 'settings',
    icon: "Settings",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'menu',
  },
  {
    path: '/system',
    label: 'system',
    icon: "Package",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'dir',
    children: [
      {
        path: '/system/users',
        label: "systemUsers",
        icon: "Users",
      },
      {
        path: '/system/menus',
        label: "systemMenus",
        icon: "Menu",
      }
    ],
  },
  {
    path: "/denetim",
    label: "auditSystem",
    icon: "ClipboardCheck",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'dir',
    children: [
      {
        path: "/denetim",
        label: "dashboard",
        icon: "LayoutDashboard",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/my-tasks",
        label: "myTasks",
        icon: "ClipboardCheck",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/my-audits",
        label: "myAudits",
        icon: "FileCheck",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/all",
        label: "allAudits",
        icon: "ListChecks",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
    ],
  },
  {
    path: "/operations",
    label: "operations",
    icon: "Workflow",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'dir',
    children: [
      {
        path: "/denetim/findings",
        label: "findings",
        icon: "AlertCircle",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/actions",
        label: "actions",
        icon: "CheckCircle2",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/dofs",
        label: "dofs",
        icon: "Target",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/closures",
        label: "closures",
        icon: "FileCheck",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
    ],
  },
  {
    path: "/infrastructure",
    label: "infrastructure",
    icon: "Database",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'dir',
    children: [
      {
        path: "/denetim/question-banks",
        label: "questionBanks",
        icon: "HelpCircle",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/denetim/templates",
        label: "templates",
        icon: "FileText",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
    ],
  },
  {
    path: "/error",
    label: "errorPages",
    icon: "AlertCircle",
    parentId: null,
    status: "active",
    createBy: superAdminId,
    type: 'dir',
    children: [
      {
        path: "/error/404",
        label: "error404",
        icon: "AlertTriangle",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
      {
        path: "/error/500",
        label: "error500",
        icon: "ShieldAlert",
        status: "active",
        createBy: superAdminId,
        type: 'menu',
      },
    ],
  }
]

async function runSeed() {
  console.log("⏳ Running menus seed...")

 await db.transaction(async (tx) => {
  const start = Date.now()

  const result = await tx.insert(menuTable).values(menus as any).returning()

  if (result.length) {
    const childrenMenus = menus.filter((menu) => menu.type === 'dir').map((menu) => {
      const parent = result.find((m) => m.path === menu.path)

      return menu.children?.map((child) => ({
        ...child,
        parentId: parent?.id,
        createBy: superAdminId,
        type: 'menu',
      }))
    })
    const resultMenus = await tx.insert(menuTable).values(childrenMenus.flat() as any).returning()

    await tx.insert(userMenuTable).values([...resultMenus, ...result].map((menu) => ({
      userId: superAdminId,
      menuId: menu.id,
    })))
  }
  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)
 })

  process.exit(0)
}

runSeed().catch((err) => {
  console.error("❌ Seed failed")
  console.error(err)
  process.exit(1)
})
