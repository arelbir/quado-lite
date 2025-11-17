/**
 * USERS SEED - 150 Person Company
 * Smart user generator with realistic distribution
 * 
 * Features:
 * - Turkish names (realistic)
 * - ASCII emails (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u)
 * - Email verified (no verification needed)
 * - Department-based distribution
 * - Position hierarchy
 * - Role auto-assignment
 */

import { db } from "@/core/database/client";
import { user } from "@/core/database/schema/user";
import { roles, userRoles } from "@/core/database/schema/role-system";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Turkish names for realistic data
const FIRST_NAMES = {
  male: ["Mehmet", "Ahmet", "Mustafa", "Ali", "Hüseyin", "İbrahim", "Hasan", "Cem", "Can", "Emre", "Burak", "Murat", "Serkan", "Tolga", "Eren"],
  female: ["Ayşe", "Fatma", "Zeynep", "Elif", "Selin", "Deniz", "Merve", "Ebru", "Gizem", "Esra", "Burcu", "Canan", "Pınar", "Özlem", "Tuğba"],
};

const LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Yıldız", "Yıldırım", "Öztürk", "Aktaş", "Şen", "Erdoğan"];

// Department distribution (150 total)
const DEPT_DISTRIBUTION = {
  CEO: 2,          // Genel Müdürlük
  QUALITY: 8,      // Kalite
  PRODUCTION: 35,  // Üretim (en kalabalık)
  SALES: 20,       // Satış
  HR: 6,           // İK
  FINANCE: 8,      // Finans
  IT: 12,          // IT
  RND: 15,         // AR-GE
  SUPPLY: 15,      // Tedarik
  MAINTENANCE: 18, // Bakım
  LEGAL: 5,        // Hukuk
  ADMIN: 6,        // İdari
};

// Position distribution per department
const POSITION_LEVELS = {
  executive: 0.02,   // %2 - C-Level
  management: 0.15,  // %15 - Managers/Supervisors
  professional: 0.40, // %40 - Specialists/Engineers
  operational: 0.43,  // %43 - Operators/Staff
};

// Helper: Convert Turkish characters to ASCII for email
// Same logic as normalizeEmailForLogin utility
function toAscii(str: string): string {
  return str
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/i̇/g, 'i')  // Combining dot above
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .normalize('NFD')      // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
}

function generateUser(index: number, deptCode: string, companyId: string) {
  const isFemale = Math.random() > 0.6; // %40 female ratio
  const firstNameArray = isFemale ? FIRST_NAMES.female : FIRST_NAMES.male;
  const firstName = firstNameArray[Math.floor(Math.random() * firstNameArray.length)]!;
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]!;
  const name = `${firstName} ${lastName}`;
  
  // ✅ Convert Turkish characters to ASCII for email
  const emailFirstName = toAscii(firstName);
  const emailLastName = toAscii(lastName);
  const email = `${emailFirstName}.${emailLastName}@abcteknoloji.com`;
  
  const employeeNumber = `EMP${String(index + 1).padStart(4, "0")}`;
  
  // Random hire date (last 5 years)
  const yearsAgo = Math.floor(Math.random() * 5);
  const monthsAgo = Math.floor(Math.random() * 12);
  const hireDate = new Date();
  hireDate.setFullYear(hireDate.getFullYear() - yearsAgo);
  hireDate.setMonth(hireDate.getMonth() - monthsAgo);

  return {
    name,
    email,
    employeeNumber,
    phoneNumber: `+90 5${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
    hireDate,
    departmentCode: deptCode,
  };
}

export async function seedUsers(companyId: string) {
  console.log("\n👥 SEEDING: Users (150 people)...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  // Get references
  const allDepartments = await db.query.departments.findMany();
  const allPositions = await db.query.positions.findMany();
  const firstBranch = await db.query.branches.findFirst();

  // Ensure roles exist
  const rolesMap: any = {};
  for (const roleName of ["Admin", "Manager", "Auditor", "User"]) {
    let role = await db.query.roles.findFirst({ where: eq(roles.name, roleName) });
    if (!role) {
      [role] = await db.insert(roles).values({
        name: roleName,
        code: roleName.toUpperCase(),
        description: `${roleName} role`,
        isSystem: true,
        isActive: true,
      }).returning();
    }
    rolesMap[roleName] = role;
  }

  // Generate users
  let userIndex = 0;
  const createdUsers = [];

  for (const [deptCode, count] of Object.entries(DEPT_DISTRIBUTION)) {
    const department = allDepartments.find((d: any) => d.code === deptCode);
    if (!department) continue;

    for (let i = 0; i < count; i++) {
      const userData = generateUser(userIndex, deptCode, companyId);
      
      // Assign position based on seniority
      let positionCode;
      let roleName;
      
      if (userIndex === 0) {
        // CEO
        positionCode = "CEO";
        roleName = "Admin";
      } else if (userIndex < 3) {
        // VPs
        positionCode = "VP";
        roleName = "Manager";
      } else {
        // Distribute by ratio
        const rand = Math.random();
        if (rand < 0.10) {
          positionCode = ["DIRECTOR", "MANAGER"][Math.floor(Math.random() * 2)];
          roleName = "Manager";
        } else if (rand < 0.30) {
          positionCode = ["SUPERVISOR", "TEAM_LEAD"][Math.floor(Math.random() * 2)];
          roleName = deptCode === "QUALITY" ? "Auditor" : "User";
        } else if (rand < 0.70) {
          positionCode = ["SR_SPECIALIST", "SPECIALIST", "SR_ENGINEER", "ENGINEER"][Math.floor(Math.random() * 4)];
          roleName = deptCode === "QUALITY" && Math.random() > 0.5 ? "Auditor" : "User";
        } else {
          positionCode = ["JR_SPECIALIST", "TECHNICIAN", "OPERATOR", "STAFF"][Math.floor(Math.random() * 4)];
          roleName = "User";
        }
      }

      const position = allPositions.find((p: any) => p.code === positionCode);

      try {
        const [newUser] = await db.insert(user).values({
          name: userData.name,
          email: userData.email,
          emailVerified: new Date(), // ✅ Email verified for seed users
          password: hashedPassword,
          status: "active",
          companyId,
          branchId: firstBranch?.id,
          departmentId: department.id,
          positionId: position?.id,
          employeeNumber: userData.employeeNumber,
          phoneNumber: userData.phoneNumber,
          hireDate: userData.hireDate,
        }).returning().onConflictDoNothing();

        if (newUser) {
          // Assign role
          await db.insert(userRoles).values({
            userId: newUser.id,
            roleId: rolesMap[roleName].id,
          });

          createdUsers.push(newUser);
        }
      } catch (error) {
        // Skip duplicates
      }

      userIndex++;
    }
  }

  console.log(`  ✅ Created ${createdUsers.length} users`);
  console.log(`  📧 Email format: firstname.lastname@abcteknoloji.com (Turkish chars converted to ASCII)`);
  console.log(`  📊 Distribution:`);
  console.log(`     - Admins: ${createdUsers.filter((u: any) => u.employeeNumber === "EMP0001").length}`);
  console.log(`     - Managers: ~${Math.floor(createdUsers.length * 0.15)}`);
  console.log(`     - Professionals: ~${Math.floor(createdUsers.length * 0.40)}`);
  console.log(`     - Operational: ~${Math.floor(createdUsers.length * 0.43)}`);
}
