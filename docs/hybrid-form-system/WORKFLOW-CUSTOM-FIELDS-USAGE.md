# 🔄 WORKFLOW CUSTOM FIELDS USAGE GUIDE

**Status:** ✅ Implemented  
**Date:** 2025-01-26

---

## **📋 OVERVIEW:**

Custom fields are now available in workflow conditions and role resolution rules. This allows dynamic workflow behavior based on user-defined fields.

---

## **🎯 IMPLEMENTATION:**

### **1. Workflow Metadata Integration:**

All metadata builder functions now include custom fields:

```typescript
// lib/workflow/workflow-integration.ts

// Audit metadata
const metadata = await buildAuditMetadata(audit);
// Returns: { riskLevel, department, ..., customFields: {...} }

// Action metadata
const metadata = await buildActionMetadata(action);
// Returns: { priority, type, ..., customFields: {...} }

// Finding metadata
const metadata = await buildFindingMetadata(finding);
// Returns: { severity, riskLevel, ..., customFields: {...} }

// DOF metadata
const metadata = await buildDofMetadata(dof);
// Returns: { currentStep, ..., customFields: {...} }
```

---

## **💡 USAGE EXAMPLES:**

### **Example 1: Audit Workflow - ISO Certification Check**

**Admin defines custom field:**
```
/admin/custom-fields/AUDIT
→ Field: "certificationNumber" (text)
→ Field: "auditScore" (number)
```

**Workflow condition:**
```javascript
// In workflow designer, Decision node condition:
"customFields.certificationNumber.startsWith('ISO') && customFields.auditScore > 90"

// If true → Route to "ISO Compliance Review"
// If false → Route to "Standard Review"
```

**Example workflow:**
```
Start
  ↓
Decision: Has ISO certification?
  (customFields.certificationNumber !== undefined)
  ↓         ↓
 YES        NO
  ↓         ↓
ISO       Standard
Auditor   Review
  ↓         ↓
Approval  Approval
  ↓         ↓
  End ←----┘
```

---

### **Example 2: Action Workflow - Priority Based on Custom Field**

**Admin defines:**
```
/admin/custom-fields/ACTION
→ Field: "impactLevel" (select: High/Medium/Low)
→ Field: "costEstimate" (number)
```

**Workflow condition:**
```javascript
// Decision node:
"customFields.impactLevel === 'High' || customFields.costEstimate > 10000"

// If true → Requires CFO approval
// If false → Manager approval only
```

---

### **Example 3: Finding Workflow - Department-Based Routing**

**Admin defines:**
```
/admin/custom-fields/FINDING
→ Field: "affectedDepartment" (select)
→ Field: "isRecurring" (checkbox)
```

**Role resolution:**
```javascript
// In Approval node, Assigned To:
{
  type: 'COMPUTED',
  rules: [
    {
      condition: "customFields.affectedDepartment === 'PRODUCTION'",
      assignTo: 'PRODUCTION_MANAGER'
    },
    {
      condition: "customFields.affectedDepartment === 'QUALITY'",
      assignTo: 'QUALITY_MANAGER'
    },
    {
      condition: "customFields.isRecurring === true",
      assignTo: 'QUALITY_DIRECTOR' // Escalate recurring issues
    }
  ],
  default: 'GENERAL_MANAGER'
}
```

---

## **🔧 CONDITION SYNTAX:**

### **Accessing Custom Fields:**
```javascript
// Simple access
customFields.fieldKey

// Check existence
customFields.certNumber !== undefined

// String operations
customFields.certNumber.startsWith('ISO')
customFields.certNumber.includes('9001')

// Number comparisons
customFields.score > 80
customFields.cost <= 5000

// Boolean checks
customFields.isUrgent === true
customFields.approved === false

// Combined conditions
customFields.score > 85 && riskLevel === 'HIGH'
customFields.department === 'PROD' || customFields.priority === 'HIGH'
```

---

## **📊 AVAILABLE IN:**

**All workflow contexts include custom fields:**

### **✅ Condition Nodes:**
- Decision points
- Branch logic
- Conditional routing

### **✅ Role Resolution:**
- Dynamic user assignment
- Department-based routing
- Computed role rules

### **✅ Workflow Variables:**
- Available in workflow instance
- Accessible in all nodes
- Persisted in workflow history

---

## **🚀 REAL-WORLD SCENARIOS:**

### **Scenario 1: Multi-Standard Audit**
```javascript
// Custom Fields:
// - certificationStandard: "ISO 9001", "ISO 14001", "ISO 45001"
// - auditorSpecialization: required for each standard

// Workflow Logic:
if (customFields.certificationStandard === 'ISO 9001') {
  assignTo: 'ISO_9001_AUDITOR'
} else if (customFields.certificationStandard === 'ISO 14001') {
  assignTo: 'ENVIRONMENTAL_AUDITOR'
} else {
  assignTo: 'SAFETY_AUDITOR'
}
```

### **Scenario 2: Cost-Based Approval Chain**
```javascript
// Custom Fields:
// - estimatedCost: number
// - budgetCategory: "CapEx" | "OpEx"

// Workflow Logic:
if (customFields.estimatedCost > 50000) {
  // CFO + CEO approval required
  route: 'EXECUTIVE_APPROVAL'
} else if (customFields.estimatedCost > 10000) {
  // Department head + Finance approval
  route: 'MANAGEMENT_APPROVAL'
} else {
  // Manager approval only
  route: 'STANDARD_APPROVAL'
}
```

### **Scenario 3: Recurring Issue Escalation**
```javascript
// Custom Fields:
// - occurrenceCount: number
// - lastOccurrenceDate: date

// Workflow Logic:
if (customFields.occurrenceCount > 3) {
  // Escalate to quality director
  assignTo: 'QUALITY_DIRECTOR'
  notifications: ['EXECUTIVE_TEAM']
} else {
  // Normal process
  assignTo: 'PROCESS_OWNER'
}
```

---

## **⚠️ IMPORTANT NOTES:**

### **1. Undefined Custom Fields:**
```javascript
// Always check for undefined
customFields.fieldKey !== undefined

// Use optional chaining
customFields?.fieldKey === 'value'
```

### **2. Type Safety:**
```javascript
// String fields
customFields.textField === 'value'

// Number fields
customFields.numberField > 100

// Boolean fields
customFields.checkboxField === true

// Date fields (stored as string)
new Date(customFields.dateField) > TODAY
```

### **3. Performance:**
- Custom fields are loaded once per workflow execution
- Cached in workflow instance
- No additional database queries during evaluation

---

## **📝 BEST PRACTICES:**

1. **Keep Conditions Simple:**
   ```javascript
   // ✅ Good
   customFields.priority === 'HIGH'
   
   // ❌ Avoid complex regex
   customFields.code.match(/^[A-Z]{3}-\d{4}$/)
   ```

2. **Provide Defaults:**
   ```javascript
   // ✅ Good
   customFields.score > 80 || riskLevel === 'HIGH'
   
   // Has fallback to core field
   ```

3. **Document Custom Fields:**
   - Add help text in field definition
   - Explain usage in workflow documentation
   - Provide examples

4. **Test Workflows:**
   - Test with custom fields present
   - Test with custom fields missing
   - Test edge cases

---

## **🎉 BENEFITS:**

- ✅ **Flexibility:** Workflows adapt to business needs
- ✅ **No Code Changes:** Admins can modify behavior
- ✅ **Type Safe:** Custom fields properly validated
- ✅ **Performance:** Efficient data loading
- ✅ **Audit Trail:** All decisions logged
- ✅ **Future Proof:** Easy to extend

---

## **📚 RELATED DOCS:**

- [Custom Fields Overview](./00-OVERVIEW.md)
- [Workflow Integration](./06-WORKFLOW-INTEGRATION.md)
- [Workflow-Form Bridge](./09-WORKFLOW-FORM-BRIDGE.md)

---

**Status:** ✅ Production Ready  
**Last Updated:** 2025-01-26
