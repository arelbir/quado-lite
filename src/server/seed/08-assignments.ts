/**
 * MANAGER & LEADER ASSIGNMENTS
 * Assign managers to branches, departments, and leaders to teams
 * 
 * MUST RUN AFTER:
 * - Organization
 * - Users
 * - Teams
 * 
 * This seed assigns real users as:
 * - Branch managers
 * - Department managers
 * - Team leaders
 */

import { db } from "@/drizzle/db";
import { branches, departments, teams } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function seedAssignments(adminId?: string) {
  console.log("\n👔 SEEDING: Manager & Leader Assignments...");
  
  try {
    // Get all users (sorted by role/position level)
    const users = await db.query.user.findMany({
      with: {
        position: true,
        department: true,
      },
      orderBy: (users, { asc }) => [asc(users.createdAt)],
    });

    if (users.length < 10) {
      console.log("  ⚠️  Not enough users for assignments, skipping");
      return;
    }

    // Filter managers (high-level positions)
    const managers = users.filter(u => 
      u.position?.level && parseInt(u.position.level) >= 7
    );

    if (managers.length < 5) {
      console.log("  ⚠️  Not enough managers found, using first users");
    }

    // Use managers or fallback to first users
    const availableManagers = managers.length >= 5 ? managers : users.slice(0, 15);

    let assignmentCount = 0;

    // ============================================
    // 1. BRANCH MANAGERS
    // ============================================
    console.log("\n  🏢 Assigning branch managers...");
    
    const branchList = await db.query.branches.findMany({
      where: isNull(branches.managerId),
    });

    for (let i = 0; i < branchList.length && i < availableManagers.length; i++) {
      const branch = branchList[i];
      const manager = availableManagers[i];

      await db.update(branches)
        .set({ 
          managerId: manager!.id,
          updatedAt: new Date(),
        })
        .where(eq(branches.id, branch!.id));

      console.log(`     ✅ ${branch!.name} → ${manager!.name}`);
      assignmentCount++;
    }

    // ============================================
    // 2. DEPARTMENT MANAGERS
    // ============================================
    console.log("\n  🏛️  Assigning department managers...");
    
    const deptList = await db.query.departments.findMany({
      where: isNull(departments.managerId),
    });

    for (let i = 0; i < deptList.length && i < availableManagers.length; i++) {
      const dept = deptList[i];
      const manager = availableManagers[i % availableManagers.length]; // Rotate if not enough

      await db.update(departments)
        .set({ 
          managerId: manager!.id,
          updatedAt: new Date(),
        })
        .where(eq(departments.id, dept!.id));

      console.log(`     ✅ ${dept!.name} → ${manager!.name}`);
      assignmentCount++;
    }

    // ============================================
    // 3. TEAM LEADERS
    // ============================================
    console.log("\n  👥 Assigning team leaders...");
    
    const teamList = await db.query.teams.findMany({
      where: isNull(teams.leaderId),
    });

    // For teams, use a mix of managers and senior staff
    const teamLeaders = users.filter(u => 
      u.position?.level && parseInt(u.position.level) >= 5
    ).slice(0, 20);

    for (let i = 0; i < teamList.length && i < teamLeaders.length; i++) {
      const team = teamList[i];
      const leader = teamLeaders[i % teamLeaders.length];

      await db.update(teams)
        .set({ 
          leaderId: leader!.id,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, team!.id));

      console.log(`     ✅ ${team!.name} → ${leader!.name}`);
      assignmentCount++;
    }

    console.log("\n✅ Assignments completed!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total assignments: ${assignmentCount}`);
    console.log(`   Branch managers: ${Math.min(branchList.length, availableManagers.length)}`);
    console.log(`   Department managers: ${Math.min(deptList.length, availableManagers.length)}`);
    console.log(`   Team leaders: ${Math.min(teamList.length, teamLeaders.length)}`);

  } catch (error) {
    console.error("❌ Error assigning managers:", error);
    throw error;
  }
}
