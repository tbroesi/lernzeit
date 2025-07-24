-- Remove duplicate templates and ensure unique content per category/grade combination
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

-- Add unique constraint to prevent future duplicates
ALTER TABLE generated_templates 
ADD CONSTRAINT unique_content_category_grade 
UNIQUE (content, category, grade) 
DEFERRABLE INITIALLY DEFERRED;