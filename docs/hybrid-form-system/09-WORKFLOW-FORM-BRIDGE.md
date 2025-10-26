# 🌉 STEP 9: WORKFLOW-FORM BRIDGE

**Phase:** Critical Integration  
**Duration:** 2-3 days  
**Dependencies:** Workflow Integration (Step 6)

---

## **🎯 OBJECTIVES:**

- Automatic workflow start on form submission
- Workflow task completion → Form update
- Bidirectional synchronization
- Validation from workflow requirements
- State management consistency

---

## **1️⃣ FORM SUBMISSION → WORKFLOW START:**

### **Automatic Workflow Trigger:**

```typescript
// src/server/actions/audit-actions.ts

export async function createAudit(data: {
  core: AuditFormData;
  custom: Record<string, any>;
}): Promise<ActionResponse<Audit>> {
  return withAuth(async (user) => {
    // 1. Create audit (core fields)
    const audit = await db.audit.create({
      data: {
        ...data.core,
        createdBy: user.id,
        status: 'DRAFT',
      },
    });

    // 2. Save custom fields
    if (Object.keys(data.custom).length > 0) {
      await saveCustomFieldValues({
        entityType: 'AUDIT',
        entityId: audit.id,
        values: data.custom,
      });
    }

    // 3. 🔥 AUTO-START WORKFLOW
    const activeWorkflow = await getActiveWorkflowForModule('AUDIT');
    
    if (activeWorkflow) {
      await workflowEngine.start({
        workflowId: activeWorkflow.id,
        entityType: 'AUDIT',
        entityId: audit.id,
        startedBy: user.id,
        variables: {
          // Core fields
          ...data.core,
          
          // Custom fields
          customFields: data.custom,
          
          // Entity metadata
          entityType: 'AUDIT',
          entityId: audit.id,
        },
      });
    }

    // 4. Revalidate paths
    revalidateAuditPaths();

    return { success: true, data: audit };
  });
}
```

---

## **2️⃣ WORKFLOW TASK → FORM UPDATE:**

### **Task Completion Updates Entity:**

```typescript
// lib/workflow/engine.ts

export class WorkflowEngine {
  async completeTask(taskId: string, userId: string, result: any) {
    const task = await db.workflowTask.findUnique({ where: { id: taskId } });
    const instance = await db.workflowInstance.findUnique({ 
      where: { id: task.instanceId } 
    });

    // Update task
    await db.workflowTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', result },
    });

    // 🔥 UPDATE ENTITY BASED ON TASK RESULT
    if (result.updateFields) {
      await this.updateEntityFromTaskResult(
        instance.entityType,
        instance.entityId,
        result.updateFields
      );
    }

    // Continue workflow
    await this.advanceWorkflow(instance.id);
  }

  private async updateEntityFromTaskResult(
    entityType: string,
    entityId: string,
    fields: Record<string, any>
  ) {
    // Core fields
    const coreFields = {};
    const customFields = {};

    for (const [key, value] of Object.entries(fields)) {
      if (key.startsWith('customFields.')) {
        const fieldKey = key.replace('customFields.', '');
        customFields[fieldKey] = value;
      } else {
        coreFields[key] = value;
      }
    }

    // Update core fields
    if (Object.keys(coreFields).length > 0) {
      await db[entityType.toLowerCase()].update({
        where: { id: entityId },
        data: coreFields,
      });
    }

    // Update custom fields
    if (Object.keys(customFields).length > 0) {
      await saveCustomFieldValues({
        entityType,
        entityId,
        values: customFields,
      });
    }
  }
}
```

---

## **3️⃣ BIDIRECTIONAL SYNC:**

### **Form Change → Workflow Update:**

```typescript
// components/forms/HybridForm.tsx

export function HybridForm({ entityType, entityId, onSubmit }) {
  const [workflowInstance, setWorkflowInstance] = useState(null);

  // Load workflow instance if exists
  useEffect(() => {
    if (entityId) {
      loadWorkflowInstance(entityType, entityId).then(setWorkflowInstance);
    }
  }, [entityType, entityId]);

  const handleCoreFieldChange = async (field: string, value: any) => {
    // Update form state
    form.setValue(field, value);

    // 🔥 Update workflow variables if workflow is running
    if (workflowInstance && workflowInstance.status === 'RUNNING') {
      await updateWorkflowVariables(workflowInstance.id, {
        [field]: value,
      });
    }
  };

  const handleCustomFieldChange = async (field: string, value: any) => {
    setCustomValues(prev => ({ ...prev, [field]: value }));

    // 🔥 Update workflow variables
    if (workflowInstance) {
      await updateWorkflowVariables(workflowInstance.id, {
        [`customFields.${field}`]: value,
      });
    }
  };

  return (
    <Form onFieldChange={handleCoreFieldChange}>
      {/* Core fields */}
      <CustomFieldsSection onChange={handleCustomFieldChange} />
    </Form>
  );
}
```

### **Workflow State → Form State:**

```typescript
// Real-time sync using polling or websockets

export function useWorkflowSync(entityType: string, entityId: string) {
  const [workflowState, setWorkflowState] = useState(null);

  useEffect(() => {
    // Poll workflow state every 5 seconds
    const interval = setInterval(async () => {
      const instance = await getWorkflowInstance(entityType, entityId);
      
      if (instance && instance.variables) {
        // Update form with workflow variables
        setWorkflowState(instance.variables);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [entityType, entityId]);

  return workflowState;
}

// Usage in form
function AuditForm({ auditId }) {
  const workflowState = useWorkflowSync('AUDIT', auditId);
  
  // Sync workflow state to form
  useEffect(() => {
    if (workflowState) {
      form.setValue('riskLevel', workflowState.riskLevel);
      // ... sync other fields
    }
  }, [workflowState]);
}
```

---

## **4️⃣ VALIDATION FROM WORKFLOW:**

### **Dynamic Required Fields:**

```typescript
// Get required fields from workflow configuration

export async function getRequiredFieldsForWorkflow(
  entityType: string
): Promise<string[]> {
  const workflow = await getActiveWorkflowForModule(entityType);
  
  if (!workflow) return [];

  // Parse workflow nodes to find required fields
  const requiredFields = new Set<string>();

  for (const node of workflow.nodes) {
    if (node.type === 'decision' && node.data.condition) {
      // Extract field names from condition
      const fields = extractFieldsFromCondition(node.data.condition);
      fields.forEach(f => requiredFields.add(f));
    }

    if (node.type === 'approval' && node.data.assignedTo?.rules) {
      // Extract fields from role resolution rules
      for (const rule of node.data.assignedTo.rules) {
        const fields = extractFieldsFromCondition(rule.condition);
        fields.forEach(f => requiredFields.add(f));
      }
    }
  }

  return Array.from(requiredFields);
}

// Usage in form validation
const auditSchema = z.object({
  title: z.string().min(1),
  riskLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  // ... core fields
}).refine(async (data) => {
  // Get workflow required fields
  const requiredFields = await getRequiredFieldsForWorkflow('AUDIT');
  
  // Check if all required fields are present
  for (const field of requiredFields) {
    if (!data[field] && !data.customFields?.[field]) {
      return false;
    }
  }
  
  return true;
}, {
  message: 'Required fields for workflow are missing',
});
```

---

## **5️⃣ WORKFLOW-AWARE FORM UI:**

### **Show Workflow Status in Form:**

```typescript
// components/forms/WorkflowStatusBanner.tsx

export function WorkflowStatusBanner({ entityType, entityId }) {
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    loadWorkflowInstance(entityType, entityId).then(setInstance);
  }, [entityType, entityId]);

  if (!instance) return null;

  const currentNode = instance.workflow.nodes.find(
    n => n.id === instance.currentNodeId
  );

  return (
    <Alert>
      <Icons.Workflow className="size-4" />
      <AlertTitle>Workflow: {instance.workflow.name}</AlertTitle>
      <AlertDescription>
        Current step: {currentNode?.data.label || 'Unknown'}
        <br />
        Status: {instance.status}
      </AlertDescription>
    </Alert>
  );
}

// Usage in form
<HybridForm>
  <WorkflowStatusBanner entityType="AUDIT" entityId={auditId} />
  {/* Form fields */}
</HybridForm>
```

### **Disable Fields Based on Workflow:**

```typescript
// components/forms/HybridForm.tsx

export function HybridForm({ entityType, entityId }) {
  const [workflowInstance, setWorkflowInstance] = useState(null);
  const [disabledFields, setDisabledFields] = useState<string[]>([]);

  useEffect(() => {
    async function loadWorkflowState() {
      const instance = await getWorkflowInstance(entityType, entityId);
      
      if (instance) {
        setWorkflowInstance(instance);
        
        // Determine which fields should be disabled
        const currentNode = instance.workflow.nodes.find(
          n => n.id === instance.currentNodeId
        );
        
        if (currentNode?.data.lockFields) {
          setDisabledFields(currentNode.data.lockFields);
        }
      }
    }
    
    loadWorkflowState();
  }, [entityType, entityId]);

  const isFieldDisabled = (fieldKey: string) => {
    // Disable if workflow is running and field is locked
    return workflowInstance?.status === 'RUNNING' && 
           disabledFields.includes(fieldKey);
  };

  return (
    <Form>
      <Input 
        name="title" 
        disabled={isFieldDisabled('title')} 
      />
      {/* Other fields */}
    </Form>
  );
}
```

---

## **6️⃣ WORKFLOW TASK FORM:**

### **Special Form for Task Completion:**

```typescript
// components/workflow/TaskCompletionForm.tsx

export function TaskCompletionForm({ taskId }: { taskId: string }) {
  const [task, setTask] = useState(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    async function loadTask() {
      const t = await getWorkflowTask(taskId);
      const i = await getWorkflowInstance(t.instanceId);
      
      setTask(t);
      setInstance(i);
    }
    loadTask();
  }, [taskId]);

  if (!task) return <div>Loading...</div>;

  const node = instance.workflow.nodes.find(n => n.id === task.nodeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{node.data.label}</CardTitle>
        <CardDescription>
          Complete this {task.taskType.toLowerCase()} task
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Show entity data (read-only) */}
        <EntityDataDisplay 
          entityType={instance.entityType}
          entityId={instance.entityId}
        />

        {/* Task-specific form */}
        {task.taskType === 'APPROVAL' && (
          <ApprovalForm
            taskId={taskId}
            onComplete={handleComplete}
          />
        )}

        {task.taskType === 'USER_SELECTION' && (
          <UserSelectionForm
            taskId={taskId}
            filter={task.metadata.filter}
            onComplete={handleComplete}
          />
        )}

        {/* Allow updating custom fields during task */}
        <CustomFieldsSection
          entityType={instance.entityType}
          entityId={instance.entityId}
          fields={getEditableFields(task)}
        />
      </CardContent>

      <CardFooter>
        <Button onClick={handleComplete}>
          Complete Task
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## **7️⃣ ERROR HANDLING & CONSISTENCY:**

### **Transaction Management:**

```typescript
// Ensure form + workflow operations are atomic

export async function createAuditWithWorkflow(data: {
  core: any;
  custom: any;
}) {
  // Use database transaction
  return await db.transaction(async (tx) => {
    // 1. Create audit
    const audit = await tx.audit.create({ data: data.core });

    // 2. Save custom fields
    await saveCustomFieldValuesInTransaction(tx, {
      entityType: 'AUDIT',
      entityId: audit.id,
      values: data.custom,
    });

    // 3. Start workflow
    const workflow = await getActiveWorkflowForModule('AUDIT');
    if (workflow) {
      await workflowEngine.startInTransaction(tx, {
        workflowId: workflow.id,
        entityType: 'AUDIT',
        entityId: audit.id,
        variables: { ...data.core, customFields: data.custom },
      });
    }

    return audit;
  });
}
```

### **Rollback on Workflow Failure:**

```typescript
// If workflow fails to start, rollback entity creation

try {
  const audit = await createAudit(data);
  const workflowResult = await workflowEngine.start({...});
  
  if (!workflowResult.success) {
    // Rollback audit creation
    await deleteAudit(audit.id);
    throw new Error('Workflow failed to start');
  }
} catch (error) {
  // Handle error
}
```

---

## **8️⃣ TESTING INTEGRATION:**

### **Integration Test:**

```typescript
// __tests__/integration/workflow-form-bridge.test.ts

describe('Workflow-Form Bridge', () => {
  it('should start workflow when form is submitted', async () => {
    // 1. Create custom field
    await createCustomFieldDefinition({
      entityType: 'AUDIT',
      fieldKey: 'testField',
      fieldType: 'text',
      label: 'Test',
    });

    // 2. Create workflow
    const workflow = await createVisualWorkflow({
      name: 'Test Workflow',
      module: 'AUDIT',
      nodes: [
        { id: '1', type: 'start', data: {} },
        { id: '2', type: 'end', data: {} },
      ],
      edges: [{ source: '1', target: '2' }],
    });

    await publishWorkflow(workflow.id);

    // 3. Submit form
    const result = await createAudit({
      core: { title: 'Test', riskLevel: 'HIGH' },
      custom: { testField: 'value' },
    });

    // 4. Verify workflow started
    const instance = await getWorkflowInstance('AUDIT', result.data.id);
    
    expect(instance).toBeTruthy();
    expect(instance.status).toBe('RUNNING');
    expect(instance.variables.customFields.testField).toBe('value');
  });

  it('should update form when workflow task completes', async () => {
    // 1. Create audit with workflow
    const audit = await createAudit({...});

    // 2. Get workflow task
    const tasks = await getWorkflowTasks(audit.id);
    const task = tasks[0];

    // 3. Complete task with field updates
    await completeWorkflowTask(task.id, {
      approved: true,
      updateFields: {
        'customFields.approvalNotes': 'Approved by manager',
      },
    });

    // 4. Verify form updated
    const customValues = await getCustomFieldValues('AUDIT', audit.id);
    expect(customValues.data.approvalNotes).toBe('Approved by manager');
  });
});
```

---

## **✅ CHECKLIST:**

- [ ] Auto-start workflow on form submission
- [ ] Workflow task completion updates form
- [ ] Bidirectional sync implemented
- [ ] Required fields from workflow
- [ ] Workflow status shown in form
- [ ] Fields disabled based on workflow state
- [ ] Task completion form
- [ ] Transaction management
- [ ] Error handling & rollback
- [ ] Integration tests

---

**Status:** ✅ Bridge design complete  
**Critical:** This ensures seamless workflow-form integration
