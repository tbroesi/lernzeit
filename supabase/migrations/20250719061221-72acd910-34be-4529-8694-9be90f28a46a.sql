-- Aktiviere die pg_cron und pg_net Erweiterungen für geplante Aufgaben
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Erstelle einen Cron Job für den jährlichen Klassenwechsel am 1. August um 6:00 Uhr
SELECT cron.schedule(
  'annual-grade-upgrade',
  '0 6 1 8 *', -- Jeden 1. August um 6:00 Uhr (Minute, Stunde, Tag, Monat, Wochentag)
  $$
  SELECT
    net.http_post(
        url:='https://fsmgynpdfxkaiiuguqyr.supabase.co/functions/v1/annual-grade-upgrade',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWd5bnBkZnhrYWlpdWd1cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTg4ODYsImV4cCI6MjA2ODI3NDg4Nn0.unk2ST0Wcsw7RJz-BGrCqQpXSgLJQpAQPgJ-ImGCv-Q"}'::jsonb,
        body:='{"time": "Annual grade upgrade triggered"}'::jsonb
    ) as request_id;
  $$
);

-- Erstelle eine Funktion um manuell den Klassenwechsel zu testen
CREATE OR REPLACE FUNCTION public.trigger_grade_upgrade()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result json;
BEGIN
  -- Manueller Aufruf der Edge Function für Tests
  SELECT net.http_post(
    url := 'https://fsmgynpdfxkaiiuguqyr.supabase.co/functions/v1/annual-grade-upgrade',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWd5bnBkZnhrYWlpdWd1cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTg4ODYsImV4cCI6MjA2ODI3NDg4Nn0.unk2ST0Wcsw7RJz-BGrCqQpXSgLJQpAQPgJ-ImGCv-Q"}'::jsonb,
    body := '{"time": "Manual grade upgrade test"}'::jsonb
  ) INTO result;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Grade upgrade function triggered',
    'request_id', result
  );
END;
$$;