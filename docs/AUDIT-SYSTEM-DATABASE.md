# 🗄️ Denetim Sistemi - Database Schema

## 📋 İçindekiler
- [Entity İlişki Diyagramı](#entity-i̇lişki-diyagramı)
- [Tablo Detayları](#tablo-detayları)
- [İlişkiler (Relations)](#i̇lişkiler-relations)
- [Indexler ve Performans](#indexler-ve-performans)
- [Migration Stratejisi](#migration-stratejisi)

---

## Entity İlişki Diyagramı (ERD)

```
┌──────────────┐
│  audit_plans │ (Denetim Planları)
├──────────────┤
│ id           │──┐
│ title        │  │
│ template_id  │──│─┐
│ auditor_id   │──│─│─┐
│ schedule_type│  │ │ │
│ status       │  │ │ │
│ ...          │  │ │ │
└──────────────┘  │ │ │
                  │ │ │
        ┌─────────┘ │ │
        ↓           │ │
┌──────────────┐   │ │
│   audits     │ (Denetimler)
├──────────────┤   │ │
│ id           │──┐│ │
│ title        │  ││ │
│ auditor_id   │──│┼─┘
│ status       │  ││
│ ...          │  ││
└──────────────┘  ││
        │         ││
        │  ┌──────┘│
        ↓  ↓       │
┌──────────────┐  │
│  questions   │  │
├──────────────┤  │
│ id           │  │
│ audit_id     │  │
│ text         │  │
│ answer       │  │
│ score        │  │
└──────────────┘  │
        │         │
        ↓         │
┌──────────────┐  │
│  findings    │ (Bulgular)
├──────────────┤  │
│ id           │──┐
│ audit_id     │  │
│ details      │  │
│ status       │  │
│ assigned_to  │──│─┐
│ risk_type    │  │ │
└──────────────┘  │ │
        │         │ │
        ├─────────┘ │
        ↓           │
┌──────────────┐   │
│    capas     │ (DÖF/CAPA)
├──────────────┤   │
│ id           │──┐│
│ finding_id   │  ││
│ root_cause   │  ││
│ analysis     │  ││
└──────────────┘  ││
        │         ││
        ↓         ││
┌──────────────┐  ││
│   actions    │ (Aksiyonlar)
├──────────────┤  ││
│ id           │  ││
│ finding_id   │──┘│
│ capa_id      │───┘
│ type         │
│ status       │
│ assigned_to  │───┐
│ manager_id   │───┼─┐
└──────────────┘   │ │
                   │ │
        ┌──────────┘ │
        ↓            │
┌──────────────┐    │
│ audit_       │    │
│ templates    │    │
├──────────────┤    │
│ id           │────┘
│ name         │
│ category     │
└──────────────┘
        │
        ↓
┌──────────────┐
│   user       │ (Kullanıcılar)
├──────────────┤
│ id           │
│ name         │
│ email        │
│ role         │
└──────────────┘
```

---

## Tablo Detayları

### 1. `audit_plans` - Denetim Planları

**Açıklama:** Planlı ve plansız denetimlerin planlanması

```typescript
export const auditPlans = pgTable("audit_plans", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Temel Bilgiler
  title: text("title").notNull(),
  description: text("description"),
  
  // Plan Tipi
  scheduleType: auditScheduleTypeEnum("schedule_type").notNull(),
  // Enum: "Scheduled" | "Adhoc"
  
  // Status
  status: auditScheduleStatusEnum("status").default("Pending").notNull(),
  // Enum: "Pending" | "Created" | "Cancelled"
  
  // Referanslar
  templateId: uuid("template_id").references(() => auditTemplates.id),
  auditorId: uuid("auditor_id").references(() => user.id),
  createdById: uuid("created_by_id").references(() => user.id),
  createdAuditId: uuid("created_audit_id").references(() => audits.id),
  
  // Scheduled Plan İçin
  scheduledDate: timestamp("scheduled_date"),
  
  // Periyodik Tekrarlama
  recurrenceType: recurrenceTypeEnum("recurrence_type").default("None"),
  // Enum: "None" | "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly"
  
  recurrenceInterval: integer("recurrence_interval").default(1),
  nextScheduledDate: timestamp("next_scheduled_date"),
  maxOccurrences: integer("max_occurrences"),
  occurrenceCount: integer("occurrence_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**Indexler:**
```sql
CREATE INDEX idx_audit_plans_status ON audit_plans(status);
CREATE INDEX idx_audit_plans_scheduled_date ON audit_plans(scheduled_date);
CREATE INDEX idx_audit_plans_next_scheduled ON audit_plans(next_scheduled_date);
CREATE INDEX idx_audit_plans_auditor ON audit_plans(auditor_id);
```

---

### 2. `audits` - Denetimler

**Açıklama:** Gerçekleştirilen denetimler

```typescript
export const audits = pgTable("audits", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Temel Bilgiler
  title: text("title").notNull(),
  description: text("description"),
  auditDate: timestamp("audit_date"),
  
  // Status
  status: auditStatusEnum("status").default("Active").notNull(),
  // Enum: "Draft" | "Active" | "InProgress" | "PendingClosure" | "Closed" | "Archived"
  
  // Referanslar
  auditorId: uuid("auditor_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete
});
```

**Indexler:**
```sql
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_auditor ON audits(auditor_id);
CREATE INDEX idx_audits_audit_date ON audits(audit_date);
CREATE INDEX idx_audits_deleted ON audits(deleted_at) WHERE deleted_at IS NULL;
```

---

### 3. `questions` - Denetim Soruları

**Açıklama:** Denetim sırasında sorulan sorular ve cevapları

```typescript
export const questions = pgTable("questions", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Referans
  auditId: uuid("audit_id").references(() => audits.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }),
  
  // Soru Bilgileri
  text: text("text").notNull(),
  category: text("category"),
  
  // Cevap
  answer: text("answer"),
  score: integer("score"),
  
  // Belge ve Fotoğraflar
  attachments: text("attachments").array(), // URL dizisi
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  answeredAt: timestamp("answered_at"),
});
```

**Indexler:**
```sql
CREATE INDEX idx_questions_audit ON questions(audit_id);
CREATE INDEX idx_questions_category ON questions(category);
```

---

### 4. `findings` - Bulgular

**Açıklama:** Denetim sırasında tespit edilen uygunsuzluklar

```typescript
export const findings = pgTable("findings", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Referans
  auditId: uuid("audit_id").references(() => audits.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }),
  
  // Bulgu Bilgileri
  details: text("details").notNull(),
  riskType: text("risk_type"), // "Kritik" | "Yüksek" | "Orta" | "Düşük"
  
  // Status
  status: findingStatusEnum("status").notNull().default("Open"),
  // Enum: "Open" | "InProgress" | "PendingClosure" | "Closed"
  
  // Referanslar
  assignedToId: uuid("assigned_to_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});
```

**Indexler:**
```sql
CREATE INDEX idx_findings_audit ON findings(audit_id);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_findings_assigned ON findings(assigned_to_id);
CREATE INDEX idx_findings_risk ON findings(risk_type);
```

---

### 5. `dofs` - DÖF (Düzeltici ve Önleyici Faaliyetler)

**Açıklama:** 7 adımlı CAPA süreci ile kompleks bulguların sistematik çözümü

```typescript
export const dofs = pgTable("dofs", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Referans
  findingId: uuid("finding_id").references(() => findings.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }).notNull(),
  
  // Adım 1: Problem Tanımı (5N1K)
  problemTitle: text("problem_title").notNull(),
  problemDetails: text("problem_details"), // Ne, Nerede, Ne zaman, Kim, Nasıl, Niçin
  
  // Adım 2: Geçici Önlemler
  tempMeasures: text("temp_measures"),
  
  // Adım 3: Kök Neden Analizi
  rootCauseAnalysis: text("root_cause_analysis"),
  rootCauseFileUrl: text("root_cause_file_url"), // Balık kılçığı diyagramı vb.
  
  // Adım 4: Faaliyetler → actions tablosunda (dofId ile)
  
  // Adım 5: Uygulama → action'ların tamamlanması
  
  // Adım 6: Etkinlik Kontrolü
  effectivenessCheck: text("effectiveness_check"),
  effectivenessCheckDate: timestamp("effectiveness_check_date"),
  
  // Adım 7: Yönetici Onayı
  
  // Status (Step-based)
  status: dofStatusEnum("status").default("Step1_Problem").notNull(),
  // Enum: "Step1_Problem" | "Step2_TempMeasures" | "Step3_RootCause" | 
  //       "Step4_Activities" | "Step5_Implementation" | "Step6_EffectivenessCheck" |
  //       "PendingManagerApproval" | "Completed" | "Rejected"
  
  // Referanslar
  assignedToId: uuid("assigned_to_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  managerId: uuid("manager_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});
```

**Indexler:**
```sql
CREATE INDEX idx_dofs_finding ON dofs(finding_id);
CREATE INDEX idx_dofs_status ON dofs(status);
CREATE INDEX idx_dofs_assigned ON dofs(assigned_to_id);
CREATE INDEX idx_dofs_manager ON dofs(manager_id);
```

**Alt Action Durumu (Computed):**
DÖF'ün Step5'ten Step6'ya geçebilmesi için tüm action'ları Completed olmalı:
```typescript
async function canMoveToStep6(dofId: string): Promise<boolean> {
  const actions = await getActionsByDofId(dofId);
  return actions.every(a => a.status === "Completed");
}
```

---

### 6. `actions` - Aksiyonlar

**Açıklama:** Hem basit aksiyonlar hem de DÖF alt aksiyonları (DRY prensibi)

```typescript
export const actions = pgTable("actions", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Referanslar (En az biri NULL olmamalı)
  findingId: uuid("finding_id").references(() => findings.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }), // Basit aksiyon için
  
  dofId: uuid("dof_id").references(() => dofs.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }), // DÖF aksiyonu için (Step 4'te oluşturulur)
  
  // Aksiyon Tipi
  type: actionTypeEnum("type").default("Simple").notNull(),
  // Enum: "Simple" | "Corrective" | "Preventive"
  
  // Aksiyon Bilgileri
  details: text("details").notNull(),
  
  // Status
  status: actionStatusEnum("status").notNull().default("Assigned"),
  // Enum: "Assigned" | "PendingManagerApproval" | "Completed" | "Cancelled"
  
  // Referanslar
  assignedToId: uuid("assigned_to_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  managerId: uuid("manager_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Tamamlama ve Red Notları
  completionNotes: text("completion_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Kanıtlar
  evidenceUrls: text("evidence_urls").array(), // Belge/fotoğraf URL'leri
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Constraint: En az biri NULL olmamalı
  // CHECK (finding_id IS NOT NULL OR dof_id IS NOT NULL)
});
```

**Indexler:**
```sql
CREATE INDEX idx_actions_finding ON actions(finding_id);
CREATE INDEX idx_actions_dof ON actions(dof_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_assigned ON actions(assigned_to_id);
CREATE INDEX idx_actions_manager ON actions(manager_id);
CREATE INDEX idx_actions_type ON actions(type);
```

**Constraint:**
```sql
ALTER TABLE actions ADD CONSTRAINT actions_parent_check 
CHECK (finding_id IS NOT NULL OR dof_id IS NOT NULL);
```

---

### 7. `action_progress` - Aksiyon İlerleme Notları

**Açıklama:** Aksiyon sürecinde eklenen notlar ve güncellemeler

```typescript
export const actionProgress = pgTable("action_progress", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Referans
  actionId: uuid("action_id").references(() => actions.id, { 
    onDelete: "cascade", 
    onUpdate: "cascade" 
  }).notNull(),
  
  // Not Bilgileri
  note: text("note").notNull(),
  
  // Referans
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Indexler:**
```sql
CREATE INDEX idx_action_progress_action ON action_progress(action_id);
CREATE INDEX idx_action_progress_created ON action_progress(created_at);
```

---

### 8. `audit_templates` - Denetim Şablonları

**Açıklama:** Önceden tanımlanmış denetim şablonları

```typescript
export const auditTemplates = pgTable("audit_templates", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Şablon Bilgileri
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  
  // Soru Bankası Referansları
  questionBankIds: uuid("question_bank_ids").array(),
  
  // Referans
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
```

**Indexler:**
```sql
CREATE INDEX idx_templates_category ON audit_templates(category);
CREATE INDEX idx_templates_deleted ON audit_templates(deleted_at) WHERE deleted_at IS NULL;
```

---

### 9. `question_banks` - Soru Bankası

**Açıklama:** Şablonlarda kullanılmak üzere soru havuzu

```typescript
export const questionBanks = pgTable("question_banks", {
  // Primary Key
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Soru Bilgileri
  text: text("text").notNull(),
  category: text("category"),
  tags: text("tags").array(),
  
  // Referans
  createdById: uuid("created_by_id").references(() => user.id, { 
    onDelete: "set null", 
    onUpdate: "cascade" 
  }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});
```

**Indexler:**
```sql
CREATE INDEX idx_question_banks_category ON question_banks(category);
CREATE INDEX idx_question_banks_tags ON question_banks USING GIN(tags);
CREATE INDEX idx_question_banks_deleted ON question_banks(deleted_at) WHERE deleted_at IS NULL;
```

---

## İlişkiler (Relations)

### Drizzle ORM Relations

```typescript
// audit_plans relations
export const auditPlansRelations = relations(auditPlans, ({ one }) => ({
  template: one(auditTemplates, {
    fields: [auditPlans.templateId],
    references: [auditTemplates.id],
  }),
  auditor: one(user, {
    fields: [auditPlans.auditorId],
    references: [user.id],
  }),
  createdBy: one(user, {
    fields: [auditPlans.createdById],
    references: [user.id],
  }),
  createdAudit: one(audits, {
    fields: [auditPlans.createdAuditId],
    references: [audits.id],
  }),
}));

// audits relations
export const auditsRelations = relations(audits, ({ one, many }) => ({
  auditor: one(user, {
    fields: [audits.auditorId],
    references: [user.id],
    relationName: 'audit_auditor',
  }),
  createdBy: one(user, {
    fields: [audits.createdById],
    references: [user.id],
    relationName: 'audit_creator',
  }),
  questions: many(questions),
  findings: many(findings),
}));

// findings relations
export const findingsRelations = relations(findings, ({ one, many }) => ({
  audit: one(audits, {
    fields: [findings.auditId],
    references: [audits.id],
  }),
  assignedTo: one(user, {
    fields: [findings.assignedToId],
    references: [user.id],
    relationName: 'finding_assigned',
  }),
  createdBy: one(user, {
    fields: [findings.createdById],
    references: [user.id],
    relationName: 'finding_creator',
  }),
  actions: many(actions),
  dofs: many(dofs),
}));

// dofs relations
export const dofsRelations = relations(dofs, ({ one, many }) => ({
  finding: one(findings, {
    fields: [dofs.findingId],
    references: [findings.id],
  }),
  assignedTo: one(user, {
    fields: [dofs.assignedToId],
    references: [user.id],
    relationName: 'dof_assigned',
  }),
  manager: one(user, {
    fields: [dofs.managerId],
    references: [user.id],
    relationName: 'dof_manager',
  }),
  createdBy: one(user, {
    fields: [dofs.createdById],
    references: [user.id],
    relationName: 'dof_creator',
  }),
  actions: many(actions),
}));

// actions relations
export const actionsRelations = relations(actions, ({ one, many }) => ({
  finding: one(findings, {
    fields: [actions.findingId],
    references: [findings.id],
  }),
  dof: one(dofs, {
    fields: [actions.dofId],
    references: [dofs.id],
  }),
  assignedTo: one(user, {
    fields: [actions.assignedToId],
    references: [user.id],
    relationName: 'action_assigned',
  }),
  manager: one(user, {
    fields: [actions.managerId],
    references: [user.id],
    relationName: 'action_manager',
  }),
  createdBy: one(user, {
    fields: [actions.createdById],
    references: [user.id],
    relationName: 'action_creator',
  }),
  progressNotes: many(actionProgress),
}));
```

---

## Indexler ve Performans

### Kritik Sorgular ve İndeksler

**1. Dashboard Sorguları:**
```sql
-- Aktif denetimler
SELECT * FROM audits 
WHERE status IN ('Active', 'InProgress') 
  AND deleted_at IS NULL;
-- Index: idx_audits_status, idx_audits_deleted

-- Bekleyen bulgular
SELECT * FROM findings 
WHERE status IN ('Open', 'InProgress') 
  AND assigned_to_id = $1;
-- Index: idx_findings_assigned, idx_findings_status

-- Bekleyen aksiyonlar
SELECT * FROM actions 
WHERE status = 'Assigned' 
  AND assigned_to_id = $1;
-- Index: idx_actions_assigned, idx_actions_status
```

**2. Onay Bekleyen İşler:**
```sql
-- Onay bekleyen aksiyonlar
SELECT * FROM actions 
WHERE status = 'PendingManagerApproval' 
  AND manager_id = $1;
-- Index: idx_actions_manager, idx_actions_status

-- Onay bekleyen bulgular
SELECT f.* FROM findings f
JOIN audits a ON f.audit_id = a.id
WHERE f.status = 'PendingClosure'
  AND a.auditor_id = $1;
-- Index: idx_findings_status, idx_audits_auditor
```

**3. Raporlama:**
```sql
-- Denetim özet raporu
SELECT 
  a.*,
  COUNT(DISTINCT f.id) as total_findings,
  COUNT(DISTINCT CASE WHEN f.status = 'Closed' THEN f.id END) as closed_findings
FROM audits a
LEFT JOIN findings f ON a.id = f.audit_id
WHERE a.id = $1
GROUP BY a.id;
-- Index: idx_findings_audit, idx_findings_status
```

---

## Migration Stratejisi

### 1. Yeni Sistem Kurulumu (Clean Install)

```sql
-- 1. Enum'ları oluştur
CREATE TYPE audit_status AS ENUM (
  'Draft', 'Active', 'InProgress', 'PendingClosure', 'Closed', 'Archived'
);

CREATE TYPE finding_status AS ENUM (
  'Open', 'InProgress', 'PendingClosure', 'Closed'
);

CREATE TYPE action_status AS ENUM (
  'Assigned', 'PendingManagerApproval', 'Completed', 'Cancelled'
);

CREATE TYPE action_type AS ENUM (
  'Simple', 'Corrective', 'Preventive'
);

-- 2. Tabloları oluştur (sırayla, foreign key'lere dikkat)
-- 3. Index'leri oluştur
-- 4. Constraint'leri ekle
```

### 2. Mevcut Sistemden Geçiş

**Adım 1: Yeni tabloları ekle**
```sql
-- capas tablosunu ekle
-- actions tablosuna capa_id ve type ekle
```

**Adım 2: Mevcut verileri migrate et**
```sql
-- Basit aksiyonları güncelle
UPDATE actions SET type = 'Simple' WHERE capa_id IS NULL;

-- Status güncellemeleri
-- Finding: 'New', 'Assigned' → 'Open'
-- Finding: 'Completed' → 'Closed'
-- Finding: 'PendingAuditorClosure' → 'PendingClosure'
```

**Adım 3: Eski kolonları kaldır**
```sql
-- Artık kullanılmayan kolonları drop et
```

---

**Versiyon:** 1.0  
**Son Güncelleme:** 23 Ekim 2025  
**Durum:** Planlama Aşaması
