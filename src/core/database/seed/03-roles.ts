/**
 * ROLE & PERMISSION SEED DATA
 * Pre-defined system roles and permissions
 * 
 * Run: pnpm run seed:roles
 * 
 * Created: 2025-01-24
 * Sprint: Week 2 - Multi-Role System
 */

import { db } from "@/core/database/client";
import { roles, permissions, rolePermissions } from "@/core/database/schema/role-system";

/**
 * SYSTEM ROLES
 * Protected roles that cannot be deleted
 */
const SYSTEM_ROLES = [
  // Admin Roles
  {
    name: "Super Admin",
    code: "SUPER_ADMIN",
    description: "Full system access - highest privilege level",
    category: "System" as const,
    scope: "Global" as const,
    isSystem: true,
  },
  {
    name: "Admin",
    code: "ADMIN",
    description: "Company-wide administration and management",
    category: "System" as const,
    scope: "Company" as const,
    isSystem: true,
  },
  {
    name: "Manager",
    code: "MANAGER",
    description: "Department or team management",
    category: "System" as const,
    scope: "Department" as const,
    isSystem: true,
  },
  {
    name: "User",
    code: "USER",
    description: "Basic user access",
    category: "System" as const,
    scope: "Global" as const,
    isSystem: true,
  },
  
  // Add your domain-specific roles here
  // Example:
  // {
  //   name: "Custom Role",
  //   code: "CUSTOM_ROLE",
  //   description: "Your role description",
  //   category: "Functional" as const,
  //   scope: "Department" as const,
  //   isSystem: false,
  // },
];

/**
 * PERMISSIONS
 * Granular permissions (Resource + Action)
 */
const PERMISSIONS = [
  // User Permissions
  { code: "user.create", resource: "User", action: "Create", category: "User Management", name: "Create User" },
  { code: "user.read", resource: "User", action: "Read", category: "User Management", name: "View User" },
  { code: "user.update", resource: "User", action: "Update", category: "User Management", name: "Update User" },
  { code: "user.delete", resource: "User", action: "Delete", category: "User Management", name: "Delete User" },
  { code: "user.assign_role", resource: "User", action: "AssignRole", category: "User Management", name: "Assign Role to User" },
  
  // Department Permissions
  { code: "department.create", resource: "Department", action: "Create", category: "Organization Management", name: "Create Department" },
  { code: "department.read", resource: "Department", action: "Read", category: "Organization Management", name: "View Department" },
  { code: "department.update", resource: "Department", action: "Update", category: "Organization Management", name: "Update Department" },
  { code: "department.delete", resource: "Department", action: "Delete", category: "Organization Management", name: "Delete Department" },
  
  // Role Permissions
  { code: "role.create", resource: "Role", action: "Create", category: "System Management", name: "Create Role" },
  { code: "role.read", resource: "Role", action: "Read", category: "System Management", name: "View Role" },
  { code: "role.update", resource: "Role", action: "Update", category: "System Management", name: "Update Role" },
  { code: "role.delete", resource: "Role", action: "Delete", category: "System Management", name: "Delete Role" },
  
  // Report Permissions
  { code: "report.export", resource: "Report", action: "Export", category: "Reporting", name: "Export Reports" },
  { code: "report.create", resource: "Report", action: "Create", category: "Reporting", name: "Create Report" },
  { code: "report.read", resource: "Report", action: "Read", category: "Reporting", name: "View Report" },
  
  // Workflow Permissions
  { code: "workflow.create", resource: "Workflow", action: "Create", category: "Workflow Management", name: "Create Workflow" },
  { code: "workflow.read", resource: "Workflow", action: "Read", category: "Workflow Management", name: "View Workflow" },
  { code: "workflow.update", resource: "Workflow", action: "Update", category: "Workflow Management", name: "Update Workflow" },
  { code: "workflow.delete", resource: "Workflow", action: "Delete", category: "Workflow Management", name: "Delete Workflow" },
  { code: "workflow.approve", resource: "Workflow", action: "Approve", category: "Workflow Management", name: "Approve in Workflow" },
  { code: "workflow.reject", resource: "Workflow", action: "Reject", category: "Workflow Management", name: "Reject in Workflow" },
  
  // Notification Permissions
  { code: "notification.read", resource: "Notification", action: "Read", category: "System", name: "View Notifications" },
  { code: "notification.send", resource: "Notification", action: "Send", category: "System", name: "Send Notifications" },
  
  // Custom Fields Permissions
  { code: "customfield.create", resource: "CustomField", action: "Create", category: "System Management", name: "Create Custom Field" },
  { code: "customfield.read", resource: "CustomField", action: "Read", category: "System Management", name: "View Custom Field" },
  { code: "customfield.update", resource: "CustomField", action: "Update", category: "System Management", name: "Update Custom Field" },
  { code: "customfield.delete", resource: "CustomField", action: "Delete", category: "System Management", name: "Delete Custom Field" },
];

/**
 * ROLE-PERMISSION MAPPINGS
 * Define which roles have which permissions
 */
const ROLE_PERMISSION_MAPPINGS: Record<string, string[] | "all"> = {
  // Super Admin: All permissions
  SUPER_ADMIN: "all",
  
  // Admin: Most permissions except system management
  ADMIN: [
    // User Management
    "user.create", "user.read", "user.update", "user.delete", "user.assign_role",
    // Organization
    "department.create", "department.read", "department.update", "department.delete",
    // Workflows
    "workflow.create", "workflow.read", "workflow.update", "workflow.delete", "workflow.approve", "workflow.reject",
    // Custom Fields
    "customfield.create", "customfield.read", "customfield.update", "customfield.delete",
    // Notifications
    "notification.read", "notification.send",
    // Reports
    "report.export", "report.create", "report.read",
  ],
  
  // Manager: Department-level management
  MANAGER: [
    "user.read",
    "department.read",
    "workflow.read", "workflow.approve", "workflow.reject",
    "notification.read",
    "report.read", "report.export",
  ],
  
  // User: Basic read access
  USER: [
    "user.read",
    "department.read",
    "workflow.read",
    "notification.read",
  ],
};

/**
 * MAIN SEED FUNCTION
 */
export async function seedRoleSystem(adminId?: string) {
  console.log("🌱 Seeding role & permission system...\n");
  // AdminId available for future use (e.g., createdById field)
  
  try {
    // 1. Seed Permissions
    console.log("🔐 Seeding permissions...");
    const createdPermissions = new Map<string, string>();
    
    for (const perm of PERMISSIONS) {
      const [created] = await db.insert(permissions)
        .values({
          ...perm,
          isSystem: true,
        })
        .returning({ id: permissions.id, code: permissions.code })
        .onConflictDoNothing();
      
      if (created) {
        createdPermissions.set(created.code, created.id);
        console.log(`  ✅ Created: ${perm.name} (${perm.code})`);
      }
    }
    
    if (createdPermissions.size === 0) {
      console.log("  ⏭️  Permissions already exist, loading existing...");
      // Load existing
      const existing = await db.query.permissions.findMany();
      for (const perm of existing) {
        createdPermissions.set(perm.code, perm.id);
      }
    }
    
    console.log(`  📊 Total permissions: ${createdPermissions.size}`);
    
    // 2. Seed Roles
    console.log("\n👥 Seeding roles...");
    const createdRoles = new Map<string, string>();
    
    for (const role of SYSTEM_ROLES) {
      const [created] = await db.insert(roles)
        .values(role)
        .returning({ id: roles.id, code: roles.code })
        .onConflictDoNothing();
      
      if (created) {
        createdRoles.set(created.code, created.id);
        console.log(`  ✅ Created: ${role.name} (${role.code})`);
      }
    }
    
    if (createdRoles.size === 0) {
      console.log("  ⏭️  Roles already exist, loading existing...");
      // Load existing
      const existing = await db.query.roles.findMany();
      for (const role of existing) {
        createdRoles.set(role.code, role.id);
      }
    }
    
    console.log(`  📊 Total roles: ${createdRoles.size}`);
    
    // 3. Map Roles to Permissions
    console.log("\n🔗 Mapping roles to permissions...");
    let mappingCount = 0;
    
    for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSION_MAPPINGS)) {
      const roleId = createdRoles.get(roleCode);
      if (!roleId) {
        console.log(`  ⚠️  Role not found: ${roleCode}`);
        continue;
      }
      
      if (permissionCodes === "all") {
        // Super admin gets all permissions
        console.log(`  🔑 Assigning ALL permissions to ${roleCode}...`);
        for (const permId of createdPermissions.values()) {
          await db.insert(rolePermissions)
            .values({ roleId, permissionId: permId })
            .onConflictDoNothing();
          mappingCount++;
        }
      } else {
        console.log(`  🔗 Assigning ${permissionCodes.length} permissions to ${roleCode}...`);
        for (const permCode of permissionCodes) {
          const permId = createdPermissions.get(permCode);
          if (!permId) {
            console.log(`    ⚠️  Permission not found: ${permCode}`);
            continue;
          }
          
          await db.insert(rolePermissions)
            .values({ roleId, permissionId: permId })
            .onConflictDoNothing();
          mappingCount++;
        }
      }
    }
    
    console.log(`  📊 Total role-permission mappings: ${mappingCount}`);
    
    console.log("\n✅ Role system seed completed!");
    console.log("\n📊 Summary:");
    console.log(`  Roles: ${SYSTEM_ROLES.length}`);
    console.log(`  Permissions: ${PERMISSIONS.length}`);
    console.log(`  Mappings: ${mappingCount}`);
    
  } catch (error) {
    console.error("❌ Error seeding role system:", error);
    throw error;
  }
}
