-- Check existing enum values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM 
    pg_type t 
JOIN 
    pg_enum e ON t.oid = e.enumtypid  
WHERE 
    t.typname = 'question_type'
ORDER BY 
    e.enumsortorder;
