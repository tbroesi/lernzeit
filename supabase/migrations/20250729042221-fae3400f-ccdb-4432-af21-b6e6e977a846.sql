-- Activate high-quality templates that have been marked inactive
UPDATE generated_templates 
SET is_active = true, updated_at = now()
WHERE quality_score >= 0.7 
AND usage_count >= 0 
AND category IN ('math', 'german', 'english', 'geography', 'history', 'physics', 'biology', 'chemistry', 'latin')
AND is_active = false;

-- Mark low-quality or problematic templates as inactive
UPDATE generated_templates 
SET is_active = false, updated_at = now()
WHERE quality_score < 0.3 
OR content ILIKE '%23 + 17%'
OR content ILIKE '%undefined%'
OR content ILIKE '%null%'
OR content = '';

-- Clean up templates with malformed content
DELETE FROM generated_templates 
WHERE content IS NULL 
OR content = '' 
OR length(trim(content)) < 10;