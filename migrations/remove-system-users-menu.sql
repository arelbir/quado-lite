-- Migration: Remove /system/users menu entry
-- Date: 2025-01-29
-- Reason: Duplicate users page removed, only /admin/users remains

BEGIN;

-- Remove role-menu mappings for /system/users
DELETE FROM "RoleMenu" 
WHERE "menuId" IN (
  SELECT id FROM "Menu" WHERE path = '/system/users'
);

-- Remove the menu itself
DELETE FROM "Menu" 
WHERE path = '/system/users';

-- Verify deletion
SELECT COUNT(*) as remaining_system_users_menus 
FROM "Menu" 
WHERE path = '/system/users';

COMMIT;
