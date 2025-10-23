-- Add rejection_reason column to findings table if it doesn't exist
ALTER TABLE findings 
ADD COLUMN IF NOT EXISTS rejection_reason text;
