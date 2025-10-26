# 🏗️ WORKFLOW INTEGRATION STRATEGY

**Date:** 2025-01-26  
**Status:** Architecture Design

---

## **1️⃣ FORM-WORKFLOW INTEGRATION**

### **RECOMMENDED: Workflow Engine Approach**

**Database Schema:**
```sql
-- Workflow Instance (Her form için bir instance)
WorkflowInstance {
  id, workflowId, entityType, entityId,
  currentNodeId, status, startedBy, variables
}

-- Execution History
WorkflowExecution {
  instanceId, nodeId, action, executedBy, input, output
}

-- Pending Tasks
WorkflowTask {
  instanceId, nodeId, taskType, assignedTo, status, result
}
```

**Integration Points:**
```typescript
// 1. Form oluşturulunca workflow başlat
async function createAudit(data) {
  const audit = await db.audit.create({ data });
  await workflowEngine.start({
    workflowId: getActiveWorkflow('AUDIT').id,
    entityType: 'AUDIT',
    entityId: audit.id,
    startedBy: user.id,
  });
}

// 2. Status değişince workflow ilerlet
async function completeAudit(auditId) {
  await db.audit.update({ status: 'COMPLETED' });
  await workflowEngine.advance(auditId, 'AUDIT', { action: 'COMPLETE' });
}
```

---

## **2️⃣ DYNAMIC CONDITION SYSTEM**

### **Condition Expression Language**

**Simple:**
```javascript
"riskLevel === 'HIGH'"
"findings.length > 5"
"score < 60"
```

**Complex:**
```javascript
"riskLevel === 'HIGH' AND findings.length > 3"
"findings.some(f => f.riskType === 'CRITICAL')"
"dueDate < TODAY"
```

**Implementation:**
```typescript
class ConditionEvaluator {
  evaluate(condition: string, context: {
    entity: any,  // Form data
    user: User,
    workflow: any,
  }): boolean {
    const ast = parse(condition);
    return safeEval(ast, context);
  }
}
```

**UI Component:**
```tsx
<ConditionBuilder
  entityType="AUDIT"
  fields={['status', 'riskLevel', 'score', 'findings.length']}
  operators={['===', '>', '<', 'AND', 'OR']}
  value={condition}
  onChange={setCondition}
/>
```

---

## **3️⃣ DYNAMIC ROLE MANAGEMENT**

### **Role Types:**

**1. Static:**
```json
{ "assignedTo": "user_123" }
{ "assignedTo": "QUALITY_MANAGER" }
```

**2. Dynamic (Context-Based):**
```json
{ "assignedTo": "{workflow.starter}" }
{ "assignedTo": "{entity.owner}" }
{ "assignedTo": "{entity.processOwner}" }
{ "assignedTo": "{entity.manager}" }
```

**3. Computed (Rule-Based):**
```json
{
  "assignedTo": {
    "type": "COMPUTED",
    "rules": [
      { "condition": "riskLevel === 'HIGH'", "assignTo": "QUALITY_DIRECTOR" },
      { "condition": "riskLevel === 'MEDIUM'", "assignTo": "QUALITY_MANAGER" }
    ],
    "default": "{entity.processOwner}"
  }
}
```

**4. User Selection:**
```json
{
  "assignedTo": {
    "type": "USER_SELECT",
    "prompt": "Select approver",
    "filter": { "department": "{entity.departmentId}" },
    "selectedBy": "{workflow.starter}"
  }
}
```

### **Role Resolver:**
```typescript
class RoleResolver {
  async resolve(roleDefinition, context): Promise<string[]> {
    if (isStatic(roleDefinition)) return [roleDefinition];
    if (isDynamic(roleDefinition)) return resolvePlaceholder(roleDefinition, context);
    if (isComputed(roleDefinition)) return resolveComputed(roleDefinition, context);
    if (isUserSelect(roleDefinition)) return resolveUserSelect(roleDefinition, context);
  }
}
```

---

## **4️⃣ IMPLEMENTATION ROADMAP**

### **Phase 1: Foundation (Week 1-2)**
- [ ] WorkflowInstance, WorkflowExecution, WorkflowTask tables
- [ ] WorkflowEngine, ConditionEvaluator, RoleResolver classes
- [ ] Basic integration with Audit module

### **Phase 2: Conditions (Week 3-4)**
- [ ] ConditionBuilder UI component
- [ ] Expression parser & evaluator
- [ ] Decision node branching

### **Phase 3: Dynamic Roles (Week 5-6)**
- [ ] RoleSelector UI component
- [ ] All role types support
- [ ] Task assignment logic

### **Phase 4: Full Integration (Week 7-8)**
- [ ] All modules (Audit, Finding, Action, DOF)
- [ ] Task management page
- [ ] Notifications

---

## **5️⃣ EXAMPLE SCENARIOS**

### **Audit High-Risk Approval:**
```typescript
// Workflow
Decision: "riskLevel === 'HIGH'"
  → YES: Approval by QUALITY_DIRECTOR
  → NO: Approval by {entity.processOwner}

// Execution
1. User creates audit with riskLevel = 'HIGH'
2. Condition evaluates → true
3. Task assigned to QUALITY_DIRECTOR
4. Director approves → workflow complete
```

### **Finding with Dynamic Assignment:**
```typescript
// Workflow
Process: Assign to {entity.processOwner}
Approval: {
  type: 'USER_SELECT',
  prompt: 'Select corrective action owner',
  selectedBy: '{entity.processOwner}'
}
Decision: "actions.filter(a => a.status !== 'COMPLETED').length === 0"
  → YES: Auditor closure
  → NO: Loop back

// Execution
1. Finding created → assigned to process owner
2. Process owner selects action owner from team
3. Action owner completes actions
4. Decision checks: all actions complete?
5. If yes → auditor approves closure
```

---

## **6️⃣ BEST PRACTICES**

**✅ DO:**
- Use dynamic roles for flexibility
- Test conditions with sample data
- Keep expressions simple
- Log all workflow executions
- Handle errors gracefully

**❌ DON'T:**
- Hardcode user IDs in workflows
- Use complex nested conditions
- Allow arbitrary code execution
- Skip validation
- Ignore edge cases

---

**Status:** Ready for implementation  
**Next Step:** Create WorkflowEngine POC
