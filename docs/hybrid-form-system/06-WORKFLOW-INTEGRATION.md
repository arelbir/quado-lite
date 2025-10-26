# 🔄 STEP 6: WORKFLOW INTEGRATION

**Phase:** Advanced Integration  
**Duration:** 2-3 days  
**Dependencies:** Form Integration (Step 5)

---

## **🎯 OBJECTIVES:**

- Custom fields available in workflow conditions
- Custom fields in role resolution
- Custom fields in workflow context
- Test workflow with custom fields

---

## **1️⃣ WORKFLOW CONTEXT UPDATE:**

```typescript
// lib/workflow/engine.ts

export class WorkflowEngine {
  async executeNode(instanceId: string, nodeId: string) {
    const instance = await this.getInstance(instanceId);
    const entity = await this.getEntity(instance.entityType, instance.entityId);
    
    // Load custom fields
    const customFieldsResult = await getCustomFieldValues(
      instance.entityType,
      instance.entityId
    );
    const customFields = customFieldsResult.success ? customFieldsResult.data : {};
    
    // Build context with custom fields
    const context = {
      entity: {
        ...entity,
        customFields, // ✨ Custom fields now available!
      },
      user: await this.getUser(instance.startedBy),
      workflow: instance,
      variables: instance.variables,
    };
    
    // Execute node with enriched context
    await this.executeNodeWithContext(node, context);
  }
}
```

---

## **2️⃣ CONDITION EVALUATOR UPDATE:**

```typescript
// lib/workflow/condition-evaluator.ts

export class ConditionEvaluator {
  evaluate(condition: string, context: ConditionContext): boolean {
    // Build evaluation context
    const evalContext = {
      // Entity data (includes customFields)
      ...context.entity,
      
      // Shortcut for custom fields
      customFields: context.entity.customFields || {},
      
      // Helper functions
      TODAY: new Date(),
      // ... more helpers
    };
    
    // Now conditions can use customFields!
    // Example: "customFields.certificationNumber === 'ISO9001'"
    return this.safeEval(this.parse(condition), evalContext);
  }
}
```

---

## **3️⃣ USAGE IN CONDITIONS:**

### **Simple Custom Field Check:**
```javascript
// In Decision node condition
"customFields.certificationNumber === 'ISO9001'"
```

### **Complex Logic:**
```javascript
// Check multiple custom fields
"customFields.certificationNumber === 'ISO9001' AND customFields.auditScore > 85"

// Existence check
"customFields.specialRequirements !== undefined"

// Type-specific checks
"customFields.expirationDate < TODAY"
```

### **Combined with Core Fields:**
```javascript
// Mix core and custom
"riskLevel === 'HIGH' AND customFields.previousAuditFailed === true"

// Nested custom field
"customFields.department === 'PRODUCTION' AND status === 'DRAFT'"
```

---

## **4️⃣ ROLE RESOLUTION WITH CUSTOM FIELDS:**

```typescript
// lib/workflow/role-resolver.ts

export class RoleResolver {
  async resolveComputed(
    definition: any,
    context: RoleContext
  ): Promise<string[]> {
    const evaluator = new ConditionEvaluator();
    
    // Rules can now use customFields!
    for (const rule of definition.rules) {
      const matches = evaluator.evaluate(rule.condition, {
        entity: context.entity, // Includes customFields
        user: context.user,
        workflow: context.workflow,
        variables: {},
      });
      
      if (matches) {
        return await this.resolve(rule.assignTo, context);
      }
    }
    
    return await this.resolve(definition.default, context);
  }
}
```

### **Example: Department-Based Assignment**

```typescript
// Workflow node configuration
{
  type: 'approval',
  data: {
    label: 'Department Manager Approval',
    assignedTo: {
      type: 'COMPUTED',
      rules: [
        {
          condition: "customFields.department === 'PRODUCTION'",
          assignTo: 'PRODUCTION_MANAGER'
        },
        {
          condition: "customFields.department === 'QUALITY'",
          assignTo: 'QUALITY_MANAGER'
        },
        {
          condition: "customFields.department === 'MAINTENANCE'",
          assignTo: 'MAINTENANCE_MANAGER'
        }
      ],
      default: 'GENERAL_MANAGER'
    }
  }
}
```

---

## **5️⃣ WORKFLOW VARIABLES UPDATE:**

```typescript
// When starting workflow, include custom fields in variables
async function createAudit(data: { core: any; custom: any }) {
  const audit = await db.audit.create({ data: data.core });
  
  await saveCustomFieldValues({
    entityType: 'AUDIT',
    entityId: audit.id,
    values: data.custom,
  });
  
  // Start workflow with custom fields
  await workflowEngine.start({
    workflowId: getActiveWorkflow('AUDIT').id,
    entityType: 'AUDIT',
    entityId: audit.id,
    startedBy: user.id,
    variables: {
      // Core fields
      riskLevel: audit.riskLevel,
      processOwnerId: audit.processOwnerId,
      
      // Custom fields ✨
      customFields: data.custom,
    },
  });
}
```

---

## **6️⃣ WORKFLOW DESIGNER UI UPDATE:**

### **Condition Builder with Custom Fields:**

```typescript
// components/workflow-designer/ConditionBuilder.tsx

function getFieldsForEntity(entityType: string) {
  // Load custom field definitions
  const customFields = await getCustomFieldDefinitions(entityType);
  
  const baseFields = [
    { label: 'Status', value: 'status' },
    { label: 'Risk Level', value: 'riskLevel' },
    // ... core fields
  ];
  
  const customFieldSuggestions = customFields.map(cf => ({
    label: `${cf.label} (Custom)`,
    value: `customFields.${cf.fieldKey}`,
    type: cf.fieldType,
  }));
  
  return [...baseFields, ...customFieldSuggestions];
}
```

### **UI Display:**
```tsx
<ConditionBuilder
  entityType="AUDIT"
  value={node.data.condition}
  onChange={handleChange}
  fields={[
    // Core fields
    { label: 'Risk Level', value: 'riskLevel' },
    
    // Custom fields (loaded dynamically)
    { label: 'Certification Number (Custom)', value: 'customFields.certificationNumber' },
    { label: 'Audit Score (Custom)', value: 'customFields.auditScore' },
  ]}
/>
```

---

## **7️⃣ EXAMPLE WORKFLOWS:**

### **ISO Audit Certification Flow:**

```typescript
// Workflow with custom field conditions
{
  nodes: [
    {
      id: '1',
      type: 'start',
      data: { label: 'Audit Started' }
    },
    {
      id: '2',
      type: 'decision',
      data: {
        label: 'ISO Certification Check',
        condition: "customFields.certificationNumber.startsWith('ISO')"
      }
    },
    {
      id: '3',
      type: 'approval',
      data: {
        label: 'ISO Auditor Approval',
        assignedTo: 'ISO_AUDITOR', // Only if has ISO cert
      }
    },
    {
      id: '4',
      type: 'approval',
      data: {
        label: 'Standard Approval',
        assignedTo: 'QUALITY_MANAGER',
      }
    },
    {
      id: '5',
      type: 'end',
      data: { label: 'Complete' }
    }
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '2', target: '3', sourceHandle: 'yes' }, // Has ISO cert
    { source: '2', target: '4', sourceHandle: 'no' },  // No ISO cert
    { source: '3', target: '5' },
    { source: '4', target: '5' },
  ]
}
```

### **Department-Specific Routing:**

```typescript
{
  nodes: [
    {
      id: '1',
      type: 'start'
    },
    {
      id: '2',
      type: 'decision',
      data: {
        label: 'Department Router',
        condition: "customFields.affectedDepartment === 'PRODUCTION'"
      }
    },
    {
      id: '3',
      type: 'approval',
      data: {
        label: 'Production Manager',
        assignedTo: 'PRODUCTION_MANAGER'
      }
    },
    {
      id: '4',
      type: 'approval',
      data: {
        label: 'Other Department Manager',
        assignedTo: {
          type: 'COMPUTED',
          rules: [
            { 
              condition: "customFields.affectedDepartment === 'QUALITY'",
              assignTo: 'QUALITY_MANAGER'
            },
            {
              condition: "customFields.affectedDepartment === 'MAINTENANCE'",
              assignTo: 'MAINTENANCE_MANAGER'
            }
          ],
          default: 'GENERAL_MANAGER'
        }
      }
    }
  ]
}
```

---

## **8️⃣ TESTING SCENARIOS:**

### **Test 1: Custom Field in Condition**
```typescript
// Create audit with custom field
await createAudit({
  core: { title: 'Test', riskLevel: 'HIGH' },
  custom: { certificationNumber: 'ISO9001' }
});

// Verify workflow takes ISO path
// Condition: "customFields.certificationNumber === 'ISO9001'" → true
```

### **Test 2: Custom Field in Role Resolution**
```typescript
// Create finding with department custom field
await createFinding({
  core: { title: 'Test Finding' },
  custom: { affectedDepartment: 'PRODUCTION' }
});

// Verify assigned to Production Manager
// Rule: department === 'PRODUCTION' → PRODUCTION_MANAGER
```

### **Test 3: Missing Custom Field**
```typescript
// Create entity without custom field
await createAudit({
  core: { title: 'Test' },
  custom: {} // No certificationNumber
});

// Verify workflow handles gracefully
// Condition: "customFields.certificationNumber === 'ISO9001'" → false
```

---

## **✅ CHECKLIST:**

- [ ] Update WorkflowEngine to load custom fields
- [ ] Update ConditionEvaluator context
- [ ] Test conditions with custom fields
- [ ] Update RoleResolver for custom fields
- [ ] Test role resolution with custom fields
- [ ] Update workflow designer UI
- [ ] Add custom field suggestions in builder
- [ ] Create test workflows
- [ ] Document examples
- [ ] End-to-end testing

---

**Status:** ✅ Workflow integrated  
**Next:** [Testing Strategy](./07-TESTING-STRATEGY.md)
