-- Add Cancelled status to action_status enum
-- Exit strategy: Döngüyü kırmak için

ALTER TYPE action_status ADD VALUE IF NOT EXISTS 'Cancelled';

-- Comment
COMMENT ON TYPE action_status IS 'Action status: Assigned, PendingManagerApproval, Completed, Rejected (unused), Cancelled (exit loop)';
