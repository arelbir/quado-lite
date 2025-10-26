/**
 * MASTER SEED ORCHESTRATOR
 * 150-person company with all modules
 * 
 * Usage: npx tsx src/server/seed/00-master.ts
 * 
 * Order (CRITICAL):
 * 0. Admin User (FIRST - for createdById)
 * 1. Organization
 * 2. Users
 * 3. Roles & Permissions
 * 4. Menus
 * 5. Question Banks
 * 6. Teams & Groups
 * 7. Manager & Leader Assignments ✨
 * 8. Sample Data
 * 9. Workflow Definitions ✨ NEW
 */

import { seedAdmin, assignAdminRole } from "./00-admin";
import { seedOrganization } from "./01-organization";
import { seedUsers } from "./02-users";
import { seedRoleSystem } from "./03-roles";
import { seedMenus } from "./04-menus";
import { seedQuestionBanks } from "./05-question-banks";
import { seedTeamsAndGroups } from "./06-teams-groups";
import { seedSampleData } from "./07-sample-data";
import { seedAssignments } from "./08-assignments";
import { seedWorkflows } from "./09-workflows";
import { seedRoleMenus } from "./10-role-menus";
import { seedWorkflows as seedVisualWorkflows } from "./11-workflows";

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
    
    // 5. Question Banks (with adminId)
    console.log("\n📚 SEEDING: Question Banks...");
    await seedQuestionBanks(adminId);
    
    // 6. Teams & Groups (with adminId)
    console.log("\n👥 SEEDING: Teams & Groups...");
    await seedTeamsAndGroups(adminId);
    
    // 7. Manager & Leader Assignments (AFTER users & teams)
    await seedAssignments(adminId);
    
    // 8. Sample Data (with adminId)
    console.log("\n📊 SEEDING: Sample Data...");
    await seedSampleData(adminId);
    
    // 9. Workflow Definitions (with adminId)
    await seedWorkflows(adminId);
    
    // 10. Role-Menu Mappings (AFTER roles & menus)
    await seedRoleMenus(adminId);
    
    // 11. Visual Workflow Definitions (with adminId)
    console.log("\n🎨 SEEDING: Visual Workflows...");
    await seedVisualWorkflows();

    console.log("\n");
    console.log("═══════════════════════════════════════════════════");
    console.log("✅ SEED COMPLETED SUCCESSFULLY");
    console.log("═══════════════════════════════════════════════════");
    console.log("\n📊 SUMMARY:");
    console.log("  ✅ 1 Company (ABC Teknoloji A.Ş.)");
    console.log("  ✅ 5 Branches (with managers ✨)");
    console.log("  ✅ 12 Departments (with managers ✨)");
    console.log("  ✅ 15 Positions (Hierarchical)");
    console.log("  ✅ 150 Users (Realistic distribution)");
    console.log("  ✅ 4 System Roles");
    console.log("  ✅ Menu Items");
    console.log("  ✅ Question Banks");
    console.log("  ✅ 10 Teams (with leaders ✨)");
    console.log("  ✅ 10 Groups (with owners)");
    console.log("  ✅ 8 Workflow Definitions");
    console.log("  ✅ 4 Visual Workflows (Designer) ✨ NEW");
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
