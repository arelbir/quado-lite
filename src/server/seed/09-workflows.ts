/**
 * WORKFLOW DEFINITIONS SEED
 * Seed workflow definitions with JSON-based steps and transitions
 * 
 * Usage: npx tsx src/server/seed/09-workflows.ts
 * Or run via 00-master.ts
 * 
 * Created: 2025-01-26
 */

import { db } from "@/drizzle/db";
import { workflowDefinitions } from "@/drizzle/schema";

/**
 * Seed Workflow Definitions
 */
export async function seedWorkflows(adminId: string) {
  console.log("\n🔄 SEEDING: Workflow Definitions...");

  try {
    // ============================================================
    // AUDIT WORKFLOWS
    // ============================================================

    // 1. Audit Normal Flow (Simple review)
    await db.insert(workflowDefinitions).values({
      name: "Audit Normal Flow",
      description: "Standard audit completion workflow with simple review",
      entityType: "Audit",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "draft",
          name: "Draft",
          type: "start",
          allowedRoles: ["Auditor", "Manager"],
        },
        {
          id: "auditor_review",
          name: "Auditor Review",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Auditor",
          deadline: "2d",
        },
        {
          id: "completed",
          name: "Completed",
          type: "end",
        },
      ],
      transitions: [
        { from: "draft", to: "auditor_review", action: "submit" },
        { from: "auditor_review", to: "completed", action: "approve" },
        { from: "auditor_review", to: "draft", action: "reject" },
      ],
    });
    console.log("  ✅ Audit Normal Flow");

    // 2. Audit Critical Flow (High risk with manager approval)
    await db.insert(workflowDefinitions).values({
      name: "Audit Critical Flow",
      description: "Critical audit workflow with manager approval (for high risk audits)",
      entityType: "Audit",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "draft",
          name: "Draft",
          type: "start",
          allowedRoles: ["Auditor", "Manager"],
        },
        {
          id: "auditor_review",
          name: "Auditor Review",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Auditor",
          deadline: "2d",
        },
        {
          id: "manager_approval",
          name: "Manager Approval",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "3d",
        },
        {
          id: "completed",
          name: "Completed",
          type: "end",
        },
      ],
      transitions: [
        { from: "draft", to: "auditor_review", action: "submit" },
        { from: "auditor_review", to: "manager_approval", action: "approve" },
        { from: "auditor_review", to: "draft", action: "reject" },
        { from: "manager_approval", to: "completed", action: "approve" },
        { from: "manager_approval", to: "auditor_review", action: "reject" },
      ],
    });
    console.log("  ✅ Audit Critical Flow");

    // 3. Audit Completion Flow (Generic)
    await db.insert(workflowDefinitions).values({
      name: "Audit Completion Flow",
      description: "Standard workflow for audit completion approval",
      entityType: "Audit",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "in_review",
          name: "In Review",
          type: "start",
          allowedRoles: ["Auditor"],
        },
        {
          id: "manager_review",
          name: "Manager Review",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "3d",
        },
        {
          id: "pending_closure",
          name: "Pending Closure",
          type: "end",
        },
      ],
      transitions: [
        { from: "in_review", to: "manager_review", action: "submit" },
        { from: "manager_review", to: "pending_closure", action: "approve" },
        { from: "manager_review", to: "in_review", action: "reject" },
      ],
    });
    console.log("  ✅ Audit Completion Flow");

    // ============================================================
    // FINDING WORKFLOWS
    // ============================================================

    // 4. Finding Closure Flow
    await db.insert(workflowDefinitions).values({
      name: "Finding Closure Flow",
      description: "Auditor approval required before closing findings",
      entityType: "Finding",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "pending_closure",
          name: "Pending Closure",
          type: "start",
          allowedRoles: ["User", "Manager"],
        },
        {
          id: "auditor_approval",
          name: "Auditor Approval",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Auditor",
          deadline: "2d",
        },
        {
          id: "closed",
          name: "Closed",
          type: "end",
        },
      ],
      transitions: [
        { from: "pending_closure", to: "auditor_approval", action: "submit" },
        { from: "auditor_approval", to: "closed", action: "approve" },
        { from: "auditor_approval", to: "pending_closure", action: "reject" },
      ],
    });
    console.log("  ✅ Finding Closure Flow");

    // 5. Finding Critical Closure Flow
    await db.insert(workflowDefinitions).values({
      name: "Finding Critical Closure Flow",
      description: "Multi-level approval for high-risk finding closure",
      entityType: "Finding",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "pending_closure",
          name: "Pending Closure",
          type: "start",
          allowedRoles: ["User", "Manager"],
        },
        {
          id: "auditor_review",
          name: "Auditor Review",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Auditor",
          deadline: "2d",
        },
        {
          id: "manager_approval",
          name: "Manager Approval",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "3d",
        },
        {
          id: "closed",
          name: "Closed",
          type: "end",
        },
      ],
      transitions: [
        { from: "pending_closure", to: "auditor_review", action: "submit" },
        { from: "auditor_review", to: "manager_approval", action: "approve" },
        { from: "auditor_review", to: "pending_closure", action: "reject" },
        { from: "manager_approval", to: "closed", action: "approve" },
        { from: "manager_approval", to: "auditor_review", action: "reject" },
      ],
    });
    console.log("  ✅ Finding Critical Closure Flow");

    // ============================================================
    // ACTION WORKFLOWS
    // ============================================================

    // 6. Action Approval Flow
    await db.insert(workflowDefinitions).values({
      name: "Action Approval Flow",
      description: "Manager approval required for action completion",
      entityType: "Action",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "assigned",
          name: "Assigned",
          type: "start",
          allowedRoles: ["User"],
        },
        {
          id: "manager_review",
          name: "Manager Review",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "3d",
        },
        {
          id: "completed",
          name: "Completed",
          type: "end",
        },
      ],
      transitions: [
        { from: "assigned", to: "manager_review", action: "submit" },
        { from: "manager_review", to: "completed", action: "approve" },
        { from: "manager_review", to: "assigned", action: "reject" },
      ],
    });
    console.log("  ✅ Action Approval Flow");

    // 7. Action Critical Flow
    await db.insert(workflowDefinitions).values({
      name: "Action Critical Flow",
      description: "Multi-level approval for critical actions",
      entityType: "Action",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "assigned",
          name: "Assigned",
          type: "start",
          allowedRoles: ["User"],
        },
        {
          id: "manager_review",
          name: "Manager Review",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "2d",
        },
        {
          id: "director_approval",
          name: "Director Approval",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Admin",
          deadline: "3d",
        },
        {
          id: "completed",
          name: "Completed",
          type: "end",
        },
      ],
      transitions: [
        { from: "assigned", to: "manager_review", action: "submit" },
        { from: "manager_review", to: "director_approval", action: "approve" },
        { from: "manager_review", to: "assigned", action: "reject" },
        { from: "director_approval", to: "completed", action: "approve" },
        { from: "director_approval", to: "manager_review", action: "reject" },
      ],
    });
    console.log("  ✅ Action Critical Flow");

    // ============================================================
    // DOF WORKFLOWS
    // ============================================================

    // 8. DOF CAPA Flow (8-step process)
    await db.insert(workflowDefinitions).values({
      name: "DOF CAPA Flow",
      description: "8-step CAPA workflow for Deviation, Observation, Failure management",
      entityType: "DOF",
      isActive: true,
      createdById: adminId,
      steps: [
        {
          id: "problem_definition",
          name: "Problem Definition",
          type: "start",
          allowedRoles: ["User", "Manager"],
        },
        {
          id: "temporary_measures",
          name: "Temporary Measures",
          type: "task",
          assignmentType: "role",
          assignedRole: "User",
          deadline: "3d",
        },
        {
          id: "root_cause_analysis",
          name: "Root Cause Analysis",
          type: "task",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "5d",
        },
        {
          id: "corrective_action_plan",
          name: "Corrective Action Plan",
          type: "task",
          assignmentType: "role",
          assignedRole: "Manager",
          deadline: "3d",
        },
        {
          id: "implementation",
          name: "Implementation",
          type: "task",
          assignmentType: "role",
          assignedRole: "User",
          deadline: "14d",
        },
        {
          id: "verification",
          name: "Verification",
          type: "approval",
          assignmentType: "role",
          assignedRole: "Auditor",
          deadline: "5d",
        },
        {
          id: "effectiveness_check",
          name: "Effectiveness Check",
          type: "task",
          assignmentType: "role",
          assignedRole: "Auditor",
          deadline: "30d",
        },
        {
          id: "final_closure",
          name: "Final Closure",
          type: "end",
        },
      ],
      transitions: [
        { from: "problem_definition", to: "temporary_measures", action: "submit" },
        { from: "temporary_measures", to: "root_cause_analysis", action: "complete" },
        { from: "root_cause_analysis", to: "corrective_action_plan", action: "complete" },
        { from: "corrective_action_plan", to: "implementation", action: "complete" },
        { from: "implementation", to: "verification", action: "complete" },
        { from: "verification", to: "effectiveness_check", action: "approve" },
        { from: "verification", to: "corrective_action_plan", action: "reject" },
        { from: "effectiveness_check", to: "final_closure", action: "complete" },
      ],
      conditions: [
        {
          stepId: "verification",
          field: "riskLevel",
          operator: "=",
          value: "critical",
          nextStep: "manager_approval",
        },
      ],
    });
    console.log("  ✅ DOF CAPA Flow (8 steps)");

    // ============================================================
    // SUMMARY
    // ============================================================

    console.log("\n  📊 WORKFLOW SUMMARY:");
    console.log("    ✅ 8 Workflow Definitions");
    console.log("\n  📋 WORKFLOWS BY MODULE:");
    console.log("    🔍 Audits:   3 workflows (Normal, Critical, Completion)");
    console.log("    📌 Findings: 2 workflows (Normal, Critical)");
    console.log("    ⚡ Actions:  2 workflows (Normal, Critical)");
    console.log("    🔴 DOF:      1 workflow (8-step CAPA)");
    console.log("\n  🎯 FEATURES:");
    console.log("    ✅ JSON-based configuration");
    console.log("    ✅ Role-based assignments");
    console.log("    ✅ Deadline tracking");
    console.log("    ✅ Conditional transitions");
    console.log("    ✅ Multi-step approvals");

  } catch (error) {
    console.error("  ❌ Workflow seed failed:", error);
    throw error;
  }
}

// Allow direct execution (ES module syntax)
// Note: This is typically called from 00-master.ts, not standalone
