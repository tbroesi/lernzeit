-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a scheduled job to generate templates every hour
-- This will run Monday to Friday at 2 AM, 8 AM, 2 PM, and 8 PM
SELECT cron.schedule(
  'template-generator-regular',
  '0 2,8,14,20 * * 1-5', -- Every day at 2 AM, 8 AM, 2 PM, 8 PM, Monday to Friday
  $$
  SELECT
    net.http_post(
        url:='https://fsmgynpdfxkaiiuguqyr.supabase.co/functions/v1/template-generator-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWd5bnBkZnhrYWlpdWd1cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTg4ODYsImV4cCI6MjA2ODI3NDg4Nn0.unk2ST0Wcsw7RJz-BGrCqQpXSgLJQpAQPgJ-ImGCv-Q"}'::jsonb,
        body:=concat('{"time": "', now(), '", "trigger": "scheduled"}')::jsonb
    ) as request_id;
  $$
);

-- Create a weekly cleanup job to remove old unused templates
-- This will run every Sunday at 3 AM
SELECT cron.schedule(
  'template-cleanup-weekly',
  '0 3 * * 0', -- Every Sunday at 3 AM
  $$
  -- Deactivate templates older than 2 weeks that haven't been used much
  UPDATE generated_templates 
  SET is_active = false 
  WHERE created_at < NOW() - INTERVAL '14 days' 
    AND usage_count < 5
    AND is_active = true;
    
  -- Keep only the most recent 50 templates per category/grade combination
  WITH ranked_templates AS (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY category, grade 
             ORDER BY usage_count DESC, created_at DESC
           ) as rn
    FROM generated_templates 
    WHERE is_active = true
  )
  UPDATE generated_templates 
  SET is_active = false 
  WHERE id IN (
    SELECT id FROM ranked_templates WHERE rn > 50
  );
  $$
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_templates_category_grade_active 
ON generated_templates(category, grade, is_active);

CREATE INDEX IF NOT EXISTS idx_generated_templates_usage_count 
ON generated_templates(usage_count);

CREATE INDEX IF NOT EXISTS idx_generated_templates_created_at 
ON generated_templates(created_at);

-- Create a function to manually trigger template generation
CREATE OR REPLACE FUNCTION public.trigger_template_generation()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result json;
BEGIN
  -- Manual trigger of the template generation cron job
  SELECT net.http_post(
    url := 'https://fsmgynpdfxkaiiuguqyr.supabase.co/functions/v1/template-generator-cron',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWd5bnBkZnhrYWlpdWd1cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTg4ODYsImV4cCI6MjA2ODI3NDg4Nn0.unk2ST0Wcsw7RJz-BGrCqQpXSgLJQpAQPgJ-ImGCv-Q"}'::jsonb,
    body := '{"time": "Manual template generation trigger", "trigger": "manual"}'::jsonb
  ) INTO result;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Template generation triggered manually',
    'request_id', result
  );
END;
$function$