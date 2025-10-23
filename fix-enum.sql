-- Fix question_type enum - Remove and re-add SingleChoice if it exists
-- This is safe if no data uses these specific values

-- Check if SingleChoice exists, if so skip
DO $$ 
BEGIN
    -- Enum değerini kaldıramazsınız çünkü PostgreSQL bunu desteklemiyor
    -- Sadece yeni değerler ekleyebilirsiniz
    
    -- Eğer SingleChoice yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'SingleChoice' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type')
    ) THEN
        ALTER TYPE question_type ADD VALUE 'SingleChoice';
    END IF;
    
    -- Eğer Checklist yoksa ekle
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Checklist' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'question_type')
    ) THEN
        ALTER TYPE question_type ADD VALUE 'Checklist';
    END IF;
END $$;
