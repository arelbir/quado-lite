# APPROVAL MECHANISM → WORKFLOW MIGRATION PLAN

**Date:** 2025-01-25  
**Status:** Planning Phase  
**Priority:** HIGH - Architectural Simplification

---

## 🎯 OBJECTIVE

Mevcut eski onay mekanizmasını (approve/reject) kaldırıp tüm onay süreçlerini yeni Workflow sistemine taşımak.

---

## 📊 CURRENT STATE ANALYSIS

### **1. ACTION MODULE - Approval Mechanism**

**Schema (action.ts):**
```typescript
export const actionStatusEnum = pgEnum("action_status", [
  "Assigned",              
  "PendingManagerApproval", // ❌ KALDIRILACAK
  "Completed",             
  "Rejected",              // ❌ KALDIRILACAK (artık kullanılmıyor)
  "Cancelled"              
]);
```

**Current Flow:**
```
Assigned → completeAction() → PendingManagerApproval 
         → approveAction() → Completed
         → rejectAction() → Assigned (loop back)
```

**Affected Files:**
- `src/drizzle/schema/action.ts` - Status enum
- `src/server/actions/action-actions.ts` - approve/reject functions
- `src/components/actions/action-detail-actions.tsx` - UI buttons
- `src/app/(main)/denetim/actions/[id]/page.tsx` - Detail page
- `src/lib/constants/status-labels.ts` - Status labels

---

### **2. DOF MODULE - Approval Mechanism**

**Schema (dof.ts):**
```typescript
export const dofStatusEnum = pgEnum("dof_status", [
  "Step1_Problem",
  "Step2_TempMeasures",
  "Step3_RootCause",
  "Step4_Activities",
  "Step5_Implementation",
  "Step6_EffectivenessCheck",
  "PendingManagerApproval",  // ❌ KALDIRILACAK
  "Completed",               
  "Rejected"                 // ❌ KALDIRILACAK
]);
```

**Current Flow:**
```
Step6 → submitDofForApproval() → PendingManagerApproval
      → approveDof() → Completed
      → rejectDof() → Step6 (loop back)
```

**Affected Files:**
- `src/drizzle/schema/dof.ts` - Status enum
- `src/server/actions/dof-actions.ts` - approve/reject functions
- `src/components/dof/wizard/step7-approval.tsx` - Approval UI
- `src/app/(main)/denetim/dofs/[id]/page.tsx` - Wizard page
- `src/lib/constants/status-labels.ts` - Status labels

---

## 🎯 TARGET STATE (With Workflow)

### **NEW ACTION FLOW:**
```
Assigned → Workflow Start (Auto)
         → Step 1: Work on Task (User)
         → Step 2: Review (Manager) [Workflow Approval]
         → Completed (Auto)
```

### **NEW DOF FLOW:**
```
Step1-6 → Normal steps (unchanged)
        → Workflow Start (Auto at Step 6)
        → Manager Approval Step [Workflow Approval]
        → Completed (Auto)
```

---

## 🔧 MIGRATION STRATEGY

### **PHASE 1: Schema Updates**

#### **1.1 Action Status Enum - Simplify**
```typescript
// OLD
export const actionStatusEnum = pgEnum("action_status", [
  "Assigned",
  "PendingManagerApproval", // ❌ Remove
  "Completed",
  "Rejected",               // ❌ Remove
  "Cancelled"
]);

// NEW
export const actionStatusEnum = pgEnum("action_status", [
  "Assigned",      // Initial state
  "InProgress",    // NEW: Being worked on
  "Completed",     // Final state (workflow approved)
  "Cancelled"      // Exit state
]);
```

#### **1.2 DOF Status Enum - Remove Approval**
```typescript
// OLD
export const dofStatusEnum = pgEnum("dof_status", [
  "Step1_Problem",
  "Step2_TempMeasures",
  "Step3_RootCause",
  "Step4_Activities",
  "Step5_Implementation",
  "Step6_EffectivenessCheck",
  "PendingManagerApproval",  // ❌ Remove
  "Completed",
  "Rejected"                 // ❌ Remove
]);

// NEW
export const dofStatusEnum = pgEnum("dof_status", [
  "Step1_Problem",
  "Step2_TempMeasures",
  "Step3_RootCause",
  "Step4_Activities",
  "Step5_Implementation",
  "Step6_EffectivenessCheck",
  "Completed",     // Final state (workflow approved)
  "Cancelled"      // NEW: Exit state
]);
```

---

### **PHASE 2: Database Migration**

#### **2.1 Update Existing Data**
```sql
-- Actions: Migrate PendingManagerApproval → InProgress
UPDATE "actions" 
SET status = 'InProgress' 
WHERE status = 'PendingManagerApproval';

-- Actions: Migrate Rejected → Assigned
UPDATE "actions" 
SET status = 'Assigned' 
WHERE status = 'Rejected';

-- DOFs: Migrate PendingManagerApproval → Step6
UPDATE "dofs" 
SET status = 'Step6_EffectivenessCheck' 
WHERE status = 'PendingManagerApproval';

-- DOFs: Migrate Rejected → Step6
UPDATE "dofs" 
SET status = 'Step6_EffectivenessCheck' 
WHERE status = 'Rejected';
```

#### **2.2 Remove Old Enum Values**
```sql
-- Cannot directly remove enum values in PostgreSQL
-- Need to recreate the enum

-- Actions
ALTER TYPE action_status RENAME TO action_status_old;
CREATE TYPE action_status AS ENUM ('Assigned', 'InProgress', 'Completed', 'Cancelled');
ALTER TABLE actions ALTER COLUMN status TYPE action_status USING status::text::action_status;
DROP TYPE action_status_old;

-- DOFs
ALTER TYPE dof_status RENAME TO dof_status_old;
CREATE TYPE dof_status AS ENUM (
  'Step1_Problem',
  'Step2_TempMeasures',
  'Step3_RootCause',
  'Step4_Activities',
  'Step5_Implementation',
  'Step6_EffectivenessCheck',
  'Completed',
  'Cancelled'
);
ALTER TABLE dofs ALTER COLUMN status TYPE dof_status USING status::text::dof_status;
DROP TYPE dof_status_old;
```

---

### **PHASE 3: Backend Refactoring**

#### **3.1 Action Module Changes**

**Remove Functions:**
- ❌ `approveAction()` → Use `transitionWorkflow({ action: "approve" })`
- ❌ `rejectAction()` → Use `transitionWorkflow({ action: "reject" })`
- ❌ `completeAction()` → Use `transitionWorkflow({ action: "complete" })`

**Replace With:**
```typescript
// action-actions.ts
export async function transitionActionWorkflow(data: {
  actionId: string;
  action: "complete" | "approve" | "reject";
  comment?: string;
}): Promise<ActionResponse> {
  return withAuth(async (user) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, data.actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    // Get workflow instance for this action
    const workflow = await db.query.workflowInstances.findFirst({
      where: and(
        eq(workflowInstances.entityType, "action"),
        eq(workflowInstances.entityId, data.actionId)
      ),
    });

    if (!workflow) {
      return createValidationError("No workflow found for this action");
    }

    // Use workflow transition
    return transitionWorkflow({
      workflowInstanceId: workflow.id,
      action: data.action,
      comment: data.comment,
    });
  });
}
```

#### **3.2 DOF Module Changes**

**Remove Functions:**
- ❌ `approveDof()` → Use `transitionWorkflow({ action: "approve" })`
- ❌ `rejectDof()` → Use `transitionWorkflow({ action: "reject" })`
- ❌ `submitDofForApproval()` → Trigger workflow automatically

**Replace With:**
```typescript
// dof-actions.ts
export async function transitionDofWorkflow(data: {
  dofId: string;
  action: "submit" | "approve" | "reject";
  comment?: string;
}): Promise<ActionResponse> {
  return withAuth(async (user) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, data.dofId),
    });

    if (!dof) {
      return createNotFoundError("DOF");
    }

    // Get workflow instance
    const workflow = await db.query.workflowInstances.findFirst({
      where: and(
        eq(workflowInstances.entityType, "dof"),
        eq(workflowInstances.entityId, data.dofId)
      ),
    });

    if (!workflow) {
      return createValidationError("No workflow found for this DOF");
    }

    // Use workflow transition
    return transitionWorkflow({
      workflowInstanceId: workflow.id,
      action: data.action,
      comment: data.comment,
    });
  });
}
```

---

### **PHASE 4: Frontend Refactoring**

#### **4.1 Action Detail Page**

**Before:**
```tsx
// action-detail-actions.tsx
<Button onClick={() => approveAction(actionId)}>Approve</Button>
<Button onClick={() => rejectAction(actionId)}>Reject</Button>
```

**After:**
```tsx
// Use workflow transition component
<WorkflowActionButtons 
  workflowId={action.workflowInstanceId}
  entityType="action"
  entityId={actionId}
/>
```

#### **4.2 DOF Wizard**

**Before:**
```tsx
// step7-approval.tsx
<Button onClick={() => approveDof(dofId)}>Approve</Button>
<Button onClick={() => rejectDof(dofId)}>Reject</Button>
```

**After:**
```tsx
// Use workflow transition component
<WorkflowActionButtons 
  workflowId={dof.workflowInstanceId}
  entityType="dof"
  entityId={dofId}
/>
```

---

### **PHASE 5: Status Label Updates**

#### **5.1 Update Constants**

```typescript
// status-labels.ts

// Action Status - UPDATED
export const ACTION_STATUS_LABELS: Record<string, string> = {
  Assigned: "Atandı",
  InProgress: "Devam Ediyor",      // NEW
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi",
  // Removed: PendingManagerApproval, Rejected
};

export const ACTION_STATUS_COLORS: Record<string, string> = {
  Assigned: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",  // NEW
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-gray-100 text-gray-800",
};

// DOF Status - UPDATED
export const DOF_STATUS_LABELS: Record<string, string> = {
  Step1_Problem: "1. Problem Tanımı",
  Step2_TempMeasures: "2. Geçici Önlemler",
  Step3_RootCause: "3. Kök Neden",
  Step4_Activities: "4. Faaliyetler",
  Step5_Implementation: "5. Uygulama",
  Step6_EffectivenessCheck: "6. Etkinlik Kontrolü",
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi",        // NEW
  // Removed: PendingManagerApproval, Rejected
};
```

---

### **PHASE 6: Workflow Integration**

#### **6.1 Auto-start Workflows**

```typescript
// When action is created → start workflow
export async function createAction(data: NewActionRecord): Promise<ActionResponse> {
  return withAuth(async (user) => {
    // Create action
    const [action] = await db.insert(actions).values({
      ...data,
      status: "Assigned",
      createdById: user.id,
    }).returning();

    // Start workflow automatically
    await startWorkflow({
      entityType: "action",
      entityId: action.id,
      entityName: action.details.slice(0, 50),
      metadata: buildActionMetadata(action),
    });

    return { success: true, data: action };
  });
}
```

#### **6.2 Workflow Completion Handlers**

```typescript
// When workflow completes → update entity status
export async function onWorkflowComplete(workflowId: string) {
  const workflow = await db.query.workflowInstances.findFirst({
    where: eq(workflowInstances.id, workflowId),
  });

  if (!workflow) return;

  if (workflow.entityType === "action") {
    await db.update(actions)
      .set({ status: "Completed", completedAt: new Date() })
      .where(eq(actions.id, workflow.entityId));
  }

  if (workflow.entityType === "dof") {
    await db.update(dofs)
      .set({ status: "Completed", completedAt: new Date() })
      .where(eq(dofs.id, workflow.entityId));
  }
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Preparation**
- [ ] Backup database
- [ ] Create feature branch
- [ ] Review all affected files

### **Phase 2: Schema Updates**
- [ ] Update `action.ts` enum
- [ ] Update `dof.ts` enum
- [ ] Run TypeScript checks

### **Phase 3: Database Migration**
- [ ] Create migration SQL file
- [ ] Test migration on dev database
- [ ] Verify data integrity

### **Phase 4: Backend Refactoring**
- [ ] Update `action-actions.ts`
- [ ] Update `dof-actions.ts`
- [ ] Add workflow integration
- [ ] Remove old approve/reject functions

### **Phase 5: Frontend Updates**
- [ ] Update `action-detail-actions.tsx`
- [ ] Update `step7-approval.tsx`
- [ ] Update status labels
- [ ] Update column definitions

### **Phase 6: Testing**
- [ ] Test action workflow
- [ ] Test DOF workflow
- [ ] Test approval/rejection flow
- [ ] Test status transitions

### **Phase 7: Documentation**
- [ ] Update API documentation
- [ ] Update user guide
- [ ] Create migration notes

---

## ⚠️ RISKS & MITIGATION

### **Risk 1: Data Loss**
- **Mitigation:** Full database backup before migration
- **Rollback:** Keep old enum types until confirmed working

### **Risk 2: UI Breaking**
- **Mitigation:** Thorough testing of all affected pages
- **Rollback:** Feature flag to switch back

### **Risk 3: Workflow Not Starting**
- **Mitigation:** Add error logging and alerts
- **Fallback:** Manual workflow trigger option

---

## 📊 EXPECTED BENEFITS

### **Code Reduction:**
- Remove ~150 lines (approve/reject functions)
- Remove ~80 lines (UI components)
- **Total:** ~230 lines removed

### **Maintenance:**
- ✅ Single approval mechanism (workflow)
- ✅ Consistent UX across all modules
- ✅ Easier to add new approval steps
- ✅ Better audit trail (workflow timeline)

### **Features:**
- ✅ Deadline tracking (automatic)
- ✅ Escalation (automatic)
- ✅ Delegation (built-in)
- ✅ Analytics (centralized)

---

## 🚀 DEPLOYMENT PLAN

### **Step 1: Development**
1. Create feature branch
2. Implement schema changes
3. Test locally

### **Step 2: Staging**
1. Deploy to staging
2. Run migration
3. Verify all flows

### **Step 3: Production**
1. Schedule maintenance window
2. Backup database
3. Run migration
4. Deploy code
5. Monitor for 24 hours

---

## 📝 NOTES

- Old approve/reject functions should be deprecated first (add warning logs)
- Keep migration script for at least 1 month after deployment
- Monitor workflow performance in first week
- Prepare rollback plan

---

**Status:** ✅ Ready to Implement  
**Estimated Time:** 8-12 hours  
**Priority:** HIGH
