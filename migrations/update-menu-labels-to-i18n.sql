-- Menu i18n Migration
-- Converts hard-coded menu labels to translation keys
-- Date: 2025-10-24

-- ========================================
-- BACKUP CURRENT LABELS (Optional)
-- ========================================
-- CREATE TABLE "MenuBackup" AS SELECT * FROM "Menu";

-- ========================================
-- UPDATE MAIN MENU ITEMS
-- ========================================

-- Dashboard
UPDATE "Menu" SET label = 'dashboard' 
WHERE label IN ('Dashboard', 'Ana Sayfa', 'Kontrol Paneli');

-- Audit System
UPDATE "Menu" SET label = 'auditSystem' 
WHERE label IN ('Denetim Sistemi', 'Audit System');

-- Audits
UPDATE "Menu" SET label = 'audits' 
WHERE label IN ('Denetimler', 'Audits');

-- My Audits
UPDATE "Menu" SET label = 'myAudits' 
WHERE label IN ('Denetimlerim', 'My Audits');

-- All Audits  
UPDATE "Menu" SET label = 'allAudits' 
WHERE label IN ('Tüm Denetimler', 'All Audits');

-- Plans
UPDATE "Menu" SET label = 'plans' 
WHERE label IN ('Planlar', 'Plans', 'Denetim Planları', 'Audit Plans');

-- My Tasks
UPDATE "Menu" SET label = 'myTasks' 
WHERE label IN ('Görevlerim', 'My Tasks', 'Bekleyen İşlerim');

-- Findings
UPDATE "Menu" SET label = 'findings' 
WHERE label IN ('Bulgular', 'Findings');

-- Actions
UPDATE "Menu" SET label = 'actions' 
WHERE label IN ('Aksiyonlar', 'Actions');

-- DOFs / CAPAs
UPDATE "Menu" SET label = 'dofs' 
WHERE label IN ('DÖF''ler', 'DÖF (CAPA)', 'CAPA', 'CAPAs');

-- Templates
UPDATE "Menu" SET label = 'templates' 
WHERE label IN ('Şablonlar', 'Templates');

-- Question Banks
UPDATE "Menu" SET label = 'questionBanks' 
WHERE label IN ('Soru Havuzları', 'Soru Havuzu', 'Question Banks');

-- Reports
UPDATE "Menu" SET label = 'reports' 
WHERE label IN ('Raporlar', 'Reports');

-- Settings
UPDATE "Menu" SET label = 'settings' 
WHERE label IN ('Ayarlar', 'Settings');

-- Profile
UPDATE "Menu" SET label = 'profile' 
WHERE label IN ('Profil', 'Profile');

-- ========================================
-- UPDATE NESTED MENU ITEMS (System)
-- ========================================

-- System (parent)
UPDATE "Menu" SET label = 'system.title' 
WHERE label IN ('Sistem', 'System') 
  AND parentId IS NULL;

-- System > Users
UPDATE "Menu" SET label = 'system.users' 
WHERE label IN ('Kullanıcılar', 'Users', 'System Users')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'system.title');

-- System > Menus
UPDATE "Menu" SET label = 'system.menus' 
WHERE label IN ('Menüler', 'Menus', 'System Menus')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'system.title');

-- System > Roles
UPDATE "Menu" SET label = 'system.roles' 
WHERE label IN ('Roller', 'Roles', 'System Roles')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'system.title');

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to verify changes:
-- SELECT id, label, path, icon, parentId FROM "Menu" ORDER BY parentId NULLS FIRST, label;

-- ========================================
-- ROLLBACK (if needed)
-- ========================================
-- If you need to rollback:
-- DROP TABLE "Menu";
-- ALTER TABLE "MenuBackup" RENAME TO "Menu";
