-- Spalten in child_settings umbenennen um deutsche Kategorienamen zu verwenden
ALTER TABLE public.child_settings 
RENAME COLUMN math_seconds_per_task TO mathematik_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN german_seconds_per_task TO deutsch_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN english_seconds_per_task TO englisch_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN geography_seconds_per_task TO geographie_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN history_seconds_per_task TO geschichte_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN physics_seconds_per_task TO physik_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN biology_seconds_per_task TO biologie_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN chemistry_seconds_per_task TO chemie_seconds_per_task;

ALTER TABLE public.child_settings 
RENAME COLUMN latin_seconds_per_task TO latein_seconds_per_task;