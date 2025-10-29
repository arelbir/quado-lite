-- =========================================
-- NORMALIZE USER EMAILS TO ASCII
-- Convert Turkish characters in email addresses to ASCII
-- =========================================
-- Date: 2025-10-29
-- Purpose: Fix login issues with Turkish characters in emails
-- Impact: All user emails will be normalized to ASCII format

-- Backup current emails (optional safety check)
-- SELECT id, name, email FROM "user" WHERE email ~ '[İıÇçŞşĞğÜüÖö]';

-- Normalize emails: Turkish chars → ASCII
UPDATE "user"
SET email = LOWER(
  TRANSLATE(
    email,
    'İıÇçŞşĞğÜüÖö',
    'iiccssgguuoo'
  )
)
WHERE email ~ '[İıÇçŞşĞğÜüÖö]';

-- Verify changes
SELECT 
  id, 
  name, 
  email,
  CASE 
    WHEN email ~ '[İıÇçŞşĞğÜüÖö]' THEN '❌ Still has Turkish chars'
    ELSE '✅ Normalized'
  END as status
FROM "user"
ORDER BY name;

-- =========================================
-- EXPECTED RESULTS:
-- =========================================
-- BEFORE:
--   İbrahim Aydın → i̇brahim.aydin@abcteknoloji.com
--   Gizem Çetin → gizem.cetin@abcteknoloji.com (ç)
--
-- AFTER:
--   İbrahim Aydın → ibrahim.aydin@abcteknoloji.com (i̇→i)
--   Gizem Çetin → gizem.cetin@abcteknoloji.com (ç→c)
-- =========================================
