
-- Add feedback and quality tracking tables
CREATE TABLE public.question_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_content TEXT NOT NULL,
  question_type TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('incorrect', 'too_easy', 'too_hard', 'confusing', 'duplicate')),
  feedback_details TEXT,
  category TEXT NOT NULL,
  grade INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for question feedback
ALTER TABLE public.question_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for question feedback
CREATE POLICY "Users can submit feedback" 
ON public.question_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.question_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add columns to game_sessions for better tracking
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS question_source TEXT DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'unknown';

-- Update the game_sessions table to use the new structure
UPDATE public.game_sessions 
SET 
  duration_seconds = COALESCE(time_spent, 0),
  score = COALESCE(correct_answers, 0),
  category = 'math'
WHERE duration_seconds IS NULL OR duration_seconds = 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_question_feedback_category_grade 
ON public.question_feedback (category, grade);

CREATE INDEX IF NOT EXISTS idx_game_sessions_category_grade 
ON public.game_sessions (category, grade);

-- Add trigger for updated_at on feedback table
CREATE TRIGGER update_question_feedback_updated_at
BEFORE UPDATE ON public.question_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
