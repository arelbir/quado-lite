import { db } from '@/drizzle/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Migration SQL
    const migrationSQL = `
      -- DÖF + Action Entegrasyonu (Hibrit Yaklaşım)
      -- Sadece yeni kolonlar ekleniyor

      -- 1. action_type enum'ı oluştur
      DO $$ BEGIN
       CREATE TYPE "public"."action_type" AS ENUM('Simple', 'Corrective', 'Preventive');
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;

      -- 2. actions tablosuna yeni kolonlar ekle (sadece yoksa)
      DO $$ BEGIN
        -- dof_id ekle
        ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "dof_id" uuid;
        
        -- type ekle
        ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "type" "action_type" DEFAULT 'Simple' NOT NULL;
        
        -- evidence_urls ekle
        ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "evidence_urls" text[];
        
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;

      -- 3. Foreign key constraint ekle
      DO $$ BEGIN
       ALTER TABLE "actions" ADD CONSTRAINT "actions_dof_id_dofs_id_fk" FOREIGN KEY ("dof_id") REFERENCES "public"."dofs"("id") ON DELETE cascade ON UPDATE cascade;
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `;

    // Execute migration
    await db.execute(sql.raw(migrationSQL));

    return NextResponse.json({ 
      success: true, 
      message: 'Migration başarıyla uygulandı! 🎉' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
