/**
 * Master Seed Script
 * Tüm seed dosyalarını sırayla çalıştırır
 */

import { seedComprehensiveAuditData } from "./comprehensive-audit-seed";
import { seedQuestionBanks } from "./question-bank-seed";

async function runAllSeeds() {
  console.log("🌱 Starting comprehensive seed process...");
  console.log("===============================================");
  
  try {
    // 1. Question Banks & Templates (İlk önce bunlar)
    await seedQuestionBanks();
    
    // 2. Comprehensive Audit Data (IT + Üretim + Kalite + Çevre)
    await seedComprehensiveAuditData();
    
    console.log("===============================================");
    console.log("✅ All seeds completed successfully!");
    console.log("");
    console.log("📊 Summary:");
    console.log("   - 12 Turkish users");
    console.log("   - 3 question banks + 14 questions");
    console.log("   - 3 audit templates");
    console.log("   - 6 audits (ISO 9001, ISO 27001, KVKK, Software, ISO 14001, İSG)");
    console.log("   - 13 findings");
    console.log("   - 11+ actions with progress notes");
    console.log("   - 1 DOF with root cause analysis");
    console.log("");
    console.log("🔑 Login credentials:");
    console.log("   Admin: admin@example.com / admin1234");
    console.log("   Users: [name]@example.com / Password123!");
    console.log("");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    process.exit(1);
  }
}

runAllSeeds();
