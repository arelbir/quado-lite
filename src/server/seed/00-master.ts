/**
 * MASTER SEED ORCHESTRATOR - FRAMEWORK CORE
 * Sample company structure with core modules only
 * 
 * Usage: npx tsx src/server/seed/00-master.ts
 * 
 * Order (CRITICAL):
 * 0. Admin User (FIRST - for createdById)
 * 1. Organization
 * 2. Users
 * 3. Roles & Permissions
 * 4. Menus
 * 5. Teams & Groups
 * 6. Role-Menu Mappings
 */

import { seedAdmin, assignAdminRole } from "./00-admin";
import { seedOrganization } from "./01-organization";
import { seedUsers } from "./02-users";
import { seedRoleSystem } from "./03-roles";
import { seedMenus } from "./04-menus";
import { seedTeamsAndGroups } from "./06-teams-groups";
import { seedRoleMenus } from "./10-role-menus";

async function masterSeed() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════");
  console.log("🌱 MASTER SEED - 150-Person Company");
  console.log("═══════════════════════════════════════════════════");

  try {
    // 0. Admin User (FIRST - for createdById tracking)
    const { adminId } = await seedAdmin();
    
    // 1. Organization Structure (with adminId)
    const { companyId } = await seedOrganization(adminId);
    
    // 2. Users (150 people)
    await seedUsers(companyId);
    
    // 3. Role System (with adminId)
    await seedRoleSystem(adminId);
    
    // 3.5. Assign SUPER_ADMIN role to admin (AFTER role system)
    await assignAdminRole(adminId);
    
    // 4. Menus (with adminId)
    await seedMenus(adminId);
    
    // 5. Teams & Groups (with adminId)
    console.log("\n👥 SEEDING: Teams & Groups...");
    await seedTeamsAndGroups(adminId);
    
    // 6. Role-Menu Mappings (AFTER roles & menus)
    await seedRoleMenus(adminId);

    console.log("\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("✅ SEED COMPLETED SUCCESSFULLY");
    console.log("═══════════════════════════════════════════════════");
    console.log("\n📊 FRAMEWORK CORE SEEDED:");
    console.log("  ✅ 1 Company (ABC Teknoloji A.Ş.)");
    console.log("  ✅ 5 Branches (with managers)");
    console.log("  ✅ 12 Departments (with managers)");
    console.log("  ✅ 15 Positions (Hierarchical)");
    console.log("  ✅ 150 Users (Realistic distribution)");
    console.log("  ✅ 4 System Roles (RBAC)");
    console.log("  ✅ Core Menu Items");
    console.log("  ✅ 10 Teams (with leaders)");
    console.log("  ✅ 10 Groups (with owners)");
    console.log("  ✅ Role-Menu Mappings");
    console.log("\n🔑 LOGIN:");
    console.log("  📧 Any user: [firstname].[lastname]@abcteknoloji.com");
    console.log("  ℹ️  Turkish chars → ASCII (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u)");
    console.log("  🔑 Password: 123456");
    console.log("\n💡 EXAMPLES:");
    console.log("  admin@example.com / 123456");
    console.log("  mehmet.yilmaz@abcteknoloji.com / 123456 (Mehmet Yılmaz)");
    console.log("  ayse.demir@abcteknoloji.com / 123456 (Ayşe Demir)");
    console.log("  selin.yildirim@abcteknoloji.com / 123456 (Selin Yıldırım)");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ SEED FAILED:", error);
    process.exit(1);
  }
}

masterSeed();
