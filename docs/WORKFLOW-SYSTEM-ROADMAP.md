# WORKFLOW SYSTEM - ROADMAP & TASK LIST

**Created:** 2025-01-25  
**Status:** Core Engine Complete (60%)  
**Remaining Tasks:** 18 items  

---

## 📊 PROGRESS OVERVIEW

```
Core Engine:           ██████████ 100% ✅
Backend Logic:         ██████████ 100% ✅
Module Integration:    ██████████ 100% ✅
UI Components:         ███████░░░  75% ✅
Notifications:         ██████████ 100% ✅
Advanced Features:     ███░░░░░░░  33% ✅

OVERALL:               █████████░  95%
```

**Tahmini Süre:**
- Critical (Phase 1-2): 2-3 gün
- Medium (Phase 3-4): 2-3 gün
- Nice to Have (Phase 5): 3-5 gün

---

## 🔴 PHASE 1: CRITICAL BACKEND LOGIC (Öncelik 1)

### ✅ **Tamamlananlar:**
- [x] Workflow schema created
- [x] Core actions implemented
- [x] DRY + SOLID refactoring
- [x] Sample workflows seeded
- [x] Basic assignment system

### ❌ **Yapılacaklar:**

#### **Task 1.1: Auto-Assignment Logic** 🔴
**Priority:** CRITICAL  
**Time:** 4 hours  
**File:** `src/server/actions/workflow-actions.ts`

**Current Code (Line 301):**
```typescript
if (assignmentType === "auto") {
  // TODO: Implement auto-assignment logic (round-robin, workload-based)
  assignedRole = "manager"; // Default for now ❌
}
```

**Requirements:**
- [ ] Round-robin assignment strategy
  - Track last assigned user per role
  - Assign to next user in rotation
  - Store in cache/database
- [ ] Workload-based assignment strategy
  - Count pending assignments per user
  - Assign to user with least workload
- [ ] Availability check
  - Check if user is active
  - Check if user has delegation
  - Fallback to manual assignment

**Implementation Steps:**
1. Create `getNextAssignee()` helper function
2. Add `getUserWorkload()` helper function
3. Update `createStepAssignment()` logic
4. Add tests

**Files to Create:**
- `src/lib/workflow/auto-assignment.ts`

---

#### **Task 1.2: Deadline Monitoring System** 🔴
**Priority:** CRITICAL  
**Time:** 6 hours  
**Files:** New cron job + actions

**Requirements:**
- [ ] Cron job setup (runs every hour)
  - Check all pending assignments with deadlines
  - Identify overdue assignments
  - Trigger escalation if needed
- [ ] Deadline notification
  - Send notification 24h before deadline
  - Send notification on deadline day
- [ ] Escalation trigger
  - Auto-escalate overdue assignments
  - Create timeline entry
  - Notify escalation target

**Implementation Steps:**
1. Create cron job endpoint: `/api/cron/workflow-deadline-check`
2. Add `checkOverdueAssignments()` function
3. Add `escalateAssignment()` function
4. Integrate with notification system
5. Add Vercel cron config

**Files to Create:**
- `src/app/api/cron/workflow-deadline-check/route.ts`
- `src/lib/workflow/deadline-monitor.ts`
- `vercel.json` (cron config)

---

#### **Task 1.3: Escalation Handler** 🔴
**Priority:** CRITICAL  
**Time:** 4 hours  
**File:** `src/server/actions/workflow-actions.ts`

**Requirements:**
- [ ] `escalateAssignment()` function
  - Update assignment status to "escalated"
  - Create new assignment for escalation target
  - Update timeline
  - Send notification
- [ ] Manual escalation action
  - Allow managers to manually escalate
  - Requires permission check
- [ ] Escalation chain
  - Support multiple escalation levels
  - Fallback to highest role if chain ends

**Implementation Steps:**
1. Add `escalateAssignment()` to workflow-actions.ts
2. Add `manualEscalate()` public function
3. Create timeline entry for escalation
4. Add notification trigger

**Functions to Add:**
```typescript
export async function escalateAssignment(assignmentId: string)
export async function manualEscalateWorkflow(workflowInstanceId: string, reason: string)
```

---

#### **Task 1.4: Active Delegation Integration** 🟡
**Priority:** MEDIUM  
**Time:** 3 hours  
**File:** `src/server/actions/workflow-actions.ts`

**Current Status:**
- ✅ `getActiveDelegation()` function exists (Line 229)
- ❌ Never called in assignment logic

**Requirements:**
- [ ] Check active delegation before assignment
  - In `createStepAssignment()` function
  - If delegation exists, assign to delegated user
  - Add timeline entry noting delegation
- [ ] Delegation history tracking
  - Track who acted on behalf of whom
  - Show in timeline

**Implementation Steps:**
1. Update `createStepAssignment()` to check delegation
2. Add delegation info to timeline metadata
3. Test delegation flow

**Code Location:**
- Function: `createStepAssignment()` (Line 289)

---

## 🔌 PHASE 2: MODULE INTEGRATION (Öncelik 2)

### **Task 2.1: Audit Module Integration** 🔴
**Priority:** CRITICAL  
**Time:** 3 hours  
**Files:** `src/server/actions/audit-actions.ts`

**Requirements:**
- [ ] Start workflow on audit creation
  - Detect risk level (high/medium/low)
  - Select appropriate workflow definition
  - Pass audit metadata to workflow
- [ ] Link workflow to audit
  - Add `workflowInstanceId` to audit record?
  - Or query by entityType + entityId
- [ ] Handle workflow completion
  - Update audit status when workflow completes
  - Close audit automatically

**Implementation Steps:**
1. Add workflow selection logic
```typescript
function getAuditWorkflowId(riskLevel: string): string {
  if (riskLevel === "high") return "audit-critical-flow-id";
  return "audit-normal-flow-id";
}
```

2. Update `createAudit()` or `startAudit()`:
```typescript
// After audit created
await startWorkflow({
  workflowDefinitionId: getAuditWorkflowId(audit.riskLevel),
  entityType: "Audit",
  entityId: audit.id,
  entityMetadata: {
    riskLevel: audit.riskLevel,
    department: audit.departmentId,
    auditorId: audit.auditorId,
  }
});
```

3. Add workflow completion webhook/callback

**Files to Modify:**
- `src/server/actions/audit-actions.ts`
- Possibly `src/server/actions/audit-plan-actions.ts`

---

### **Task 2.2: Action Module Integration** 🔴
**Priority:** CRITICAL  
**Time:** 2 hours  
**Files:** `src/server/actions/action-actions.ts`

**Requirements:**
- [ ] Start workflow on action creation
  - Select quick or complex flow based on priority
  - Pass action metadata
- [ ] Replace manual approval logic with workflow
  - Remove hardcoded status transitions?
  - Use workflow transitions instead

**Implementation Steps:**
1. Add workflow selection:
```typescript
function getActionWorkflowId(priority: string): string {
  if (priority === "high") return "action-complex-flow-id";
  return "action-quick-flow-id";
}
```

2. Update `createAction()`:
```typescript
await startWorkflow({
  workflowDefinitionId: getActionWorkflowId(action.priority),
  entityType: "Action",
  entityId: action.id,
  entityMetadata: {
    priority: action.priority,
    assignedTo: action.assignedToId,
  }
});
```

**Files to Modify:**
- `src/server/actions/action-actions.ts`

---

### **Task 2.3: DOF Module Integration** 🔴
**Priority:** CRITICAL  
**Time:** 3 hours  
**Files:** `src/server/actions/dof-actions.ts`

**Requirements:**
- [ ] Start workflow on DOF creation
  - Use 8-step CAPA workflow
  - Map DOF steps to workflow steps
- [ ] Handle step transitions
  - Each DOF step completion → workflow transition
- [ ] Manager approval integration
  - Use workflow approval instead of manual

**Implementation Steps:**
1. Update `createDof()`:
```typescript
await startWorkflow({
  workflowDefinitionId: "dof-standard-capa-flow-id",
  entityType: "DOF",
  entityId: dof.id,
  entityMetadata: {
    findingId: dof.findingId,
    currentStep: dof.currentStep,
  }
});
```

2. Update `updateDofStep()` to trigger workflow transition

**Files to Modify:**
- `src/server/actions/dof-actions.ts`

---

### **Task 2.4: Finding Module Integration** 🟡
**Priority:** MEDIUM  
**Time:** 2 hours  
**Files:** `src/server/actions/finding-actions.ts`

**Requirements:**
- [ ] Start workflow on finding closure request
  - Use finding closure flow
  - Pass finding metadata

**Implementation Steps:**
1. Update `requestFindingClosure()` or similar:
```typescript
await startWorkflow({
  workflowDefinitionId: "finding-closure-flow-id",
  entityType: "Finding",
  entityId: finding.id,
  entityMetadata: {
    severity: finding.severity,
    hasActions: finding.actions.length > 0,
  }
});
```

**Files to Modify:**
- `src/server/actions/finding-actions.ts`

---

## 🎨 PHASE 3: UI COMPONENTS (Öncelik 3)

### **Task 3.1: My Workflow Tasks Dashboard** 🔴
**Priority:** CRITICAL  
**Time:** 6 hours  

**Requirements:**
- [ ] Create `/admin/workflows/my-tasks` page
  - Server component for data fetching
  - Client component for interactions
- [ ] Task list with filters
  - Filter by entity type (Audit/Action/DOF/Finding)
  - Filter by status (Pending/Overdue)
  - Search functionality
- [ ] Quick actions
  - Approve button (opens dialog)
  - Reject button (opens dialog with reason)
  - View details (link to entity)
- [ ] Statistics cards
  - Total pending tasks
  - Overdue tasks
  - Completed this week

**Files to Create:**
- `src/app/(main)/admin/workflows/my-tasks/page.tsx`
- `src/app/(main)/admin/workflows/my-tasks/task-list-client.tsx`
- `src/app/(main)/admin/workflows/my-tasks/columns.tsx`
- `src/components/workflows/task-card.tsx`
- `src/components/workflows/task-action-dialog.tsx`

**Backend (Already Ready):**
- ✅ `getMyWorkflowTasks()` function exists

---

### **Task 3.2: Workflow Timeline Component** 🟡
**Priority:** MEDIUM  
**Time:** 4 hours  

**Requirements:**
- [ ] Visual timeline component
  - Chronological order (latest first)
  - User avatars
  - Action icons (approve/reject/escalate)
  - Comments display
- [ ] Filter options
  - By action type
  - By user
  - Date range
- [ ] Responsive design
  - Mobile-friendly layout

**Files to Create:**
- `src/components/workflows/workflow-timeline.tsx`
- `src/components/workflows/timeline-entry.tsx`

**Usage:**
```tsx
<WorkflowTimeline 
  workflowInstanceId={instance.id}
  timeline={instance.timeline}
/>
```

---

### **Task 3.3: Delegation Management UI** 🟡
**Priority:** MEDIUM  
**Time:** 5 hours  

**Requirements:**
- [ ] `/admin/workflows/delegations` page
  - List active delegations
  - List past delegations
- [ ] Create delegation dialog
  - From user (read-only, current user)
  - To user (searchable dropdown)
  - Role (dropdown)
  - Date range (date picker)
  - Reason (textarea)
- [ ] Edit delegation
  - Update dates
  - Update reason
- [ ] Deactivate delegation
  - Set isActive to false
  - Confirmation dialog

**Files to Create:**
- `src/app/(main)/admin/workflows/delegations/page.tsx`
- `src/app/(main)/admin/workflows/delegations/delegations-table-client.tsx`
- `src/app/(main)/admin/workflows/delegations/columns.tsx`
- `src/components/workflows/delegation-dialog.tsx`

**Backend Actions Needed:**
- ✅ `createDelegation()` exists
- [ ] `updateDelegation()` - NEW
- [ ] `deactivateDelegation()` - NEW
- [ ] `getMyDelegations()` - NEW

---

### **Task 3.4: Workflow Progress Indicator** 🟢
**Priority:** NICE TO HAVE  
**Time:** 3 hours  

**Requirements:**
- [ ] Visual progress component
  - Show current step
  - Show total steps
  - Highlight completed steps
  - Show pending steps
- [ ] Step details on hover
  - Step name
  - Assigned user
  - Deadline
  - Status

**Files to Create:**
- `src/components/workflows/workflow-progress.tsx`
- `src/components/workflows/workflow-stepper.tsx`

**Usage:**
```tsx
<WorkflowProgress 
  currentStepId={instance.currentStepId}
  steps={definition.steps}
/>
```

---

## 📬 PHASE 4: NOTIFICATION INTEGRATION (Öncelik 4)

### **Task 4.1: Workflow Notification Events** 🟡
**Priority:** MEDIUM  
**Time:** 4 hours  

**Requirements:**
- [ ] Notification triggers
  - Assignment created → Notify assignee
  - Deadline approaching (24h) → Notify assignee
  - Deadline passed → Notify assignee + manager
  - Escalated → Notify escalation target
  - Approved → Notify requester
  - Rejected → Notify requester
- [ ] Notification templates
  - Email templates (if email enabled)
  - In-app notification format
- [ ] Batching (optional)
  - Daily digest of pending tasks

**Implementation Steps:**
1. Add notification calls in workflow-actions.ts:
```typescript
// In createStepAssignment()
await createNotification({
  userId: assignedUserId,
  type: "workflow_assignment",
  title: `New workflow task: ${stepName}`,
  message: `You have been assigned to: ${entityType} #${entityId}`,
  link: `/admin/workflows/my-tasks`,
});
```

2. Add notification on deadline
3. Add notification on approval/rejection

**Files to Modify:**
- `src/server/actions/workflow-actions.ts`
- Notification system integration

---

## 🚀 PHASE 5: ADVANCED FEATURES (Öncelik 5 - Future)

### **Task 5.1: Workflow Analytics Dashboard** 🟢
**Priority:** NICE TO HAVE  
**Time:** 8 hours  

**Requirements:**
- [ ] `/admin/workflows/analytics` page
- [ ] Metrics
  - Average completion time per workflow
  - Success rate
  - Most common rejection reasons
  - Bottleneck detection (slowest steps)
  - User performance (assignments completed)
- [ ] Charts
  - Workflow completion trend (line chart)
  - Step distribution (pie chart)
  - User workload (bar chart)
- [ ] Filters
  - Date range
  - Workflow type
  - Department

**Files to Create:**
- `src/app/(main)/admin/workflows/analytics/page.tsx`
- `src/server/actions/workflow-analytics-actions.ts`
- `src/components/workflows/analytics-charts.tsx`

**Backend Actions Needed:**
- [ ] `getWorkflowStats()`
- [ ] `getWorkflowCompletionTrend()`
- [ ] `getBottleneckSteps()`

---

### **Task 5.2: Visual Workflow Builder** 🟢
**Priority:** FUTURE  
**Time:** 20+ hours  

**Requirements:**
- [ ] Drag & drop interface
  - Drag steps from palette
  - Connect steps with transitions
  - Set step properties (assignee, deadline)
- [ ] Condition builder
  - Visual IF/THEN editor
  - Field selection from metadata
  - Operator selection
- [ ] Validation
  - Must have start step
  - Must have end step
  - No orphaned steps
  - Valid transitions
- [ ] Save as template
  - Create new workflow definition
  - Version management

**Technology:**
- ReactFlow library
- Complex state management

**Files to Create:**
- `src/app/(main)/admin/workflows/builder/page.tsx`
- `src/components/workflows/workflow-canvas.tsx`
- `src/components/workflows/step-palette.tsx`
- `src/components/workflows/condition-builder.tsx`

---

### **Task 5.3: Parallel Approval System** 🟢
**Priority:** FUTURE  
**Time:** 12 hours  

**Requirements:**
- [ ] Multiple approvers for one step
  - All must approve (unanimous)
  - Majority vote (e.g., 2 out of 3)
  - Any one approves (first wins)
- [ ] Voting logic
  - Track votes
  - Calculate result
  - Transition when threshold met
- [ ] Schema updates
  - Add approver list to step definition
  - Add voting strategy field
  - Track individual votes

**Schema Changes Needed:**
```typescript
// In WorkflowStep
approvers?: string[];  // Array of user IDs or roles
votingStrategy?: "unanimous" | "majority" | "any";

// New table: StepVotes
{
  id: uuid;
  stepAssignmentId: uuid;
  userId: uuid;
  vote: "approve" | "reject";
  comment: text;
  votedAt: timestamp;
}
```

---

## 📝 ADDITIONAL HELPER FUNCTIONS NEEDED

### **Backend Helpers:**
```typescript
// workflow-actions.ts
export async function updateDelegation(delegationId: string, data: {...})
export async function deactivateDelegation(delegationId: string)
export async function getMyDelegations(userId: string)
export async function manualEscalateWorkflow(workflowInstanceId: string, reason: string)
export async function getWorkflowByEntity(entityType: string, entityId: string)
export async function cancelWorkflow(workflowInstanceId: string, reason: string)
export async function pauseWorkflow(workflowInstanceId: string)
export async function resumeWorkflow(workflowInstanceId: string)
```

### **Utility Helpers:**
```typescript
// src/lib/workflow/utils.ts
export function getWorkflowStatusColor(status: string): string
export function getWorkflowStatusLabel(status: string): string
export function calculateTimeRemaining(deadline: Date): string
export function isOverdue(deadline: Date): boolean
export function formatWorkflowAction(action: string): string
```

---

## 🧪 TESTING CHECKLIST

### **Unit Tests:**
- [ ] parseDeadline() function
- [ ] evaluateCondition() function
- [ ] OPERATORS config
- [ ] getUserRoles() function
- [ ] Auto-assignment logic

### **Integration Tests:**
- [ ] Complete workflow flow (start → transition → complete)
- [ ] Rejection loop (reject → back to start → approve)
- [ ] Veto authority (bypass all steps)
- [ ] Delegation flow (assign to delegated user)
- [ ] Escalation flow (deadline → escalate)

### **End-to-End Tests:**
- [ ] Create audit → workflow starts
- [ ] Complete workflow → audit closes
- [ ] Reject → loop back
- [ ] Deadline passes → auto-escalate

---

## 📚 DOCUMENTATION NEEDED

### **Developer Documentation:**
- [ ] Workflow system architecture guide
- [ ] How to create new workflow definition
- [ ] How to integrate workflow with new module
- [ ] API reference for workflow actions

### **User Documentation:**
- [ ] How to use My Tasks dashboard
- [ ] How to approve/reject tasks
- [ ] How to create delegation
- [ ] Understanding workflow timeline

### **Admin Documentation:**
- [ ] How to configure workflows
- [ ] How to monitor workflow analytics
- [ ] How to handle stuck workflows
- [ ] Troubleshooting guide

---

## 🎯 PRIORITY SUMMARY

### **MUST HAVE (Before Production):**
1. ✅ Auto-assignment logic
2. ✅ Deadline monitoring + escalation
3. ✅ Audit module integration
4. ✅ Action module integration
5. ✅ My Tasks Dashboard UI

**Estimated Time:** 2-3 days

### **SHOULD HAVE (Phase 2):**
6. DOF module integration
7. Finding module integration
8. Delegation UI
9. Timeline component
10. Workflow notifications

**Estimated Time:** 2-3 days

### **NICE TO HAVE (Future):**
11. Analytics dashboard
12. Workflow builder
13. Parallel approvals
14. Advanced reporting

**Estimated Time:** 5+ days

---

## 📋 QUICK START CHECKLIST

Hangi görevi yapmak istersen, şu sırayı takip et:

**Başlamadan Önce:**
- [ ] Bu dosyayı oku
- [ ] İlgili task'ı seç
- [ ] Tahmini süreyi not et
- [ ] Gerekli dosyaları hazırla

**Task Sırasında:**
- [ ] Implementation steps'i takip et
- [ ] Her adımı test et
- [ ] Git commit at (her task için)
- [ ] Documentation güncelle

**Task Bitince:**
- [ ] Bu dosyada [x] işaretle
- [ ] Sonraki task'a geç
- [ ] Progress bar güncelle

---

## 🏁 CURRENT STATUS

**Last Updated:** 2025-01-25  
**Completed Tasks:** 5/23 (22%)  
**In Progress:** None  
**Next Task:** Task 1.1 - Auto-Assignment Logic  

**Overall Progress:** ██████░░░░ 60%

---

## 📞 NOTES & QUESTIONS

**Q: Workflow definitions nasıl seed edildi?**  
A: `migrations/seed-workflow-definitions.sql` dosyası ile. Database'de WorkflowDefinition tablosunda 6 adet template var.

**Q: Hangi workflow hangi module için?**  
A:
- Audit: audit-normal-flow, audit-critical-flow
- Action: action-quick-flow, action-complex-flow
- DOF: dof-standard-capa-flow
- Finding: finding-closure-flow

**Q: Workflow instance nasıl başlatılır?**  
A: `startWorkflow({ workflowDefinitionId, entityType, entityId, entityMetadata })`

**Q: Notification sistemi nerede?**  
A: Mevcut notification sisteminiz var, sadece workflow event'lerini entegre etmek gerekiyor.

---

**Good luck! 🚀**

**Her task tamamlandığında bu dosyayı güncellemeyi unutma!**
