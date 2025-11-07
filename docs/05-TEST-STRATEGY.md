# Test Stratejisi ve Senaryolar

**Tarih:** 2025-01-07  
**Amaç:** Sistemin doğru çalıştığını doğrulamak

---

## 📋 Test Seviyeleri

### 1. Manual Testing (Hemen yapılabilir)
### 2. Integration Testing (Playwright)
### 3. Unit Testing (Vitest)

---

## 🎯 ADIM 1: Manual Test Senaryoları

### Senaryo 1: Action CAPA Loop (15 dk)

**Amaç:** Reject loop'un doğru çalıştığını doğrulamak

**Roller:**
- Process Owner (user1)
- Manager (user2)

**Adımlar:**

```
1. Process Owner: Login
   └─ /denetim/findings/{id}

2. Create Action
   ├─ Details: "Fix security vulnerability"
   ├─ Assign to: user1
   ├─ Manager: user2
   └─ Due date: 3 days
   └─ ✅ BEKLENEN: Action created, status="Assigned"

3. Complete Action (as user1)
   ├─ Click "Tamamla" button
   ├─ Completion notes: "Vulnerability fixed, tested locally"
   └─ ✅ BEKLENEN: status="PendingManagerApproval"

4. Manager: Login (as user2)
   └─ /denetim/actions/{id}

5. Reject Action
   ├─ Click "Reddet" button
   ├─ Reason: "Test cases eksik, production test gerekli"
   └─ ✅ BEKLENEN: 
        - status="Assigned" (LOOP!)
        - "Tamamla" button visible again
        - Rejection reason in timeline

6. Process Owner: Add Progress Note
   ├─ Click "İlerleme Notu Ekle"
   ├─ Note: "Test cases eklendi, production'da test edildi"
   └─ ✅ BEKLENEN: Note visible in timeline

7. Complete Action Again (as user1)
   ├─ Completion notes: "All tests passed, ready for approval"
   └─ ✅ BEKLENEN: status="PendingManagerApproval"

8. Manager: Approve Action (as user2)
   ├─ Click "Onayla" button
   └─ ✅ BEKLENEN: 
        - status="Completed"
        - approvedAt set
        - No action buttons visible

9. Verify Timeline
   └─ ✅ BEKLENEN:
        - Created event
        - First completion event
        - Rejection event (with reason)
        - Progress note event
        - Second completion event
        - Approval event
```

**Test Edilecek:**
- [  ] Action oluşturma
- [  ] Tamamlama işlemi
- [  ] Manager reddetme
- [  ] Status "Assigned"'a geri döndü mü?
- [  ] Progress note ekleme
- [  ] Tekrar tamamlama
- [  ] Manager onaylama
- [  ] Timeline doğru mu?
- [  ] Permission checks çalışıyor mu?

---

### Senaryo 2: DOF 8-Step Process (30 dk)

**Amaç:** 8-step CAPA workflow'unun doğru çalıştığını doğrulamak

**Roller:**
- Assigned User (user1)
- Manager (user2)

**Adımlar:**

```
1. Create DOF
   ├─ Finding: {findingId}
   ├─ Problem Title: "Quality issue in production"
   ├─ Assigned to: user1
   └─ Manager: user2
   └─ ✅ BEKLENEN: status="Step1_Problem"

2. Step 1: Problem Definition (5N1K)
   ├─ What: "Defective products found"
   ├─ Where: "Production line 3"
   ├─ When: "2025-01-05"
   ├─ Who: "Operator A"
   ├─ How: "During quality check"
   └─ Why: "Machine calibration issue"
   └─ ✅ BEKLENEN: status="Step2_TempMeasures"

3. Step 2: Temporary Measures
   ├─ Measures: "Stopped production, manual inspection"
   ├─ Date: 2025-01-06
   └─ Effective: Yes
   └─ ✅ BEKLENEN: status="Step3_RootCause"

4. Step 3: Root Cause Analysis (5 Why)
   ├─ Why 1: "Why defects? → Machine not calibrated"
   ├─ Why 2: "Why not calibrated? → Missed schedule"
   ├─ Why 3: "Why missed? → No reminder system"
   ├─ Why 4: "Why no system? → Not implemented"
   ├─ Why 5: "Why not implemented? → Budget constraints"
   └─ Root Cause: "Lack of preventive maintenance system"
   └─ ✅ BEKLENEN: status="Step4_Activities"

5. Step 4: Create Activities
   ├─ Activity 1:
   │  ├─ Type: "Corrective"
   │  ├─ Description: "Calibrate all machines"
   │  ├─ Responsible: user1
   │  └─ Due: 2025-01-15
   └─ Activity 2:
      ├─ Type: "Preventive"
      ├─ Description: "Implement maintenance reminder system"
      ├─ Responsible: user1
      └─ Due: 2025-02-01
   └─ ✅ BEKLENEN: 2 activities created

6. Navigate to Step 5
   └─ ✅ BEKLENEN: status="Step5_Implementation"

7. Step 5: Complete Activities
   ├─ Complete Activity 1:
   │  └─ Notes: "All machines calibrated, verified"
   └─ Complete Activity 2:
      └─ Notes: "Reminder system deployed, tested"
   └─ ✅ BEKLENEN: All activities "Completed"

8. Navigate to Step 6
   └─ ✅ BEKLENEN: status="Step6_Effectiveness"

9. Step 6: Effectiveness Check
   ├─ Effective Date: 2025-02-15
   ├─ Result: "No defects in 2 weeks, system working"
   └─ Is Effective: Yes
   └─ ✅ BEKLENEN: status="PendingManagerApproval"

10. Manager: Reject DOF (LOOP TEST!)
    ├─ Login as user2
    ├─ Navigate to DOF
    ├─ Click "Reddet"
    └─ Reason: "Effectiveness period too short, need 1 month"
    └─ ✅ BEKLENEN: 
         - status="Step6_Effectiveness" (LOOP!)
         - Rejection reason visible

11. Assigned User: Re-do Step 6
    ├─ Login as user1
    ├─ Update Effectiveness Check:
    │  ├─ Effective Date: 2025-03-15 (1 month later)
    │  └─ Result: "No defects in 1 month, confirmed effective"
    └─ ✅ BEKLENEN: status="PendingManagerApproval"

12. Manager: Approve DOF
    ├─ Login as user2
    └─ Click "Onayla"
    └─ ✅ BEKLENEN: status="Completed"
```

**Test Edilecek:**
- [  ] Her step geçişi çalışıyor mu?
- [  ] 5 Why method doğru kaydediliyor mu?
- [  ] Activity oluşturma
- [  ] Activity tamamlama
- [  ] Effectiveness check validation
- [  ] Manager reject loop
- [  ] Status geri dönüyor mu?
- [  ] Final approval
- [  ] Timeline history

---

### Senaryo 3: Finding Closure Validation (20 dk)

**Amaç:** Finding'in ancak tüm action/DOF'ler tamamlandıktan sonra kapanabildiğini doğrulamak

**Adımlar:**

```
1. Create Finding
   └─ Audit: {auditId}
   └─ ✅ BEKLENEN: status="New"

2. Assign to Process Owner
   └─ ✅ BEKLENEN: status="Assigned"

3. Process Owner: Create 2 Actions
   ├─ Action 1: "Fix issue A"
   └─ Action 2: "Fix issue B"
   └─ ✅ BEKLENEN: Finding status="InProgress"

4. Process Owner: Try to Submit for Closure (SHOULD FAIL!)
   ├─ Click "Kapanış İçin Gönder"
   └─ ✅ BEKLENEN: 
        - Error: "Cannot submit - pending actions"
        - Button disabled or error toast

5. Complete Action 1
   ├─ User completes
   └─ Manager approves
   └─ ✅ BEKLENEN: Action 1 status="Completed"

6. Try to Submit for Closure Again (SHOULD STILL FAIL!)
   └─ ✅ BEKLENEN: 
        - Error: "Cannot submit - pending actions"
        - Action 2 still pending

7. Complete Action 2
   ├─ User completes
   └─ Manager approves
   └─ ✅ BEKLENEN: Action 2 status="Completed"

8. Submit for Closure (SHOULD SUCCEED!)
   ├─ Click "Kapanış İçin Gönder"
   ├─ Closure notes: "All actions completed, issue resolved"
   └─ ✅ BEKLENEN: 
        - status="PendingClosure"
        - Auditor notified

9. Auditor: Reject Closure (LOOP TEST!)
   ├─ Login as auditor
   ├─ Click "Reddet"
   └─ Reason: "Need verification report"
   └─ ✅ BEKLENEN:
        - status="InProgress" (LOOP!)
        - Process owner notified

10. Process Owner: Create Verification Report (example)
    └─ Update finding details with report

11. Submit for Closure Again
    └─ ✅ BEKLENEN: status="PendingClosure"

12. Auditor: Approve Closure
    └─ Click "Bulguyu Kapat"
    └─ ✅ BEKLENEN: 
         - status="ClosedApproved"
         - closedAt set
         - Finding card shows "Closed" badge
```

**Test Edilecek:**
- [  ] Closure validation çalışıyor mu?
- [  ] Pending actions varken kapanmıyor mu?
- [  ] Tüm actions completed olunca kapanabiliyor mu?
- [  ] Auditor reject loop
- [  ] Timeline doğru mu?

---

### Senaryo 4: Audit Completion Flow (25 dk)

**Amaç:** End-to-end audit sürecinin doğru çalıştığını doğrulamak

**Adımlar:**

```
1. Create Audit
   ├─ Template: "ISO 9001 Internal Audit"
   ├─ Title: "Q1 2025 Quality Audit"
   ├─ Auditor: user1
   └─ Department: Engineering
   └─ ✅ BEKLENEN: 
        - status="Draft"
        - Questions loaded from template

2. Start Audit
   └─ ✅ BEKLENEN: status="InProgress"

3. Answer Questions
   ├─ Question 1: "Yes" (Score: 10)
   ├─ Question 2: "Partially" (Score: 5)
   ├─ Question 3: "No" (Score: 0)
   └─ ... (answer all questions)
   └─ ✅ BEKLENEN: 
        - Total score calculated
        - Progress bar updates

4. Try to Complete Audit (with unanswered questions - SHOULD FAIL!)
   ├─ Leave 2 questions unanswered
   └─ Click "Denetimi Tamamla"
   └─ ✅ BEKLENEN: 
        - Error: "All questions must be answered"
        - Button disabled

5. Answer Remaining Questions
   └─ ✅ BEKLENEN: Can now complete

6. Complete Audit
   ├─ Click "Denetimi Tamamla"
   └─ ✅ BEKLENEN: 
        - status="Completed"
        - completedAt set
        - totalScore displayed
        - riskLevel calculated

7. Create 2 Findings
   ├─ Finding 1: "Safety issue" (High severity)
   └─ Finding 2: "Documentation missing" (Medium severity)
   └─ ✅ BEKLENEN: Findings created

8. Try to Close Audit (SHOULD FAIL!)
   ├─ Click "Denetimi Kapat"
   └─ ✅ BEKLENEN: 
        - Error: "Cannot close - pending findings"
        - Shows count of open findings

9. Close Finding 1
   ├─ Create action
   ├─ Complete action
   ├─ Manager approves
   ├─ Submit for closure
   └─ Auditor approves
   └─ ✅ BEKLENEN: Finding 1 status="ClosedApproved"

10. Try to Close Audit Again (SHOULD STILL FAIL!)
    └─ ✅ BEKLENEN: Error shows Finding 2 still open

11. Close Finding 2
    └─ (Same process as Finding 1)
    └─ ✅ BEKLENEN: Finding 2 status="ClosedApproved"

12. Close Audit (SHOULD SUCCEED!)
    ├─ Click "Denetimi Kapat"
    └─ ✅ BEKLENEN: 
         - status="Closed"
         - closedAt set
         - All action buttons hidden
         - Archive ready
```

**Test Edilecek:**
- [  ] Template questions loading
- [  ] Question answering
- [  ] Score calculation
- [  ] Completion validation
- [  ] Finding creation
- [  ] Audit closure validation
- [  ] Cannot close with open findings

---

## 🔐 RBAC Permission Tests

### Senaryo 5: Permission Checks (15 dk)

**Amaç:** 4-layer permission model'in doğru çalıştığını doğrulamak

**Test 1: Admin Bypass**

```
1. Login as Admin
2. Navigate to any action (not owned by admin)
3. Try to approve/reject/cancel
   └─ ✅ BEKLENEN: All buttons visible, all actions allowed
```

**Test 2: Role-Based Permissions**

```
1. Create test role "Limited Auditor"
   └─ Permissions: audit.create, audit.read (only)
   └─ NO: audit.complete, audit.close

2. Assign role to user3

3. Login as user3
   ├─ Can create audit ✅
   ├─ Can view audits ✅
   ├─ Cannot complete audit ❌ (button hidden)
   └─ Cannot close audit ❌ (button hidden)
```

**Test 3: Workflow-Based Permissions**

```
1. Create action with workflow
2. Login as user who is NOT assigned
3. Try to complete action
   └─ ✅ BEKLENEN: Error "You are not assigned to this task"

4. Login as assigned user
5. Complete action
   └─ ✅ BEKLENEN: Success
```

**Test 4: Ownership-Based Permissions**

```
1. User1 creates finding
2. Login as User2 (not assigned, not auditor)
3. Try to view finding
   └─ ✅ BEKLENEN: Can view (created by User1, can read own)

4. Try to update finding
   └─ ✅ BEKLENEN: Error "Permission denied"

5. Assign finding to User2
6. Try to update finding
   └─ ✅ BEKLENEN: Success (now assigned)
```

**Test 5: Constraint-Based Permissions**

```
1. Create role "Department Manager"
   └─ Permission: finding.update
   └─ Constraint: { "department": "own" }

2. Assign to user4 (department=Engineering)

3. Login as user4
   ├─ Finding in Engineering dept → Can update ✅
   └─ Finding in HR dept → Cannot update ❌
```

---

## 🤖 Workflow Engine Tests

### Senaryo 6: Auto-Assignment (10 dk)

**Test: Round Robin**

```
1. Create role "AUDITOR"
2. Assign to 3 users: user1, user2, user3

3. Create Workflow Definition
   └─ Step 1: assignmentStrategy="round_robin", role="AUDITOR"

4. Start 3 workflows
   └─ ✅ BEKLENEN:
        - Workflow 1 → assigned to user1
        - Workflow 2 → assigned to user2
        - Workflow 3 → assigned to user3
        - Workflow 4 → assigned to user1 (cycled)
```

**Test: Load Balanced**

```
1. user1 has 5 active tasks
2. user2 has 2 active tasks
3. user3 has 0 active tasks

4. Create workflow with load_balanced strategy
   └─ ✅ BEKLENEN: Assigned to user3 (least load)

5. Create another workflow
   └─ ✅ BEKLENEN: Assigned to user2 (now least load)
```

### Senaryo 7: Deadline Monitoring (15 dk)

```
1. Create action with 2-day deadline
   └─ Deadline: 2025-01-09 (2 days from now)

2. Wait until 1 day before deadline (simulation)
   └─ ✅ BEKLENEN: Warning notification sent

3. Wait until deadline passed (simulation)
   └─ ✅ BEKLENEN:
        - Escalation notification to manager
        - Timeline event created
        - Status still "pending" but flagged

4. Complete task after deadline
   └─ ✅ BEKLENEN: 
        - Can still complete
        - Timeline shows overdue completion
```

---

## ✅ Test Checklist

### Critical Paths (Must Test!)

**Action Workflow:**
- [  ] Create action
- [  ] Complete action
- [  ] Manager approve
- [  ] Manager reject (LOOP test!)
- [  ] Add progress notes
- [  ] Cancel action (exit strategy)
- [  ] Timeline accuracy

**DOF Workflow:**
- [  ] All 8 steps completion
- [  ] 5 Why root cause analysis
- [  ] Activity creation and completion
- [  ] Effectiveness check
- [  ] Manager approval/reject loop
- [  ] Timeline accuracy

**Finding Workflow:**
- [  ] Create finding
- [  ] Assign to process owner
- [  ] Create action/DOF
- [  ] Closure validation (cannot close with pending actions)
- [  ] Submit for closure
- [  ] Auditor approve/reject
- [  ] Timeline accuracy

**Audit Workflow:**
- [  ] Create audit
- [  ] Load template questions
- [  ] Answer questions
- [  ] Score calculation
- [  ] Complete audit
- [  ] Create findings
- [  ] Close audit validation (all findings must be closed)
- [  ] Timeline accuracy

**RBAC System:**
- [  ] Admin bypass
- [  ] Role-based permissions
- [  ] Workflow-based permissions
- [  ] Ownership-based permissions
- [  ] Constraint evaluation (department, status)
- [  ] Permission denied errors

**Workflow Engine:**
- [  ] Workflow start
- [  ] Step completion
- [  ] Transition evaluation
- [  ] Condition evaluation
- [  ] Auto-assignment (round-robin, load-balanced)
- [  ] Deadline monitoring
- [  ] Timeline events

---

## 📊 Test Data Setup

### Users

```sql
-- Admin
user_admin (role: SUPER_ADMIN)

-- Auditors
user_auditor1 (role: AUDITOR, dept: Engineering)
user_auditor2 (role: AUDITOR, dept: HR)

-- Process Owners
user_po1 (role: PROCESS_OWNER, dept: Engineering)
user_po2 (role: PROCESS_OWNER, dept: HR)

-- Managers
user_manager1 (role: MANAGER, dept: Engineering)
user_manager2 (role: MANAGER, dept: HR)
```

### Test Audit

```sql
INSERT INTO "Audits" (
  id, template_id, title, auditor_id, department_id, status
) VALUES (
  'test-audit-1',
  'template-iso-9001',
  'Test Audit Q1 2025',
  'user_auditor1',
  'dept-engineering',
  'Draft'
);
```

### Test Finding

```sql
INSERT INTO "Findings" (
  id, audit_id, description, severity, risk_level, status, created_by_id
) VALUES (
  'test-finding-1',
  'test-audit-1',
  'Security vulnerability found',
  'High',
  'High',
  'New',
  'user_auditor1'
);
```

---

## 🎯 Başarı Kriterleri

### 1. Functional Requirements

✅ Tüm workflow'lar baştan sona çalışıyor  
✅ Reject loop'lar doğru çalışıyor  
✅ Validation'lar beklendiği gibi çalışıyor  
✅ Permission checks tüm senaryolarda doğru  
✅ Timeline events doğru kaydediliyor

### 2. Security Requirements

✅ Unauthorized erişim engelleniyor  
✅ Permission errors düzgün handling  
✅ Admin bypass çalışıyor  
✅ Ownership checks çalışıyor

### 3. UX Requirements

✅ Error messages açık ve anlaşılır  
✅ Button states doğru (disabled/enabled)  
✅ Loading states var  
✅ Toast notifications çalışıyor  
✅ Auto-refresh after operations

---

## 📝 Test Raporlama

### Test Sonuç Format

```markdown
## Test Senaryosu: Action CAPA Loop

**Tarih:** 2025-01-07  
**Tester:** Your Name  
**Durum:** ✅ PASS / ❌ FAIL

### Test Adımları:

1. ✅ Action oluşturma - PASS
   - Expected: status="Assigned"
   - Actual: status="Assigned" ✅

2. ✅ Action tamamlama - PASS
   - Expected: status="PendingManagerApproval"
   - Actual: status="PendingManagerApproval" ✅

3. ✅ Manager reddetme - PASS
   - Expected: status="Assigned" (LOOP!)
   - Actual: status="Assigned" ✅
   - Rejection reason visible: ✅

4. ❌ Progress note ekleme - FAIL
   - Expected: Note visible in timeline
   - Actual: Timeline boş görünüyor ❌
   - **BUG FOUND!**

### Bulunan Buglar:

1. **BUG-001:** Progress notes timeline'da görünmüyor
   - Severity: Medium
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...
```

---

## ✅ Sonraki Adım

**Şimdi ne yapalım?**

1. **Manual testlere başlayalım** → Yukarıdaki senaryoları sırayla test edelim
2. **Bulunan bugları dokümante edelim** → Bug listesi oluşturalım
3. **Playwright E2E testleri yazalım** → Otomasyona geçelim

**Hangi senaryo ile başlamak istersiniz?**

Öneri: **Senaryo 1 (Action CAPA Loop)** ile başlayalım - en kritik ve anlaşılması kolay olan.
