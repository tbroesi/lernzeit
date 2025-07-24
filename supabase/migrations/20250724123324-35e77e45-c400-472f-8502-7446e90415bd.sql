-- Phase 1: Database Cleanup (Fixed)
-- Remove exact duplicates and consolidate templates with same content
WITH duplicate_templates AS (
  SELECT 
    content,
    category, 
    grade,
    (array_agg(id ORDER BY created_at))[1] as keep_id,
    array_agg(id) as all_ids,
    SUM(usage_count) as total_usage,
    MAX(quality_score) as best_quality
  FROM generated_templates 
  WHERE is_active = true
  GROUP BY content, category, grade
  HAVING COUNT(*) > 1
)
UPDATE generated_templates 
SET 
  usage_count = dt.total_usage,
  quality_score = dt.best_quality,
  updated_at = now()
FROM duplicate_templates dt
WHERE generated_templates.id = dt.keep_id;

-- Delete duplicate entries (keeping the oldest one)
WITH duplicate_templates AS (
  SELECT 
    content,
    category, 
    grade,
    (array_agg(id ORDER BY created_at))[1] as keep_id,
    array_agg(id) as all_ids
  FROM generated_templates 
  WHERE is_active = true
  GROUP BY content, category, grade
  HAVING COUNT(*) > 1
)
DELETE FROM generated_templates 
WHERE id IN (
  SELECT unnest(all_ids) 
  FROM duplicate_templates dt
) AND id NOT IN (
  SELECT keep_id 
  FROM duplicate_templates
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_templates_content_hash 
ON generated_templates(content_hash);

CREATE INDEX IF NOT EXISTS idx_generated_templates_category_grade_quality 
ON generated_templates(category, grade, quality_score DESC, usage_count);

-- Update quality scores based on usage and recency
UPDATE generated_templates 
SET quality_score = GREATEST(0.1, 
  quality_score * (1.0 - (usage_count::float / GREATEST(10, usage_count + 1))) *
  (1.0 + EXTRACT(EPOCH FROM (now() - created_at))/(24*3600*30)) -- Boost newer templates
)
WHERE usage_count > 3;