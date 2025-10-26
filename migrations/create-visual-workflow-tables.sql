-- Create enums for visual workflow
CREATE TYPE workflow_status AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE workflow_module AS ENUM ('DOF', 'ACTION', 'FINDING', 'AUDIT');

-- Create VisualWorkflow table
CREATE TABLE "VisualWorkflow" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "module" workflow_module NOT NULL,
  "status" workflow_status NOT NULL DEFAULT 'DRAFT',
  "nodes" JSONB NOT NULL,
  "edges" JSONB NOT NULL,
  "version" VARCHAR(50) NOT NULL DEFAULT '1.0',
  "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP WITH TIME ZONE,
  "publishedById" UUID REFERENCES "User"("id") ON DELETE SET NULL
);

-- Create VisualWorkflowVersion table for version history
CREATE TABLE "VisualWorkflowVersion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflowId" UUID NOT NULL REFERENCES "VisualWorkflow"("id") ON DELETE CASCADE,
  "version" VARCHAR(50) NOT NULL,
  "changeNotes" TEXT,
  "nodes" JSONB NOT NULL,
  "edges" JSONB NOT NULL,
  "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX "idx_visual_workflow_status" ON "VisualWorkflow"("status");
CREATE INDEX "idx_visual_workflow_module" ON "VisualWorkflow"("module");
CREATE INDEX "idx_visual_workflow_created_by" ON "VisualWorkflow"("createdById");
CREATE INDEX "idx_visual_workflow_version_workflow_id" ON "VisualWorkflowVersion"("workflowId");

-- Add comments
COMMENT ON TABLE "VisualWorkflow" IS 'Visual workflow definitions created in workflow designer';
COMMENT ON TABLE "VisualWorkflowVersion" IS 'Version history for visual workflows';
COMMENT ON COLUMN "VisualWorkflow"."nodes" IS 'React Flow nodes in JSON format';
COMMENT ON COLUMN "VisualWorkflow"."edges" IS 'React Flow edges in JSON format';
