# 🔄 WORKFLOW SYSTEM GUIDE

**Version:** 1.0  
**Date:** 2025-01-26  
**Status:** Production Ready

---

## 📋 İÇİNDEKİLER

1. [Genel Bakış](#genel-bakış)
2. [Frontend - Kullanıcı Arayüzü](#frontend---kullanıcı-arayüzü)
3. [Workflow Nasıl Ayarlanır](#workflow-nasıl-ayarlanır)
4. [Database Yapılandırması](#database-yapılandırması)
5. [Entegrasyon Örnekleri](#entegrasyon-örnekleri)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 GENEL BAKIŞ

### **Workflow Sistemi Nedir?**

Sistemdeki tüm onay süreçlerini yöneten merkezi bir yapı:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   AUDIT     │ ──→  │   WORKFLOW   │ ──→  │   MANAGER   │
│  (Created)  │      │   (Started)  │      │  (Approve)  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ↓
                     ┌──────────────┐
                     │   COMPLETED  │
                     └──────────────┘
```

### **Kullanıldığı Modüller:**

| Modül | Workflow Tipi | Açıklama |
|-------|---------------|----------|
| **Audit** | Audit Completion Flow | Denetim tamamlandığında onay |
| **Finding** | Finding Closure Flow | Bulgu kapatma onayı |
| **Action** | Action Approval Flow | Aksiyon tamamlama onayı |
| **DOF** | DOF CAPA Flow | 8-step CAPA süreci |

---

## 💻 FRONTEND - KULLANICI ARAYÜZÜ

### **1. My Workflow Tasks Sayfası**

**URL:** `/admin/workflows/my-tasks`

**Dosyalar:**
```
src/app/(main)/admin/workflows/my-tasks/
├── page.tsx (Server Component)
└── tasks-client.tsx (Client Component)
```

**Özellikler:**
- ✅ Bekleyen görevleri listeler
- ✅ Approve/Reject butonları
- ✅ Deadline takibi
- ✅ Overdue uyarıları
- ✅ Real-time güncelleme

**Kullanım:**

```typescript
// page.tsx
import { getMyWorkflowTasks } from "@/server/actions/workflow-actions";

export default async function MyWorkflowTasksPage() {
  const result = await getMyWorkflowTasks();
  
  return (
    <WorkflowTasksClient tasks={result.data || []} />
  );
}
```

**Görüntü:**
```
┌───────────────────────────────────────────────┐
│  My Workflow Tasks                            │
├───────────────────────────────────────────────┤
│  📊 Stats:                                    │
│  ├─ Total Tasks:    5                         │
│  ├─ Pending:        3                         │
│  └─ Overdue:        1                         │
├───────────────────────────────────────────────┤
│  📋 Task List:                                │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ Audit - abc12345  [⚠️ Overdue]          │  │
│  │ Workflow: Audit Completion Flow         │  │
│  │ Deadline: 2025-01-25 14:00              │  │
│  │ [✅ Approve] [❌ Reject]                 │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ Action - def67890                        │  │
│  │ Workflow: Action Approval Flow           │  │
│  │ [✅ Approve] [❌ Reject]                 │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

### **2. Workflow Analytics Sayfası**

**URL:** `/admin/workflows/analytics`

**Dosyalar:**
```
src/app/(main)/admin/workflows/analytics/
├── page.tsx
└── analytics-client.tsx
```

**Özellikler:**
- ✅ Workflow istatistikleri
- ✅ Performans metrikleri
- ✅ Bottleneck analizi
- ✅ Top performers
- ✅ Timeline activity (30 gün)

---

### **3. Task Actions (Modül İçinde)**

**Örnek: Audit Detail Page**

```typescript
// src/app/(main)/denetim/audits/[id]/page.tsx

import { completeAudit } from "@/server/actions/audit-actions";

// "Tamamla" butonuna tıklandığında:
onClick={async () => {
  // 1. Audit status: Active → InReview
  // 2. Workflow başlatılır (Audit Completion Flow)
  // 3. Yöneticiye task gider
  await completeAudit(auditId);
}}
```

**Workflow Akışı:**
```
User Action (UI)
     ↓
completeAudit() - Backend
     ↓
Update audit status: Active → InReview
     ↓
startWorkflow({
  workflowDefinitionId: "xxx",
  entityType: "Audit",
  entityId: auditId
})
     ↓
Create workflow instance
     ↓
Assign task to manager (Role-based)
     ↓
Manager sees in /admin/workflows/my-tasks
     ↓
Manager clicks [Approve]
     ↓
transitionWorkflow({ action: "approve" })
     ↓
Audit status: InReview → PendingClosure
     ↓
Complete! ✅
```

---

## ⚙️ WORKFLOW NASIL AYARLANIR

### **ADIM 1: Workflow Definition Oluştur (Database)**

Workflow'lar database'de `WorkflowDefinition` tablosunda tanımlanır.

**SQL ile Workflow Ekleme:**

```sql
-- 1. Workflow Definition oluştur
INSERT INTO "WorkflowDefinition" (id, name, description, "isActive")
VALUES (
  gen_random_uuid(),
  'Audit Completion Flow',
  'Manager approval required for audit completion',
  true
);

-- 2. Workflow Steps tanımla
-- Step 1: Manager Review
INSERT INTO "WorkflowStep" (
  id, 
  "workflowDefinitionId", 
  name, 
  "stepOrder", 
  "assignmentType",
  "assignedRole",
  "deadlineDays"
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "WorkflowDefinition" WHERE name = 'Audit Completion Flow'),
  'Manager Review',
  1,
  'role',  -- role, user, or group
  'Manager',
  3  -- 3 days deadline
);

-- Step 2: Final Approval (isteğe bağlı)
INSERT INTO "WorkflowStep" (
  id, 
  "workflowDefinitionId", 
  name, 
  "stepOrder", 
  "assignmentType",
  "assignedRole",
  "deadlineDays"
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "WorkflowDefinition" WHERE name = 'Audit Completion Flow'),
  'Final Approval',
  2,
  'role',
  'Admin',
  2
);
```

---

### **ADIM 2: Backend'de Workflow Entegrasyonu**

**Dosya:** `src/lib/workflow/workflow-integration.ts`

```typescript
/**
 * Workflow tanımının ID'sini al
 */
export async function getAuditCompletionWorkflowId(): Promise<string | null> {
  return await getWorkflowDefinitionId("Audit Completion Flow");
}

/**
 * Audit metadata'sı hazırla (workflow için context)
 */
export function buildAuditMetadata(audit: any) {
  return {
    riskLevel: audit.riskLevel || "medium",
    department: audit.departmentId,
    auditor: audit.auditorId,
    findingsCount: audit.findingsCount || 0,
  };
}
```

**Dosya:** `src/server/actions/audit-actions.ts`

```typescript
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getAuditCompletionWorkflowId, buildAuditMetadata } from "@/lib/workflow/workflow-integration";

export async function completeAudit(auditId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ... validation ...
    
    // 1. Update audit status
    await db.update(audits)
      .set({ status: "InReview" })
      .where(eq(audits.id, auditId));

    // 2. Start workflow
    const workflowId = await getAuditCompletionWorkflowId();
    if (workflowId) {
      await startWorkflow({
        workflowDefinitionId: workflowId,
        entityType: "Audit",
        entityId: auditId,
        entityMetadata: buildAuditMetadata(audit),
      });
    }

    return { success: true };
  });
}
```

---

### **ADIM 3: Frontend'de Workflow Trigger**

**Örnek: Audit Tamamla Butonu**

```tsx
// src/components/audit/audit-actions.tsx
"use client";

import { completeAudit } from "@/server/actions/audit-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AuditActions({ auditId }: { auditId: string }) {
  const handleComplete = async () => {
    try {
      const result = await completeAudit(auditId);
      
      if (result.success) {
        toast.success("Denetim tamamlandı ve onaya gönderildi!");
        // Refresh page or redirect
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  return (
    <Button onClick={handleComplete}>
      Tamamla ve Onaya Gönder
    </Button>
  );
}
```

---

## 🗄️ DATABASE YAPILANDIRMASI

### **Tablolar:**

```sql
-- 1. Workflow Definitions (Templates)
WorkflowDefinition
├── id (UUID)
├── name (VARCHAR)
├── description (TEXT)
├── isActive (BOOLEAN)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

-- 2. Workflow Steps (Definition içindeki adımlar)
WorkflowStep
├── id (UUID)
├── workflowDefinitionId (FK)
├── name (VARCHAR)
├── stepOrder (INT)
├── assignmentType (role/user/group)
├── assignedRole (VARCHAR)
├── assignedUserId (UUID)
├── deadlineDays (INT)
├── canVeto (BOOLEAN)
└── createdAt (TIMESTAMP)

-- 3. Workflow Instances (Aktif workflow'lar)
WorkflowInstance
├── id (UUID)
├── workflowDefinitionId (FK)
├── entityType (Audit/Finding/Action/DOF)
├── entityId (UUID)
├── currentStepId (FK)
├── status (active/completed/cancelled/vetoed)
├── startedAt (TIMESTAMP)
├── completedAt (TIMESTAMP)
└── entityMetadata (JSONB)

-- 4. Step Assignments (Kullanıcı görevleri)
StepAssignment
├── id (UUID)
├── workflowInstanceId (FK)
├── stepId (FK)
├── assignmentType (role/user/group)
├── assignedRole (VARCHAR)
├── assignedUserId (UUID)
├── status (pending/completed/rejected)
├── deadline (TIMESTAMP)
├── completedAt (TIMESTAMP)
└── completedByUserId (UUID)
```

---

## 🔧 DATABASE'DE WORKFLOW YÖNETIMI

### **Mevcut Workflow'ları Görme:**

```sql
-- Tüm aktif workflow definitions
SELECT id, name, description, "isActive"
FROM "WorkflowDefinition"
WHERE "isActive" = true
ORDER BY name;

-- Bir workflow'un step'lerini görme
SELECT 
  ws.name,
  ws."stepOrder",
  ws."assignmentType",
  ws."assignedRole",
  ws."deadlineDays"
FROM "WorkflowStep" ws
JOIN "WorkflowDefinition" wd ON ws."workflowDefinitionId" = wd.id
WHERE wd.name = 'Audit Completion Flow'
ORDER BY ws."stepOrder";
```

### **Yeni Workflow Ekleme (Örnek: Finding Closure):**

```sql
-- 1. Definition
INSERT INTO "WorkflowDefinition" (id, name, description, "isActive")
VALUES (
  gen_random_uuid(),
  'Finding Closure Flow',
  'Requires auditor approval before closing findings',
  true
);

-- 2. Steps
-- Step 1: Auditor Review
INSERT INTO "WorkflowStep" (
  id,
  "workflowDefinitionId",
  name,
  "stepOrder",
  "assignmentType",
  "assignedRole",
  "deadlineDays",
  "canVeto"
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "WorkflowDefinition" WHERE name = 'Finding Closure Flow'),
  'Auditor Review',
  1,
  'role',
  'Auditor',
  2,
  true  -- Auditor can veto
);

-- Step 2: Manager Approval (if high risk)
INSERT INTO "WorkflowStep" (
  id,
  "workflowDefinitionId",
  name,
  "stepOrder",
  "assignmentType",
  "assignedRole",
  "deadlineDays",
  "canVeto"
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "WorkflowDefinition" WHERE name = 'Finding Closure Flow'),
  'Manager Approval',
  2,
  'role',
  'Manager',
  3,
  false
);
```

---

## 📖 ENTEGRASYON ÖRNEKLERİ

### **Örnek 1: Action Approval Workflow**

**1. Database Setup:**
```sql
-- Workflow tanımla
INSERT INTO "WorkflowDefinition" (id, name, description, "isActive")
VALUES (gen_random_uuid(), 'Action Approval Flow', 'Manager approval for actions', true);

-- Step ekle
INSERT INTO "WorkflowStep" (
  id, "workflowDefinitionId", name, "stepOrder",
  "assignmentType", "assignedRole", "deadlineDays"
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "WorkflowDefinition" WHERE name = 'Action Approval Flow'),
  'Manager Review', 1, 'role', 'Manager', 3
);
```

**2. Backend Integration:**
```typescript
// lib/workflow/workflow-integration.ts
export async function getActionWorkflowId(): Promise<string | null> {
  return await getWorkflowDefinitionId("Action Approval Flow");
}

export function buildActionMetadata(action: any) {
  return {
    priority: action.priority,
    type: action.type,
    findingId: action.findingId,
  };
}

// server/actions/action-actions.ts
export async function completeAction(actionId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // Update status
    await db.update(actions)
      .set({ status: "PendingApproval" })
      .where(eq(actions.id, actionId));

    // Start workflow
    const workflowId = await getActionWorkflowId();
    if (workflowId) {
      await startWorkflow({
        workflowDefinitionId: workflowId,
        entityType: "Action",
        entityId: actionId,
        entityMetadata: buildActionMetadata(action),
      });
    }

    return { success: true };
  });
}
```

**3. Frontend Trigger:**
```tsx
// components/actions/action-complete-button.tsx
"use client";

export function ActionCompleteButton({ actionId }: { actionId: string }) {
  const handleComplete = async () => {
    const result = await completeAction(actionId);
    if (result.success) {
      toast.success("Aksiyon tamamlandı ve onaya gönderildi!");
    }
  };

  return <Button onClick={handleComplete}>Tamamla</Button>;
}
```

---

## 🎨 UI CUSTOMIZATION

### **My Tasks Sayfasını Özelleştirme:**

```tsx
// tasks-client.tsx

// Renkleri değiştir
const isOverdue = task.deadline && new Date(task.deadline) < new Date();

<Card className={isOverdue ? "border-red-500" : "border-blue-500"}>

// Badge stillerini özelleştir
<Badge variant={task.status === "pending" ? "default" : "secondary"}>
  {task.status}
</Badge>

// Buton metinlerini Türkçeye çevir
<Button onClick={() => handleApprove(task)}>
  Onayla
</Button>
<Button onClick={() => handleReject(task)} variant="destructive">
  Reddet
</Button>
```

---

## 🔍 TROUBLESHOOTING

### **Problem 1: Görevler görünmüyor**

**Kontrol:**
```sql
-- Kullanıcının rolünü kontrol et
SELECT id, email, role FROM "User" WHERE id = 'user-id';

-- Pending task'ları kontrol et
SELECT 
  sa.id,
  sa.status,
  sa."assignedRole",
  wi."entityType",
  wi."entityId"
FROM "StepAssignment" sa
JOIN "WorkflowInstance" wi ON sa."workflowInstanceId" = wi.id
WHERE sa."assignedRole" = 'Manager'  -- User'ın rolü
AND sa.status = 'pending';
```

**Çözüm:**
- User'ın doğru role sahip olduğundan emin ol
- Workflow instance'ın active olduğunu kontrol et

---

### **Problem 2: Workflow başlamıyor**

**Kontrol:**
```typescript
// Console log ekle
const workflowId = await getAuditCompletionWorkflowId();
console.log("Workflow ID:", workflowId);  // null mu?

if (!workflowId) {
  console.error("Workflow definition not found!");
}
```

**Çözüm:**
```sql
-- Workflow'un var olduğunu kontrol et
SELECT * FROM "WorkflowDefinition" 
WHERE name = 'Audit Completion Flow'
AND "isActive" = true;

-- Yoksa ekle
INSERT INTO "WorkflowDefinition" (id, name, description, "isActive")
VALUES (gen_random_uuid(), 'Audit Completion Flow', 'Description', true);
```

---

### **Problem 3: Deadline uyarıları çalışmıyor**

**Kontrol:**
```sql
-- Deadline'ı kontrol et
SELECT 
  id,
  deadline,
  NOW() as current_time,
  deadline < NOW() as is_overdue
FROM "StepAssignment"
WHERE status = 'pending';
```

**Çözüm:**
- Deadline monitor cron job'ın çalıştığından emin ol
- `lib/workflow/deadline-monitor.ts` kontrol et

---

## 📊 WORKFLOW MONITORING

### **Aktif Workflow'ları İzleme:**

```sql
-- Dashboard query
SELECT 
  wd.name as workflow_name,
  wi."entityType",
  wi.status,
  COUNT(sa.id) as pending_tasks,
  AVG(EXTRACT(EPOCH FROM (sa.deadline - NOW()))/3600) as avg_hours_remaining
FROM "WorkflowInstance" wi
JOIN "WorkflowDefinition" wd ON wi."workflowDefinitionId" = wd.id
LEFT JOIN "StepAssignment" sa ON wi.id = sa."workflowInstanceId" AND sa.status = 'pending'
WHERE wi.status = 'active'
GROUP BY wd.name, wi."entityType", wi.status
ORDER BY avg_hours_remaining ASC;
```

---

## 🚀 HIZLI BAŞLANGIÇ

### **1. Database'i Hazırla:**

```sql
-- Seed script çalıştır (varsa)
-- Yoksa manuel olarak workflow definitions ekle
```

### **2. İlk Workflow'u Test Et:**

```typescript
// test-workflow.ts
import { startWorkflow } from "@/server/actions/workflow-actions";

async function testWorkflow() {
  const result = await startWorkflow({
    workflowDefinitionId: "workflow-id-buraya",
    entityType: "Audit",
    entityId: "audit-id-buraya",
    entityMetadata: {},
  });
  
  console.log("Workflow started:", result);
}

testWorkflow();
```

### **3. My Tasks Sayfasını Ziyaret Et:**

```
http://localhost:3000/admin/workflows/my-tasks
```

### **4. Approve/Reject Test Et:**

UI'dan bir görevi onayla veya reddet, sonucu gözlemle.

---

## 📝 BEST PRACTICES

### **1. Workflow Naming:**
```
✅ "Audit Completion Flow"
✅ "Action Approval Flow"
✅ "Finding Closure Flow"

❌ "workflow1"
❌ "test_flow"
```

### **2. Step Naming:**
```
✅ "Manager Review"
✅ "Auditor Approval"
✅ "Final Approval"

❌ "step1"
❌ "approval"
```

### **3. Deadline Settings:**
```
✅ 1-3 days for urgent
✅ 3-7 days for normal
✅ 7-14 days for low priority

❌ 0 days (instant)
❌ 365 days (too long)
```

### **4. Role Assignment:**
```
✅ Use roles: "Manager", "Auditor", "Admin"
✅ Fallback to specific users if needed
✅ Group assignments for team tasks

❌ Hardcode specific user IDs
```

---

## 🎯 SONUÇ

Workflow sistemi:
- ✅ Database'de tanımlanır (WorkflowDefinition)
- ✅ Backend'de trigger edilir (startWorkflow)
- ✅ Frontend'de görüntülenir (/admin/workflows/my-tasks)
- ✅ Kullanıcılar approve/reject yapar
- ✅ Otomatik deadline tracking
- ✅ Role-based assignment

**Sistem Production Ready!** 🚀

---

**Version:** 1.0  
**Last Updated:** 2025-01-26  
**Documentation:** Complete
