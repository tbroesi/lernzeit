
-- Erweitere die child_settings Tabelle um die neuen Fächer
ALTER TABLE public.child_settings 
ADD COLUMN geography_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN history_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN physics_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN biology_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN chemistry_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN latin_minutes_per_task INTEGER NOT NULL DEFAULT 5;

-- Erweitere parent_settings für die neuen Standard-Kategorien-Belohnungen
ALTER TABLE public.parent_settings 
ADD COLUMN geography_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN history_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN physics_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN biology_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN chemistry_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN latin_minutes_per_task INTEGER NOT NULL DEFAULT 5;

-- Erweitere das CHECK constraint für learning_sessions um die neuen Kategorien
ALTER TABLE public.learning_sessions 
DROP CONSTRAINT IF EXISTS learning_sessions_category_check;

ALTER TABLE public.learning_sessions 
ADD CONSTRAINT learning_sessions_category_check 
CHECK (category IN ('math', 'german', 'english', 'geography', 'history', 'physics', 'biology', 'chemistry', 'latin'));
