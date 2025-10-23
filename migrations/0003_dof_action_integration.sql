-- Migration: DÖF + Action Entegrasyonu (Hibrit Yaklaşım)
-- Manuel SQL - Güvenli ve kontrollü uygulama

-- 1. action_type enum'ı oluştur (zaten varsa hata verme)
DO $$ BEGIN
  CREATE TYPE action_type AS ENUM ('Simple', 'Corrective', 'Preventive');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'action_type enum zaten var, atlanıyor';
END $$;

-- 2. actions tablosuna yeni kolonlar ekle (eğer yoksa)
DO $$ BEGIN
  -- dof_id kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'actions' AND column_name = 'dof_id'
  ) THEN
    ALTER TABLE actions ADD COLUMN dof_id uuid;
    ALTER TABLE actions ADD CONSTRAINT actions_dof_id_dofs_id_fk 
      FOREIGN KEY (dof_id) REFERENCES dofs(id) ON DELETE CASCADE ON UPDATE CASCADE;
    RAISE NOTICE 'actions.dof_id kolonu eklendi ✅';
  ELSE
    RAISE NOTICE 'actions.dof_id zaten var, atlanıyor';
  END IF;

  -- type kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'actions' AND column_name = 'type'
  ) THEN
    ALTER TABLE actions ADD COLUMN type action_type DEFAULT 'Simple' NOT NULL;
    RAISE NOTICE 'actions.type kolonu eklendi ✅';
  ELSE
    RAISE NOTICE 'actions.type zaten var, atlanıyor';
  END IF;

  -- evidence_urls kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'actions' AND column_name = 'evidence_urls'
  ) THEN
    ALTER TABLE actions ADD COLUMN evidence_urls text[];
    RAISE NOTICE 'actions.evidence_urls kolonu eklendi ✅';
  ELSE
    RAISE NOTICE 'actions.evidence_urls zaten var, atlanıyor';
  END IF;
END $$;

-- 3. Constraint ekle (eğer yoksa)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'actions_parent_check'
  ) THEN
    ALTER TABLE actions ADD CONSTRAINT actions_parent_check 
      CHECK (finding_id IS NOT NULL OR dof_id IS NOT NULL);
    RAISE NOTICE 'actions_parent_check constraint eklendi ✅';
  ELSE
    RAISE NOTICE 'actions_parent_check zaten var, atlanıyor';
  END IF;
END $$;

-- 4. Index'ler oluştur (eğer yoksa)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_actions_dof'
  ) THEN
    CREATE INDEX idx_actions_dof ON actions(dof_id);
    RAISE NOTICE 'idx_actions_dof index oluşturuldu ✅';
  ELSE
    RAISE NOTICE 'idx_actions_dof zaten var, atlanıyor';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_actions_type'
  ) THEN
    CREATE INDEX idx_actions_type ON actions(type);
    RAISE NOTICE 'idx_actions_type index oluşturuldu ✅';
  ELSE
    RAISE NOTICE 'idx_actions_type zaten var, atlanıyor';
  END IF;
END $$;

-- 5. Mevcut action'ları Simple olarak işaretle (zaten default ama kesin olsun)
UPDATE actions SET type = 'Simple' WHERE type IS NULL;

-- 6. OPSIYONEL: dofActivities'den actions'a data migration
-- NOT: Bu adım dofActivities verisi varsa çalışır
DO $$
DECLARE
  activity_count integer;
BEGIN
  -- dofActivities tablosu var mı kontrol et
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dof_activities') THEN
    -- Kaç kayıt var kontrol et
    SELECT COUNT(*) INTO activity_count FROM dof_activities;
    
    IF activity_count > 0 THEN
      RAISE NOTICE 'dof_activities tablosunda % kayıt bulundu, migration başlıyor...', activity_count;
      
      -- Migration yap
      INSERT INTO actions (
        dof_id,
        type,
        details,
        status,
        assigned_to_id,
        created_at,
        completed_at
      )
      SELECT 
        dof_id,
        CASE 
          WHEN type::text = 'Düzeltici' THEN 'Corrective'::action_type
          WHEN type::text = 'Önleyici' THEN 'Preventive'::action_type
          ELSE 'Corrective'::action_type
        END,
        description,
        CASE 
          WHEN is_completed = true THEN 'Completed'::action_status
          ELSE 'Assigned'::action_status
        END,
        responsible_id,
        created_at,
        completed_at
      FROM dof_activities
      WHERE NOT EXISTS (
        -- Duplikasyonu önle
        SELECT 1 FROM actions a 
        WHERE a.dof_id = dof_activities.dof_id 
        AND a.details = dof_activities.description
      );
      
      RAISE NOTICE 'dof_activities verileri actions tablosuna migrate edildi ✅';
    ELSE
      RAISE NOTICE 'dof_activities boş, migration atlandı';
    END IF;
  ELSE
    RAISE NOTICE 'dof_activities tablosu bulunamadı, migration atlandı';
  END IF;
END $$;

-- Migration tamamlandı!
DO $$ BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DÖF + Action Entegrasyonu Tamamlandı! 🎉';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Eklenen özellikler:';
  RAISE NOTICE '  ✅ action_type enum (Simple, Corrective, Preventive)';
  RAISE NOTICE '  ✅ actions.dof_id kolonu (DÖF aksiyonları için)';
  RAISE NOTICE '  ✅ actions.type kolonu (aksiyon tipi)';
  RAISE NOTICE '  ✅ actions.evidence_urls kolonu (kanıtlar)';
  RAISE NOTICE '  ✅ actions_parent_check constraint';
  RAISE NOTICE '  ✅ idx_actions_dof ve idx_actions_type index';
  RAISE NOTICE '';
  RAISE NOTICE 'Hibrit yaklaşım aktif! 🚀';
END $$;
