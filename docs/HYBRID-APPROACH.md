# 🔄 Hibrit Yaklaşım: DÖF + Action Modülü

## 📋 Özet

Bu dokuman, **DÖF (7 adımlı CAPA)** ve **Action modülü** entegrasyonunu açıklar. Bu hibrit yaklaşım, her iki sistemin avantajlarını birleştirir:

- ✅ **DÖF:** 7 adımlı ISO 9001 uyumlu CAPA süreci
- ✅ **Action:** DRY prensibiyle tekrar kullanılabilir onay mekanizması

---

## 🎯 Temel Prensip

```
DÖF = 7 Adımlı Container (Problem → Kök Neden → Actions → Etkinlik → Onay)
Actions = Reusable Module (Basit Aksiyon VEYA DÖF Alt Aksiyonu)
```

**DRY İlkesi:**
- ❌ `dofActivities` tablosu kullanılmıyor (gereksiz tekrar)
- ✅ Mevcut `actions` tablosu hem basit hem DÖF aksiyonları için kullanılıyor

---

## 🗄️ Database Yapısı

### 1. DÖF Tablosu (7 Adım Container)

```typescript
dofs {
  id: uuid,
  findingId: uuid,
  
  // Step 1: Problem Tanımı (5N1K)
  problemTitle: text,
  problemDetails: text, // Ne, Nerede, Ne zaman, Kim, Nasıl, Niçin
  
  // Step 2: Geçici Önlemler
  tempMeasures: text,
  
  // Step 3: Kök Neden Analizi
  rootCauseAnalysis: text,
  rootCauseFileUrl: text, // Fishbone diagram
  
  // Step 4: Actions (actions tablosunda dofId ile bağlı)
  // Step 5: Uygulama (actions tamamlanması)
  
  // Step 6: Etkinlik Kontrolü
  effectivenessCheck: text,
  effectivenessCheckDate: timestamp,
  
  // Step 7: Yönetici Onayı
  
  status: dofStatusEnum, // Step-based
  assignedToId: uuid,
  managerId: uuid,
  createdById: uuid,
}

dofStatusEnum = [
  "Step1_Problem",
  "Step2_TempMeasures",
  "Step3_RootCause",
  "Step4_Activities",
  "Step5_Implementation",
  "Step6_EffectivenessCheck",
  "PendingManagerApproval",
  "Completed",
  "Rejected"
]
```

---

### 2. Actions Tablosu (Reusable)

```typescript
actions {
  id: uuid,
  
  // Parent Referansları (En az biri NULL olmamalı)
  findingId: uuid,  // Basit aksiyon için
  dofId: uuid,      // DÖF aksiyonu için (Step 4'te oluşturulur)
  
  // Type
  type: actionTypeEnum, // "Simple" | "Corrective" | "Preventive"
  
  // Details
  details: text,
  
  // Status (Onay mekanizması)
  status: actionStatusEnum, // "Assigned" | "PendingManagerApproval" | "Completed" | "Cancelled"
  
  // Referanslar
  assignedToId: uuid,
  managerId: uuid,
  createdById: uuid,
  
  // Notlar
  completionNotes: text,
  rejectionReason: text,
  evidenceUrls: text[],
}

actionTypeEnum = ["Simple", "Corrective", "Preventive"]
actionStatusEnum = ["Assigned", "PendingManagerApproval", "Completed", "Cancelled"]
```

**Constraint:**
```sql
ALTER TABLE actions ADD CONSTRAINT actions_parent_check 
CHECK (finding_id IS NOT NULL OR dof_id IS NOT NULL);
```

---

## 🔄 Workflow

### Bulgu → Basit Aksiyon

```
Finding (Open)
    ↓
Basit Action Oluştur
    type: "Simple"
    findingId: xxx
    dofId: null
    ↓
Action: Assigned → PendingApproval → Completed
    ↓
Finding: InProgress → PendingClosure → Closed
```

---

### Bulgu → DÖF → Alt Actions

```
Finding (Open)
    ↓
DÖF Oluştur (Step 1)
    ↓
Step 1-3: Problem ve Kök Neden
    ↓
Step 4: Actions Oluştur
    ├─ Action 1 (type: "Corrective", dofId: xxx, findingId: null)
    ├─ Action 2 (type: "Corrective", dofId: xxx, findingId: null)
    └─ Action 3 (type: "Preventive", dofId: xxx, findingId: null)
    ↓
Step 5: Actions Tamamlanır
    Action 1: Assigned → PendingApproval → Completed ✅
    Action 2: Assigned → PendingApproval → Completed ✅
    Action 3: Assigned → PendingApproval → Completed ✅
    ↓
Tüm Actions Completed → DÖF Step 6'ya geçebilir
    ↓
Step 6: Etkinlik Kontrolü
    ↓
Step 7: Yönetici Onayı
    DÖF: PendingManagerApproval → Completed
    ↓
Finding: InProgress → PendingClosure → Closed
```

---

## ✅ Avantajlar

### 1. **DRY (Don't Repeat Yourself)**
```
❌ Önce:
- actions tablosu (basit aksiyonlar için)
- dofActivities tablosu (DÖF aktiviteleri için)
= İki ayrı onay mekanizması

✅ Sonra:
- actions tablosu (her ikisi için)
= Tek onay mekanizması
```

### 2. **Full-Featured Actions**
```
DÖF Action'ları:
✅ Assigned → PendingApproval → Completed
✅ Döngü mekanizması (Reject → Assigned)
✅ Yönetici onayı
✅ Kanıt ekleme
✅ İptal etme
✅ Timeline tracking

❌ Önceki dofActivities:
- Sadece isCompleted: boolean
- Basit yapı
```

### 3. **ISO 9001 Uyumlu + Modern**
```
✅ 7 adımlı CAPA süreci (ISO standardı)
✅ Modern onay mekanizması
✅ Sınırsız döngü (quality control)
✅ Detaylı audit trail
```

---

## 📊 Karşılaştırma Tablosu

| Özellik | Eski (CAPA) | Eski (dofActivities) | Yeni (Hibrit) |
|---------|-------------|---------------------|---------------|
| **7 Adımlı Süreç** | ❌ Yok | ✅ Var | ✅ Var |
| **Kök Neden Analizi** | ✅ Basit | ✅ Detaylı | ✅ Detaylı |
| **Alt İşler** | ✅ Actions | ❌ Activities (basit) | ✅ Actions (full) |
| **Onay Mekanizması** | ✅ Action onayı | ❌ Boolean | ✅ Action onayı |
| **Döngü** | ✅ Var | ❌ Yok | ✅ Var |
| **DRY** | ✅ İyi | ❌ Tekrar var | ✅ Mükemmel |
| **ISO Uyumlu** | ⚠️ Kısmen | ✅ Tam | ✅ Tam |

---

## 🔧 Migration Gerekli

### Mevcut Durum:
```typescript
// ✅ Var
dofs table (7 adım)
dofActivities table (basit activities)
actions table (findingId var, dofId yok)

// ❌ Eksik
actions.dofId field'ı
actions.type enum'ı
```

### Migration Adımları:

```sql
-- 1. action_type enum ekle
CREATE TYPE action_type AS ENUM ('Simple', 'Corrective', 'Preventive');

-- 2. actions tablosuna dofId ve type ekle
ALTER TABLE actions ADD COLUMN dof_id uuid REFERENCES dofs(id) ON DELETE CASCADE;
ALTER TABLE actions ADD COLUMN type action_type DEFAULT 'Simple' NOT NULL;

-- 3. Mevcut action'ları Simple olarak işaretle (zaten default)
UPDATE actions SET type = 'Simple' WHERE type IS NULL;

-- 4. dofActivities'den actions'a migrate et
INSERT INTO actions (dof_id, type, details, status, assigned_to_id, created_at)
SELECT 
  dof_id,
  type::action_type,
  description,
  CASE 
    WHEN is_completed = true THEN 'Completed'::action_status
    ELSE 'Assigned'::action_status
  END,
  responsible_id,
  created_at
FROM dof_activities;

-- 5. dofActivities tablosunu kaldır (opsiyonel, yedek al)
-- DROP TABLE dof_activities;

-- 6. Constraint ekle
ALTER TABLE actions ADD CONSTRAINT actions_parent_check 
CHECK (finding_id IS NOT NULL OR dof_id IS NOT NULL);

-- 7. Index ekle
CREATE INDEX idx_actions_dof ON actions(dof_id);
```

---

## 📝 Backend Logic Örnekleri

### DÖF'te Action Oluştur (Step 4)

```typescript
async function createDofAction(data: {
  dofId: string;
  type: "Corrective" | "Preventive";
  details: string;
  assignedToId: string;
  managerId: string;
}): Promise<ActionResponse<{ id: string }>> {
  const user = await currentUser();
  
  const [action] = await db.insert(actions).values({
    dofId: data.dofId,
    findingId: null, // DÖF aksiyonu için null
    type: data.type,
    details: data.details,
    status: "Assigned",
    assignedToId: data.assignedToId,
    managerId: data.managerId,
    createdById: user.id,
  }).returning({ id: actions.id });
  
  return { success: true, data: { id: action.id } };
}
```

---

### Step 5 → Step 6 Geçiş Kontrolü

```typescript
async function checkDofActionsCompletion(dofId: string) {
  const dof = await db.query.dofs.findFirst({
    where: eq(dofs.id, dofId),
    with: { actions: true }
  });
  
  if (!dof || dof.status !== "Step5_Implementation") return;
  
  // Tüm action'lar completed mı?
  const allCompleted = dof.actions.every(a => a.status === "Completed");
  
  if (allCompleted) {
    // Step 6'ya geçiş izni ver (UI'da görünür)
    return { canMoveToStep6: true };
  }
  
  return { canMoveToStep6: false };
}
```

---

### Bulgu Kapatma Kontrolü (Finding Closure)

```typescript
async function checkFindingCompletion(findingId: string) {
  const finding = await db.query.findings.findFirst({
    where: eq(findings.id, findingId),
    with: {
      actions: true, // Basit aksiyonlar
      dofs: {
        with: { actions: true } // DÖF action'ları
      }
    }
  });
  
  if (!finding || finding.status !== "InProgress") return;
  
  // 1. Basit aksiyonlar tamam mı?
  const simpleActions = finding.actions.filter(a => a.type === "Simple");
  const simpleComplete = simpleActions.every(a => a.status === "Completed");
  
  // 2. DÖF'ler tamam mı?
  const dofsComplete = finding.dofs.every(dof => {
    // DÖF Completed durumunda mı?
    if (dof.status !== "Completed") return false;
    
    // Alternatif: DÖF action'ları completed mı?
    return dof.actions.every(a => a.status === "Completed");
  });
  
  // Her şey tamam ise PendingClosure'a geç
  if (simpleComplete && dofsComplete) {
    await db.update(findings)
      .set({ status: "PendingClosure" })
      .where(eq(findings.id, findingId));
    
    // Denetçiye bildirim
    await notifyAuditor(finding.auditId, "Bulgu onay bekliyor");
  }
}
```

---

## 🎯 Sonuç

**Hibrit yaklaşım en iyi çözüm:**
- ✅ ISO 9001 uyumlu 7 adımlı DÖF süreci
- ✅ DRY: Action modülü tekrar kullanılıyor
- ✅ SOLID: Single Responsibility
- ✅ Full-featured: Onay, döngü, timeline
- ✅ Maintainable: Tek onay logic

**Next Steps:**
1. ✅ Dokümantasyon güncellendi
2. 🔄 Migration script'i hazırla
3. 🔄 Schema'yı güncelle (`actions` tablosuna `dofId` ekle)
4. 🔄 Backend action'ları güncelle
5. 🔄 Frontend UI'ı güncelle

---

**Versiyon:** 1.0  
**Son Güncelleme:** 23 Ekim 2025  
**Durum:** Dokümantasyon Tamamlandı, Implementation Bekliyor
