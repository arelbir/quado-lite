/**
 * TEAMS & GROUPS SEED DATA
 * Initial teams and functional groups
 * 
 * Run: pnpm run seed:teams
 * 
 * Created: 2025-01-24
 * Sprint: Week 4 - Teams & Groups
 */

import { db } from "@/core/database/client";
import { teams, groups, departments } from "@/core/database/schema";

/**
 * SEED TEAMS
 * Organizational teams within departments
 */
const SEED_TEAMS = [
  // Quality Department Teams
  {
    name: "Kalite Güvence Ekibi",
    code: "QA_TEAM",
    description: "Kalite güvence ve test ekibi",
    type: "Permanent" as const,
  },
  {
    name: "Denetim Ekibi",
    code: "AUDIT_TEAM",
    description: "İç denetim ve uygunluk değerlendirme ekibi",
    type: "Permanent" as const,
  },
  
  // IT Department Teams
  {
    name: "DevOps Ekibi",
    code: "DEVOPS_TEAM",
    description: "Altyapı ve deployment ekibi",
    type: "Permanent" as const,
  },
  {
    name: "Yazılım Geliştirme Ekibi",
    code: "DEV_TEAM",
    description: "Yazılım geliştirme ekibi",
    type: "Permanent" as const,
  },
  
  // Sales Department Teams
  {
    name: "B2B Satış Ekibi",
    code: "B2B_SALES",
    description: "Kurumsal müşteriler satış ekibi",
    type: "Permanent" as const,
  },
  {
    name: "B2C Satış Ekibi",
    code: "B2C_SALES",
    description: "Bireysel müşteriler satış ekibi",
    type: "Permanent" as const,
  },
  
  // Production Department Teams
  {
    name: "Üretim Hattı 1",
    code: "PROD_LINE_1",
    description: "1 numaralı üretim hattı ekibi",
    type: "Permanent" as const,
  },
  {
    name: "Kalite Kontrol Ekibi",
    code: "QC_TEAM",
    description: "Üretim kalite kontrol ekibi",
    type: "Permanent" as const,
  },
  
  // Project Teams
  {
    name: "Yeni Ürün Geliştirme",
    code: "NEW_PRODUCT_DEV",
    description: "Yeni ürün geliştirme proje ekibi",
    type: "Project" as const,
  },
  {
    name: "Dijital Dönüşüm Ekibi",
    code: "DIGITAL_TRANSFORM",
    description: "Dijital dönüşüm proje ekibi",
    type: "Project" as const,
  },
];

/**
 * SEED GROUPS
 * Cross-functional groups
 */
const SEED_GROUPS = [
  // Functional Groups
  {
    name: "Denetçiler Grubu",
    code: "AUDITORS_GROUP",
    description: "Tüm iç denetçilerin grubu",
    type: "Functional" as const,
    visibility: "Public" as const,
  },
  {
    name: "Kalite Yöneticileri",
    code: "QUALITY_MANAGERS",
    description: "Kalite yöneticileri koordinasyon grubu",
    type: "Functional" as const,
    visibility: "Public" as const,
  },
  {
    name: "Süreç Sahipleri",
    code: "PROCESS_OWNERS",
    description: "Süreç sahipleri iletişim grubu",
    type: "Functional" as const,
    visibility: "Public" as const,
  },
  
  // Committee Groups
  {
    name: "ISO Komitesi",
    code: "ISO_COMMITTEE",
    description: "ISO standardları yönetim komitesi",
    type: "Committee" as const,
    visibility: "Public" as const,
  },
  {
    name: "Kalite Konseyi",
    code: "QUALITY_COUNCIL",
    description: "Üst düzey kalite konseyi",
    type: "Committee" as const,
    visibility: "Restricted" as const,
  },
  {
    name: "İyileştirme Komitesi",
    code: "IMPROVEMENT_COMMITTEE",
    description: "Sürekli iyileştirme komitesi",
    type: "Committee" as const,
    visibility: "Public" as const,
  },
  
  // Project Groups
  {
    name: "Proje Alpha Ekibi",
    code: "PROJECT_ALPHA",
    description: "Alpha projesi çalışma grubu",
    type: "Project" as const,
    visibility: "Private" as const,
  },
  {
    name: "İnovasyon Grubu",
    code: "INNOVATION_GROUP",
    description: "İnovasyon ve AR-GE çalışma grubu",
    type: "Project" as const,
    visibility: "Public" as const,
  },
  
  // Custom Groups
  {
    name: "Yeni Çalışanlar",
    code: "ONBOARDING_GROUP",
    description: "Yeni işe başlayanlar oryantasyon grubu",
    type: "Custom" as const,
    visibility: "Public" as const,
  },
  {
    name: "Eğitim Koordinatörleri",
    code: "TRAINING_COORDINATORS",
    description: "Eğitim ve gelişim koordinatörleri",
    type: "Custom" as const,
    visibility: "Public" as const,
  },
];

/**
 * MAIN SEED FUNCTION
 */
export async function seedTeamsAndGroups(adminId?: string) {
  console.log("🌱 Seeding teams and groups...\n");
  // AdminId available for future use
  
  try {
    // Get departments for mapping teams
    const deptList = await db.query.departments.findMany();
    const deptMap = new Map(deptList.map(d => [d.code, d.id]));
    
    // 1. Seed Teams
    console.log("👥 Seeding teams...");
    let teamCount = 0;
    
    for (const team of SEED_TEAMS) {
      // Map teams to departments based on their nature
      let departmentId: string | null = null;
      
      if (team.code.includes('QA') || team.code.includes('AUDIT')) {
        departmentId = deptMap.get('QUALITY') || null;
      } else if (team.code.includes('DEV') || team.code.includes('IT')) {
        departmentId = deptMap.get('IT') || null;
      } else if (team.code.includes('SALES')) {
        departmentId = deptMap.get('SALES') || null;
      } else if (team.code.includes('PROD') || team.code.includes('QC')) {
        departmentId = deptMap.get('PRODUCTION') || null;
      }
      
      const [created] = await db.insert(teams)
        .values({
          ...team,
          departmentId,
          createdById: adminId,
        })
        .returning({ id: teams.id })
        .onConflictDoNothing();
      
      if (created) {
        teamCount++;
        console.log(`  ✅ Created: ${team.name} (${team.code})`);
      }
    }
    
    if (teamCount === 0) {
      console.log("  ⏭️  Teams already exist, skipping...");
    }
    
    // 2. Seed Groups
    console.log("\n🔗 Seeding groups...");
    let groupCount = 0;
    
    // Get first admin user as default owner
    const firstAdmin = await db.query.user.findFirst({
      orderBy: (users, { asc }) => [asc(users.createdAt)],
    });
    
    if (!firstAdmin) {
      console.log("  ⚠️  No users found, skipping groups");
    } else {
      for (const group of SEED_GROUPS) {
        const [created] = await db.insert(groups)
          .values({
            ...group,
            ownerId: firstAdmin.id,
            createdById: adminId,
          })
          .returning()
          .onConflictDoNothing();
        
        if (created) {
          groupCount++;
          console.log(`  ✅ Created: ${group.name} (${group.code})`);
        }
      }
      
      if (groupCount === 0) {
        console.log("  ⏭️  Groups already exist, skipping...");
      }
    }
    
    console.log("\n✅ Teams & Groups seed completed!");
    console.log("\n📊 Summary:");
    console.log(`  Teams created: ${teamCount}`);
    console.log(`  Groups created: ${groupCount}`);
    
    if (groupCount > 0) {
      console.log("\n💡 Next steps:");
      console.log("  1. Assign users to roles");
      console.log("  2. Add members to teams and groups via UI");
    }
    
  } catch (error) {
    console.error("❌ Error seeding teams and groups:", error);
    throw error;
  }
}

/**
 * EXAMPLE GROUPS DATA
 * To be created via API with actual user IDs
 */
export const EXAMPLE_GROUPS = SEED_GROUPS;
