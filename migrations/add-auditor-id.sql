-- Add auditor_id column to audits table
-- Denetimi yapacak kişiyi (denetçi) belirlemek için

ALTER TABLE audits ADD COLUMN IF NOT EXISTS auditor_id uuid;

-- Foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'audits_auditor_id_User_id_fk'
    ) THEN
        ALTER TABLE audits 
        ADD CONSTRAINT audits_auditor_id_User_id_fk 
        FOREIGN KEY (auditor_id) 
        REFERENCES "User"(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Comment
COMMENT ON COLUMN audits.auditor_id IS 'Denetimi yapacak denetçi (auditor)';
COMMENT ON COLUMN audits.created_by_id IS 'Denetimi oluşturan kişi (planner/admin)';
