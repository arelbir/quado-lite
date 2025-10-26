DO $$ BEGIN
 CREATE TYPE "public"."ActionType" AS ENUM('submit', 'approve', 'reject', 'assign', 'reassign', 'escalate', 'veto', 'complete', 'cancel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."AssignmentType" AS ENUM('role', 'user', 'auto');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."EntityType" AS ENUM('Audit', 'Finding', 'Action', 'DOF');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."InstanceStatus" AS ENUM('active', 'completed', 'cancelled', 'on_hold');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."StepStatus" AS ENUM('pending', 'in_progress', 'completed', 'rejected', 'escalated', 'skipped');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."StepType" AS ENUM('start', 'approval', 'task', 'decision', 'end');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "action_status" ADD VALUE 'InProgress';--> statement-breakpoint
ALTER TYPE "dof_status" ADD VALUE 'Cancelled';--> statement-breakpoint
ALTER TYPE "notification_category" ADD VALUE 'workflow_assignment';--> statement-breakpoint
ALTER TYPE "notification_category" ADD VALUE 'workflow_deadline_approaching';--> statement-breakpoint
ALTER TYPE "notification_category" ADD VALUE 'workflow_escalated';--> statement-breakpoint
ALTER TYPE "notification_category" ADD VALUE 'workflow_approved';--> statement-breakpoint
ALTER TYPE "notification_category" ADD VALUE 'workflow_rejected';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "StepAssignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflowInstanceId" uuid NOT NULL,
	"stepId" varchar(100) NOT NULL,
	"assignmentType" "AssignmentType" NOT NULL,
	"assignedRole" varchar(100),
	"assignedUserId" uuid,
	"status" "StepStatus" DEFAULT 'pending' NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"deadline" timestamp,
	"completedBy" uuid,
	"action" "ActionType",
	"comment" text,
	"escalatedAt" timestamp,
	"escalatedTo" uuid,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WorkflowDefinition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"entityType" "EntityType" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"steps" json NOT NULL,
	"transitions" json NOT NULL,
	"conditions" json,
	"vetoRoles" json,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"createdById" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WorkflowDelegation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromUserId" uuid NOT NULL,
	"toUserId" uuid NOT NULL,
	"role" varchar(100) NOT NULL,
	"entityType" "EntityType",
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"createdById" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WorkflowInstance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflowDefinitionId" uuid NOT NULL,
	"entityType" "EntityType" NOT NULL,
	"entityId" uuid NOT NULL,
	"currentStepId" varchar(100) NOT NULL,
	"status" "InstanceStatus" DEFAULT 'active' NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"entityMetadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "WorkflowTimeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflowInstanceId" uuid NOT NULL,
	"stepId" varchar(100) NOT NULL,
	"action" "ActionType" NOT NULL,
	"performedBy" uuid,
	"performedAt" timestamp DEFAULT now() NOT NULL,
	"comment" text,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StepAssignment" ADD CONSTRAINT "StepAssignment_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "public"."WorkflowInstance"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StepAssignment" ADD CONSTRAINT "StepAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StepAssignment" ADD CONSTRAINT "StepAssignment_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StepAssignment" ADD CONSTRAINT "StepAssignment_escalatedTo_fkey" FOREIGN KEY ("escalatedTo") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowDelegation" ADD CONSTRAINT "WorkflowDelegation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowDelegation" ADD CONSTRAINT "WorkflowDelegation_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowDelegation" ADD CONSTRAINT "WorkflowDelegation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "public"."WorkflowDefinition"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowTimeline" ADD CONSTRAINT "WorkflowTimeline_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "public"."WorkflowInstance"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "WorkflowTimeline" ADD CONSTRAINT "WorkflowTimeline_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_assignment_instance_step_idx" ON "StepAssignment" ("workflowInstanceId","stepId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_assignment_assigned_user_idx" ON "StepAssignment" ("assignedUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_assignment_status_idx" ON "StepAssignment" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "step_assignment_deadline_idx" ON "StepAssignment" ("deadline");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_definition_entity_type_idx" ON "WorkflowDefinition" ("entityType");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_definition_active_idx" ON "WorkflowDefinition" ("isActive");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_delegation_from_user_idx" ON "WorkflowDelegation" ("fromUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_delegation_to_user_idx" ON "WorkflowDelegation" ("toUserId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_delegation_active_idx" ON "WorkflowDelegation" ("isActive");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_delegation_date_idx" ON "WorkflowDelegation" ("startDate","endDate");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_instance_entity_idx" ON "WorkflowInstance" ("entityType","entityId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_instance_status_idx" ON "WorkflowInstance" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_instance_current_step_idx" ON "WorkflowInstance" ("currentStepId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_timeline_instance_idx" ON "WorkflowTimeline" ("workflowInstanceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_timeline_performed_at_idx" ON "WorkflowTimeline" ("performedAt");