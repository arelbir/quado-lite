-- Migration: Add Workflow Notification Categories
-- Date: 2025-01-25
-- Description: Adds workflow-related notification categories to the enum

-- Add new notification categories for workflow events
ALTER TYPE notification_category ADD VALUE IF NOT EXISTS 'workflow_assignment';
ALTER TYPE notification_category ADD VALUE IF NOT EXISTS 'workflow_deadline_approaching';
ALTER TYPE notification_category ADD VALUE IF NOT EXISTS 'workflow_escalated';
ALTER TYPE notification_category ADD VALUE IF NOT EXISTS 'workflow_approved';
ALTER TYPE notification_category ADD VALUE IF NOT EXISTS 'workflow_rejected';

-- Verify the new values were added
SELECT enum_range(NULL::notification_category);
