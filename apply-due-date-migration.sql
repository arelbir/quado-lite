-- Add due_date column to actions table
-- Run this SQL manually if drizzle-kit push fails

ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "due_date" timestamp;
