-- Migration: DÖF + Action Entegrasyonu (Hibrit Yaklaşım)
-- Tarih: 23 Ekim 2025
-- Amaç: actions tablosunu DÖF aksiyonları için genişlet

-- 1. action_type enum'ı oluştur
CREATE TYPE action_type AS ENUM ('Simple', 'Corrective', 'Preventive');

-- 2. actions tablosuna yeni kolonlar ekle
ALTER TABLE actions ADD COLUMN dof_id uuid REFERENCES dofs(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE actions ADD COLUMN type action_type DEFAULT 'Simple' NOT NULL;
ALTER TABLE actions ADD COLUMN evidence_urls text[];

-- 3. Mevcut tüm action'ları Simple olarak işaretle
UPDATE actions SET type = 'Simple' WHERE type IS NULL OR type = 'Simple';

-- 4. Constraint: En az biri NULL olmamalı (findingId VEYA dofId)
ALTER TABLE actions ADD CONSTRAINT actions_parent_check 
CHECK (finding_id IS NOT NULL OR dof_id IS NOT NULL);

-- 5. Index'ler oluştur
CREATE INDEX idx_actions_dof ON actions(dof_id);
CREATE INDEX idx_actions_type ON actions(type);

-- 6. dofActivities'den actions'a data migration
-- NOT: dofActivities tablosu varsa migrate et
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dof_activities') THEN
        -- dofActivities'deki verileri actions'a kopyala
        INSERT INTO actions (
            dof_id,
            type,
            details,
            status,
            assigned_to_id,
            manager_id,
            created_by_id,
            created_at,
            completed_at
        )
        SELECT 
            dof_id,
            type::action_type,
            description,
            CASE 
                WHEN is_completed = true THEN 'Completed'::action_status
                ELSE 'Assigned'::action_status
            END,
            responsible_id,
            NULL, -- manager_id (dofActivities'de yok, NULL kalacak)
            NULL, -- created_by_id (dofActivities'de yok, NULL kalacak)
            created_at,
            completed_at
        FROM dof_activities;
        
        RAISE NOTICE 'dof_activities verileri actions tablosuna migrate edildi.';
    ELSE
        RAISE NOTICE 'dof_activities tablosu bulunamadı, migration atlandı.';
    END IF;
END $$;

-- 7. OPSIYONEL: dofActivities tablosunu kaldır (yedek aldıktan sonra)
-- DROP TABLE IF EXISTS dof_activities CASCADE;
-- RAISE NOTICE 'dof_activities tablosu kaldırıldı (opsiyonel).';

-- Comments
COMMENT ON COLUMN actions.dof_id IS 'DÖF aksiyonu için DÖF ID (Step 4''te oluşturulur)';
COMMENT ON COLUMN actions.type IS 'Aksiyon tipi: Simple (basit), Corrective (düzeltici), Preventive (önleyici)';
COMMENT ON COLUMN actions.evidence_urls IS 'Kanıt dosyaları (fotoğraf, belge URLs)';

-- Migration tamamlandı
RAISE NOTICE 'DÖF + Action entegrasyonu migration tamamlandı! ✅';
