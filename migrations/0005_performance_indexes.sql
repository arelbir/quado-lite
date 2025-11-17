-- Migration: Performance Optimization - Database Indexes
-- Date: 2025-11-18
-- Description: Add indexes for frequently queried columns to improve performance

-- ============================================================================
-- USER TABLE INDEXES
-- ============================================================================

-- Email lookups (authentication, user search)
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User" ("email");

-- Active user queries
CREATE INDEX IF NOT EXISTS "idx_user_active" ON "User" ("isActive") WHERE "isActive" = true;

-- Department/Role filtering
CREATE INDEX IF NOT EXISTS "idx_user_department_role" ON "User" ("departmentId", "roleId");

-- ============================================================================
-- WORKFLOW INDEXES
-- ============================================================================

-- Visual Workflow queries (by module, status)
CREATE INDEX IF NOT EXISTS "idx_visual_workflow_module_status" ON "VisualWorkflow" ("module", "status");

-- Created by queries
CREATE INDEX IF NOT EXISTS "idx_visual_workflow_created" ON "VisualWorkflow" ("createdById", "createdAt" DESC);

-- ============================================================================
-- TEAMS & GROUPS INDEXES
-- ============================================================================

-- Team lookups (by code, department)
CREATE INDEX IF NOT EXISTS "idx_team_code" ON "Team" ("code");
CREATE INDEX IF NOT EXISTS "idx_team_department" ON "Team" ("departmentId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_team_leader" ON "Team" ("leaderId");

-- User-Team membership queries
CREATE INDEX IF NOT EXISTS "idx_user_team_user" ON "UserTeam" ("userId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_user_team_team" ON "UserTeam" ("teamId") WHERE "isActive" = true;

-- Group lookups (by code, visibility)
CREATE INDEX IF NOT EXISTS "idx_group_code" ON "Group" ("code");
CREATE INDEX IF NOT EXISTS "idx_group_visibility" ON "Group" ("visibility") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_group_owner" ON "Group" ("ownerId");

-- Group membership queries
CREATE INDEX IF NOT EXISTS "idx_group_member_user" ON "GroupMember" ("userId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "idx_group_member_group" ON "GroupMember" ("groupId") WHERE "isActive" = true;

-- ============================================================================
-- NOTIFICATION INDEXES
-- ============================================================================

-- User notifications (most common query)
CREATE INDEX IF NOT EXISTS "idx_notification_user_read" ON "Notification" ("userId", "isRead", "createdAt" DESC);

-- Unread notifications count
CREATE INDEX IF NOT EXISTS "idx_notification_unread" ON "Notification" ("userId") WHERE "isRead" = false;

-- ============================================================================
-- AUDIT & ACTIVITY INDEXES
-- ============================================================================

-- Audit log queries (by entity, user, action)
CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "AuditLog" ("entityType", "entityId", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_user" ON "AuditLog" ("userId", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "AuditLog" ("action", "timestamp" DESC);

-- Recent audit logs
CREATE INDEX IF NOT EXISTS "idx_audit_timestamp" ON "AuditLog" ("timestamp" DESC);

-- ============================================================================
-- CUSTOM FIELDS INDEXES
-- ============================================================================

-- Custom field lookups
CREATE INDEX IF NOT EXISTS "idx_custom_field_entity" ON "CustomFieldDefinition" ("entityType", "isActive");

-- Custom field values
CREATE INDEX IF NOT EXISTS "idx_custom_field_value_entity" ON "CustomFieldValue" ("entityType", "entityId");

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX "idx_user_email" IS 'Optimize user email lookups for authentication';
COMMENT ON INDEX "idx_visual_workflow_module_status" IS 'Optimize workflow filtering by module and status';
COMMENT ON INDEX "idx_notification_user_read" IS 'Optimize user notification queries';
COMMENT ON INDEX "idx_audit_entity" IS 'Optimize audit log queries by entity';

-- Performance improvement expected: 50-80% faster queries
