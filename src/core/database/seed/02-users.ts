/**
 * USERS SEED - Small Team (10 Users)
 * Generic framework user generator
 * 
 * Features:
 * - Turkish names (realistic)
 * - ASCII emails (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u)
 * - Email verified (no verification needed)
 * - Simple structure for framework demo
 * - Mixed roles for testing
 */

import { db } from "@/core/database/client";
import { user } from "@/core/database/schema/user";
import { roles, userRoles } from "@/core/database/schema/role-system";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Predefined 10 users for framework demo
const DEMO_USERS = [
  { firstName: "Mehmet", lastName: "Yılmaz", role: "MANAGER", employeeNumber: "EMP0001" },
  { firstName: "Ayşe", lastName: "Demir", role: "MANAGER", employeeNumber: "EMP0002" },
  { firstName: "Ahmet", lastName: "Kaya", role: "USER", employeeNumber: "EMP0003" },
  { firstName: "Zeynep", lastName: "Çelik", role: "USER", employeeNumber: "EMP0004" },
  { firstName: "Can", lastName: "Arslan", role: "USER", employeeNumber: "EMP0005" },
  { firstName: "Selin", lastName: "Yıldırım", role: "USER", employeeNumber: "EMP0006" },
  { firstName: "Emre", lastName: "Özdemir", role: "USER", employeeNumber: "EMP0007" },
  { firstName: "Elif", lastName: "Şahin", role: "USER", employeeNumber: "EMP0008" },
  { firstName: "Burak", lastName: "Aydın", role: "USER", employeeNumber: "EMP0009" },
  { firstName: "Deniz", lastName: "Koç", role: "USER", employeeNumber: "EMP0010" },
];

// Helper: Convert Turkish characters to ASCII for email
function toAscii(str: string): string {
  return str
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function seedUsers(companyId: string) {
  console.log("\n👥 SEEDING: Users (10 demo users)...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  // Get references
  const firstDepartment = await db.query.departments.findFirst();
  const firstPosition = await db.query.positions.findFirst();
  const firstBranch = await db.query.branches.findFirst();

  // Get roles
  const managerRole = await db.query.roles.findFirst({ where: eq(roles.code, "MANAGER") });
  const userRole = await db.query.roles.findFirst({ where: eq(roles.code, "USER") });

  if (!managerRole || !userRole) {
    console.error("❌ Roles not found. Run role seed first.");
    return;
  }

  const createdUsers = [];

  for (const demoUser of DEMO_USERS) {
    const { firstName, lastName, role, employeeNumber } = demoUser;
    
    // Convert Turkish to ASCII for email
    const emailFirstName = toAscii(firstName);
    const emailLastName = toAscii(lastName);
    const email = `${emailFirstName}.${emailLastName}@abcteknoloji.com`;
    const name = `${firstName} ${lastName}`;

    try {
      const [newUser] = await db.insert(user).values({
        name,
        email,
        emailVerified: new Date(),
        password: hashedPassword,
        status: "active",
        companyId,
        branchId: firstBranch?.id,
        departmentId: firstDepartment?.id,
        positionId: firstPosition?.id,
        employeeNumber,
        phoneNumber: `+90 5${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        hireDate: new Date(),
      }).returning().onConflictDoNothing();

      if (newUser) {
        // Assign role
        const roleId = role === "MANAGER" ? managerRole.id : userRole.id;
        await db.insert(userRoles).values({
          userId: newUser.id,
          roleId,
        });

        createdUsers.push(newUser);
        console.log(`  ✅ Created: ${name} (${email})`);
      }
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`\n  📊 Total users created: ${createdUsers.length}`);
  console.log(`  📧 Email format: firstname.lastname@abcteknoloji.com`);
  console.log(`  🔑 Password: 123456 (all users)`);
}
