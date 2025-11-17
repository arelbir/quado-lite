/**
 * RE-SEED ROLE-MENUS ONLY
 * Clean and re-create role-menu mappings
 */

import { db } from "@/core/database/client";
import { roleMenus, user } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { seedRoleMenus } from "./10-role-menus";

async function reseedRoleMenus() {
  console.log("\n🔄 RE-SEEDING: Role-Menu Mappings...\n");

  try {
    // 1. Get admin user
    const admin = await db.query.user.findFirst({
      where: eq(user.email, "admin@example.com"),
    });

    if (!admin) {
      console.error("❌ Admin user not found!");
      process.exit(1);
    }

    // 2. Clear existing role-menu mappings
    console.log("🗑️  Clearing existing role-menu mappings...");
    await db.delete(roleMenus);
    console.log("  ✅ Cleared\n");

    // 3. Re-seed role-menus
    await seedRoleMenus(admin.id);

    console.log("\n✅ Role-Menu re-seed completed!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Re-seed failed:", error);
    process.exit(1);
  }
}

reseedRoleMenus();
