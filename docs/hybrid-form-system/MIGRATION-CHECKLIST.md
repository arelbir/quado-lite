# ✅ HYBRID FORM SYSTEM - MIGRATION CHECKLIST

**Date:** 2025-01-26  
**Status:** Ready for Production  
**Approach:** Zero-downtime deployment

---

## **📋 PRE-DEPLOYMENT CHECKLIST:**

### **1. Code Review:**
- [x] All components implemented
- [x] Server actions complete
- [x] Build successful (pnpm run build)
- [x] No TypeScript errors
- [x] Icons imported correctly
- [x] Type guards added where needed

### **2. Database:**
- [ ] Database backup created
- [ ] Migration script ready
- [ ] Indexes defined in schema
- [ ] Foreign keys correct

### **3. Environment:**
- [ ] Environment variables checked
- [ ] Database connection working
- [ ] Admin user exists

---

## **🚀 DEPLOYMENT STEPS:**

### **Step 1: Commit & Push Code**

```powershell
# Already committed
git status

# If changes exist:
git add .
git commit -m "feat: hybrid form system complete"
git push
```

✅ **Already Done:** Code committed and pushed!

---

### **Step 2: Database Migration**

```powershell
# Generate migration (if not done)
pnpm drizzle-kit generate

# Push to database
pnpm drizzle-kit push

# Or run specific migration
pnpm drizzle-kit migrate
```

**Expected Tables:**
- ✅ `CustomFieldDefinition`
- ✅ `CustomFieldValue`

**Expected Indexes:**
- ✅ `idx_custom_field_definition_entity`
- ✅ `idx_custom_field_value_entity`
- ✅ `idx_custom_field_definition_status`

---

### **Step 3: Verify Database**

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'Custom%';

-- Should return:
-- CustomFieldDefinition
-- CustomFieldValue

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('CustomFieldDefinition', 'CustomFieldValue');

-- Verify schema
\d "CustomFieldDefinition"
\d "CustomFieldValue"
```

---

### **Step 4: Create Admin Menu Item**

Menu item should already exist for:
- Path: `/admin/custom-fields`
- Access: Admin only

**Verify in database:**
```sql
SELECT * FROM "Menu" WHERE path LIKE '%custom-fields%';
```

If missing, add via menu management or insert:
```sql
INSERT INTO "Menu" (name, path, icon, parentId, "order", isActive)
VALUES ('Custom Fields', '/admin/custom-fields', 'Settings', NULL, 100, true);
```

---

### **Step 5: Test Admin UI**

**Manual Testing:**

1. **Login as Admin**
   - Navigate to `/admin/custom-fields/AUDIT`

2. **Create Field:**
   - Click "Add Field"
   - Field Key: `testField`
   - Field Type: `text`
   - Label: `Test Field`
   - Required: `true`
   - Save
   - ✅ Should appear in list

3. **Edit Field:**
   - Click edit icon
   - Change label
   - Save
   - ✅ Should update

4. **Reorder Fields:**
   - Drag and drop (if implemented)
   - Or use order field
   - ✅ Order should persist

5. **Delete/Archive Field:**
   - Click delete
   - ✅ Should archive (not delete)

---

### **Step 6: Test Form Integration**

**Test Audit Form:**

1. Navigate to `/denetim/audits/new`
2. ✅ Core fields visible (title, description, date)
3. ✅ Custom Fields section visible
4. ✅ Test field from Step 5 appears
5. Fill all fields
6. Submit
7. ✅ Should save successfully

**Test Audit Detail:**

1. Navigate to audit detail page
2. Go to Details tab
3. ✅ Custom Fields section visible
4. ✅ Values displayed correctly

**Test Finding Form:**

1. Create a finding
2. ✅ Custom fields work (if defined)

**Test Action Form:**

1. Create an action
2. ✅ Custom fields work (if defined)

---

### **Step 7: Test Workflow Integration**

**Create workflow condition:**

```javascript
// In workflow designer (if available)
// Decision node condition:
customFields.testField === 'specific-value'
```

**Or test via code:**
```typescript
// In audit workflow
const metadata = await buildAuditMetadata(audit);
console.log('Custom Fields:', metadata.customFields);
// Should include testField value
```

---

### **Step 8: Performance Check**

**Check Load Time:**

```typescript
// Add to page temporarily
const start = performance.now();
const fields = await getCustomFieldDefinitions('AUDIT');
const duration = performance.now() - start;
console.log('Load time:', duration, 'ms');
// Should be < 100ms
```

**Check Query:**
```sql
EXPLAIN ANALYZE
SELECT * FROM "CustomFieldDefinition"
WHERE "entityType" = 'AUDIT'
AND status = 'ACTIVE'
ORDER BY "order" ASC;
-- Should use index
```

---

### **Step 9: Monitor Logs**

**Watch for errors:**

```powershell
# In dev mode
pnpm dev

# Watch console for:
# - [CustomFields] messages
# - Any errors related to custom fields
```

**Check server logs:**
- No 500 errors
- No database errors
- No validation errors

---

### **Step 10: User Documentation**

Create user guide:

```markdown
# How to Use Custom Fields

## For Admins:

1. Navigate to Admin > Custom Fields
2. Select entity type (Audit, Finding, Action, DOF)
3. Click "Add Field"
4. Fill in field details:
   - Field Key: Unique identifier (no spaces)
   - Field Type: text, number, select, etc.
   - Label: Display name
   - Required: Yes/No
5. Save
6. Custom field will appear in forms automatically!

## For Users:

Custom fields appear in forms automatically.
Fill them in when creating/editing entities.
Required fields must be filled.

## Field Types:

- **Text:** Short text input
- **Textarea:** Long text input
- **Number:** Numeric input with min/max
- **Select:** Dropdown selection
- **Checkbox:** Yes/No toggle
- **Date:** Date picker
- **Email:** Email validation
- **URL:** URL validation
- **Phone:** Phone number
```

---

## **✅ POST-DEPLOYMENT VERIFICATION:**

### **Day 1:**

- [ ] All forms loading correctly
- [ ] No errors in console
- [ ] No errors in server logs
- [ ] Performance acceptable (<200ms)
- [ ] Users can create/edit entities
- [ ] Custom fields save correctly
- [ ] Custom fields display correctly

### **Week 1:**

- [ ] Monitor usage metrics
- [ ] Check for any errors
- [ ] Gather user feedback
- [ ] Identify optimization needs

**Usage Query:**
```sql
SELECT 
  entity_type,
  COUNT(DISTINCT entity_id) as entities_with_custom_fields,
  COUNT(*) as total_custom_values
FROM "CustomFieldValue"
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY entity_type;
```

---

## **🆘 ROLLBACK PLAN:**

### **If Critical Issues:**

**1. Disable Custom Fields Temporarily:**
```sql
UPDATE "CustomFieldDefinition" 
SET status = 'ARCHIVED' 
WHERE status = 'ACTIVE';
```

**2. Revert Code:**
```powershell
git revert HEAD
git push
```

**3. Database Rollback (Last Resort):**
```sql
-- Only if absolutely necessary
DROP TABLE IF EXISTS "CustomFieldValue" CASCADE;
DROP TABLE IF EXISTS "CustomFieldDefinition" CASCADE;
```

---

## **📊 SUCCESS METRICS:**

### **Technical:**
- ✅ Page load time < 200ms
- ✅ Zero errors in first week
- ✅ Build size increase < 50KB
- ✅ Database queries optimized

### **User:**
- ✅ Custom fields being used
- ✅ Positive user feedback
- ✅ No confusion/support requests
- ✅ Forms still easy to use

---

## **🎯 CURRENT STATUS:**

**Implementation:**
- ✅ Database Schema (100%)
- ✅ Server Actions (100%)
- ✅ React Components (100%)
- ✅ Admin UI (100%)
- ✅ Form Integration (100%)
- ✅ Workflow Integration (100%)

**Deployment:**
- ✅ Code committed and pushed
- ✅ Build successful
- [ ] Database migration applied
- [ ] Production testing
- [ ] User documentation published

---

**Next Step:** Apply database migration with `pnpm drizzle-kit push` 🚀
