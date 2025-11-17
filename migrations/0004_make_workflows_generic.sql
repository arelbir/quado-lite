-- Migration: Make Workflows Generic & Remove Hardcoded Enums
-- Date: 2025-11-18
-- Description: Transform workflow system to be fully generic and extensible

-- Step 1: Add temporary column
ALTER TABLE "VisualWorkflow" ADD COLUMN "module_temp" VARCHAR(100);

-- Step 2: Migrate existing data
UPDATE "VisualWorkflow" SET "module_temp" = "module"::text;

-- Step 3: Drop old enum-based column
ALTER TABLE "VisualWorkflow" DROP COLUMN "module";

-- Step 4: Rename temp column
ALTER TABLE "VisualWorkflow" RENAME COLUMN "module_temp" TO "module";

-- Step 5: Add NOT NULL constraint with default
ALTER TABLE "VisualWorkflow" ALTER COLUMN "module" SET NOT NULL;
ALTER TABLE "VisualWorkflow" ALTER COLUMN "module" SET DEFAULT 'GENERIC';

-- Step 6: Drop old enum type (if no other tables use it)
-- DROP TYPE IF EXISTS "workflow_module";

-- Comments
COMMENT ON COLUMN "VisualWorkflow"."module" IS 'Generic entity type - no longer restricted to specific modules';
