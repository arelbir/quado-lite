-- Add deleted_at column to audits table for soft delete
ALTER TABLE audits ADD COLUMN IF NOT EXISTS deleted_at timestamp;

-- Add Archived status to audit_status enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Archived' AND enumtypid = 'audit_status'::regtype) THEN
        ALTER TYPE audit_status ADD VALUE 'Archived';
    END IF;
END $$;
