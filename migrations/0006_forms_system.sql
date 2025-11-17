-- Migration: Forms System
-- Date: 2025-11-18
-- Description: Add custom form builder tables

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Form status
CREATE TYPE form_status AS ENUM ('draft', 'published', 'archived');

-- Submission status
CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- ============================================================================
-- FORM DEFINITIONS TABLE
-- ============================================================================

CREATE TABLE "FormDefinition" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  
  -- JSON Schema
  "schema" JSONB NOT NULL,
  
  -- Version
  "version" INTEGER DEFAULT 1 NOT NULL,
  
  -- Status
  "status" form_status DEFAULT 'draft' NOT NULL,
  
  -- Categorization
  "tags" JSONB,
  "category" VARCHAR(100),
  
  -- Workflow integration
  "workflowId" UUID,
  "workflowNodeId" VARCHAR(255),
  
  -- Audit
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP,
  "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE SET NULL,
  "updatedById" UUID REFERENCES "User"("id") ON DELETE SET NULL
);

-- Indexes
CREATE INDEX "idx_form_definition_name" ON "FormDefinition"("name");
CREATE INDEX "idx_form_definition_status" ON "FormDefinition"("status");
CREATE INDEX "idx_form_definition_category" ON "FormDefinition"("category");
CREATE INDEX "idx_form_definition_workflow" ON "FormDefinition"("workflowId");
CREATE INDEX "idx_form_definition_created_by" ON "FormDefinition"("createdById");

-- Comments
COMMENT ON TABLE "FormDefinition" IS 'Form definitions with JSON Schema format';
COMMENT ON COLUMN "FormDefinition"."schema" IS 'JSON Schema 7 compliant form definition';

-- ============================================================================
-- FORM VERSIONS TABLE
-- ============================================================================

CREATE TABLE "FormVersion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "formId" UUID NOT NULL REFERENCES "FormDefinition"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "schema" JSONB NOT NULL,
  
  -- Changelog
  "changeDescription" TEXT,
  
  -- Audit
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "createdById" UUID NOT NULL REFERENCES "User"("id") ON DELETE SET NULL
);

-- Indexes
CREATE INDEX "idx_form_version_form_id" ON "FormVersion"("formId");
CREATE INDEX "idx_form_version_version" ON "FormVersion"("formId", "version");

-- Unique constraint
CREATE UNIQUE INDEX "idx_form_version_unique" ON "FormVersion"("formId", "version");

-- Comments
COMMENT ON TABLE "FormVersion" IS 'Historical versions of forms';

-- ============================================================================
-- FORM SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE "FormSubmission" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "formId" UUID NOT NULL REFERENCES "FormDefinition"("id") ON DELETE CASCADE,
  "formVersion" INTEGER NOT NULL,
  
  -- Data
  "data" JSONB NOT NULL,
  
  -- Status
  "status" submission_status DEFAULT 'draft' NOT NULL,
  
  -- User
  "submittedBy" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "submittedAt" TIMESTAMP,
  
  -- Workflow context
  "workflowInstanceId" UUID,
  "workflowStepId" VARCHAR(255),
  
  -- Attachments metadata
  "attachments" JSONB,
  
  -- Audit
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP
);

-- Indexes
CREATE INDEX "idx_form_submission_form_id" ON "FormSubmission"("formId");
CREATE INDEX "idx_form_submission_status" ON "FormSubmission"("status");
CREATE INDEX "idx_form_submission_submitted_by" ON "FormSubmission"("submittedBy");
CREATE INDEX "idx_form_submission_workflow" ON "FormSubmission"("workflowInstanceId");
CREATE INDEX "idx_form_submission_created_at" ON "FormSubmission"("createdAt");

-- Comments
COMMENT ON TABLE "FormSubmission" IS 'User form submissions and responses';
COMMENT ON COLUMN "FormSubmission"."data" IS 'Form data in key-value pairs';
COMMENT ON COLUMN "FormSubmission"."attachments" IS 'File attachment metadata';

-- ============================================================================
-- SUCCESS
-- ============================================================================

-- Form builder system ready!
