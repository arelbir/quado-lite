-- ============================================
-- WORKFLOW SYSTEM MIGRATION
-- Generic workflow engine for approval processes
-- Date: 2025-01-25
-- ============================================

-- Create Enums
CREATE TYPE "EntityType" AS ENUM ('Audit', 'Finding', 'Action', 'DOF');
CREATE TYPE "StepType" AS ENUM ('start', 'approval', 'task', 'decision', 'end');
CREATE TYPE "AssignmentType" AS ENUM ('role', 'user', 'auto');
CREATE TYPE "StepStatus" AS ENUM ('pending', 'in_progress', 'completed', 'rejected', 'escalated', 'skipped');
CREATE TYPE "InstanceStatus" AS ENUM ('active', 'completed', 'cancelled', 'on_hold');
CREATE TYPE "ActionType" AS ENUM ('submit', 'approve', 'reject', 'assign', 'reassign', 'escalate', 'veto', 'complete', 'cancel');

-- ============================================
-- WorkflowDefinition Table
-- ============================================
CREATE TABLE "WorkflowDefinition" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "entityType" "EntityType" NOT NULL,
  "version" INTEGER DEFAULT 1 NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "steps" JSONB NOT NULL,
  "transitions" JSONB NOT NULL,
  "conditions" JSONB,
  "vetoRoles" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP,
  "createdById" UUID
);

-- Foreign Keys
ALTER TABLE "WorkflowDefinition"
  ADD CONSTRAINT "WorkflowDefinition_createdById_fkey" 
  FOREIGN KEY ("createdById") 
  REFERENCES "User"("id") 
  ON DELETE SET NULL;

-- Indexes
CREATE INDEX "workflow_definition_entity_type_idx" ON "WorkflowDefinition"("entityType");
CREATE INDEX "workflow_definition_active_idx" ON "WorkflowDefinition"("isActive");

-- ============================================
-- WorkflowInstance Table
-- ============================================
CREATE TABLE "WorkflowInstance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflowDefinitionId" UUID NOT NULL,
  "entityType" "EntityType" NOT NULL,
  "entityId" UUID NOT NULL,
  "currentStepId" VARCHAR(100) NOT NULL,
  "status" "InstanceStatus" DEFAULT 'active' NOT NULL,
  "startedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completedAt" TIMESTAMP,
  "entityMetadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP
);

-- Foreign Keys
ALTER TABLE "WorkflowInstance"
  ADD CONSTRAINT "WorkflowInstance_workflowDefinitionId_fkey" 
  FOREIGN KEY ("workflowDefinitionId") 
  REFERENCES "WorkflowDefinition"("id") 
  ON DELETE RESTRICT;

-- Indexes
CREATE INDEX "workflow_instance_entity_idx" ON "WorkflowInstance"("entityType", "entityId");
CREATE INDEX "workflow_instance_status_idx" ON "WorkflowInstance"("status");
CREATE INDEX "workflow_instance_current_step_idx" ON "WorkflowInstance"("currentStepId");

-- ============================================
-- StepAssignment Table
-- ============================================
CREATE TABLE "StepAssignment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflowInstanceId" UUID NOT NULL,
  "stepId" VARCHAR(100) NOT NULL,
  "assignmentType" "AssignmentType" NOT NULL,
  "assignedRole" VARCHAR(100),
  "assignedUserId" UUID,
  "status" "StepStatus" DEFAULT 'pending' NOT NULL,
  "assignedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "deadline" TIMESTAMP,
  "completedBy" UUID,
  "action" "ActionType",
  "comment" TEXT,
  "escalatedAt" TIMESTAMP,
  "escalatedTo" UUID,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP
);

-- Foreign Keys
ALTER TABLE "StepAssignment"
  ADD CONSTRAINT "StepAssignment_workflowInstanceId_fkey" 
  FOREIGN KEY ("workflowInstanceId") 
  REFERENCES "WorkflowInstance"("id") 
  ON DELETE CASCADE;

ALTER TABLE "StepAssignment"
  ADD CONSTRAINT "StepAssignment_assignedUserId_fkey" 
  FOREIGN KEY ("assignedUserId") 
  REFERENCES "User"("id") 
  ON DELETE SET NULL;

ALTER TABLE "StepAssignment"
  ADD CONSTRAINT "StepAssignment_completedBy_fkey" 
  FOREIGN KEY ("completedBy") 
  REFERENCES "User"("id") 
  ON DELETE SET NULL;

ALTER TABLE "StepAssignment"
  ADD CONSTRAINT "StepAssignment_escalatedTo_fkey" 
  FOREIGN KEY ("escalatedTo") 
  REFERENCES "User"("id") 
  ON DELETE SET NULL;

-- Indexes
CREATE INDEX "step_assignment_instance_step_idx" ON "StepAssignment"("workflowInstanceId", "stepId");
CREATE INDEX "step_assignment_assigned_user_idx" ON "StepAssignment"("assignedUserId");
CREATE INDEX "step_assignment_status_idx" ON "StepAssignment"("status");
CREATE INDEX "step_assignment_deadline_idx" ON "StepAssignment"("deadline");

-- ============================================
-- WorkflowDelegation Table
-- ============================================
CREATE TABLE "WorkflowDelegation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fromUserId" UUID NOT NULL,
  "toUserId" UUID NOT NULL,
  "role" VARCHAR(100) NOT NULL,
  "entityType" "EntityType",
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP,
  "createdById" UUID
);

-- Foreign Keys
ALTER TABLE "WorkflowDelegation"
  ADD CONSTRAINT "WorkflowDelegation_fromUserId_fkey" 
  FOREIGN KEY ("fromUserId") 
  REFERENCES "User"("id") 
  ON DELETE CASCADE;

ALTER TABLE "WorkflowDelegation"
  ADD CONSTRAINT "WorkflowDelegation_toUserId_fkey" 
  FOREIGN KEY ("toUserId") 
  REFERENCES "User"("id") 
  ON DELETE CASCADE;

ALTER TABLE "WorkflowDelegation"
  ADD CONSTRAINT "WorkflowDelegation_createdById_fkey" 
  FOREIGN KEY ("createdById") 
  REFERENCES "User"("id") 
  ON DELETE SET NULL;

-- Indexes
CREATE INDEX "workflow_delegation_from_user_idx" ON "WorkflowDelegation"("fromUserId");
CREATE INDEX "workflow_delegation_to_user_idx" ON "WorkflowDelegation"("toUserId");
CREATE INDEX "workflow_delegation_active_idx" ON "WorkflowDelegation"("isActive");
CREATE INDEX "workflow_delegation_date_idx" ON "WorkflowDelegation"("startDate", "endDate");

-- ============================================
-- WorkflowTimeline Table
-- ============================================
CREATE TABLE "WorkflowTimeline" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflowInstanceId" UUID NOT NULL,
  "stepId" VARCHAR(100) NOT NULL,
  "action" "ActionType" NOT NULL,
  "performedBy" UUID,
  "performedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "comment" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Foreign Keys
ALTER TABLE "WorkflowTimeline"
  ADD CONSTRAINT "WorkflowTimeline_workflowInstanceId_fkey" 
  FOREIGN KEY ("workflowInstanceId") 
  REFERENCES "WorkflowInstance"("id") 
  ON DELETE CASCADE;

ALTER TABLE "WorkflowTimeline"
  ADD CONSTRAINT "WorkflowTimeline_performedBy_fkey" 
  FOREIGN KEY ("performedBy") 
  REFERENCES "User"("id") 
  ON DELETE SET NULL;

-- Indexes
CREATE INDEX "workflow_timeline_instance_idx" ON "WorkflowTimeline"("workflowInstanceId");
CREATE INDEX "workflow_timeline_performed_at_idx" ON "WorkflowTimeline"("performedAt");

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE "WorkflowDefinition" IS 'Workflow templates (reusable definitions)';
COMMENT ON TABLE "WorkflowInstance" IS 'Active workflow instances (per entity)';
COMMENT ON TABLE "StepAssignment" IS 'Step assignments (who should work on this step)';
COMMENT ON TABLE "WorkflowDelegation" IS 'User delegation (yetki devri)';
COMMENT ON TABLE "WorkflowTimeline" IS 'Audit trail for workflow actions';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables created
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE tablename LIKE '%Workflow%' OR tablename LIKE '%StepAssignment%';

-- Verify foreign keys
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name LIKE '%Workflow%' OR tc.table_name = 'StepAssignment');

-- Verify indexes
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename LIKE '%Workflow%' OR tablename = 'StepAssignment'
ORDER BY tablename, indexname;
