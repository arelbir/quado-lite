# İş Akışları - Detaylı Analiz

**Tarih:** 2025-01-07

---

## 📋 İçindekiler

1. [Action Workflow (CAPA)](#1-action-workflow-capa)
2. [DOF Workflow (8-Step CAPA)](#2-dof-workflow-8-step-capa)
3. [Finding Workflow](#3-finding-workflow)
4. [Audit Workflow](#4-audit-workflow)

---

## 1. Action Workflow (CAPA)

**Dosya:** `src/server/actions/action-actions.ts`  
**UI:** `/denetim/actions`, `/denetim/actions/[id]`

### Status Flow Diagram

```
┌──────────┐
│ Assigned │ ←─────────────┐
└─────┬────┘                │
      │ completeAction()    │
      ↓                     │
┌─────────────────────┐     │
│ PendingManager      │     │ managerRejectAction()
│ Approval            │     │ (LOOP BACK!)
└──────┬──────────────┘     │
       │                    │
       ├────────────────────┘
       │
       │ managerApproveAction()
       ↓
┌───────────┐
│ Completed │
└───────────┘

EXIT STRATEGY:
┌──────────┐
│ Assigned │
│    or    │ ─── cancelAction() ───→ ┌───────────┐
│ Pending  │                          │ Cancelled │
└──────────┘                          └───────────┘
                                      (FINAL STATE)
```

### Database Schema

```typescript
{
  id: string;
  findingId: string;              // FK → Findings
  details: string;                // Action details
  assignedToId: string;           // FK → User (responsible)
  managerId?: string;             // FK → User (approver)
  status: "Assigned" | "PendingManagerApproval" | "Completed" | "Cancelled";
  dueDate?: Date;
  completionNotes?: string;       // Notes when completing
  completedAt?: Date;
  rejectionReason?: string;       // Reason when rejected
  approvedAt?: Date;
  createdById: string;
  workflowInstanceId?: string;    // FK → WorkflowInstances
}
```

### 1. Create Action

**Function:** `createAction()`

```typescript
export async function createAction(data: {
  findingId: string;
  details: string;
  assignedToId: string;
  managerId?: string | null;
  dueDate?: Date;
}): Promise<ActionResponse<{ id: string }>>
```

**Akış:**

```
1. Validate finding exists
   └─ db.query.findings.findFirst({ where: eq(findingId) })

2. Permission check (unified)
   └─ checkPermission(user, "action", "create", finding)
   └─ Sources: Admin | Role-based | Ownership (process owner)

3. Create action
   └─ db.insert(actions).values({
        findingId,
        details,
        assignedToId,
        managerId,
        dueDate,
        status: "Assigned",
        createdById: user.id
      })

4. Update finding status
   └─ db.update(findings)
        .set({ status: "InProgress" })
        .where(eq(id, findingId))

5. Start workflow (optional)
   └─ getActionWorkflowId({ priority, type })
   └─ startWorkflow({
        definitionId: workflowId,
        entityType: "Action",
        entityId: action.id,
        metadata: buildActionMetadata(action)
      })

6. Revalidate paths
   └─ revalidateFindingPaths({ list: true })
   └─ revalidateActionPaths({ list: true })
```

**Permission Requirements:**
- ✅ Admin (bypass)
- ✅ Has `action.create` permission
- ✅ Finding process owner (ownership-based)

### 2. Complete Action

**Function:** `completeAction()`

```typescript
export async function completeAction(
  actionId: string,
  completionNotes: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch action
   └─ db.query.actions.findFirst()

2. Permission check
   └─ checkPermission(user, "action", "complete", action)
   └─ Sources: Admin | Workflow (assigned user) | Ownership

3. Validate status
   └─ Must be "Assigned"
   └─ Else: Error "Action already completed or pending approval"

4. Update action
   └─ db.update(actions).set({
        status: "PendingManagerApproval",
        completionNotes,
        completedAt: new Date()
      })

5. Complete workflow step (if exists)
   └─ if (workflowInstanceId) {
        completeStep({
          workflowInstanceId,
          stepId: "step-complete",
          action: "complete"
        })
      }

6. Notify manager
   └─ createNotification(managerId, "Action completed, awaiting approval")

7. Revalidate
   └─ revalidateActionPaths({ detail: actionId, list: true })
```

**Permission Requirements:**
- ✅ Admin
- ✅ Assigned user (assignedToId)
- ✅ Workflow-based (if workflow active)

### 3. Manager Approve Action

**Function:** `managerApproveAction()`

```typescript
export async function managerApproveAction(
  actionId: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch action
   └─ db.query.actions.findFirst()

2. Permission check
   └─ checkPermission(user, "action", "approve", action)
   └─ Sources: Admin | Role-based (manager) | Workflow

3. Validate status
   └─ Must be "PendingManagerApproval"

4. Update action
   └─ db.update(actions).set({
        status: "Completed",
        approvedAt: new Date()
      })

5. Complete workflow (if exists)
   └─ completeStep({
        workflowInstanceId,
        stepId: "step-approval",
        action: "approve"
      })

6. Check finding completion
   └─ checkAuditCompletionStatus(action.findingId)
   └─ If all actions/DOFs completed → Allow finding closure

7. Notify assigned user
   └─ createNotification(assignedToId, "Your action has been approved")

8. Revalidate
   └─ revalidateActionPaths({ detail: actionId, list: true })
   └─ revalidateFindingPaths({ detail: findingId })
```

**Permission Requirements:**
- ✅ Admin
- ✅ Manager (managerId)
- ✅ Has `action.approve` permission
- ✅ Workflow-based (if workflow active)

### 4. Manager Reject Action (LOOP!)

**Function:** `managerRejectAction()`

```typescript
export async function managerRejectAction(
  actionId: string,
  reason: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch action
   └─ db.query.actions.findFirst()

2. Permission check
   └─ checkPermission(user, "action", "reject", action)

3. Validate status
   └─ Must be "PendingManagerApproval"

4. Update action (BACK TO ASSIGNED!)
   └─ db.update(actions).set({
        status: "Assigned",          // ⭐ LOOP BACK!
        rejectionReason: reason,
        completedAt: null,            // Reset
        completionNotes: null         // Reset
      })

5. Reject workflow step (if exists)
   └─ completeStep({
        workflowInstanceId,
        stepId: "step-approval",
        action: "reject",
        comment: reason
      })

6. Notify assigned user
   └─ createNotification(assignedToId, {
        title: "Action Rejected",
        message: reason,
        link: `/denetim/actions/${actionId}`
      })

7. Revalidate
   └─ revalidateActionPaths({ detail: actionId, list: true })
```

**CAPA Compliance - Rejection Loop:**

```
Timeline Example:
─────────────────────────────────────────────────────
2025-01-01: Created (Assigned)
2025-01-03: Completed (Notes: "Fixed bug")
2025-01-04: Rejected (Reason: "Test eksik")
            Status → Assigned (LOOP!)
2025-01-05: Progress Note: "Test cases eklendi"
2025-01-06: Completed (Notes: "Fixed + tested")
2025-01-07: Rejected (Reason: "Döküman eksik")
            Status → Assigned (LOOP AGAIN!)
2025-01-08: Progress Note: "README updated"
2025-01-09: Completed (Notes: "All done")
2025-01-10: Approved ✅
```

### 5. Cancel Action (Exit Strategy)

**Function:** `cancelAction()`

```typescript
export async function cancelAction(
  actionId: string,
  reason: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch action
   └─ db.query.actions.findFirst()

2. Permission check
   └─ checkPermission(user, "action", "cancel", action)
   └─ Sources: Admin | Creator (createdById)

3. Validate status
   └─ Must be "Assigned" or "PendingManagerApproval"
   └─ Cannot cancel "Completed" or "Cancelled" actions

4. Update action (FINAL STATE!)
   └─ db.update(actions).set({
        status: "Cancelled",          // ⭐ FINAL!
        rejectionReason: reason
      })

5. Cancel workflow (if exists)
   └─ cancelWorkflow(workflowInstanceId)

6. Create timeline event
   └─ "Action cancelled: {reason}"

7. Revalidate
   └─ revalidateActionPaths({ detail: actionId, list: true })
```

**Use Cases:**
- Gereksiz aksiyon (artık gerekli değil)
- Sonsuz döngü (birkaç kez reddedildi)
- Proje iptali
- Yanlış aksiyon oluşturuldu

### 6. Add Action Progress

**Function:** `addActionProgress()`

```typescript
export async function addActionProgress(
  actionId: string,
  note: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch action
   └─ db.query.actions.findFirst()

2. Permission check
   └─ Must be assigned user (assignedToId)

3. Validate status
   └─ Must be "Assigned"

4. Create progress note
   └─ db.insert(actionProgress).values({
        actionId,
        note,
        createdById: user.id
      })

5. Revalidate
   └─ revalidateActionPaths({ detail: actionId })
```

**Timeline Display:**

```
Timeline:
─────────────────────────────────────────────────────
2025-01-01: Action Created
2025-01-02: Progress Note: "Analiz yapıldı"
2025-01-03: Progress Note: "Fix uygulandı"
2025-01-04: Completed
2025-01-05: Approved ✅
```

---

## 2. DOF Workflow (8-Step CAPA)

**Dosya:** `src/server/actions/dof-actions.ts`  
**UI:** `/denetim/dofs`, `/denetim/dofs/[id]`

### Status Flow Diagram

```
Step1_Problem ──→ Step2_TempMeasures ──→ Step3_RootCause ──→
Step4_Activities ──→ Step5_Implementation ──→
Step6_Effectiveness ──→ PendingManagerApproval ──→ Completed
                                 │
                                 │ rejectDof()
                                 ↓
                         ┌───────────────┐
                         │ LOOP BACK TO  │
                         │ CURRENT STEP  │
                         └───────────────┘
```

### Database Schema

```typescript
{
  id: string;
  findingId: string;              // FK → Findings
  problemTitle: string;
  problemDetails?: string;
  assignedToId: string;           // FK → User
  managerId: string;              // FK → User
  status: "Step1_Problem" | "Step2_TempMeasures" | ... | "Completed";
  currentStep: number;            // 1-7
  
  // Step 1: Problem Definition (5N1K)
  what?: string;
  where?: string;
  when?: string;
  who?: string;
  how?: string;
  why?: string;
  
  // Step 2: Temporary Measures
  tempMeasures?: string;
  tempMeasureDate?: Date;
  tempMeasureEffective?: boolean;
  
  // Step 3: Root Cause Analysis
  analysisMethod?: "5why" | "fishbone" | "freeform";
  why1?: string;
  why2?: string;
  why3?: string;
  why4?: string;
  why5?: string;
  rootCause?: string;
  fishboneUrl?: string;
  rootCauseAnalysis?: string;
  
  // Step 6: Effectiveness Check
  effectiveDate?: Date;
  effectiveResult?: string;
  isEffective?: boolean;
  
  // Approval
  submittedAt?: Date;
  rejectionReason?: string;
  approvedAt?: Date;
  
  createdById: string;
  workflowInstanceId?: string;
}
```

### 8-Step Process

#### Step 1: Problem Definition (5N1K)

**Function:** `updateDofStep()` with step=1

```typescript
{
  step: 1,
  data: {
    what: "What happened?",
    where: "Where did it happen?",
    when: "When did it happen?",
    who: "Who was involved?",
    how: "How did it happen?",
    why: "Why did it happen?"
  }
}
```

**UI:** Form with 6 textarea fields

**Validation:**
- All 6 fields required
- Minimum 10 characters each

**Next:** Status → "Step2_TempMeasures"

#### Step 2: Temporary Measures

```typescript
{
  step: 2,
  data: {
    tempMeasures: "Actions taken immediately",
    tempMeasureDate: Date,
    tempMeasureEffective: boolean
  }
}
```

**Purpose:** Hemen alınan geçici önlemler

**Next:** Status → "Step3_RootCause"

#### Step 3: Root Cause Analysis ⭐

**3 Methods:**

**A. 5 Why Method:**

```typescript
{
  step: 3,
  data: {
    analysisMethod: "5why",
    why1: "First why?",
    why2: "Second why?",
    why3: "Third why?",
    why4: "Fourth why?",
    why5: "Fifth why?",
    rootCause: "Final root cause conclusion"
  }
}
```

**B. Fishbone Diagram:**

```typescript
{
  step: 3,
  data: {
    analysisMethod: "fishbone",
    fishboneUrl: "https://example.com/diagram.png",
    rootCause: "Root cause identified from diagram"
  }
}
```

**C. Freeform Analysis:**

```typescript
{
  step: 3,
  data: {
    analysisMethod: "freeform",
    rootCauseAnalysis: "Detailed freeform analysis...",
    rootCause: "Root cause conclusion"
  }
}
```

**UI:** Tabs for 3 methods

**Next:** Status → "Step4_Activities"

#### Step 4: Activity Definition

**Function:** `createDofActivity()`

```typescript
{
  dofId: string;
  type: "Corrective" | "Preventive";
  description: string;
  responsibleId: string;
  dueDate: Date;
}
```

**Database:** `DofActivities` table

```typescript
{
  id: string;
  dofId: string;
  type: "Corrective" | "Preventive";
  description: string;
  responsibleId: string;
  dueDate: Date;
  status: "Pending" | "Completed";
  completionNotes?: string;
  completedAt?: Date;
}
```

**UI:** List of activities + Add button

**Validation:** At least 1 activity required

**Next:** Status → "Step5_Implementation"

#### Step 5: Implementation

**Function:** `completeDofActivity()`

```typescript
async function completeDofActivity(
  activityId: string,
  completionNotes: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Mark activity as completed
2. Check if all activities completed
3. If all done → Allow step 5 completion
4. Else → Wait for remaining activities
```

**UI:** Activity list with "Complete" buttons

**Next:** Status → "Step6_Effectiveness"

#### Step 6: Effectiveness Check

```typescript
{
  step: 6,
  data: {
    effectiveDate: Date,
    effectiveResult: "Results of effectiveness check",
    isEffective: boolean
  }
}
```

**Purpose:** Alınan önlemlerin etkinliğini değerlendirme

**Validation:**
- effectiveDate required
- effectiveResult min 20 chars
- isEffective must be true to proceed

**Next:** Status → "PendingManagerApproval"

#### Step 7: Manager Approval

**Functions:**
- `submitDofForApproval()` - Assigned user submits
- `managerApproveDof()` - Manager approves
- `managerRejectDof()` - Manager rejects (LOOP!)

**Approve Flow:**

```
1. submitDofForApproval()
   └─ Status: "PendingManagerApproval"
   └─ submittedAt: Date
   └─ Notify manager

2. managerApproveDof()
   └─ Status: "Completed"
   └─ approvedAt: Date
   └─ Complete workflow
   └─ Notify assigned user
```

**Reject Flow (LOOP!):**

```
1. managerRejectDof(reason)
   └─ rejectionReason: reason
   └─ Status: Back to "Step3_RootCause" (or any step)
   └─ Assigned user notified
   └─ Can re-work and resubmit

Timeline Example:
─────────────────────────────────────────────────────
2025-01-01: Steps 1-6 completed
2025-01-07: Submitted for approval
2025-01-08: Rejected (Reason: "Root cause analysis insufficient")
            Status → Step3_RootCause
2025-01-09: Re-analyzed with 5 Why method
2025-01-10: Steps 4-6 re-done
2025-01-11: Resubmitted
2025-01-12: Approved ✅
```

---

## 3. Finding Workflow

**Dosya:** `src/server/actions/finding-actions.ts`  
**UI:** `/denetim/findings`, `/denetim/findings/[id]`

### Status Flow Diagram

```
New ──→ Assigned ──→ InProgress ──→ PendingClosure ──→ ClosedApproved
                                            │
                                            │ rejectFinding()
                                            ↓
                                       InProgress (LOOP!)
```

### Database Schema

```typescript
{
  id: string;
  auditId: string;                // FK → Audits
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  riskLevel: "Low" | "Medium" | "High";
  assignedToId?: string;          // FK → User (process owner)
  status: "New" | "Assigned" | "InProgress" | "PendingClosure" | 
          "ClosedApproved" | "ClosedRejected";
  closureNotes?: string;
  closedAt?: Date;
  rejectionReason?: string;
  createdById: string;
}
```

### 1. Create Finding

**Function:** `createFinding()`

```typescript
export async function createFinding(data: {
  auditId: string;
  description: string;
  severity: string;
  riskLevel: string;
}): Promise<ActionResponse<{ id: string }>>
```

**Akış:**

```
1. Validate audit exists
2. Permission check (finding.create)
   └─ Auditor only
3. Create finding (status: "New")
4. Update audit status → "InProgress"
5. Revalidate paths
```

### 2. Assign Finding

**Function:** `assignFinding()`

```typescript
export async function assignFinding(
  findingId: string,
  assignedToId: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch finding
2. Permission check (finding.update)
   └─ Auditor or Admin
3. Update finding
   └─ assignedToId
   └─ status: "Assigned"
4. Notify process owner
5. Revalidate
```

### 3. Update Finding

**Function:** `updateFinding()`

```typescript
export async function updateFinding(
  findingId: string,
  data: Partial<Finding>
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch finding
2. Permission check (finding.update)
   └─ Process owner (assignedToId)
3. Auto-update status
   └─ If was "Assigned" → "InProgress"
4. Update finding
5. Revalidate
```

### 4. Submit for Closure

**Function:** `submitFindingForClosure()`

```typescript
export async function submitFindingForClosure(
  findingId: string,
  closureNotes: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch finding with actions and DOFs
2. Permission check (finding.submit)
   └─ Process owner
3. Closure validation
   ├─ All actions completed?
   ├─ All DOFs completed?
   └─ Corrective actions taken?
4. If validated:
   └─ Status: "PendingClosure"
   └─ closureNotes
5. Else:
   └─ Error: "Cannot close - pending actions/DOFs"
6. Notify auditor
7. Revalidate
```

**Closure Requirements:**

```typescript
const allActionsCompleted = actions.every(
  (a) => a.status === "Completed"
);

const allDofsCompleted = dofs.every(
  (d) => d.status === "Completed"
);

if (!allActionsCompleted || !allDofsCompleted) {
  return createValidationError(
    "Cannot submit for closure - pending actions or DOFs"
  );
}
```

### 5. Close Finding (Auditor)

**Function:** `closeFinding()`

```typescript
export async function closeFinding(
  findingId: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch finding
2. Permission check (finding.approve)
   └─ Auditor only
3. Validate status = "PendingClosure"
4. Review closure notes
5. Update finding
   └─ Status: "ClosedApproved"
   └─ closedAt: Date
6. Check audit completion
   └─ checkAuditCompletionStatus(auditId)
7. Notify process owner
8. Revalidate
```

### 6. Reject Closure (LOOP!)

**Function:** `rejectFinding()`

```typescript
export async function rejectFinding(
  findingId: string,
  reason: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch finding
2. Permission check (finding.reject)
   └─ Auditor only
3. Validate status = "PendingClosure"
4. Update finding (BACK TO INPROGRESS!)
   └─ Status: "InProgress"          // ⭐ LOOP!
   └─ rejectionReason: reason
5. Notify process owner
6. Revalidate
```

---

## 4. Audit Workflow

**Dosya:** `src/server/actions/audit-actions.ts`  
**UI:** `/denetim/audits`, `/denetim/audits/[id]`

### Status Flow Diagram

```
Draft ──→ InProgress ──→ Completed ──→ Closed
                  │
                  │ cancelAudit()
                  ↓
            Cancelled
```

### Database Schema

```typescript
{
  id: string;
  templateId: string;             // FK → AuditTemplates
  title: string;
  auditorId: string;              // FK → User
  departmentId?: string;
  status: "Draft" | "InProgress" | "Completed" | "Closed" | "Cancelled";
  scheduledDate?: Date;
  completedAt?: Date;
  closedAt?: Date;
  totalScore?: number;
  riskLevel?: "Low" | "Medium" | "High";
  notes?: string;
  createdById: string;
  workflowInstanceId?: string;
}
```

### 1. Create Audit

**Function:** `createAudit()`

```typescript
export async function createAudit(data: {
  templateId: string;
  title: string;
  auditorId?: string;
  scheduledDate?: Date;
}): Promise<ActionResponse<{ id: string }>>
```

**Akış:**

```
1. Validate template exists
2. Permission check (audit.create)
3. Create audit (status: "Draft")
4. Load questions from template
   └─ auditQuestions.insert(from questionBank)
5. Start workflow (optional)
6. Revalidate
```

### 2. Conduct Audit

**Function:** `updateAudit()` + Answer Questions

**Akış:**

```
1. Answer questions
   └─ updateAuditQuestionAnswer(questionId, answer, score)
2. Calculate total score
   └─ SUM(all question scores) / totalQuestions
3. Auto-update status
   └─ If answering → "InProgress"
4. Revalidate
```

### 3. Complete Audit

**Function:** `completeAudit()`

```typescript
export async function completeAudit(
  auditId: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch audit with questions
2. Permission check (audit.complete)
   └─ Auditor
3. Validation
   ├─ All questions answered?
   └─ Score calculated?
4. Update audit
   └─ Status: "Completed"
   └─ completedAt: Date
   └─ totalScore
   └─ riskLevel (based on score)
5. Complete workflow step (if exists)
6. Notify manager (if high risk)
7. Revalidate
```

### 4. Close Audit

**Function:** `closeAudit()`

```typescript
export async function closeAudit(
  auditId: string
): Promise<ActionResponse>
```

**Akış:**

```
1. Fetch audit with findings
2. Permission check (audit.close)
   └─ Manager or Admin
3. Closure validation
   ├─ All findings closed?
   ├─ All actions completed?
   └─ All DOFs completed?
4. If validated:
   └─ Status: "Closed"
   └─ closedAt: Date
5. Else:
   └─ Error: "Cannot close - pending findings/actions/DOFs"
6. Complete workflow (if exists)
7. Revalidate
```

**Closure Check:**

```typescript
const checkAuditCompletionStatus = async (auditId: string) => {
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, auditId),
    with: {
      findings: {
        with: {
          actions: true,
          dofs: true,
        },
      },
    },
  });

  // Check all findings closed
  const allFindingsClosed = audit.findings.every(
    (f) => f.status === "ClosedApproved"
  );

  // Check all actions completed
  const allActionsCompleted = audit.findings
    .flatMap((f) => f.actions)
    .every((a) => a.status === "Completed");

  // Check all DOFs completed
  const allDofsCompleted = audit.findings
    .flatMap((f) => f.dofs)
    .every((d) => d.status === "Completed");

  return {
    canClose: allFindingsClosed && allActionsCompleted && allDofsCompleted,
    pendingFindings: audit.findings.filter(f => f.status !== "ClosedApproved").length,
    pendingActions: audit.findings.flatMap(f => f.actions)
      .filter(a => a.status !== "Completed").length,
    pendingDofs: audit.findings.flatMap(f => f.dofs)
      .filter(d => d.status !== "Completed").length,
  };
};
```

---

## ✅ Özet

### Action Workflow
- ✅ Simple CAPA process (2 steps)
- ✅ Reject loop (manager can reject)
- ✅ Cancel exit strategy
- ✅ Progress tracking

### DOF Workflow
- ✅ Complex 8-step CAPA
- ✅ 3 root cause methods
- ✅ Activity tracking
- ✅ Effectiveness check
- ✅ Manager approval loop

### Finding Workflow
- ✅ Auditor → Process Owner
- ✅ Action/DOF creation
- ✅ Closure validation
- ✅ Auditor approval

### Audit Workflow
- ✅ Template-based
- ✅ Question-answer
- ✅ Score calculation
- ✅ Finding management
- ✅ Closure validation

## Sonraki: Test Stratejisi

Şimdi her workflow için test senaryoları oluşturalım → `05-TEST-STRATEGY.md`
