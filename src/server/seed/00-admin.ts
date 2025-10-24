/**
 * ADMIN USER SEED
 * Create initial super admin user
 * This must run FIRST before any other seeds
 */

import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  console.log("\n👤 SEEDING: Admin User...");

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "123456";

  // Check if admin already exists
  const existingAdmin = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, adminEmail),
  });

  if (existingAdmin) {
    console.log("  ⏭️  Admin user already exists");
    return { adminId: existingAdmin.id };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const [admin] = await db.insert(user).values({
    name: "Super Admin",
    email: adminEmail,
    emailVerified: new Date(),
    password: hashedPassword,
    status: "active",
    employeeNumber: "ADMIN-001",
    phoneNumber: "+90 555 000 0000",
    hireDate: new Date(),
  }).returning();

  if (!admin) {
    throw new Error("Failed to create admin user");
  }

  console.log(`  ✅ Admin user created: ${admin.email}`);
  console.log(`  🔑 Password: ${adminPassword}`);

  return { adminId: admin.id };
}
