
-- Add new columns for seconds-based time rewards
ALTER TABLE public.child_settings 
ADD COLUMN math_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN german_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN english_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN geography_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN history_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN physics_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN biology_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN chemistry_seconds_per_task integer NOT NULL DEFAULT 30,
ADD COLUMN latin_seconds_per_task integer NOT NULL DEFAULT 30;

-- Migrate existing minute data to seconds (multiply by 60)
UPDATE public.child_settings 
SET 
  math_seconds_per_task = math_minutes_per_task * 60,
  german_seconds_per_task = german_minutes_per_task * 60,
  english_seconds_per_task = english_minutes_per_task * 60,
  geography_seconds_per_task = geography_minutes_per_task * 60,
  history_seconds_per_task = history_minutes_per_task * 60,
  physics_seconds_per_task = physics_minutes_per_task * 60,
  biology_seconds_per_task = biology_minutes_per_task * 60,
  chemistry_seconds_per_task = chemistry_minutes_per_task * 60,
  latin_seconds_per_task = latin_minutes_per_task * 60;

-- Drop the old minute-based columns
ALTER TABLE public.child_settings 
DROP COLUMN math_minutes_per_task,
DROP COLUMN german_minutes_per_task,
DROP COLUMN english_minutes_per_task,
DROP COLUMN geography_minutes_per_task,
DROP COLUMN history_minutes_per_task,
DROP COLUMN physics_minutes_per_task,
DROP COLUMN biology_minutes_per_task,
DROP COLUMN chemistry_minutes_per_task,
DROP COLUMN latin_minutes_per_task;
