# 🚀 STEP 8: MIGRATION GUIDE

**Phase:** Deployment  
**Duration:** 1-2 days  
**Dependencies:** Testing (Step 7)

---

## **🎯 OBJECTIVES:**

- Migrate existing forms safely
- Zero downtime deployment
- Rollback plan
- Data integrity

---

## **1️⃣ PRE-MIGRATION CHECKLIST:**

```bash
# ✅ Database backup
pg_dump denetim_db > backup_before_custom_fields_$(date +%Y%m%d).sql

# ✅ All tests passing
pnpm test

# ✅ Code review complete
# ✅ Staging environment tested
# ✅ Performance benchmarks met
```

---

## **2️⃣ MIGRATION STEPS:**

### **Step 1: Database Migration**

```bash
# Run migration
pnpm drizzle-kit push

# Verify tables created
psql -d denetim_db -c "\dt Custom*"
# Should show:
# - CustomFieldDefinition
# - CustomFieldValue

# Verify indexes
psql -d denetim_db -c "\di idx_custom*"
```

### **Step 2: Deploy Server Actions**

```bash
# Deploy new server actions
git add src/server/actions/custom-field-*
git commit -m "feat: add custom field server actions"
git push

# Verify deployment
curl https://your-app.com/api/health
```

### **Step 3: Deploy Components**

```bash
# Deploy React components
git add src/components/forms/
git commit -m "feat: add hybrid form components"
git push
```

### **Step 4: Update Forms (One by One)**

```typescript
// ❌ Old Audit Form (Before)
export default function CreateAuditPage() {
  return (
    <form>
      <Input name="title" />
      <Select name="riskLevel" />
      {/* ... core fields ... */}
      <Button type="submit">Create</Button>
    </form>
  );
}

// ✅ New Audit Form (After)
export default function CreateAuditPage() {
  return (
    <HybridForm
      entityType="AUDIT"
      coreFields={
        <form>
          <Input name="title" />
          <Select name="riskLevel" />
          {/* ... core fields ... */}
        </form>
      }
      onSubmit={handleSubmit}
    >
      <Button type="submit">Create</Button>
    </HybridForm>
  );
}
```

### **Step 5: Update Detail Pages**

```typescript
// Add custom fields display
export default async function AuditDetailPage({ params }) {
  const audit = await getAuditById(params.id);
  const customFields = await getCustomFieldValuesWithDefinitions('AUDIT', params.id);

  return (
    <div>
      {/* Core fields */}
      <div>{audit.title}</div>
      
      {/* Custom fields */}
      {customFields.length > 0 && (
        <CustomFieldsDisplay fields={customFields} />
      )}
    </div>
  );
}
```

---

## **3️⃣ ROLLBACK PLAN:**

### **If Issues Occur:**

```sql
-- 1. Disable custom fields temporarily
UPDATE "CustomFieldDefinition" 
SET status = 'ARCHIVED' 
WHERE status = 'ACTIVE';

-- 2. If needed, drop tables (ONLY as last resort)
DROP TABLE IF EXISTS "CustomFieldValue" CASCADE;
DROP TABLE IF EXISTS "CustomFieldDefinition" CASCADE;

-- 3. Restore from backup
psql -d denetim_db < backup_before_custom_fields_YYYYMMDD.sql
```

### **Code Rollback:**

```bash
# Revert to previous version
git revert HEAD~3..HEAD
git push

# Or rollback deployment
vercel rollback  # If using Vercel
```

---

## **4️⃣ DATA MIGRATION:**

### **If You Have Existing Custom Data:**

```typescript
// migrate-existing-data.ts

async function migrateExistingCustomData() {
  // Example: Migrate old JSON fields to custom field system
  
  // 1. Create field definitions
  await createCustomFieldDefinition({
    entityType: 'AUDIT',
    fieldKey: 'certificationNumber',
    fieldType: 'text',
    label: 'Certification Number',
  });

  // 2. Migrate data
  const audits = await db.audit.findMany({
    where: {
      metadata: { not: null }, // Old JSON field
    },
  });

  for (const audit of audits) {
    const metadata = audit.metadata as any;
    
    if (metadata.certificationNumber) {
      await saveCustomFieldValues({
        entityType: 'AUDIT',
        entityId: audit.id,
        values: {
          certificationNumber: metadata.certificationNumber,
        },
      });
    }
  }

  console.log(`Migrated ${audits.length} audits`);
}

// Run migration
await migrateExistingCustomData();
```

---

## **5️⃣ GRADUAL ROLLOUT:**

### **Phase 1: Shadow Mode (Week 1)**
```typescript
// Enable custom fields but don't make visible
const ENABLE_CUSTOM_FIELDS = process.env.ENABLE_CUSTOM_FIELDS === 'true';

<HybridForm
  entityType="AUDIT"
  coreFields={<CoreFields />}
  onSubmit={async (data) => {
    await createAudit(data.core);
    
    // Save custom fields in shadow mode
    if (ENABLE_CUSTOM_FIELDS && data.custom) {
      await saveCustomFieldValues({
        entityType: 'AUDIT',
        entityId: audit.id,
        values: data.custom,
      });
    }
  }}
/>
```

### **Phase 2: Beta Users (Week 2)**
```typescript
// Enable for specific users
const isBetaUser = user.email.endsWith('@company.com');

{isBetaUser && (
  <CustomFieldsSection
    fields={customFields}
    values={customValues}
    onChange={handleChange}
  />
)}
```

### **Phase 3: Full Rollout (Week 3)**
```typescript
// Enable for everyone
<CustomFieldsSection
  fields={customFields}
  values={customValues}
  onChange={handleChange}
/>
```

---

## **6️⃣ MONITORING:**

### **Add Logging:**

```typescript
// Log custom field usage
export async function saveCustomFieldValues(params) {
  console.log('[CustomFields] Saving values', {
    entityType: params.entityType,
    entityId: params.entityId,
    fieldCount: Object.keys(params.values).length,
  });

  const result = await withAuth(async (user) => {
    // ... save logic
  });

  if (result.success) {
    console.log('[CustomFields] Saved successfully');
  } else {
    console.error('[CustomFields] Save failed', result.error);
  }

  return result;
}
```

### **Monitor Performance:**

```typescript
// Add performance tracking
const startTime = Date.now();
const result = await getCustomFieldDefinitions('AUDIT');
const duration = Date.now() - startTime;

if (duration > 100) {
  console.warn('[Performance] Custom fields slow', { duration });
}
```

### **Track Errors:**

```typescript
// Send errors to monitoring service
try {
  await saveCustomFieldValues(params);
} catch (error) {
  // Send to Sentry, DataDog, etc.
  trackError('CUSTOM_FIELD_SAVE_ERROR', {
    error,
    entityType: params.entityType,
    userId: user.id,
  });
  throw error;
}
```

---

## **7️⃣ POST-MIGRATION VERIFICATION:**

### **Day 1:**
```bash
# ✅ All forms loading
# ✅ Custom fields rendering
# ✅ No errors in logs
# ✅ Performance acceptable (<200ms)
```

### **Week 1:**
```bash
# ✅ Monitor usage metrics
SELECT 
  COUNT(DISTINCT entity_id) as unique_entities,
  COUNT(*) as total_custom_values
FROM "CustomFieldValue"
WHERE created_at > NOW() - INTERVAL '7 days';

# ✅ Check for errors
SELECT COUNT(*) 
FROM error_logs 
WHERE message LIKE '%CustomField%'
AND timestamp > NOW() - INTERVAL '7 days';
```

### **Month 1:**
```bash
# ✅ Review adoption rate
# ✅ Gather user feedback
# ✅ Optimize based on usage patterns
# ✅ Add requested field types
```

---

## **8️⃣ DOCUMENTATION UPDATE:**

### **Update for Users:**
```markdown
# How to Add Custom Fields

1. Navigate to Admin > Custom Fields
2. Select entity type (Audit, Finding, etc.)
3. Click "Add Field"
4. Fill in field details
5. Save

Custom fields will appear in forms automatically!
```

### **Update for Developers:**
```markdown
# Developer Guide

## Adding Custom Field Support to New Entity

1. Add entity type to CustomFieldDefinition enum
2. Create form with HybridForm wrapper
3. Update detail page with CustomFieldsDisplay
4. Test thoroughly

See: docs/hybrid-form-system/
```

---

## **✅ MIGRATION CHECKLIST:**

### **Pre-Migration:**
- [ ] Database backup
- [ ] Tests passing
- [ ] Staging tested
- [ ] Rollback plan ready

### **Migration:**
- [ ] Database migration applied
- [ ] Server actions deployed
- [ ] Components deployed
- [ ] Forms updated (all entities)
- [ ] Detail pages updated

### **Post-Migration:**
- [ ] All forms working
- [ ] Performance acceptable
- [ ] No critical errors
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] User training complete

### **Week 1:**
- [ ] Usage metrics reviewed
- [ ] No major issues
- [ ] User feedback collected
- [ ] Optimizations identified

---

## **🆘 TROUBLESHOOTING:**

### **Issue: Custom fields not appearing**
```typescript
// Check field definitions
const fields = await getCustomFieldDefinitions('AUDIT');
console.log('Fields:', fields);

// Check status
const activeFields = fields.data?.filter(f => f.status === 'ACTIVE');
console.log('Active fields:', activeFields.length);
```

### **Issue: Values not saving**
```typescript
// Check validation
const result = await saveCustomFieldValues({
  entityType: 'AUDIT',
  entityId: 'test-id',
  values: { test: 'value' },
});

console.log('Save result:', result);
if (!result.success) {
  console.error('Error:', result.error);
}
```

### **Issue: Performance slow**
```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM "CustomFieldValue"
WHERE entity_type = 'AUDIT' AND entity_id = 'test-id';

-- Should use index: idx_custom_field_value_entity
```

---

**Status:** ✅ Migration guide complete  
**Next:** Deploy to production! 🚀
