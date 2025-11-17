/**
 * ADMIN USER SEED
 * Create initial super admin user
 * This must run FIRST before any other seeds
 */

import { db } from "@/core/database/client";
import { user, roles, userRoles } from "@/core/database/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

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
  console.log(`  ⏭️  SUPER_ADMIN role will be assigned after role seed`);

  return { adminId: admin.id };
}

/**
 * Assign SUPER_ADMIN role to admin user
 * This should be called AFTER role system seed
 */
export async function assignAdminRole(adminId: string) {
  console.log("\n🔑 ASSIGNING: Admin Role...");

  try {
    // Get SUPER_ADMIN role
    const superAdminRole = await db.query.roles.findFirst({
      where: eq(roles.code, 'SUPER_ADMIN'),
    });

    if (!superAdminRole) {
      console.log("  ⚠️  SUPER_ADMIN role not found. Run role seed first!");
      return;
    }

    // Check if already assigned
    const existing = await db.query.userRoles.findFirst({
      where: (ur, { and, eq }) => and(
        eq(ur.userId, adminId),
        eq(ur.roleId, superAdminRole.id)
      ),
    });

    if (existing) {
      console.log("  ⏭️  Admin already has SUPER_ADMIN role");
      return;
    }

    // Assign SUPER_ADMIN role to admin
    await db.insert(userRoles).values({
      userId: adminId,
      roleId: superAdminRole.id,
      contextType: 'Global',
      isActive: true,
      assignedBy: adminId,
    });

    console.log("  ✅ SUPER_ADMIN role assigned to admin");
  } catch (error) {
    console.error("  ❌ Failed to assign admin role:", error);
  }
}
