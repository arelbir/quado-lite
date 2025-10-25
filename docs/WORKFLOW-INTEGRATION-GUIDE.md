# WORKFLOW INTEGRATION GUIDE

**How to integrate workflow system with your modules**

---

## 🎯 QUICK START

### **Step 1: Import Helpers**

```typescript
import { startWorkflow } from "@/server/actions/workflow-actions";
import { 
  getAuditWorkflowId, 
  buildAuditMetadata 
} from "@/lib/workflow/workflow-integration";
```

### **Step 2: Start Workflow After Entity Creation**

```typescript
// After creating audit/action/dof/finding
const workflowId = await getAuditWorkflowId({
  riskLevel: audit.riskLevel,
  totalScore: audit.totalScore,
});

if (workflowId) {
  await startWorkflow({
    workflowDefinitionId: workflowId,
    entityType: "Audit",
    entityId: audit.id,
    entityMetadata: buildAuditMetadata(audit),
  });
}
```

---

## 📝 MODULE-SPECIFIC INTEGRATION

### **AUDIT MODULE** (`src/action/audit-plan-actions.ts`)

**Function to Modify:** `startAdhocAudit()` or `createAuditFromPlan()`

**Add After Audit Creation:**
```typescript
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getAuditWorkflowId, buildAuditMetadata } from "@/lib/workflow/workflow-integration";

// ... after audit is created ...

// Start workflow
const workflowId = await getAuditWorkflowId({
  riskLevel: audit.riskLevel,
  totalScore: audit.totalScore,
  departmentId: audit.departmentId,
});

if (workflowId) {
  const workflowResult = await startWorkflow({
    workflowDefinitionId: workflowId,
    entityType: "Audit",
    entityId: audit.id,
    entityMetadata: buildAuditMetadata(audit),
  });

  if (!workflowResult.success) {
    console.error("Workflow start failed:", workflowResult.error);
    // Decide: Continue or rollback?
  }
}
```

**Files to Modify:**
- `src/action/audit-plan-actions.ts` (Line ~200, in `startAdhocAudit()`)
- Or wherever audits are created

---

### **ACTION MODULE** (`src/action/action-actions.ts`)

**Function to Modify:** `createAction()`

**Add After Action Creation:**
```typescript
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getActionWorkflowId, buildActionMetadata } from "@/lib/workflow/workflow-integration";

// ... after action is created ...

const workflowId = await getActionWorkflowId({
  priority: action.priority,
  type: action.type,
  findingId: action.findingId,
});

if (workflowId) {
  await startWorkflow({
    workflowDefinitionId: workflowId,
    entityType: "Action",
    entityId: action.id,
    entityMetadata: buildActionMetadata(action),
  });
}
```

**Consider:** You may want to replace existing manual approval logic with workflow!

---

### **DOF MODULE** (`src/action/dof-actions.ts`)

**Function to Modify:** `createDof()`

**Add After DOF Creation:**
```typescript
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getDofWorkflowId, buildDofMetadata } from "@/lib/workflow/workflow-integration";

// ... after DOF is created ...

const workflowId = await getDofWorkflowId();

if (workflowId) {
  await startWorkflow({
    workflowDefinitionId: workflowId,
    entityType: "DOF",
    entityId: dof.id,
    entityMetadata: buildDofMetadata(dof),
  });
}
```

**Note:** DOF has 8-step CAPA workflow. You may want to sync DOF step transitions with workflow transitions.

---

### **FINDING MODULE** (`src/action/finding-actions.ts`)

**Function to Modify:** `requestFindingClosure()` or similar

**Add When Closure Requested:**
```typescript
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getFindingWorkflowId, buildFindingMetadata } from "@/lib/workflow/workflow-integration";

// ... when finding closure is requested ...

const workflowId = await getFindingWorkflowId();

if (workflowId) {
  await startWorkflow({
    workflowDefinitionId: workflowId,
    entityType: "Finding",
    entityId: finding.id,
    entityMetadata: buildFindingMetadata(finding),
  });
}
```

---

## 🔍 TESTING INTEGRATION

### **1. Check Workflow Definitions Exist**

Add debug endpoint:

```typescript
// src/app/api/admin/workflows/definitions/route.ts
import { NextResponse } from "next/server";
import { getAllWorkflowDefinitions } from "@/lib/workflow/workflow-integration";

export async function GET() {
  const definitions = await getAllWorkflowDefinitions();
  return NextResponse.json(definitions);
}
```

Visit: `http://localhost:3000/api/admin/workflows/definitions`

### **2. Verify Workflow Started**

Query database:
```sql
SELECT * FROM "WorkflowInstance" 
WHERE "entityType" = 'Audit' 
ORDER BY "createdAt" DESC LIMIT 10;
```

### **3. Check Assignments Created**

```sql
SELECT * FROM "StepAssignment" 
WHERE "workflowInstanceId" = 'YOUR_WORKFLOW_ID';
```

---

## 🚨 COMMON ISSUES

### **Issue 1: Workflow Definition Not Found**

**Symptom:** `workflowId` is null

**Solution:** 
1. Verify migrations ran: `migrations/seed-workflow-definitions.sql`
2. Check definition names match exactly
3. Verify `isActive = true`

### **Issue 2: Assignment Not Created**

**Symptom:** Workflow starts but no assignments

**Solution:**
1. Check workflow definition has correct steps
2. Verify `assignedRole` or `assignedUser` is set
3. Check auto-assignment logic

### **Issue 3: Deadline Not Working**

**Symptom:** No escalations happening

**Solution:**
1. Verify cron job is running
2. Check environment variable: `CRON_SECRET`
3. Test manually: `curl http://localhost:3000/api/cron/workflow-deadline-check`

---

## 📊 MONITORING

### **Get My Workflow Tasks**

```typescript
import { getMyWorkflowTasks } from "@/server/actions/workflow-actions";

const result = await getMyWorkflowTasks();
console.log("My tasks:", result.data);
```

### **Check Deadline Stats**

```typescript
import { getDeadlineStats } from "@/lib/workflow/deadline-monitor";

const stats = await getDeadlineStats();
console.log("Deadline stats:", stats);
// { total: 10, onTime: 5, approaching: 3, overdue: 2 }
```

### **Get Assignment Stats by Role**

```typescript
import { getAssignmentStats } from "@/lib/workflow/auto-assignment";

const stats = await getAssignmentStats("manager");
console.log("Manager workload:", stats);
```

---

## 🎨 UI INTEGRATION (Future)

Once you build the UI components, integrate like this:

### **Show My Tasks**

```tsx
// In your dashboard or tasks page
import { getMyWorkflowTasks } from "@/server/actions/workflow-actions";

export default async function MyTasksPage() {
  const { data: tasks } = await getMyWorkflowTasks();

  return (
    <div>
      <h1>My Workflow Tasks</h1>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### **Approve/Reject Actions**

```tsx
"use client";
import { transitionWorkflow } from "@/server/actions/workflow-actions";

export function ApproveButton({ workflowInstanceId }: Props) {
  const handleApprove = async () => {
    await transitionWorkflow({
      workflowInstanceId,
      action: "approve",
      comment: "Looks good!",
    });
  };

  return <Button onClick={handleApprove}>Approve</Button>;
}
```

---

## 🔧 ADVANCED: CUSTOM WORKFLOWS

### **Create New Workflow Definition**

```sql
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions"
) VALUES (
  'My Custom Flow',
  'Custom workflow for special cases',
  'Audit',
  1,
  true,
  '[
    {"id": "start", "name": "Draft", "type": "start"},
    {"id": "review", "name": "Review", "type": "approval", "assignedRole": "manager"},
    {"id": "end", "name": "Complete", "type": "end"}
  ]'::jsonb,
  '[
    {"from": "start", "to": "review", "action": "submit"},
    {"from": "review", "to": "end", "action": "approve"}
  ]'::jsonb
);
```

### **Use Custom Workflow**

```typescript
const customWorkflowId = await getWorkflowDefinitionId("My Custom Flow");
```

---

## 📞 TROUBLESHOOTING CHECKLIST

Before asking for help:

- [ ] Migrations ran successfully
- [ ] Workflow definitions seeded
- [ ] Database has WorkflowDefinition, WorkflowInstance, StepAssignment tables
- [ ] Integration code added to module
- [ ] startWorkflow() called after entity creation
- [ ] Verified workflow ID is not null
- [ ] Checked database for WorkflowInstance record
- [ ] Tested with console.log() statements

---

## 🎯 INTEGRATION PRIORITY

**Do First (Required for Production):**
1. ✅ Audit module - Most important
2. ✅ Action module - CAPA workflow
3. ✅ DOF module - If you use DOF

**Do Later (Optional):**
4. Finding module - If you want closure workflow

**Skip for Now:**
- Custom workflows
- Parallel approvals
- Analytics

---

## 📝 EXAMPLE: COMPLETE AUDIT INTEGRATION

```typescript
// src/action/audit-plan-actions.ts

import { startWorkflow } from "@/server/actions/workflow-actions";
import { getAuditWorkflowId, buildAuditMetadata } from "@/lib/workflow/workflow-integration";

export async function startAdhocAudit(data: {
  title: string;
  departmentId: string;
  templateId: string;
  // ... other fields
}): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // 1. Create audit
    const [audit] = await db.insert(audits).values({
      title: data.title,
      departmentId: data.departmentId,
      templateId: data.templateId,
      auditorId: user.id,
      status: "InProgress",
      riskLevel: "medium", // Calculate this
    }).returning();

    // 2. Load questions from template
    await loadQuestionsFromTemplate(audit.id, data.templateId);

    // 3. START WORKFLOW ⭐ NEW!
    try {
      const workflowId = await getAuditWorkflowId({
        riskLevel: audit.riskLevel,
        totalScore: 0,
        departmentId: audit.departmentId,
      });

      if (workflowId) {
        const workflowResult = await startWorkflow({
          workflowDefinitionId: workflowId,
          entityType: "Audit",
          entityId: audit.id,
          entityMetadata: buildAuditMetadata(audit),
        });

        if (!workflowResult.success) {
          console.error("Workflow start failed:", workflowResult.error);
          // Continue anyway - workflow is optional
        }
      }
    } catch (error) {
      console.error("Workflow integration error:", error);
      // Don't fail audit creation if workflow fails
    }

    // 4. Return success
    revalidateAuditPaths();

    return {
      success: true,
      message: "Audit started successfully",
      data: audit,
    };
  });
}
```

---

**🎉 You're Ready to Integrate!**

Start with Audit module, test thoroughly, then move to Action and DOF modules.

**Questions?** Check `WORKFLOW-PROGRESS-TRACKER.md` for detailed status and next steps.
