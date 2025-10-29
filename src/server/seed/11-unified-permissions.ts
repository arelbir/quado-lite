/**
 * UNIFIED PERMISSIONS SEED
 * Populate Permissions table with granular permissions
 * 
 * This seed creates the foundation for the unified permission system
 * that integrates with roles, menus, and workflow
 * 
 * Created: 2025-01-29
 * Phase: Unified Permission System
 */

import { db } from "@/drizzle/db";
import { permissions, rolePermissions, roles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function seedUnifiedPermissions() {
  console.log("\n🔐 SEEDING: Unified Permissions...");

  try {
    // Get roles
    const allRoles = await db.query.roles.findMany();
    const superAdmin = allRoles.find((r) => r.code === "SUPER_ADMIN");
    const qualityManager = allRoles.find((r) => r.code === "QUALITY_MANAGER");
    const processOwner = allRoles.find((r) => r.code === "PROCESS_OWNER");
    const auditor = allRoles.find((r) => r.code === "AUDITOR");
    const actionOwner = allRoles.find((r) => r.code === "ACTION_OWNER");

    if (!superAdmin) {
      console.log("  ⚠️  SUPER_ADMIN role not found!");
      return;
    }

    // Define permissions with constraints
    const permissionDefinitions = [
      // ================== AUDIT PERMISSIONS ==================
      {
        name: "Create Audit",
        code: "audit.create",
        resource: "audit",
        action: "create",
        category: "Audit Management",
        description: "Create new audits",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { department: "own" }, // Only in own department
        },
      },
      {
        name: "View Audit",
        code: "audit.read",
        resource: "audit",
        action: "read",
        category: "Audit Management",
        description: "View audit details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Audit",
        code: "audit.update",
        resource: "audit",
        action: "update",
        category: "Audit Management",
        description: "Update audit information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { owner: "self" }, // Only own audits
        },
      },
      {
        name: "Delete Audit",
        code: "audit.delete",
        resource: "audit",
        action: "delete",
        category: "Audit Management",
        description: "Delete audits",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: { status: ["Draft"] }, // Only drafts
        },
      },
      {
        name: "Complete Audit",
        code: "audit.complete",
        resource: "audit",
        action: "complete",
        category: "Audit Management",
        description: "Mark audit as complete",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: { assigned: "self" }, // Only assigned audits
        },
      },

      // ================== FINDING PERMISSIONS ==================
      {
        name: "Create Finding",
        code: "finding.create",
        resource: "finding",
        action: "create",
        category: "Finding Management",
        description: "Create findings during audit",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "View Finding",
        code: "finding.read",
        resource: "finding",
        action: "read",
        category: "Finding Management",
        description: "View finding details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Finding",
        code: "finding.update",
        resource: "finding",
        action: "update",
        category: "Finding Management",
        description: "Update finding information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { assigned: "self" }, // Only assigned findings
        },
      },
      {
        name: "Delete Finding",
        code: "finding.delete",
        resource: "finding",
        action: "delete",
        category: "Finding Management",
        description: "Delete findings",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: { status: ["Draft", "Open"] },
        },
      },
      {
        name: "Submit Finding for Closure",
        code: "finding.submit",
        resource: "finding",
        action: "submit",
        category: "Finding Management",
        description: "Submit finding for closure approval",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { assigned: "self" },
        },
      },
      {
        name: "Approve Finding Closure",
        code: "finding.approve",
        resource: "finding",
        action: "approve",
        category: "Finding Management",
        description: "Approve finding closure",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: { owner: "self" }, // Auditor who created the finding
        },
      },
      {
        name: "Reject Finding Closure",
        code: "finding.reject",
        resource: "finding",
        action: "reject",
        category: "Finding Management",
        description: "Reject finding closure",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: { owner: "self" },
        },
      },

      // ================== ACTION PERMISSIONS ==================
      {
        name: "Create Action",
        code: "action.create",
        resource: "action",
        action: "create",
        category: "Action Management",
        description: "Create corrective/preventive actions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "View Action",
        code: "action.read",
        resource: "action",
        action: "read",
        category: "Action Management",
        description: "View action details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: null,
          ACTION_OWNER: { assigned: "self" }, // Only assigned actions
        },
      },
      {
        name: "Update Action",
        code: "action.update",
        resource: "action",
        action: "update",
        category: "Action Management",
        description: "Update action information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          ACTION_OWNER: { assigned: "self" },
        },
      },
      {
        name: "Delete Action",
        code: "action.delete",
        resource: "action",
        action: "delete",
        category: "Action Management",
        description: "Delete actions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: { status: ["Assigned"] }, // Only before approval
        },
      },
      {
        name: "Complete Action",
        code: "action.complete",
        resource: "action",
        action: "complete",
        category: "Action Management",
        description: "Mark action as complete",
        roles: {
          SUPER_ADMIN: null,
          ACTION_OWNER: { assigned: "self" },
        },
      },
      {
        name: "Approve Action",
        code: "action.approve",
        resource: "action",
        action: "approve",
        category: "Action Management",
        description: "Approve completed action",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          // Manager approval handled by workflow
        },
      },
      {
        name: "Reject Action",
        code: "action.reject",
        resource: "action",
        action: "reject",
        category: "Action Management",
        description: "Reject completed action",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Cancel Action",
        code: "action.cancel",
        resource: "action",
        action: "cancel",
        category: "Action Management",
        description: "Cancel action (exit strategy)",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },

      // ================== DOF PERMISSIONS ==================
      {
        name: "Create DOF",
        code: "dof.create",
        resource: "dof",
        action: "create",
        category: "DOF Management",
        description: "Create DOF (CAPA)",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "View DOF",
        code: "dof.read",
        resource: "dof",
        action: "read",
        category: "DOF Management",
        description: "View DOF details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "Update DOF",
        code: "dof.update",
        resource: "dof",
        action: "update",
        category: "DOF Management",
        description: "Update DOF information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { assigned: "self" },
        },
      },
      {
        name: "Delete DOF",
        code: "dof.delete",
        resource: "dof",
        action: "delete",
        category: "DOF Management",
        description: "Delete DOF",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: { status: ["Step1"] }, // Only at first step
        },
      },
      {
        name: "Submit DOF for Approval",
        code: "dof.submit",
        resource: "dof",
        action: "submit",
        category: "DOF Management",
        description: "Submit DOF for manager approval",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { assigned: "self" },
        },
      },
      {
        name: "Approve DOF",
        code: "dof.approve",
        resource: "dof",
        action: "approve",
        category: "DOF Management",
        description: "Approve DOF completion",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Reject DOF",
        code: "dof.reject",
        resource: "dof",
        action: "reject",
        category: "DOF Management",
        description: "Reject DOF and send back for rework",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },

      // ================== USER PERMISSIONS ==================
      {
        name: "Create User",
        code: "user.create",
        resource: "user",
        action: "create",
        category: "User Management",
        description: "Create new users",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "View User",
        code: "user.read",
        resource: "user",
        action: "read",
        category: "User Management",
        description: "View user details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          PROCESS_OWNER: { department: "own" },
        },
      },
      {
        name: "Update User",
        code: "user.update",
        resource: "user",
        action: "update",
        category: "User Management",
        description: "Update user information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete User",
        code: "user.delete",
        resource: "user",
        action: "delete",
        category: "User Management",
        description: "Delete users",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== DEPARTMENT PERMISSIONS ==================
      {
        name: "Create Department",
        code: "department.create",
        resource: "department",
        action: "create",
        category: "Organization Management",
        description: "Create new departments",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "View Department",
        code: "department.read",
        resource: "department",
        action: "read",
        category: "Organization Management",
        description: "View department details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "Update Department",
        code: "department.update",
        resource: "department",
        action: "update",
        category: "Organization Management",
        description: "Update department information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Department",
        code: "department.delete",
        resource: "department",
        action: "delete",
        category: "Organization Management",
        description: "Delete departments",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== ROLE PERMISSIONS ==================
      {
        name: "Create Role",
        code: "role.create",
        resource: "role",
        action: "create",
        category: "Access Control",
        description: "Create new roles",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "View Role",
        code: "role.read",
        resource: "role",
        action: "read",
        category: "Access Control",
        description: "View role details and permissions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Update Role",
        code: "role.update",
        resource: "role",
        action: "update",
        category: "Access Control",
        description: "Update role information and permissions",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "Delete Role",
        code: "role.delete",
        resource: "role",
        action: "delete",
        category: "Access Control",
        description: "Delete roles",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== COMPANY PERMISSIONS ==================
      {
        name: "Create Company",
        code: "company.create",
        resource: "company",
        action: "create",
        category: "Organization Management",
        description: "Create new companies",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "View Company",
        code: "company.read",
        resource: "company",
        action: "read",
        category: "Organization Management",
        description: "View company details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Update Company",
        code: "company.update",
        resource: "company",
        action: "update",
        category: "Organization Management",
        description: "Update company information",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "Delete Company",
        code: "company.delete",
        resource: "company",
        action: "delete",
        category: "Organization Management",
        description: "Delete companies",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== BRANCH PERMISSIONS ==================
      {
        name: "Create Branch",
        code: "branch.create",
        resource: "branch",
        action: "create",
        category: "Organization Management",
        description: "Create new branches",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "View Branch",
        code: "branch.read",
        resource: "branch",
        action: "read",
        category: "Organization Management",
        description: "View branch details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Branch",
        code: "branch.update",
        resource: "branch",
        action: "update",
        category: "Organization Management",
        description: "Update branch information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Branch",
        code: "branch.delete",
        resource: "branch",
        action: "delete",
        category: "Organization Management",
        description: "Delete branches",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== POSITION PERMISSIONS ==================
      {
        name: "Create Position",
        code: "position.create",
        resource: "position",
        action: "create",
        category: "Organization Management",
        description: "Create new positions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "View Position",
        code: "position.read",
        resource: "position",
        action: "read",
        category: "Organization Management",
        description: "View position details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Position",
        code: "position.update",
        resource: "position",
        action: "update",
        category: "Organization Management",
        description: "Update position information",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Position",
        code: "position.delete",
        resource: "position",
        action: "delete",
        category: "Organization Management",
        description: "Delete positions",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== AUDIT PLAN PERMISSIONS ==================
      {
        name: "Create Audit Plan",
        code: "plan.create",
        resource: "plan",
        action: "create",
        category: "Audit Planning",
        description: "Create scheduled or adhoc audit plans",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Update Audit Plan",
        code: "plan.update",
        resource: "plan",
        action: "update",
        category: "Audit Planning",
        description: "Update, cancel, or start audit plans",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: { createdBy: "self" },
        },
      },
      {
        name: "Delete Audit Plan",
        code: "plan.delete",
        resource: "plan",
        action: "delete",
        category: "Audit Planning",
        description: "Delete audit plans (soft delete)",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: { createdBy: "self" },
        },
      },

      // ================== WORKFLOW PERMISSIONS ==================
      {
        name: "Start Workflow",
        code: "workflow.start",
        resource: "workflow",
        action: "start",
        category: "Workflow Management",
        description: "Start workflow instances",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Transition Workflow",
        code: "workflow.transition",
        resource: "workflow",
        action: "transition",
        category: "Workflow Management",
        description: "Submit, approve, reject or complete workflow steps",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "Veto Workflow",
        code: "workflow.veto",
        resource: "workflow",
        action: "veto",
        category: "Workflow Management",
        description: "Veto and immediately complete workflows",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Cancel Workflow",
        code: "workflow.cancel",
        resource: "workflow",
        action: "cancel",
        category: "Workflow Management",
        description: "Cancel active workflows",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Escalate Workflow",
        code: "workflow.escalate",
        resource: "workflow",
        action: "escalate",
        category: "Workflow Management",
        description: "Manually escalate workflow assignments",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delegate Workflow",
        code: "workflow.delegate",
        resource: "workflow",
        action: "delegate",
        category: "Workflow Management",
        description: "Create, update, and deactivate workflow delegations",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "Read Workflow",
        code: "workflow.read",
        resource: "workflow",
        action: "read",
        category: "Workflow Management",
        description: "View workflow tasks and delegations",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
          PROCESS_OWNER: null,
        },
      },

      // ================== TEMPLATE PERMISSIONS ==================
      {
        name: "Create Template",
        code: "template.create",
        resource: "template",
        action: "create",
        category: "Audit Templates",
        description: "Create audit templates",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Read Template",
        code: "template.read",
        resource: "template",
        action: "read",
        category: "Audit Templates",
        description: "View audit templates",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Template",
        code: "template.update",
        resource: "template",
        action: "update",
        category: "Audit Templates",
        description: "Update audit templates",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Template",
        code: "template.delete",
        resource: "template",
        action: "delete",
        category: "Audit Templates",
        description: "Delete audit templates (soft delete)",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== QUESTION BANK PERMISSIONS ==================
      {
        name: "Create Question Bank",
        code: "question-bank.create",
        resource: "question-bank",
        action: "create",
        category: "Question Banks",
        description: "Create question banks",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Read Question Bank",
        code: "question-bank.read",
        resource: "question-bank",
        action: "read",
        category: "Question Banks",
        description: "View question banks",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Question Bank",
        code: "question-bank.update",
        resource: "question-bank",
        action: "update",
        category: "Question Banks",
        description: "Update question banks",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Question Bank",
        code: "question-bank.delete",
        resource: "question-bank",
        action: "delete",
        category: "Question Banks",
        description: "Delete question banks (soft delete)",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== QUESTION PERMISSIONS ==================
      {
        name: "Create Question",
        code: "question.create",
        resource: "question",
        action: "create",
        category: "Questions",
        description: "Create and copy questions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Read Question",
        code: "question.read",
        resource: "question",
        action: "read",
        category: "Questions",
        description: "View question details",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Question",
        code: "question.update",
        resource: "question",
        action: "update",
        category: "Questions",
        description: "Update questions and reorder",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Question",
        code: "question.delete",
        resource: "question",
        action: "delete",
        category: "Questions",
        description: "Delete questions (soft delete)",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== AUDIT QUESTION PERMISSIONS ==================
      {
        name: "Read Audit Question",
        code: "audit-question.read",
        resource: "audit-question",
        action: "read",
        category: "Audit Execution",
        description: "View audit questions and completion status",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Answer Audit Question",
        code: "audit-question.answer",
        resource: "audit-question",
        action: "answer",
        category: "Audit Execution",
        description: "Answer audit questions and update answers",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },

      // ================== NOTIFICATION PERMISSIONS ==================
      {
        name: "Read Notification",
        code: "notification.read",
        resource: "notification",
        action: "read",
        category: "Notifications",
        description: "View notifications and preferences",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
          PROCESS_OWNER: null,
        },
      },
      {
        name: "Update Notification",
        code: "notification.update",
        resource: "notification",
        action: "update",
        category: "Notifications",
        description: "Mark notifications as read and update preferences",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
          PROCESS_OWNER: null,
        },
      },

      // ================== CUSTOM FIELD PERMISSIONS ==================
      {
        name: "Create Custom Field",
        code: "custom-field.create",
        resource: "custom-field",
        action: "create",
        category: "Custom Fields",
        description: "Create custom field definitions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Read Custom Field",
        code: "custom-field.read",
        resource: "custom-field",
        action: "read",
        category: "Custom Fields",
        description: "View custom field definitions",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
      {
        name: "Update Custom Field",
        code: "custom-field.update",
        resource: "custom-field",
        action: "update",
        category: "Custom Fields",
        description: "Update and reorder custom fields",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
        },
      },
      {
        name: "Delete Custom Field",
        code: "custom-field.delete",
        resource: "custom-field",
        action: "delete",
        category: "Custom Fields",
        description: "Archive custom field definitions",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== HR SYNC PERMISSIONS ==================
      {
        name: "Create HR Sync Config",
        code: "hr-sync.create",
        resource: "hr-sync",
        action: "create",
        category: "HR Integration",
        description: "Create HR sync configurations",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "Update HR Sync Config",
        code: "hr-sync.update",
        resource: "hr-sync",
        action: "update",
        category: "HR Integration",
        description: "Update HR sync configurations and toggle status",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "Delete HR Sync Config",
        code: "hr-sync.delete",
        resource: "hr-sync",
        action: "delete",
        category: "HR Integration",
        description: "Delete HR sync configurations",
        roles: {
          SUPER_ADMIN: null,
        },
      },
      {
        name: "Trigger HR Sync",
        code: "hr-sync.sync",
        resource: "hr-sync",
        action: "sync",
        category: "HR Integration",
        description: "Manually trigger HR synchronization",
        roles: {
          SUPER_ADMIN: null,
        },
      },

      // ================== REPORT PERMISSIONS ==================
      {
        name: "Export Reports",
        code: "report.export",
        resource: "report",
        action: "export",
        category: "Reports",
        description: "Export audit, action, DOF, and findings reports",
        roles: {
          SUPER_ADMIN: null,
          QUALITY_MANAGER: null,
          AUDITOR: null,
        },
      },
    ];

    // Insert permissions
    console.log("  📋 Creating permissions...");
    let createdCount = 0;

    for (const permDef of permissionDefinitions) {
      // Check if permission already exists
      const existing = await db.query.permissions.findFirst({
        where: eq(permissions.code, permDef.code),
      });

      if (existing) {
        console.log(`  ⚠️  ${permDef.name} already exists, skipping...`);
        continue;
      }

      // Create permission
      const result = await db
        .insert(permissions)
        .values({
          name: permDef.name,
          code: permDef.code,
          resource: permDef.resource,
          action: permDef.action,
          category: permDef.category,
          description: permDef.description,
          isSystem: true,
        })
        .returning();

      if (!result || result.length === 0) {
        console.log(`  ⚠️  Failed to create ${permDef.name}`);
        continue;
      }

      const perm = result[0];
      if (!perm) {
        console.log(`  ⚠️  Permission object is undefined for ${permDef.name}`);
        continue;
      }

      createdCount++;

      // Assign to roles with constraints
      for (const [roleCode, constraints] of Object.entries(permDef.roles)) {
        const role = allRoles.find((r) => r.code === roleCode);
        if (!role) continue;

        await db.insert(rolePermissions).values({
          roleId: role.id,
          permissionId: perm.id,
          constraints: constraints,
        });
      }

      console.log(`  ✅ ${permDef.name} (${permDef.code})`);
    }

    console.log(`\n  📊 UNIFIED PERMISSIONS SUMMARY:`);
    console.log(`    Created: ${createdCount} permissions`);
    console.log(`    Resources: Audit, Finding, Action, DOF, User`);
    console.log(`    Actions: Create, Read, Update, Delete, Submit, Approve, Reject, Complete`);
    console.log(`    Constraints: Department (own), Status, Owner (self), Assigned (self)`);

    console.log("\n✅ Unified permissions seed completed!");
  } catch (error) {
    console.error("  ❌ Unified permissions seed failed:", error);
    throw error;
  }
}
