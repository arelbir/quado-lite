-- ============================================
-- WORKFLOW DEFINITIONS SEED DATA
-- Sample workflow definitions for each entity type
-- Date: 2025-01-25
-- ============================================

-- ============================================
-- 1. AUDIT - NORMAL FLOW (2 steps)
-- ============================================
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions",
  "conditions",
  "vetoRoles"
) VALUES (
  'Audit Normal Flow',
  'Standard audit approval process for low-medium risk audits',
  'Audit',
  1,
  true,
  '[
    {
      "id": "draft",
      "name": "Taslak",
      "type": "start",
      "allowedRoles": ["auditor"]
    },
    {
      "id": "manager-review",
      "name": "Yönetici İncelemesi",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "manager",
      "deadline": "3d",
      "escalateTo": "director"
    },
    {
      "id": "approved",
      "name": "Onaylandı",
      "type": "end"
    }
  ]'::jsonb,
  '[
    { "from": "draft", "to": "manager-review", "action": "submit" },
    { "from": "manager-review", "to": "approved", "action": "approve" },
    { "from": "manager-review", "to": "draft", "action": "reject" }
  ]'::jsonb,
  null,
  '["ceo", "admin"]'::jsonb
);

-- ============================================
-- 2. AUDIT - CRITICAL FLOW (5 steps)
-- ============================================
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions",
  "conditions",
  "vetoRoles"
) VALUES (
  'Audit Critical Flow',
  'Enhanced audit approval process for high-risk audits with multiple approvals',
  'Audit',
  1,
  true,
  '[
    {
      "id": "draft",
      "name": "Taslak",
      "type": "start",
      "allowedRoles": ["auditor"]
    },
    {
      "id": "pre-review",
      "name": "Ön İnceleme",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "senior-auditor",
      "deadline": "2d"
    },
    {
      "id": "manager-review",
      "name": "Yönetici İncelemesi",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "manager",
      "deadline": "3d",
      "escalateTo": "director"
    },
    {
      "id": "director-approval",
      "name": "Direktör Onayı",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "director",
      "deadline": "2d",
      "escalateTo": "ceo"
    },
    {
      "id": "ceo-approval",
      "name": "CEO Onayı",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "ceo",
      "deadline": "5d"
    },
    {
      "id": "approved",
      "name": "Onaylandı",
      "type": "end"
    }
  ]'::jsonb,
  '[
    { "from": "draft", "to": "pre-review", "action": "submit" },
    { "from": "pre-review", "to": "manager-review", "action": "approve" },
    { "from": "pre-review", "to": "draft", "action": "reject" },
    { "from": "manager-review", "to": "director-approval", "action": "approve" },
    { "from": "manager-review", "to": "pre-review", "action": "reject" },
    { "from": "director-approval", "to": "ceo-approval", "action": "approve" },
    { "from": "director-approval", "to": "manager-review", "action": "reject" },
    { "from": "ceo-approval", "to": "approved", "action": "approve" },
    { "from": "ceo-approval", "to": "director-approval", "action": "reject" }
  ]'::jsonb,
  null,
  '["ceo", "admin"]'::jsonb
);

-- ============================================
-- 3. ACTION - QUICK FLOW (2 steps)
-- ============================================
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions",
  "vetoRoles"
) VALUES (
  'Action Quick Flow',
  'Fast-track action approval for routine tasks',
  'Action',
  1,
  true,
  '[
    {
      "id": "draft",
      "name": "Taslak",
      "type": "start",
      "allowedRoles": ["auditor", "manager"]
    },
    {
      "id": "manager-approval",
      "name": "Yönetici Onayı",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "manager",
      "deadline": "2d",
      "escalateTo": "director"
    },
    {
      "id": "approved",
      "name": "Onaylandı",
      "type": "end"
    }
  ]'::jsonb,
  '[
    { "from": "draft", "to": "manager-approval", "action": "submit" },
    { "from": "manager-approval", "to": "approved", "action": "approve" },
    { "from": "manager-approval", "to": "draft", "action": "reject" }
  ]'::jsonb,
  '["manager", "director", "ceo", "admin"]'::jsonb
);

-- ============================================
-- 4. ACTION - COMPLEX FLOW (4 steps)
-- ============================================
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions",
  "vetoRoles"
) VALUES (
  'Action Complex Flow',
  'Comprehensive action approval for high-impact actions',
  'Action',
  1,
  true,
  '[
    {
      "id": "draft",
      "name": "Taslak",
      "type": "start",
      "allowedRoles": ["auditor", "manager"]
    },
    {
      "id": "planning-review",
      "name": "Planlama İncelemesi",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "senior-auditor",
      "deadline": "2d"
    },
    {
      "id": "manager-approval",
      "name": "Yönetici Onayı",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "manager",
      "deadline": "3d",
      "escalateTo": "director"
    },
    {
      "id": "implementation",
      "name": "Uygulama",
      "type": "task",
      "assignmentType": "auto",
      "deadline": "7d"
    },
    {
      "id": "completed",
      "name": "Tamamlandı",
      "type": "end"
    }
  ]'::jsonb,
  '[
    { "from": "draft", "to": "planning-review", "action": "submit" },
    { "from": "planning-review", "to": "manager-approval", "action": "approve" },
    { "from": "planning-review", "to": "draft", "action": "reject" },
    { "from": "manager-approval", "to": "implementation", "action": "approve" },
    { "from": "manager-approval", "to": "planning-review", "action": "reject" },
    { "from": "implementation", "to": "completed", "action": "complete" }
  ]'::jsonb,
  '["director", "ceo", "admin"]'::jsonb
);

-- ============================================
-- 5. DOF - STANDARD FLOW (8-Step CAPA)
-- ============================================
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions",
  "vetoRoles"
) VALUES (
  'DOF Standard CAPA Flow',
  '8-Step CAPA (Corrective and Preventive Action) process',
  'DOF',
  1,
  true,
  '[
    {
      "id": "step1-problem",
      "name": "1. Problem Tanımı (5N1K)",
      "type": "task",
      "assignmentType": "role",
      "assignedRole": "quality-manager",
      "deadline": "3d"
    },
    {
      "id": "step2-temporary",
      "name": "2. Geçici Önlemler",
      "type": "task",
      "assignmentType": "role",
      "assignedRole": "quality-manager",
      "deadline": "2d"
    },
    {
      "id": "step3-root-cause",
      "name": "3. Kök Neden Analizi",
      "type": "task",
      "assignmentType": "role",
      "assignedRole": "quality-manager",
      "deadline": "5d"
    },
    {
      "id": "step4-activities",
      "name": "4. Aktiviteler (Düzeltici/Önleyici)",
      "type": "task",
      "assignmentType": "role",
      "assignedRole": "quality-manager",
      "deadline": "3d"
    },
    {
      "id": "step5-implementation",
      "name": "5. Uygulama",
      "type": "task",
      "assignmentType": "auto",
      "deadline": "14d"
    },
    {
      "id": "step6-effectiveness",
      "name": "6. Etkinlik Kontrolü",
      "type": "task",
      "assignmentType": "role",
      "assignedRole": "quality-manager",
      "deadline": "7d"
    },
    {
      "id": "step7-manager-approval",
      "name": "7. Yönetici Onayı",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "manager",
      "deadline": "3d",
      "escalateTo": "director"
    },
    {
      "id": "step8-closure",
      "name": "8. Kapatma",
      "type": "end"
    }
  ]'::jsonb,
  '[
    { "from": "step1-problem", "to": "step2-temporary", "action": "complete" },
    { "from": "step2-temporary", "to": "step3-root-cause", "action": "complete" },
    { "from": "step3-root-cause", "to": "step4-activities", "action": "complete" },
    { "from": "step4-activities", "to": "step5-implementation", "action": "complete" },
    { "from": "step5-implementation", "to": "step6-effectiveness", "action": "complete" },
    { "from": "step6-effectiveness", "to": "step7-manager-approval", "action": "complete" },
    { "from": "step7-manager-approval", "to": "step8-closure", "action": "approve" },
    { "from": "step7-manager-approval", "to": "step6-effectiveness", "action": "reject" }
  ]'::jsonb,
  '["director", "ceo", "admin"]'::jsonb
);

-- ============================================
-- 6. FINDING - CLOSURE FLOW (3 steps)
-- ============================================
INSERT INTO "WorkflowDefinition" (
  "name",
  "description",
  "entityType",
  "version",
  "isActive",
  "steps",
  "transitions",
  "vetoRoles"
) VALUES (
  'Finding Closure Flow',
  'Finding resolution and closure process',
  'Finding',
  1,
  true,
  '[
    {
      "id": "open",
      "name": "Açık",
      "type": "start",
      "allowedRoles": ["auditor"]
    },
    {
      "id": "resolution-review",
      "name": "Çözüm İncelemesi",
      "type": "approval",
      "assignmentType": "role",
      "assignedRole": "manager",
      "deadline": "5d",
      "escalateTo": "director"
    },
    {
      "id": "closed",
      "name": "Kapalı",
      "type": "end"
    }
  ]'::jsonb,
  '[
    { "from": "open", "to": "resolution-review", "action": "submit" },
    { "from": "resolution-review", "to": "closed", "action": "approve" },
    { "from": "resolution-review", "to": "open", "action": "reject" }
  ]'::jsonb,
  '["director", "ceo", "admin"]'::jsonb
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  "name",
  "entityType",
  "version",
  "isActive",
  jsonb_array_length("steps") as step_count,
  jsonb_array_length("transitions") as transition_count
FROM "WorkflowDefinition"
ORDER BY "entityType", "name";
