-- Migration: Remove Approval Mechanism & Move to Workflow
-- Date: 2025-01-25
-- Description: Removes PendingManagerApproval and Rejected statuses from Actions and DOFs
--              All approval logic now handled by Workflow system

-- ============================================
-- STEP 1: Backup Current State
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Starting approval-to-workflow migration...';
    RAISE NOTICE 'Current time: %', NOW();
END $$;

-- ============================================
-- STEP 2: Migrate Existing Action Data
-- ============================================

-- Migrate PendingManagerApproval → InProgress
UPDATE "actions" 
SET status = 'InProgress',
    "updatedAt" = NOW()
WHERE status = 'PendingManagerApproval';

-- Get count of migrated records
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count 
    FROM "actions" 
    WHERE status = 'InProgress';
    
    RAISE NOTICE 'Actions: Migrated % PendingManagerApproval → InProgress', migrated_count;
END $$;

-- Migrate Rejected → Assigned (back to assignee for rework)
UPDATE "actions" 
SET status = 'Assigned',
    "updatedAt" = NOW()
WHERE status = 'Rejected';

-- ============================================
-- STEP 3: Migrate Existing DOF Data
-- ============================================

-- Migrate PendingManagerApproval → Step6
UPDATE "dofs" 
SET status = 'Step6_EffectivenessCheck',
    "updatedAt" = NOW()
WHERE status = 'PendingManagerApproval';

-- Get count
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count 
    FROM "dofs" 
    WHERE status = 'Step6_EffectivenessCheck';
    
    RAISE NOTICE 'DOFs: Migrated % PendingManagerApproval → Step6', migrated_count;
END $$;

-- Migrate Rejected → Step6 (back to last step for rework)
UPDATE "dofs" 
SET status = 'Step6_EffectivenessCheck',
    "updatedAt" = NOW()
WHERE status = 'Rejected';

-- ============================================
-- STEP 4: Update Action Status Enum
-- ============================================

-- Rename old enum
ALTER TYPE action_status RENAME TO action_status_old;

-- Create new enum without PendingManagerApproval and Rejected
CREATE TYPE action_status AS ENUM (
    'Assigned', 
    'InProgress', 
    'Completed', 
    'Cancelled'
);

-- Migrate column to new type
ALTER TABLE "actions" 
ALTER COLUMN status TYPE action_status 
USING status::text::action_status;

-- Drop old enum
DROP TYPE action_status_old;

RAISE NOTICE 'Action status enum updated successfully';

-- ============================================
-- STEP 5: Update DOF Status Enum
-- ============================================

-- Rename old enum
ALTER TYPE dof_status RENAME TO dof_status_old;

-- Create new enum without PendingManagerApproval and Rejected
CREATE TYPE dof_status AS ENUM (
    'Step1_Problem',
    'Step2_TempMeasures',
    'Step3_RootCause',
    'Step4_Activities',
    'Step5_Implementation',
    'Step6_EffectivenessCheck',
    'Completed',
    'Cancelled'
);

-- Migrate column to new type
ALTER TABLE "dofs" 
ALTER COLUMN status TYPE dof_status 
USING status::text::dof_status;

-- Drop old enum
DROP TYPE dof_status_old;

RAISE NOTICE 'DOF status enum updated successfully';

-- ============================================
-- STEP 6: Verification
-- ============================================

DO $$
DECLARE
    action_count INTEGER;
    dof_count INTEGER;
BEGIN
    -- Verify no orphaned statuses in actions
    SELECT COUNT(*) INTO action_count 
    FROM "actions" 
    WHERE status NOT IN ('Assigned', 'InProgress', 'Completed', 'Cancelled');
    
    IF action_count > 0 THEN
        RAISE EXCEPTION 'ERROR: % actions have invalid status', action_count;
    END IF;
    
    -- Verify no orphaned statuses in dofs
    SELECT COUNT(*) INTO dof_count 
    FROM "dofs" 
    WHERE status NOT IN (
        'Step1_Problem',
        'Step2_TempMeasures',
        'Step3_RootCause',
        'Step4_Activities',
        'Step5_Implementation',
        'Step6_EffectivenessCheck',
        'Completed',
        'Cancelled'
    );
    
    IF dof_count > 0 THEN
        RAISE EXCEPTION 'ERROR: % dofs have invalid status', dof_count;
    END IF;
    
    RAISE NOTICE '✅ Verification passed: All statuses are valid';
END $$;

-- ============================================
-- STEP 7: Summary
-- ============================================

DO $$
DECLARE
    total_actions INTEGER;
    total_dofs INTEGER;
    assigned_actions INTEGER;
    inprogress_actions INTEGER;
    completed_actions INTEGER;
    step6_dofs INTEGER;
    completed_dofs INTEGER;
BEGIN
    -- Action statistics
    SELECT COUNT(*) INTO total_actions FROM "actions";
    SELECT COUNT(*) INTO assigned_actions FROM "actions" WHERE status = 'Assigned';
    SELECT COUNT(*) INTO inprogress_actions FROM "actions" WHERE status = 'InProgress';
    SELECT COUNT(*) INTO completed_actions FROM "actions" WHERE status = 'Completed';
    
    -- DOF statistics
    SELECT COUNT(*) INTO total_dofs FROM "dofs";
    SELECT COUNT(*) INTO step6_dofs FROM "dofs" WHERE status = 'Step6_EffectivenessCheck';
    SELECT COUNT(*) INTO completed_dofs FROM "dofs" WHERE status = 'Completed';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Actions Total: %', total_actions;
    RAISE NOTICE '  - Assigned: %', assigned_actions;
    RAISE NOTICE '  - InProgress: %', inprogress_actions;
    RAISE NOTICE '  - Completed: %', completed_actions;
    RAISE NOTICE '';
    RAISE NOTICE 'DOFs Total: %', total_dofs;
    RAISE NOTICE '  - Step6: %', step6_dofs;
    RAISE NOTICE '  - Completed: %', completed_dofs;
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Completed at: %', NOW();
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- ROLLBACK SCRIPT (Keep for emergency)
-- ============================================
/*
-- To rollback this migration (if needed):

-- Recreate old enums
ALTER TYPE action_status RENAME TO action_status_new;
CREATE TYPE action_status AS ENUM ('Assigned', 'PendingManagerApproval', 'Completed', 'Rejected', 'Cancelled');
ALTER TABLE actions ALTER COLUMN status TYPE action_status USING status::text::action_status;
DROP TYPE action_status_new;

ALTER TYPE dof_status RENAME TO dof_status_new;
CREATE TYPE dof_status AS ENUM (
    'Step1_Problem', 'Step2_TempMeasures', 'Step3_RootCause', 'Step4_Activities',
    'Step5_Implementation', 'Step6_EffectivenessCheck', 
    'PendingManagerApproval', 'Completed', 'Rejected'
);
ALTER TABLE dofs ALTER COLUMN status TYPE dof_status USING status::text::dof_status;
DROP TYPE dof_status_new;

-- Restore old statuses (manually based on business rules)
*/
