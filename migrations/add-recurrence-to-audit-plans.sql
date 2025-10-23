-- Add recurrence fields to audit_plans table
-- Periyodik tekrarlama desteği

-- Enum oluştur
CREATE TYPE recurrence_type AS ENUM ('None', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly');

-- Kolonları ekle
ALTER TABLE audit_plans ADD COLUMN IF NOT EXISTS auditor_id uuid REFERENCES "user"(id);
ALTER TABLE audit_plans ADD COLUMN IF NOT EXISTS recurrence_type recurrence_type DEFAULT 'None';
ALTER TABLE audit_plans ADD COLUMN IF NOT EXISTS recurrence_interval integer DEFAULT 1;
ALTER TABLE audit_plans ADD COLUMN IF NOT EXISTS next_scheduled_date timestamp;
ALTER TABLE audit_plans ADD COLUMN IF NOT EXISTS max_occurrences integer;
ALTER TABLE audit_plans ADD COLUMN IF NOT EXISTS occurrence_count integer DEFAULT 0;

-- Comments
COMMENT ON COLUMN audit_plans.auditor_id IS 'Denetçi (oluşturulacak denetimlere atanacak)';
COMMENT ON COLUMN audit_plans.recurrence_type IS 'Tekrarlama periyodu tipi';
COMMENT ON COLUMN audit_plans.recurrence_interval IS 'Her kaç günde/ayda/yılda tekrarlanacak';
COMMENT ON COLUMN audit_plans.next_scheduled_date IS 'Bir sonraki otomatik oluşturulma tarihi';
COMMENT ON COLUMN audit_plans.max_occurrences IS 'Maksimum kaç kez oluşturulacak';
COMMENT ON COLUMN audit_plans.occurrence_count IS 'Şimdiye kadar kaç kez oluşturuldu';
