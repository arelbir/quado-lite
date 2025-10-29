-- ============================================
-- DEBUG: Role-Menu Mappings
-- Detailed analysis of menu assignments
-- ============================================

-- 1. Check total menu count
SELECT COUNT(*) as total_menus FROM "Menu";

-- 2. Check menu paths (see what paths exist)
SELECT 
  id,
  path,
  label,
  type,
  "parentId"
FROM "Menu"
ORDER BY path;

-- 3. Check role-menu mappings in detail
SELECT 
  r.code as role_code,
  r.name as role_name,
  m.path as menu_path,
  m.label as menu_label,
  m.type as menu_type
FROM "RoleMenus" rm
JOIN "Roles" r ON rm."roleId" = r.id
JOIN "Menu" m ON rm."menuId" = m.id
WHERE r.code IN ('QUALITY_MANAGER', 'PROCESS_OWNER', 'AUDITOR', 'ACTION_OWNER')
ORDER BY r.code, m.path;

-- 4. Check which menus match each path pattern
-- QUALITY_MANAGER paths: '/', '/audit-system', '/workflow-operations', '/administration', '/system'
SELECT 
  'QUALITY_MANAGER' as role,
  path,
  CASE 
    WHEN path = '/' THEN 'matches: /'
    WHEN path LIKE '/audit-system%' THEN 'matches: /audit-system'
    WHEN path LIKE '/workflow-operations%' THEN 'matches: /workflow-operations'
    WHEN path LIKE '/administration%' OR path LIKE '/admin/%' THEN 'matches: /administration'
    WHEN path LIKE '/system%' THEN 'matches: /system'
    ELSE 'NO MATCH'
  END as match_reason
FROM "Menu"
WHERE 
  path = '/' OR
  path LIKE '/audit-system%' OR
  path LIKE '/workflow-operations%' OR
  path LIKE '/administration%' OR
  path LIKE '/admin/%' OR
  path LIKE '/system%'
ORDER BY path;

-- 5. Count menus by parent path
SELECT 
  CASE 
    WHEN path = '/' THEN 'root'
    WHEN path LIKE '/audit-system%' THEN '/audit-system'
    WHEN path LIKE '/workflow-operations%' THEN '/workflow-operations'
    WHEN path LIKE '/admin%' THEN '/administration'
    WHEN path LIKE '/system%' THEN '/system'
    WHEN path LIKE '/denetim%' THEN '/denetim'
    ELSE 'other'
  END as path_group,
  COUNT(*) as menu_count
FROM "Menu"
GROUP BY path_group
ORDER BY menu_count DESC;
