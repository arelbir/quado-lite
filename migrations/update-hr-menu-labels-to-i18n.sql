-- HR Module Menu i18n Migration
-- Adds translation keys for HR/Organization menu items
-- Date: 2025-01-25

-- ========================================
-- UPDATE HR/ADMIN MODULE MENU ITEMS
-- ========================================

-- Admin (parent menu)
UPDATE "Menu" SET label = 'admin' 
WHERE label IN ('Yönetim', 'Administration', 'Admin', 'navigation.menu.administration')
  AND parentId IS NULL;

-- Organization (parent submenu under Admin)
UPDATE "Menu" SET label = 'organization' 
WHERE label IN ('Organizasyon', 'Organization')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'admin');

-- Companies
UPDATE "Menu" SET label = 'companies' 
WHERE label IN ('Şirketler', 'Companies')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'organization');

-- Branches
UPDATE "Menu" SET label = 'branches' 
WHERE label IN ('Şubeler', 'Branches')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'organization');

-- Departments
UPDATE "Menu" SET label = 'departments' 
WHERE label IN ('Departmanlar', 'Departments')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'organization');

-- Positions
UPDATE "Menu" SET label = 'positions' 
WHERE label IN ('Pozisyonlar', 'Positions')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'organization');

-- Org Chart
UPDATE "Menu" SET label = 'orgChart' 
WHERE label IN ('Organizasyon Şeması', 'Org Chart', 'Organization Chart', 'navigation.menu.orgChart')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'organization');

-- HR Sync (İK Senkronizasyonu)
UPDATE "Menu" SET label = 'hrSync' 
WHERE label IN ('İK Senkronizasyonu', 'HR Synchronization', 'HR Sync')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'admin');

-- Roles & Permissions
UPDATE "Menu" SET label = 'roles' 
WHERE label IN ('Roller ve Yetkiler', 'Roles & Permissions', 'Roles', 'navigation.menu.roleManagement')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'admin');

-- User Management
UPDATE "Menu" SET label = 'users' 
WHERE label IN ('Kullanıcı Yönetimi', 'User Management', 'Users', 'navigation.menu.userManagement')
  AND parentId IN (SELECT id FROM "Menu" WHERE label = 'admin');

-- ========================================
-- VERIFICATION QUERY
-- ========================================
-- Run this to verify HR menu changes:
-- SELECT id, label, path, icon, parentId, "order" 
-- FROM "Menu" 
-- WHERE label IN ('admin', 'organization', 'companies', 'branches', 'departments', 'positions', 'orgChart', 'hrSync', 'roles', 'users')
-- ORDER BY parentId NULLS FIRST, "order", label;

-- ========================================
-- COMPLETE MENU STRUCTURE (for reference)
-- ========================================
/*
Expected structure after migration:

Admin (admin)
├── Organization (organization)
│   ├── Companies (companies)
│   ├── Branches (branches)
│   ├── Departments (departments)
│   ├── Positions (positions)
│   └── Org Chart (orgChart)
├── HR Sync (hrSync)
├── Roles & Permissions (roles)
└── User Management (users)
*/

-- ========================================
-- NOTES
-- ========================================
-- 1. These labels correspond to keys in:
--    - src/i18n/locales/tr/navigation.json
--    - src/i18n/locales/en/navigation.json
--
-- 2. Menu rendering should use:
--    t(`navigation.menu.${menu.label}`)
--
-- 3. If menu items don't exist yet, create them first:
/*
   INSERT INTO "Menu" (id, label, path, icon, "order", parentId) VALUES
   ('admin-id', 'admin', '/admin', 'Settings', 1, NULL),
   ('org-id', 'organization', '/admin/organization', 'Building', 1, 'admin-id'),
   ('companies-id', 'companies', '/admin/organization/companies', 'Building2', 1, 'org-id'),
   ('branches-id', 'branches', '/admin/organization/branches', 'MapPin', 2, 'org-id'),
   ('departments-id', 'departments', '/admin/organization/departments', 'Layers', 3, 'org-id'),
   ('positions-id', 'positions', '/admin/organization/positions', 'Briefcase', 4, 'org-id'),
   ('hr-sync-id', 'hrSync', '/admin/hr-sync', 'RefreshCw', 2, 'admin-id'),
   ('roles-id', 'roles', '/admin/roles', 'Shield', 3, 'admin-id'),
   ('users-id', 'users', '/admin/users', 'Users', 4, 'admin-id');
*/
