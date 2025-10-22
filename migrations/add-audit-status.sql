-- Audit status enum'ını oluştur
DO $$ BEGIN
 CREATE TYPE "public"."audit_status" AS ENUM('Active', 'InReview', 'PendingClosure', 'Closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Audits tablosuna status kolonu ekle
ALTER TABLE "audits" ADD COLUMN IF NOT EXISTS "status" "audit_status" DEFAULT 'Active' NOT NULL;

-- Task tablosundaki updatedAt default değerini ayarla (eğer yoksa)
DO $$ BEGIN
  ALTER TABLE "Task" ALTER COLUMN "updatedAt" SET DEFAULT current_timestamp;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

-- Questions tablosundaki order_index default değerini ayarla
DO $$ BEGIN
  ALTER TABLE "questions" ALTER COLUMN "order_index" SET DEFAULT '0';
EXCEPTION
  WHEN undefined_column THEN null;
END $$;
