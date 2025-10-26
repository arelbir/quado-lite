import { db } from "@/drizzle/db";
import { 
  actionProgress, 
  dofActivities, 
  actions, 
  dofs, 
  findings, 
  audits,
  auditPlans,
  auditQuestions,
  questionBanks,
  questions,
  auditTemplates,
  user,
  teams,
  groups,
  menuTable,
  userMenuTable,
  rolePermissions,
  userRoles,
  roles,
  permissions,
  positions,
  departments,
  branches,
  companies
} from "@/drizzle/schema";
import { notInArray } from "drizzle-orm";

/**
 * Cleanup Script: Seed verilerini temizle
 * 
 * UYARI: Bu script tüm denetim verilerini ve seed kullanıcılarını siler!
 * Sadece super admin ve main admin korunur.
 */

async function cleanupSeedData() {
  console.log("🧹 Cleaning up seed data...");
  console.log("⚠️  WARNING: This will delete ALL audit data and seed users!");
  
  try {
    await db.transaction(async (tx) => {
      // ÖNEMLI: Child table'ları önce sil (Foreign Key order)
      
      // 1. Action Progress Notları Sil (child of actions)
      console.log("   🗑️  Deleting action progress notes...");
      await tx.delete(actionProgress);
      
      // 2. DOF Activities Sil (child of dofs)
      console.log("   🗑️  Deleting DOF activities...");
      await tx.delete(dofActivities);
      
      // 3. Actions Sil (child of findings)
      console.log("   🗑️  Deleting actions...");
      await tx.delete(actions);
      
      // 4. DOFs Sil (child of findings)
      console.log("   🗑️  Deleting DOFs...");
      await tx.delete(dofs);
      
      // 5. Findings Sil (child of audits)
      console.log("   🗑️  Deleting findings...");
      await tx.delete(findings);
      
      // 6. Audit Plans Sil (child of audits)
      console.log("   🗑️  Deleting audit plans...");
      await tx.delete(auditPlans);
      
      // 7. Audit Questions Sil (child of audits) ⚠️ BU DA EKSİKTİ!
      console.log("   🗑️  Deleting audit questions...");
      await tx.delete(auditQuestions);
      
      // 8. Audits Sil (parent)
      console.log("   🗑️  Deleting audits...");
      await tx.delete(audits);
      
      // 9. Question Banks & Templates
      console.log("   🗑️  Deleting questions & templates...");
      await tx.delete(questions);
      await tx.delete(questionBanks);
      await tx.delete(auditTemplates);
      
      // 10. Teams & Groups
      console.log("   🗑️  Deleting teams & groups...");
      await tx.delete(groups); // Groups first (has foreign key to teams)
      await tx.delete(teams);
      
      // 11. User-Related Tables (must delete before users)
      console.log("   🗑️  Deleting user menus & roles...");
      await tx.delete(userMenuTable);
      await tx.delete(userRoles);
      
      // 12. Seed Kullanıcıları Sil (admin hariç)
      console.log("   🗑️  Deleting seed users (keeping admins)...");
      
      // Admin emaillerini koru
      const protectedEmails = [
        process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com',
        'admin@example.com'
      ];
      
      // Diğer kullanıcıları sil
      await tx.delete(user).where(
        notInArray(user.email, protectedEmails)
      );
      
      // 13. Menus, Roles & Permissions
      console.log("   🗑️  Deleting menus, roles & permissions...");
      await tx.delete(menuTable);
      await tx.delete(rolePermissions);
      await tx.delete(roles);
      await tx.delete(permissions);
      
      // 14. Organization Structure
      console.log("   🗑️  Deleting organization structure...");
      await tx.delete(positions);
      await tx.delete(departments);
      await tx.delete(branches);
      await tx.delete(companies);
    });
    
    console.log("\n✅ Cleanup completed successfully!");
    console.log("\n📊 Deleted:");
    console.log("   - All action progress notes");
    console.log("   - All DOF activities");
    console.log("   - All actions");
    console.log("   - All DOFs");
    console.log("   - All findings");
    console.log("   - All audit plans");
    console.log("   - All audits");
    console.log("   - All questions & templates");
    console.log("   - All teams & groups");
    console.log("   - All user menus & role assignments");
    console.log("   - All seed users (except admins)");
    console.log("   - All menus");
    console.log("   - All roles & permissions");
    console.log("   - All organization structure (companies, branches, departments, positions)");
    console.log("\n✅ Admins are safe:");
    console.log(`   - ${process.env.SUPER_ADMIN_EMAIL}`);
    console.log("   - admin@example.com");
    console.log("\n🌱 Database is now clean! Run: npm run seed:master");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

cleanupSeedData();
