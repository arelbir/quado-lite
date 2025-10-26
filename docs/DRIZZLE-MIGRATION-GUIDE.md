# DRIZZLE KIT MIGRATION - USER FOREIGN KEYS

**Date:** 2025-01-25  
**Migration:** `0005_worthless_nekra.sql`  
**Status:** ✅ **READY TO APPLY**

---

## 🎯 GENERATED MIGRATION

Drizzle Kit otomatik olarak aşağıdaki migration'ı oluşturdu:

**File:** `src/drizzle/migrations/0005_worthless_nekra.sql`

```sql
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" 
 FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") 
 ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" 
 FOREIGN KEY ("branchId") REFERENCES "public"."Branch"("id") 
 ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" 
 FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") 
 ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_positionId_fkey" 
 FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") 
 ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
```

---

## 🚀 HOW TO APPLY

### **Option 1: Using psql (Recommended)**

```bash
# PowerShell
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/dbname"
Get-Content "src/drizzle/migrations/0005_worthless_nekra.sql" | psql $env:DATABASE_URL
```

### **Option 2: Using Database Client**

1. Open your database client (pgAdmin, DBeaver, etc.)
2. Connect to your database
3. Copy and paste the SQL from migration file
4. Execute

### **Option 3: Using Drizzle Studio**

```bash
# Open Drizzle Studio
npx drizzle-kit studio

# Then run migrations from the UI
```

### **Option 4: Programmatically**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql);

await migrate(db, { migrationsFolder: './src/drizzle/migrations' });
await sql.end();
```

---

## ✅ VERIFICATION

After running the migration, verify the foreign keys were created:

```sql
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'User'
    AND tc.constraint_name IN (
        'User_companyId_fkey',
        'User_branchId_fkey',
        'User_departmentId_fkey',
        'User_positionId_fkey'
    );
```

**Expected Result:** 4 rows showing the new foreign keys

---

## 📊 WHAT THIS MIGRATION DOES

### **Adds 4 Foreign Key Constraints:**

1. **User.companyId → Company.id**
   - Ensures valid company references
   - ON DELETE SET NULL (user remains if company deleted)
   - ON UPDATE CASCADE (auto-update if ID changes)

2. **User.branchId → Branch.id**
   - Ensures valid branch references
   - ON DELETE SET NULL
   - ON UPDATE CASCADE

3. **User.departmentId → Department.id**
   - Ensures valid department references
   - ON DELETE SET NULL
   - ON UPDATE CASCADE

4. **User.positionId → Position.id**
   - Ensures valid position references
   - ON DELETE SET NULL
   - ON UPDATE CASCADE

### **Safety Features:**

- ✅ **Idempotent:** Can run multiple times (WHEN duplicate_object)
- ✅ **Non-destructive:** Only adds constraints, doesn't modify data
- ✅ **Safe delete:** Users aren't deleted when organization entities are removed

---

## ⚠️ POTENTIAL ISSUES

### **If Migration Fails:**

**Error:** "violates foreign key constraint"

**Cause:** Orphaned records exist (users referencing deleted companies/branches/etc.)

**Solution:** Clean orphaned records first:

```sql
-- Check for orphaned records
SELECT 
    COUNT(*) as count,
    'companyId' as field
FROM "User" 
WHERE "companyId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Company" WHERE id = "User"."companyId")
UNION ALL
SELECT 
    COUNT(*), 
    'branchId'
FROM "User" 
WHERE "branchId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Branch" WHERE id = "User"."branchId")
UNION ALL
SELECT 
    COUNT(*), 
    'departmentId'
FROM "User" 
WHERE "departmentId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Department" WHERE id = "User"."departmentId")
UNION ALL
SELECT 
    COUNT(*), 
    'positionId'
FROM "User" 
WHERE "positionId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Position" WHERE id = "User"."positionId");

-- If orphaned records exist, clean them:
UPDATE "User" SET "companyId" = NULL 
WHERE "companyId" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "Company" WHERE id = "User"."companyId");

-- Repeat for branchId, departmentId, positionId
```

---

## 🎉 BENEFITS

### **Data Integrity:**
- ✅ No more orphaned references
- ✅ Referential integrity enforced at DB level
- ✅ Cascade behavior defined

### **Developer Experience:**
- ✅ Auto-generated with Drizzle Kit
- ✅ Version controlled (in migrations folder)
- ✅ Idempotent and safe

### **Production Ready:**
- ✅ No data loss
- ✅ Rollback friendly
- ✅ Well documented

---

## 📝 DRIZZLE KIT COMMANDS USED

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Push changes directly to database (not used due to enum conflict)
npx drizzle-kit push

# View migrations in UI
npx drizzle-kit studio

# Check what will change
npx drizzle-kit check
```

---

## 🔄 SCHEMA CHANGES DETECTED

Drizzle Kit automatically detected these changes in `user.ts`:

```typescript
// Added foreign key definitions:
userCompanyIdFkey: foreignKey({
  columns: [table.companyId],
  foreignColumns: [companies.id],
  name: "User_companyId_fkey"
}).onUpdate("cascade").onDelete("set null"),

userBranchIdFkey: foreignKey({
  columns: [table.branchId],
  foreignColumns: [branches.id],
  name: "User_branchId_fkey"
}).onUpdate("cascade").onDelete("set null"),

userDepartmentIdFkey: foreignKey({
  columns: [table.departmentId],
  foreignColumns: [departments.id],
  name: "User_departmentId_fkey"
}).onUpdate("cascade").onDelete("set null"),

userPositionIdFkey: foreignKey({
  columns: [table.positionId],
  foreignColumns: [positions.id],
  name: "User_positionId_fkey"
}).onUpdate("cascade").onDelete("set null"),
```

---

## ✅ NEXT STEPS

1. **Review migration file:** `src/drizzle/migrations/0005_worthless_nekra.sql`
2. **Check for orphaned records** (see commands above)
3. **Apply migration** using one of the methods above
4. **Verify** foreign keys were created (see verification query)
5. **Test** user operations in the application

---

## 📚 RELATED DOCUMENTATION

- Previous Analysis: `docs/USER-MANAGEMENT-SCHEMA-ANALYSIS.md`
- Manual Migration: `migrations/add-user-organization-foreign-keys.sql`
- Drizzle Kit Docs: https://orm.drizzle.team/kit-docs/overview

---

**Status:** ✅ **Migration Generated & Ready**  
**Action Required:** Apply the migration to your database  
**Drizzle Kit Version:** v0.21.4  
**Drizzle ORM Version:** v0.30.10
