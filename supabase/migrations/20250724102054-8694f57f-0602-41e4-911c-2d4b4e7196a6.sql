-- Step 1: Remove duplicate templates, keeping only the first occurrence
WITH duplicates AS (
  SELECT id, content, category, grade,
         ROW_NUMBER() OVER (PARTITION BY content, category, grade ORDER BY usage_count ASC, created_at ASC) as row_num
  FROM generated_templates
  WHERE is_active = true
)
UPDATE generated_templates 
SET is_active = false
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);