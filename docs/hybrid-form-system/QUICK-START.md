# 🚀 HYBRID FORM SYSTEM - QUICK START

**Ready to deploy!** Follow these simple steps.

---

## **⚡ 3-STEP DEPLOYMENT:**

### **Step 1: Apply Database Migration**

```powershell
# Push schema to database
pnpm drizzle-kit push
```

**Expected output:**
```
✓ Pushing schema changes to database
✓ Table CustomFieldDefinition created
✓ Table CustomFieldValue created
✓ Indexes created
```

---

### **Step 2: Restart Application**

```powershell
# Development
pnpm dev

# Production
# Your deployment will handle this
```

---

### **Step 3: Test Admin UI**

1. **Login as Admin**
2. **Navigate to:** `/admin/custom-fields/AUDIT`
3. **Click:** "Add Field"
4. **Fill:**
   - Field Key: `certificationNumber`
   - Field Type: `text`
   - Label: `Certification Number`
   - Required: `true`
5. **Save**
6. **Go to:** `/denetim/audits/new`
7. **Verify:** Custom field appears in form!

---

## **✅ THAT'S IT!**

Your hybrid form system is now live!

---

## **📖 USAGE GUIDE:**

### **For Admins - Adding Custom Fields:**

**Entity Types Available:**
- `AUDIT` - Audit forms
- `FINDING` - Finding forms
- `ACTION` - Action forms
- `DOF` - DOF (CAPA) forms

**Field Types Available:**
- `text` - Short text input
- `textarea` - Long text input
- `number` - Numeric input
- `email` - Email validation
- `url` - URL validation
- `phone` - Phone number
- `select` - Dropdown selection
- `multiselect` - Multiple selection
- `checkbox` - Yes/No toggle
- `radio` - Radio buttons
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time
- `file` - File upload
- `color` - Color picker
- `rating` - Star rating
- `slider` - Numeric slider
- `json` - JSON editor
- `richtext` - Rich text editor

**Example - Add Certification Field:**
```
1. Go to: /admin/custom-fields/AUDIT
2. Click: "Add Field"
3. Fill:
   - Field Key: certificationNumber
   - Field Type: text
   - Label: Certification Number
   - Placeholder: Enter ISO cert number
   - Help Text: Required for ISO audits
   - Required: Yes
   - Section: Certification
4. Save
5. Done! Field appears in all audit forms
```

---

### **For Users - Using Custom Fields:**

**Custom fields appear automatically in forms:**

1. **Create New Audit:**
   - Go to `/denetim/audits/new`
   - Fill core fields (title, description, date)
   - **Scroll down** → Custom Fields section
   - Fill custom fields
   - Submit

2. **View Custom Fields:**
   - Go to audit detail page
   - Click "Details" tab
   - **Scroll down** → Custom Fields section
   - Values displayed

**That's it!** No special action needed.

---

## **🔧 ADVANCED FEATURES:**

### **1. Validation Rules:**

When creating field, add validation:

```json
{
  "min": 0,
  "max": 100,
  "pattern": "^[A-Z]{3}-\\d{4}$",
  "minLength": 5,
  "maxLength": 20
}
```

### **2. Select Options:**

For select/multiselect fields:

```json
[
  { "value": "iso9001", "label": "ISO 9001" },
  { "value": "iso14001", "label": "ISO 14001" },
  { "value": "iso45001", "label": "ISO 45001" }
]
```

### **3. Field Sections:**

Group related fields:
- Section: `Certification` → All cert fields grouped
- Section: `Risk Assessment` → All risk fields grouped

### **4. Workflow Integration:**

Use custom fields in workflow conditions:

```javascript
// In workflow designer
customFields.certificationNumber !== undefined
customFields.auditScore > 90
customFields.priority === 'HIGH'
```

---

## **📊 MONITORING:**

### **Check Usage:**

```sql
-- How many entities have custom fields?
SELECT 
  entity_type,
  COUNT(DISTINCT entity_id) as entities
FROM "CustomFieldValue"
GROUP BY entity_type;

-- Most used fields
SELECT 
  cfd."label",
  COUNT(*) as usage_count
FROM "CustomFieldValue" cfv
JOIN "CustomFieldDefinition" cfd ON cfv.definition_id = cfd.id
GROUP BY cfd."label"
ORDER BY usage_count DESC
LIMIT 10;
```

### **Check Performance:**

```sql
-- Query performance
EXPLAIN ANALYZE
SELECT * FROM "CustomFieldDefinition"
WHERE entity_type = 'AUDIT' AND status = 'ACTIVE';
-- Should use index, < 10ms
```

---

## **🆘 TROUBLESHOOTING:**

### **Issue: "Custom fields not appearing"**

**Solution:**
1. Check field status is `ACTIVE`
2. Check entity type matches (AUDIT, FINDING, etc.)
3. Clear browser cache
4. Check browser console for errors

```sql
-- Check active fields
SELECT * FROM "CustomFieldDefinition"
WHERE entity_type = 'AUDIT' AND status = 'ACTIVE';
```

### **Issue: "Values not saving"**

**Solution:**
1. Check browser console for errors
2. Check server logs
3. Verify field definition exists
4. Check validation rules

```typescript
// Debug in browser console
console.log('Custom field values:', customFieldValues);
```

### **Issue: "Performance slow"**

**Solution:**
1. Check database indexes
2. Limit number of custom fields (<20 per entity)
3. Use pagination for large lists
4. Cache field definitions

```sql
-- Check indexes
SELECT * FROM pg_indexes 
WHERE tablename IN ('CustomFieldDefinition', 'CustomFieldValue');
```

---

## **📚 MORE INFO:**

- **Full Documentation:** See `/docs/hybrid-form-system/`
- **Migration Guide:** `08-MIGRATION-GUIDE.md`
- **Testing Guide:** `07-TESTING-STRATEGY.md`
- **Workflow Integration:** `WORKFLOW-CUSTOM-FIELDS-USAGE.md`

---

## **🎉 SUCCESS!**

Your hybrid form system is ready to use!

**Benefits:**
- ✅ Flexible forms without code changes
- ✅ Admin-defined custom fields
- ✅ Type-safe core fields
- ✅ Workflow integration
- ✅ Zero downtime deployment

**Next Steps:**
1. Train users on admin UI
2. Define business-specific fields
3. Monitor usage and performance
4. Gather feedback for improvements

---

**Happy form building! 🚀**
