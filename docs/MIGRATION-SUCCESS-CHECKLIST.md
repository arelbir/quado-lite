# MIGRATION SUCCESS CHECKLIST

**Date:** 2025-01-25  
**Migration:** User Organization Foreign Keys  
**Status:** ⏳ **VERIFICATION NEEDED**

---

## ✅ VERIFICATION STEPS

### **Step 1: Check Foreign Keys Exist**

Run this query in your database:

```sql
SELECT 
    tc.constraint_name AS "Constraint Name",
    tc.table_name AS "Table",
    kcu.column_name AS "Column",
    ccu.table_name AS "References Table",
    ccu.column_name AS "References Column",
    rc.update_rule AS "On Update",
    rc.delete_rule AS "On Delete"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'User'
    AND tc.constraint_name IN (
        'User_companyId_fkey',
        'User_branchId_fkey',
        'User_departmentId_fkey',
        'User_positionId_fkey'
    )
ORDER BY tc.constraint_name;
```

**Expected Result:**
```
Constraint Name          | Table | Column       | References Table | References Column | On Update | On Delete
-------------------------|-------|--------------|------------------|-------------------|-----------|----------
User_branchId_fkey       | User  | branchId     | Branch          | id                | CASCADE   | SET NULL
User_companyId_fkey      | User  | companyId    | Company         | id                | CASCADE   | SET NULL
User_departmentId_fkey   | User  | departmentId | Department      | id                | CASCADE   | SET NULL
User_positionId_fkey     | User  | positionId   | Position        | id                | CASCADE   | SET NULL
```

✅ **Pass Criteria:** Should see exactly 4 rows

---

### **Step 2: Test Data Integrity**

#### **A. Try to Insert Invalid Reference (Should Fail):**

```sql
-- This should FAIL with foreign key violation
INSERT INTO "User" (id, name, email, password, "departmentId")
VALUES (
    gen_random_uuid(),
    'Test User',
    'test@example.com',
    'password123',
    '00000000-0000-0000-0000-000000000000' -- Non-existent department
);
```

**Expected:** Error message like:
```
ERROR: insert or update on table "User" violates foreign key constraint "User_departmentId_fkey"
DETAIL: Key (departmentId)=(00000000-0000-0000-0000-000000000000) is not present in table "Department".
```

✅ **Pass Criteria:** Should get foreign key violation error

#### **B. Insert Valid Reference (Should Succeed):**

```sql
-- Get a valid department ID first
SELECT id, name FROM "Department" LIMIT 1;

-- Then insert with valid reference (use actual ID from above)
INSERT INTO "User" (id, name, email, password, "departmentId")
VALUES (
    gen_random_uuid(),
    'Test User Valid',
    'testvalid@example.com',
    'password123',
    'PASTE_VALID_DEPARTMENT_ID_HERE'
);

-- Clean up test user
DELETE FROM "User" WHERE email IN ('testvalid@example.com', 'test@example.com');
```

✅ **Pass Criteria:** Insert should succeed with valid department ID

---

### **Step 3: Test CASCADE Behavior**

#### **A. Test ON DELETE SET NULL:**

```sql
-- Create test data
INSERT INTO "Department" (id, name, code, "isActive")
VALUES ('test-dept-id-123', 'Test Department', 'TEST', true);

INSERT INTO "User" (id, name, email, password, "departmentId")
VALUES (
    'test-user-id-123',
    'Test User',
    'test-cascade@example.com',
    'password123',
    'test-dept-id-123'
);

-- Verify user has department
SELECT id, name, "departmentId" FROM "User" WHERE id = 'test-user-id-123';
-- Should show: test-dept-id-123

-- Delete department
DELETE FROM "Department" WHERE id = 'test-dept-id-123';

-- Check user's departmentId (should be NULL now)
SELECT id, name, "departmentId" FROM "User" WHERE id = 'test-user-id-123';
-- Should show: NULL

-- Clean up
DELETE FROM "User" WHERE id = 'test-user-id-123';
```

✅ **Pass Criteria:** User's departmentId should become NULL after department deletion

---

### **Step 4: Test Application Integration**

#### **A. Test User Edit Dialog:**

1. Navigate to: `http://localhost:3000/admin/users`
2. Click "Edit" on any user
3. Try selecting different departments/positions
4. Save changes
5. Verify changes persisted

✅ **Pass Criteria:** Can select and save department/position without errors

#### **B. Test User Table Display:**

1. Check Users table displays departments/positions
2. Try filtering by department (if available)
3. Verify no console errors

✅ **Pass Criteria:** No errors, data displays correctly

---

### **Step 5: Check for Orphaned Records**

```sql
-- Check if any orphaned records exist (should be 0 after FK creation)

SELECT 'Orphaned companyId' as issue, COUNT(*) as count
FROM "User" 
WHERE "companyId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Company" WHERE id = "User"."companyId")
UNION ALL
SELECT 'Orphaned branchId', COUNT(*)
FROM "User" 
WHERE "branchId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Branch" WHERE id = "User"."branchId")
UNION ALL
SELECT 'Orphaned departmentId', COUNT(*)
FROM "User" 
WHERE "departmentId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Department" WHERE id = "User"."departmentId")
UNION ALL
SELECT 'Orphaned positionId', COUNT(*)
FROM "User" 
WHERE "positionId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Position" WHERE id = "User"."positionId");
```

✅ **Pass Criteria:** All counts should be 0

---

## 📊 VERIFICATION CHECKLIST

- [ ] Step 1: Foreign keys exist (4 rows) ✅
- [ ] Step 2A: Invalid reference rejected ✅
- [ ] Step 2B: Valid reference accepted ✅
- [ ] Step 3: ON DELETE SET NULL works ✅
- [ ] Step 4A: User edit dialog works ✅
- [ ] Step 4B: User table displays correctly ✅
- [ ] Step 5: No orphaned records (0 count) ✅

---

## 🎉 SUCCESS CRITERIA

**Migration is successful if:**
- ✅ All 4 foreign keys created
- ✅ Invalid references are rejected
- ✅ Valid references work
- ✅ Cascade behavior works (SET NULL on delete)
- ✅ Application still functions normally
- ✅ No orphaned records exist

---

## ⚠️ TROUBLESHOOTING

### **Issue: Foreign keys not created**

**Symptoms:**
- Verification query returns 0 rows

**Solution:**
```sql
-- Check if error occurred during migration
-- Re-run migration SQL
```

### **Issue: Application errors**

**Symptoms:**
- User edit fails
- "Cannot read property" errors

**Solution:**
- Check browser console
- Verify schema is in sync with code
- Restart Next.js dev server

### **Issue: Orphaned records found**

**Symptoms:**
- Step 5 shows count > 0

**Solution:**
```sql
-- Set orphaned references to NULL
UPDATE "User" SET "companyId" = NULL 
WHERE "companyId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Company" WHERE id = "User"."companyId");
-- Repeat for other fields
```

---

## 🎯 NEXT STEPS AFTER VERIFICATION

### **Immediate:**
1. ✅ Document migration success
2. ✅ Commit changes to git
3. ✅ Update team documentation

### **Optional Enhancements:**
1. Add Company & Branch to user dialog
2. Add employee number field
3. Create detailed user profile page
4. Add manager selection

### **Git Commit Message:**
```
feat(database): add foreign key constraints to User table

- Added 4 foreign keys for organization fields
- User.companyId → Company.id
- User.branchId → Branch.id  
- User.departmentId → Department.id
- User.positionId → Position.id
- Migration: 0005_worthless_nekra.sql
- ON DELETE SET NULL behavior
- ON UPDATE CASCADE behavior

Resolves data integrity issues with orphaned references
```

---

## 📚 DOCUMENTATION

- Migration File: `src/drizzle/migrations/0005_worthless_nekra.sql`
- Analysis Report: `docs/USER-MANAGEMENT-SCHEMA-ANALYSIS.md`
- Drizzle Guide: `docs/DRIZZLE-MIGRATION-GUIDE.md`
- This Checklist: `docs/MIGRATION-SUCCESS-CHECKLIST.md`
- Verification Query: `verify-foreign-keys.sql`

---

**Status:** ⏳ **Awaiting Verification**  
**Action:** Run verification steps above  
**Expected Time:** 5-10 minutes
