
-- Erweitere die child_settings Tabelle um Lernkategorien
ALTER TABLE public.child_settings 
ADD COLUMN math_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN german_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN english_minutes_per_task INTEGER NOT NULL DEFAULT 5;

-- Erstelle eine neue Tabelle für Lernsessions mit Kategorien
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('math', 'german', 'english')),
  grade INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 5,
  time_spent REAL NOT NULL DEFAULT 0,
  time_earned INTEGER NOT NULL DEFAULT 0,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS für learning_sessions
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies für learning_sessions
CREATE POLICY "Users can view own learning sessions" 
ON public.learning_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" 
ON public.learning_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger für automatic timestamp updates
CREATE TRIGGER update_learning_sessions_updated_at
BEFORE UPDATE ON public.learning_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Erweitere parent_settings für Standard-Kategorien-Belohnungen
ALTER TABLE public.parent_settings 
ADD COLUMN math_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN german_minutes_per_task INTEGER NOT NULL DEFAULT 5,
ADD COLUMN english_minutes_per_task INTEGER NOT NULL DEFAULT 5;
