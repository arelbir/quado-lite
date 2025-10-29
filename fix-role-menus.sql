-- ============================================
-- FIX: Role-Menu Mappings
-- Clear and re-seed role-menu relationships
-- ============================================

-- Step 1: Clear existing role-menu mappings
DELETE FROM "RoleMenus";

-- Step 2: Now run the seed script
-- pnpm seed:fresh

-- Verification Query:
SELECT 
  r.code as role_code,
  r.name as role_name,
  COUNT(DISTINCT rm."menuId") as menu_count
FROM "Roles" r
LEFT JOIN "RoleMenus" rm ON r.id = rm."roleId"
GROUP BY r.id, r.code, r.name
ORDER BY r.code;

-- Expected Results (AFTER FIX v2):
-- ACTION_OWNER: 2 menus (/ + /admin/workflows/my-tasks)
-- AUDITOR: 11 menus (/ + /audit-system + /denetim/*)
-- PROCESS_OWNER: 28 menus (/ + /audit-system + /denetim/* + /workflow-operations + /admin/workflows + /administration)
-- QUALITY_MANAGER: 30 menus (/ + /audit-system + /denetim/* + /workflow-operations + /admin/workflows + /administration + /system)
-- SUPER_ADMIN: 32 menus (all)

-- Menu breakdown:
-- /                     1 menu  (Dashboard)
-- /audit-system         1 menu  (Parent)
-- /denetim/*            9 menus (Audits, Findings, Actions, DOFs, etc.)
-- /workflow-operations  1 menu  (Parent)
-- /admin/workflows      2 menus (Workflows, My Tasks)
-- /administration      15 menus (Users, Roles, Org Chart, HR Sync, etc.)
-- /system               2 menus (Settings, System Users)
-- other                 3 menus (Additional features)
