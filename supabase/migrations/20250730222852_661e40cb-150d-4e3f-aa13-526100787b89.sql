-- Revert column names in child_settings back to English
ALTER TABLE public.child_settings 
RENAME COLUMN mathematik_seconds_per_task TO math_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN deutsch_seconds_per_task TO german_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN englisch_seconds_per_task TO english_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN geographie_seconds_per_task TO geography_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN geschichte_seconds_per_task TO history_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN physik_seconds_per_task TO physics_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN biologie_seconds_per_task TO biology_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN chemie_seconds_per_task TO chemistry_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN latein_seconds_per_task TO latin_seconds_per_task;