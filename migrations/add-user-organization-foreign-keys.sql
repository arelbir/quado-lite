-- Add User Organization Foreign Keys
-- Adds missing foreign key constraints for organization fields in User table
-- Date: 2025-01-25
-- Priority: CRITICAL - Database Integrity

-- ========================================
-- VERIFICATION (Run first to check)
-- ========================================
-- Check if constraints already exist:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'User' AND constraint_type = 'FOREIGN KEY';

-- ========================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ========================================

-- Company Foreign Key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_companyId_fkey' 
        AND table_name = 'User'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_companyId_fkey" 
        FOREIGN KEY ("companyId") 
        REFERENCES "Company"("id") 
        ON UPDATE CASCADE 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added User_companyId_fkey';
    ELSE
        RAISE NOTICE 'User_companyId_fkey already exists';
    END IF;
END $$;

-- Branch Foreign Key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_branchId_fkey' 
        AND table_name = 'User'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_branchId_fkey" 
        FOREIGN KEY ("branchId") 
        REFERENCES "Branch"("id") 
        ON UPDATE CASCADE 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added User_branchId_fkey';
    ELSE
        RAISE NOTICE 'User_branchId_fkey already exists';
    END IF;
END $$;

-- Department Foreign Key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_departmentId_fkey' 
        AND table_name = 'User'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_departmentId_fkey" 
        FOREIGN KEY ("departmentId") 
        REFERENCES "Department"("id") 
        ON UPDATE CASCADE 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added User_departmentId_fkey';
    ELSE
        RAISE NOTICE 'User_departmentId_fkey already exists';
    END IF;
END $$;

-- Position Foreign Key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_positionId_fkey' 
        AND table_name = 'User'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_positionId_fkey" 
        FOREIGN KEY ("positionId") 
        REFERENCES "Position"("id") 
        ON UPDATE CASCADE 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added User_positionId_fkey';
    ELSE
        RAISE NOTICE 'User_positionId_fkey already exists';
    END IF;
END $$;

-- ========================================
-- VERIFICATION (Run after)
-- ========================================
-- Verify all constraints were added:
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'User'
    AND tc.constraint_name LIKE 'User_%Id_fkey'
ORDER BY tc.constraint_name;

-- ========================================
-- DATA INTEGRITY CHECK
-- ========================================
-- Check for orphaned records (should be 0):

-- Orphaned company references
SELECT COUNT(*) as orphaned_company_refs
FROM "User" u
WHERE u."companyId" IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM "Company" c WHERE c.id = u."companyId");

-- Orphaned branch references
SELECT COUNT(*) as orphaned_branch_refs
FROM "User" u
WHERE u."branchId" IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM "Branch" b WHERE b.id = u."branchId");

-- Orphaned department references
SELECT COUNT(*) as orphaned_department_refs
FROM "User" u
WHERE u."departmentId" IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM "Department" d WHERE d.id = u."departmentId");

-- Orphaned position references
SELECT COUNT(*) as orphaned_position_refs
FROM "User" u
WHERE u."positionId" IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM "Position" p WHERE p.id = u."positionId");

-- ========================================
-- ROLLBACK (if needed)
-- ========================================
-- If you need to remove the constraints:
/*
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_companyId_fkey";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_branchId_fkey";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_departmentId_fkey";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_positionId_fkey";
*/

-- ========================================
-- NOTES
-- ========================================
-- 1. ON DELETE SET NULL: When a company/branch/department/position is deleted,
--    user's reference is set to NULL (user remains, reference is cleared)
--
-- 2. ON UPDATE CASCADE: If organization ID changes (rare), 
--    user's reference is automatically updated
--
-- 3. These constraints ensure data integrity and prevent orphaned records
--
-- 4. Existing data is NOT affected unless it has orphaned references
--
-- 5. If orphaned records exist, clean them first:
--    UPDATE "User" SET "companyId" = NULL WHERE "companyId" NOT IN (SELECT id FROM "Company");
--    (repeat for branch, department, position)
