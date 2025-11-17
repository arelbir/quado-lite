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
  
  // Quality Management Roles
  {
    name: "Quality Manager",
    code: "QUALITY_MANAGER",
    description: "Manage quality systems, approve audits, findings, and DOFs",
    category: "Functional" as const,
    scope: "Department" as const,
    isSystem: false,
  },
  {
    name: "Auditor",
    code: "AUDITOR",
    description: "Conduct audits, create findings",
    category: "Functional" as const,
    scope: "Global" as const,
    isSystem: false,
  },
  {
    name: "Process Owner",
    code: "PROCESS_OWNER",
    description: "Manage processes, close findings, manage actions",
    category: "Functional" as const,
    scope: "Department" as const,
    isSystem: false,
  },
  {
    name: "Action Owner",
    code: "ACTION_OWNER",
    description: "Complete assigned corrective/preventive actions",
    category: "Functional" as const,
    scope: "Global" as const,
    isSystem: false,
  },
];

/**
 * PERMISSIONS
 * Granular permissions (Resource + Action)
 */
const PERMISSIONS = [
  // Audit Permissions
  { code: "audit.create", resource: "Audit", action: "Create", category: "Audit Management", name: "Create Audit" },
  { code: "audit.read", resource: "Audit", action: "Read", category: "Audit Management", name: "View Audit" },
  { code: "audit.update", resource: "Audit", action: "Update", category: "Audit Management", name: "Update Audit" },
  { code: "audit.delete", resource: "Audit", action: "Delete", category: "Audit Management", name: "Delete Audit" },
  { code: "audit.approve", resource: "Audit", action: "Approve", category: "Audit Management", name: "Approve Audit" },
  { code: "audit.export", resource: "Audit", action: "Export", category: "Audit Management", name: "Export Audit" },
  
  // Finding Permissions
  { code: "finding.create", resource: "Finding", action: "Create", category: "Finding Management", name: "Create Finding" },
  { code: "finding.read", resource: "Finding", action: "Read", category: "Finding Management", name: "View Finding" },
  { code: "finding.update", resource: "Finding", action: "Update", category: "Finding Management", name: "Update Finding" },
  { code: "finding.delete", resource: "Finding", action: "Delete", category: "Finding Management", name: "Delete Finding" },
  { code: "finding.assign", resource: "Finding", action: "Assign", category: "Finding Management", name: "Assign Finding" },
  { code: "finding.close", resource: "Finding", action: "Close", category: "Finding Management", name: "Close Finding" },
  { code: "finding.approve", resource: "Finding", action: "Approve", category: "Finding Management", name: "Approve Finding" },
  { code: "finding.reject", resource: "Finding", action: "Reject", category: "Finding Management", name: "Reject Finding" },
  
  // Action Permissions
  { code: "action.create", resource: "Action", action: "Create", category: "Action Management", name: "Create Action" },
  { code: "action.read", resource: "Action", action: "Read", category: "Action Management", name: "View Action" },
  { code: "action.update", resource: "Action", action: "Update", category: "Action Management", name: "Update Action" },
  { code: "action.delete", resource: "Action", action: "Delete", category: "Action Management", name: "Delete Action" },
  { code: "action.complete", resource: "Action", action: "Complete", category: "Action Management", name: "Complete Action" },
  { code: "action.approve", resource: "Action", action: "Approve", category: "Action Management", name: "Approve Action" },
  { code: "action.reject", resource: "Action", action: "Reject", category: "Action Management", name: "Reject Action" },
  { code: "action.cancel", resource: "Action", action: "Cancel", category: "Action Management", name: "Cancel Action" },
  
  // DOF Permissions
  { code: "dof.create", resource: "DOF", action: "Create", category: "DOF Management", name: "Create DOF" },
  { code: "dof.read", resource: "DOF", action: "Read", category: "DOF Management", name: "View DOF" },
  { code: "dof.update", resource: "DOF", action: "Update", category: "DOF Management", name: "Update DOF" },
  { code: "dof.delete", resource: "DOF", action: "Delete", category: "DOF Management", name: "Delete DOF" },
  { code: "dof.submit", resource: "DOF", action: "Submit", category: "DOF Management", name: "Submit DOF" },
  { code: "dof.approve", resource: "DOF", action: "Approve", category: "DOF Management", name: "Approve DOF" },
  { code: "dof.reject", resource: "DOF", action: "Reject", category: "DOF Management", name: "Reject DOF" },
  
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
  { code: "report.audit", resource: "Report", action: "Export", category: "Reporting", name: "Export Audit Reports" },
  { code: "report.finding", resource: "Report", action: "Export", category: "Reporting", name: "Export Finding Reports" },
  { code: "report.dof", resource: "Report", action: "Export", category: "Reporting", name: "Export DOF Reports" },
  
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
    // Audit
    "audit.create", "audit.read", "audit.update", "audit.delete", "audit.approve", "audit.export",
    // Finding
    "finding.create", "finding.read", "finding.update", "finding.delete", "finding.assign", "finding.close", "finding.approve", "finding.reject",
    // Action
    "action.create", "action.read", "action.update", "action.delete", "action.approve", "action.reject", "action.cancel",
    // DOF
    "dof.create", "dof.read", "dof.update", "dof.delete", "dof.approve", "dof.reject",
    // User
    "user.create", "user.read", "user.update", "user.delete", "user.assign_role",
    // Department
    "department.create", "department.read", "department.update", "department.delete",
    // Custom Fields
    "customfield.create", "customfield.read", "customfield.update", "customfield.delete",
    // Reports
    "report.audit", "report.finding", "report.dof",
  ],
  
  // Manager: Department-level management
  MANAGER: [
    "audit.read", "audit.export",
    "finding.read", "finding.assign",
    "action.read", "action.approve", "action.reject",
    "dof.read", "dof.approve", "dof.reject",
    "user.read",
    "department.read",
    "report.audit", "report.finding", "report.dof",
  ],
  
  // Quality Manager: Full quality system access
  QUALITY_MANAGER: [
    "audit.create", "audit.read", "audit.update", "audit.approve", "audit.export",
    "finding.read", "finding.update", "finding.approve", "finding.reject", "finding.close",
    "action.read", "action.approve", "action.reject",
    "dof.read", "dof.approve", "dof.reject",
    "user.read",
    "department.read",
    "customfield.create", "customfield.read", "customfield.update", "customfield.delete",
    "report.audit", "report.finding", "report.dof",
  ],
  
  // Auditor: Conduct audits and create findings
  AUDITOR: [
    "audit.create", "audit.read", "audit.update", "audit.export",
    "finding.create", "finding.read", "finding.update", "finding.assign",
    "action.read",
    "dof.read",
    "user.read",
    "department.read",
  ],
  
  // Process Owner: Manage actions and close findings
  PROCESS_OWNER: [
    "audit.read",
    "finding.read", "finding.close",
    "action.create", "action.read", "action.update", "action.complete", "action.approve", "action.reject",
    "dof.create", "dof.read", "dof.update", "dof.submit",
    "user.read",
    "department.read",
  ],
  
  // Action Owner: Complete assigned actions
  ACTION_OWNER: [
    "audit.read",
    "finding.read",
    "action.read", "action.complete",
    "dof.read",
    "user.read",
  ],
  
  // User: Basic read access
  USER: [
    "audit.read",
    "finding.read",
    "action.read",
    "dof.read",
    "user.read",
    "department.read",
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
