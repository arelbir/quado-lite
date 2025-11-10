# Workflow Engine - Detaylı Analiz

**Tarih:** 2025-01-07  
**Dosya:** `src/server/actions/workflow-actions.ts`  
**Integration:** `src/lib/workflow/`

---

## 🎯 Genel Bakış

Workflow Engine, sistemdeki iş akışlarını dinamik olarak yöneten, veritabanı tabanlı bir süreç motoru

dur.

### Özellikler

✅ **Visual Workflow Builder** - Drag & drop UI  
✅ **Dynamic Step Assignment** - Auto-assignment strategies  
✅ **Deadline Monitoring** - Automatic escalation  
✅ **Condition Evaluation** - JSON-based rules  
✅ **Delegation Support** - Task reassignment  
✅ **Timeline Tracking** - Complete audit trail  
✅ **Entity Integration** - Audit, Finding, Action, DOF

---

## 🗄️ Database Schema

### WorkflowDefinitions Table

```typescript
{
  id: string;
  name: string;                    // "Action Quick Flow", "DOF Standard CAPA Flow"
  entityType: string;              // "Action", "DOF", "Audit", "Finding"
  description?: string;
  version: number;                 // 1, 2, 3... (versioning support)
  steps: WorkflowStep[];           // JSON - Step definitions
  transitions: WorkflowTransition[]; // JSON - Transitions between steps
  vetoRoles?: string[];            // ["SUPER_ADMIN"] - Can veto workflow
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### WorkflowInstances Table

```typescript
{
  id: string;
  workflowDefinitionId: string;   // FK → WorkflowDefinitions
  entityType: string;              // "Action", "DOF"
  entityId: string;                // Action/DOF ID
  currentStep: string;             // Current step ID
  status: "in_progress" | "completed" | "cancelled";
  metadata: Record<string, any>;  // Entity metadata (for conditions)
  startedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
}
```

### StepAssignments Table

```typescript
{
  id: string;
  workflowInstanceId: string;     // FK → WorkflowInstances
  stepId: string;                 // Step ID from definition
  assignedUserId?: string;        // FK → User (if user assignment)
  assignedRole?: string;          // Role code (if role assignment)
  status: "pending" | "in_progress" | "completed" | "rejected" | "cancelled";
  deadline: Date;
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  comment?: string;
}
```

### WorkflowTimeline Table

```typescript
{
  id: string;
  workflowInstanceId: string;     // FK → WorkflowInstances
  event: string;                  // "workflow_started", "step_completed", "step_rejected"
  stepId?: string;
  userId?: string;                // Who triggered the event
  metadata?: Record<string, any>;
  timestamp: Date;
}
```

### WorkflowDelegations Table

```typescript
{
  id: string;
  assignmentId: string;           // FK → StepAssignments
  fromUserId: string;             // FK → User (delegator)
  toUserId: string;               // FK → User (delegate)
  reason?: string;
  createdAt: Date;
}
```

---

## 📐 Workflow Definition Structure

### WorkflowStep Interface

```typescript
interface WorkflowStep {
  id: string;                      // "step-1", "step-approval"
  name: string;                    // "Complete Action", "Manager Approval"
  order: number;                   // 1, 2, 3...
  assignmentType: "user" | "role"; // Atama tipi
  assignmentStrategy?: "round_robin" | "load_balanced"; // Auto-assignment
  assignedUserId?: string;         // Specific user (if assignmentType="user")
  assignedRole?: string;           // Specific role (if assignmentType="role")
  deadline?: string;               // "3d", "1w", "24h"
  requiredAction: "approve" | "review" | "complete"; // Required action type
  allowReject: boolean;            // Can reject?
  allowDelegate: boolean;          // Can delegate?
}
```

### WorkflowTransition Interface

```typescript
interface WorkflowTransition {
  from: string;                    // From step ID
  to: string;                      // To step ID
  condition?: WorkflowCondition;   // Optional condition
  label: string;                   // "Approve", "Reject", "Next"
}
```

### WorkflowCondition Interface

```typescript
interface WorkflowCondition {
  field: string;                   // Metadata field name
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains";
  value: any;                      // Value to compare
}
```

**Condition Evaluation Örneği:**

```typescript
{
  field: "priority",
  operator: "eq",
  value: "high"
}

// Evaluates to: metadata.priority === "high"
```

---

## ⚙️ Workflow Actions

### 1. Start Workflow

```typescript
export async function startWorkflow(data: {
  workflowDefinitionId: string;
  entityType: string;
  entityId: string;
  entityMetadata: Record<string, any>;
}): Promise<ActionResponse<{ id: string }>>
```

**Akış:**

```
1. Fetch workflow definition
   └─ workflowDefinitions.findFirst()

2. Create workflow instance
   └─ workflowInstances.insert({
        definitionId,
        entityType,
        entityId,
        currentStep: firstStep.id,
        status: "in_progress",
        metadata
      })

3. Determine first step
   └─ steps.sort(by order)[0]

4. Apply auto-assignment (if configured)
   └─ getNextAssignee(strategy, role)

5. Create step assignment
   └─ stepAssignments.insert({
        workflowInstanceId,
        stepId: firstStep.id,
        assignedUserId or assignedRole,
        deadline: parseDeadline(firstStep.deadline),
        status: "pending"
      })

6. Create timeline event
   └─ workflowTimeline.insert({
        event: "workflow_started",
        userId: currentUser.id
      })
```

**Kullanım (Action):**

```typescript
// src/server/actions/action-actions.ts

export async function createAction(data: {...}): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // 1. Create action
    const [action] = await db.insert(actions).values({...}).returning();

    // 2. Start workflow
    try {
      const workflowId = await getActionWorkflowId({
        priority: action.priority,
        type: action.type,
      });

      if (workflowId) {
        await startWorkflow({
          workflowDefinitionId: workflowId,
          entityType: "Action",
          entityId: action.id,
          entityMetadata: buildActionMetadata(action),
        });
      }
    } catch (error) {
      console.error("Workflow start failed:", error);
    }

    return { success: true, data: { id: action.id } };
  });
}
```

### 2. Complete Step

```typescript
export async function completeStep(data: {
  workflowInstanceId: string;
  stepId: string;
  action: "approve" | "reject" | "complete";
  comment?: string;
}): Promise<ActionResponse>
```

**Akış:**

```
1. Permission check
   └─ checkPermission(user, "workflow", action, {workflowInstanceId})

2. Fetch workflow instance + definition
   └─ workflowInstances.findFirst({ with: { definition: true } })

3. Find current assignment
   └─ stepAssignments.findFirst({ where: { stepId, status: "in_progress" } })

4. Validate user is assigned
   └─ assignment.assignedUserId === user.id OR
      user.roles.includes(assignment.assignedRole)

5. Update assignment status
   └─ stepAssignments.update({
        status: action === "approve" ? "completed" : "rejected",
        completedAt: new Date(),
        completedBy: user.id,
        comment
      })

6. Determine next step
   ├─ If approved → Find transition where from=currentStep
   │  └─ Evaluate condition (if any)
   │     └─ evaluateCondition(metadata, transition.condition)
   └─ If rejected → Find rejection transition OR end workflow

7. Create new step assignment (if next step exists)
   └─ stepAssignments.insert({
        workflowInstanceId,
        stepId: nextStep.id,
        assignedUserId or assignedRole,
        deadline,
        status: "pending"
      })

8. Update workflow instance
   ├─ If has next step → currentStep = nextStep.id
   └─ If no next step → status = "completed", completedAt = new Date()

9. Create timeline event
   └─ workflowTimeline.insert({
        event: action === "approve" ? "step_completed" : "step_rejected",
        stepId,
        userId: user.id,
        metadata: { comment }
      })
```

**Kullanım (Action Manager Approval):**

```typescript
// src/server/actions/action-actions.ts

export async function managerApproveAction(
  actionId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    // Update action status
    await db
      .update(actions)
      .set({ status: "Completed", approvedAt: new Date() })
      .where(eq(actions.id, actionId));

    // Complete workflow step (if workflow exists)
    if (action.workflowInstanceId) {
      await completeStep({
        workflowInstanceId: action.workflowInstanceId,
        stepId: "step-approval",
        action: "approve",
      });
    }

    return { success: true };
  });
}
```

### 3. Delegate Assignment

```typescript
export async function delegateAssignment(data: {
  assignmentId: string;
  toUserId: string;
  reason?: string;
}): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch assignment
   └─ stepAssignments.findFirst()

2. Permission check
   └─ assignment.assignedUserId === user.id OR isAdmin(user)

3. Check if delegation allowed
   └─ step.allowDelegate === true

4. Create delegation record
   └─ workflowDelegations.insert({
        assignmentId,
        fromUserId: user.id,
        toUserId,
        reason
      })

5. Update assignment
   └─ stepAssignments.update({
        assignedUserId: toUserId
      })

6. Notify delegate
   └─ createNotification(toUserId, "Task delegated to you")

7. Create timeline event
   └─ workflowTimeline.insert({
        event: "assignment_delegated",
        metadata: { fromUserId, toUserId, reason }
      })
```

---

## 🤖 Auto-Assignment Strategies

**Dosya:** `src/lib/workflow/auto-assignment.ts`

### 1. Round Robin

**Strateji:** Sırayla atama

```typescript
type: "round_robin"
assignedRole: "AUDITOR"
```

**Algoritma:**

```typescript
async function roundRobinAssignment(roleCode: string): Promise<string> {
  // 1. Get all users with this role
  const users = await getUsersByRole(roleCode);

  // 2. Get last assigned user for this role
  const lastAssignment = await getLastAssignment(roleCode);

  // 3. Find next user in list
  const currentIndex = users.findIndex((u) => u.id === lastAssignment?.userId);
  const nextIndex = (currentIndex + 1) % users.length;

  return users[nextIndex].id;
}
```

**Use Case:** Denetçiler arasında eşit görev dağılımı

### 2. Load Balanced

**Strateji:** En az yüklü kullanıcıya ata

```typescript
type: "load_balanced"
assignedRole: "PROCESS_OWNER"
```

**Algoritma:**

```typescript
async function loadBalancedAssignment(roleCode: string): Promise<string> {
  // 1. Get all users with this role
  const users = await getUsersByRole(roleCode);

  // 2. Count active assignments for each user
  const userLoads = await Promise.all(
    users.map(async (u) => ({
      userId: u.id,
      activeCount: await countActiveAssignments(u.id),
    }))
  );

  // 3. Sort by load (ascending)
  userLoads.sort((a, b) => a.activeCount - b.activeCount);

  // 4. Return user with least load
  return userLoads[0].userId;
}
```

**Use Case:** Süreç sahipleri arasında yük dengeleme

### 3. Specific User

**Strateji:** Belirli kullanıcıya ata

```typescript
type: "specific_user"
assignedUserId: "user-123"
```

**Use Case:** Yönetici onayı (belirli manager)

### 4. Specific Role

**Strateji:** Belirli role'e ata (ilk uygun kullanıcı)

```typescript
type: "specific_role"
assignedRole: "MANAGER"
```

**Use Case:** Herhangi bir yönetici onaylayabilir

---

## ⏰ Deadline Monitoring

**Dosya:** `src/lib/workflow/deadline-monitor.ts`

### Deadline Format

```typescript
"3d"  → 3 days
"1w"  → 1 week
"24h" → 24 hours
"2h"  → 2 hours
```

### Parsing

```typescript
function parseDeadline(deadlineStr: string | undefined): Date {
  const now = Date.now();
  
  if (!deadlineStr) {
    return new Date(now + DEFAULT_DEADLINE_DAYS * MS_PER_DAY);
  }

  const match = deadlineStr.match(/^(\d+)([hdw])$/);
  if (!match) {
    return new Date(now + DEFAULT_DEADLINE_DAYS * MS_PER_DAY);
  }

  const value = parseInt(match[1]);
  const unit = match[2] as "h" | "d" | "w";

  const multipliers = {
    h: MS_PER_HOUR,
    d: MS_PER_DAY,
    w: MS_PER_WEEK,
  };

  return new Date(now + value * multipliers[unit]);
}
```

### Escalation

```typescript
export async function escalateAssignment(
  assignmentId: string
): Promise<void> {
  // 1. Fetch assignment
  const assignment = await db.query.stepAssignments.findFirst({
    where: eq(stepAssignments.id, assignmentId),
    with: {
      workflowInstance: {
        with: {
          definition: true,
        },
      },
    },
  });

  if (!assignment || assignment.status !== "pending") {
    return;
  }

  // 2. Check if deadline passed
  const now = new Date();
  if (now < assignment.deadline) {
    return;
  }

  // 3. Notify assigned user
  await createNotification({
    userId: assignment.assignedUserId,
    type: "deadline_exceeded",
    title: "Task Overdue",
    message: `Your task has exceeded the deadline`,
    entityType: "StepAssignment",
    entityId: assignmentId,
  });

  // 4. Notify manager (escalation)
  const manager = await getManagerOf(assignment.assignedUserId);
  if (manager) {
    await createNotification({
      userId: manager.id,
      type: "escalation",
      title: "Task Escalation",
      message: `Task assigned to ${assignment.assignedUser?.name} is overdue`,
    });
  }

  // 5. Create timeline event
  await db.insert(workflowTimeline).values({
    workflowInstanceId: assignment.workflowInstanceId,
    event: "deadline_exceeded",
    stepId: assignment.stepId,
    metadata: {
      assignedUserId: assignment.assignedUserId,
      deadline: assignment.deadline,
    },
    timestamp: new Date(),
  });
}
```

### Cron Job (Monitoring)

```typescript
// Run every hour
async function monitorDeadlines() {
  // 1. Get all pending assignments with approaching deadlines
  const now = new Date();
  const warningThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

  const assignments = await db.query.stepAssignments.findMany({
    where: and(
      eq(stepAssignments.status, "pending"),
      lte(stepAssignments.deadline, warningThreshold)
    ),
  });

  // 2. Send warnings
  for (const assignment of assignments) {
    await sendDeadlineWarning(assignment);
  }

  // 3. Escalate overdue assignments
  const overdueAssignments = assignments.filter(
    (a) => a.deadline < now
  );

  for (const assignment of overdueAssignments) {
    await escalateAssignment(assignment.id);
  }
}
```

---

## 🔗 Entity Integration

**Dosya:** `src/lib/workflow/workflow-integration.ts`

### Workflow Selection

**Action Module:**

```typescript
export async function getActionWorkflowId(actionData: {
  priority?: string;
  type?: string;
  findingId?: string;
}): Promise<string | null> {
  // High priority or corrective actions use complex flow (4 steps)
  if (actionData.priority === "high" || actionData.type === "Corrective") {
    return await getWorkflowDefinitionId("Action Complex Flow");
  }

  // Normal actions use quick flow (2 steps)
  return await getWorkflowDefinitionId("Action Quick Flow");
}
```

**DOF Module:**

```typescript
export async function getDofWorkflowId(): Promise<string | null> {
  return await getWorkflowDefinitionId("DOF Standard CAPA Flow");
}
```

**Audit Module:**

```typescript
export async function getAuditWorkflowId(auditData: {
  riskLevel?: string;
  totalScore?: number;
  departmentId?: string;
  findingsCount?: number;
}): Promise<string | null> {
  // High-risk audits use critical flow (manager approval)
  if (
    auditData.riskLevel === "high" || 
    (auditData.totalScore && auditData.totalScore > 80) ||
    (auditData.findingsCount && auditData.findingsCount > 5)
  ) {
    return await getWorkflowDefinitionId("Audit Critical Flow");
  }

  // Normal audits use normal flow
  return await getWorkflowDefinitionId("Audit Normal Flow");
}
```

### Metadata Builders

**Action Metadata:**

```typescript
export async function buildActionMetadata(action: any) {
  const customFields = await getCustomFieldValues('ACTION', action.id);

  return {
    // Core fields (for conditions)
    priority: action.priority || "medium",
    type: action.type,
    findingId: action.findingId,
    assignedTo: action.assignedToId,
    dueDate: action.dueDate,
    
    // Custom fields (available in workflow conditions)
    customFields,
  };
}
```

**DOF Metadata:**

```typescript
export async function buildDofMetadata(dof: any) {
  const customFields = await getCustomFieldValues('DOF', dof.id);

  return {
    findingId: dof.findingId,
    currentStep: dof.currentStep || 1,
    assignedTo: dof.assignedToId,
    managerId: dof.managerId,
    customFields,
  };
}
```

---

## 📊 Workflow Examples

### Example 1: Action Quick Flow

**Definition:**

```typescript
{
  name: "Action Quick Flow",
  entityType: "Action",
  steps: [
    {
      id: "step-complete",
      name: "Complete Action",
      order: 1,
      assignmentType: "user",
      // assignedUserId will be set from action.assignedToId
      deadline: "3d",
      requiredAction: "complete",
      allowReject: false,
      allowDelegate: true,
    },
    {
      id: "step-approval",
      name: "Manager Approval",
      order: 2,
      assignmentType: "user",
      // assignedUserId will be set from action.managerId
      deadline: "2d",
      requiredAction: "approve",
      allowReject: true,
      allowDelegate: false,
    },
  ],
  transitions: [
    {
      from: "step-complete",
      to: "step-approval",
      label: "Submit for Approval",
    },
    {
      from: "step-approval",
      to: null, // End workflow
      label: "Approve",
    },
  ],
}
```

**Flow:**

```
1. User creates action
   └─ Workflow starts
   └─ Step 1: "Complete Action" assigned to action.assignedToId

2. Assigned user completes action
   └─ completeStep(step-complete, "complete")
   └─ Transition: step-complete → step-approval
   └─ Step 2: "Manager Approval" assigned to action.managerId

3. Manager approves
   └─ completeStep(step-approval, "approve")
   └─ Workflow completed
   └─ Action status: "Completed"
```

### Example 2: DOF Standard CAPA Flow

**Definition:**

```typescript
{
  name: "DOF Standard CAPA Flow",
  entityType: "DOF",
  steps: [
    {
      id: "step-1-6",
      name: "Complete Steps 1-6",
      order: 1,
      assignmentType: "user",
      // assignedUserId from dof.assignedToId
      deadline: "2w",
      requiredAction: "complete",
      allowReject: false,
      allowDelegate: true,
    },
    {
      id: "step-7-approval",
      name: "Manager Approval",
      order: 2,
      assignmentType: "user",
      // assignedUserId from dof.managerId
      deadline: "3d",
      requiredAction: "approve",
      allowReject: true,
      allowDelegate: false,
    },
  ],
  transitions: [
    {
      from: "step-1-6",
      to: "step-7-approval",
      label: "Submit for Approval",
    },
    {
      from: "step-7-approval",
      to: null,
      label: "Approve",
    },
    {
      from: "step-7-approval",
      to: "step-1-6", // Rejection loop
      label: "Reject",
    },
  ],
}
```

**Flow:**

```
1. User creates DOF
   └─ Workflow starts
   └─ Step 1: "Complete Steps 1-6" assigned to dof.assignedToId

2. Assigned user completes all 8 steps
   └─ completeStep(step-1-6, "complete")
   └─ Transition: step-1-6 → step-7-approval
   └─ Step 2: "Manager Approval" assigned to dof.managerId

3a. Manager approves
    └─ completeStep(step-7-approval, "approve")
    └─ Workflow completed
    └─ DOF status: "Completed"

3b. Manager rejects (LOOP!)
    └─ completeStep(step-7-approval, "reject", "Need more analysis")
    └─ Transition: step-7-approval → step-1-6
    └─ Step 1 assigned again to dof.assignedToId
    └─ Assigned user fixes issues and resubmits
```

---

## ✅ Sonraki: İş Akışları (Business Workflows)

Şimdi Action, DOF, Finding workflow'larının detaylarını inceleyelim → `04-BUSINESS-WORKFLOWS.md`
