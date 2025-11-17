-- Actions tablosuna completion_notes ve rejection_reason kolonları ekle

ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "completion_notes" TEXT;
ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;

-- Yorum ekle
COMMENT ON COLUMN "actions"."completion_notes" IS 'Sorumlu tarafından yazılan tamamlama açıklaması - ne yapıldı?';
COMMENT ON COLUMN "actions"."rejection_reason" IS 'Yönetici tarafından yazılan ret nedeni';
