
-- Add new achievement types for learning performance
ALTER TYPE public.achievement_type ADD VALUE 'accuracy_streak';
ALTER TYPE public.achievement_type ADD VALUE 'daily_activity';
ALTER TYPE public.achievement_type ADD VALUE 'persistence';
ALTER TYPE public.achievement_type ADD VALUE 'subject_mastery';
ALTER TYPE public.achievement_type ADD VALUE 'learning_efficiency';

-- Add new achievements focused on learning performance
INSERT INTO public.achievements_template (name, description, category, type, requirement_value, reward_minutes, icon, color) VALUES
-- Accuracy-based achievements
('Präzisions-Anfänger', 'Beantworte 5 Fragen hintereinander richtig', 'general', 'accuracy_streak', 5, 10, '🎯', '#10b981'),
('Treffsicher', 'Beantworte 10 Fragen hintereinander richtig', 'general', 'accuracy_streak', 10, 15, '🏹', '#10b981'),
('Perfektionist', 'Beantworte 20 Fragen hintereinander richtig', 'general', 'accuracy_streak', 20, 25, '💎', '#10b981'),

-- Daily activity achievements
('Täglicher Lerner', 'Lerne an 5 verschiedenen Tagen', 'general', 'daily_activity', 5, 10, '📅', '#3b82f6'),
('Konstanter Fortschritt', 'Lerne an 10 verschiedenen Tagen', 'general', 'daily_activity', 10, 20, '📈', '#3b82f6'),
('Lern-Routine', 'Lerne an 30 verschiedenen Tagen', 'general', 'daily_activity', 30, 40, '🔄', '#3b82f6'),

-- Persistence achievements (continuing after time limit)
('Wissbegierig', 'Lerne 5 mal über dein Zeitlimit hinaus', 'general', 'persistence', 5, 15, '🔥', '#f59e0b'),
('Unermüdlich', 'Lerne 15 mal über dein Zeitlimit hinaus', 'general', 'persistence', 15, 30, '⚡', '#f59e0b'),
('Lern-Champion', 'Lerne 30 mal über dein Zeitlimit hinaus', 'general', 'persistence', 30, 50, '👑', '#f59e0b'),

-- Subject mastery achievements (high accuracy in specific subjects)
('Mathe-Ass', 'Erreiche 90% Genauigkeit bei 50 Mathe-Fragen', 'math', 'subject_mastery', 50, 20, '🧮', '#3b82f6'),
('Sprach-Talent', 'Erreiche 90% Genauigkeit bei 50 Deutsch-Fragen', 'german', 'subject_mastery', 50, 20, '📚', '#ef4444'),
('English Expert', 'Erreiche 90% Genauigkeit bei 50 Englisch-Fragen', 'english', 'subject_mastery', 50, 20, '🇬🇧', '#10b981'),

-- Learning efficiency achievements (high accuracy with good speed)
('Schnelldenker', 'Beantworte 25 Fragen schnell und richtig', 'general', 'learning_efficiency', 25, 15, '⚡', '#8b5cf6'),
('Blitzschnell', 'Beantworte 50 Fragen schnell und richtig', 'general', 'learning_efficiency', 50, 25, '💨', '#8b5cf6'),
('Turbo-Lerner', 'Beantworte 100 Fragen schnell und richtig', 'general', 'learning_efficiency', 100, 35, '🚀', '#8b5cf6');

-- Create a table to track additional achievement statistics
CREATE TABLE public.user_achievement_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  accuracy_streak INTEGER NOT NULL DEFAULT 0,
  max_accuracy_streak INTEGER NOT NULL DEFAULT 0,
  daily_learning_days INTEGER NOT NULL DEFAULT 0,
  last_learning_date DATE,
  persistence_count INTEGER NOT NULL DEFAULT 0,
  subject_correct_answers JSONB NOT NULL DEFAULT '{}',
  subject_total_answers JSONB NOT NULL DEFAULT '{}',
  efficient_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for the new table
ALTER TABLE public.user_achievement_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievement_stats
CREATE POLICY "Users can view own achievement stats" 
ON public.user_achievement_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievement stats" 
ON public.user_achievement_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement stats" 
ON public.user_achievement_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger for timestamp updates
CREATE TRIGGER update_user_achievement_stats_updated_at
BEFORE UPDATE ON public.user_achievement_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Update the achievement progress function to handle new types
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id UUID,
  p_category TEXT,
  p_type TEXT,
  p_increment INTEGER DEFAULT 1,
  p_is_correct BOOLEAN DEFAULT true,
  p_time_limit_exceeded BOOLEAN DEFAULT false,
  p_answer_time REAL DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  achievement_record RECORD;
  user_achievement_record RECORD;
  stats_record RECORD;
  new_achievements JSON[] := '{}';
  today_date DATE := CURRENT_DATE;
  subject_correct JSONB;
  subject_total JSONB;
  accuracy_percentage REAL;
  is_efficient BOOLEAN;
BEGIN
  -- Get or create user stats
  SELECT * INTO stats_record 
  FROM public.user_achievement_stats 
  WHERE user_id = p_user_id;
  
  IF stats_record IS NULL THEN
    INSERT INTO public.user_achievement_stats (user_id) 
    VALUES (p_user_id) 
    RETURNING * INTO stats_record;
  END IF;
  
  -- Update stats based on the achievement type and context
  IF p_type = 'accuracy_streak' THEN
    IF p_is_correct THEN
      UPDATE public.user_achievement_stats 
      SET 
        accuracy_streak = accuracy_streak + 1,
        max_accuracy_streak = GREATEST(max_accuracy_streak, accuracy_streak + 1)
      WHERE user_id = p_user_id;
      
      -- Use current streak for progress tracking
      p_increment := (SELECT accuracy_streak FROM public.user_achievement_stats WHERE user_id = p_user_id);
    ELSE
      -- Reset streak on wrong answer
      UPDATE public.user_achievement_stats 
      SET accuracy_streak = 0
      WHERE user_id = p_user_id;
      RETURN json_build_object('success', true, 'new_achievements', new_achievements);
    END IF;
    
  ELSIF p_type = 'daily_activity' THEN
    -- Check if this is a new learning day
    IF stats_record.last_learning_date IS NULL OR stats_record.last_learning_date < today_date THEN
      UPDATE public.user_achievement_stats 
      SET 
        daily_learning_days = daily_learning_days + 1,
        last_learning_date = today_date
      WHERE user_id = p_user_id;
      
      p_increment := (SELECT daily_learning_days FROM public.user_achievement_stats WHERE user_id = p_user_id);
    ELSE
      -- Same day, no increment
      RETURN json_build_object('success', true, 'new_achievements', new_achievements);
    END IF;
    
  ELSIF p_type = 'persistence' THEN
    IF p_time_limit_exceeded THEN
      UPDATE public.user_achievement_stats 
      SET persistence_count = persistence_count + 1
      WHERE user_id = p_user_id;
      
      p_increment := (SELECT persistence_count FROM public.user_achievement_stats WHERE user_id = p_user_id);
    ELSE
      RETURN json_build_object('success', true, 'new_achievements', new_achievements);
    END IF;
    
  ELSIF p_type = 'subject_mastery' THEN
    -- Update subject-specific stats
    subject_correct := COALESCE(stats_record.subject_correct_answers, '{}'::jsonb);
    subject_total := COALESCE(stats_record.subject_total_answers, '{}'::jsonb);
    
    IF p_is_correct THEN
      subject_correct := subject_correct || jsonb_build_object(p_category, 
        COALESCE((subject_correct->p_category)::integer, 0) + 1);
    END IF;
    
    subject_total := subject_total || jsonb_build_object(p_category, 
      COALESCE((subject_total->p_category)::integer, 0) + 1);
    
    UPDATE public.user_achievement_stats 
    SET 
      subject_correct_answers = subject_correct,
      subject_total_answers = subject_total
    WHERE user_id = p_user_id;
    
    -- Calculate accuracy and use correct answers count for progress
    IF (subject_total->p_category)::integer > 0 THEN
      accuracy_percentage := (subject_correct->p_category)::real / (subject_total->p_category)::real;
      IF accuracy_percentage >= 0.9 THEN
        p_increment := (subject_correct->p_category)::integer;
      ELSE
        RETURN json_build_object('success', true, 'new_achievements', new_achievements);
      END IF;
    END IF;
    
  ELSIF p_type = 'learning_efficiency' THEN
    -- Consider answer efficient if correct and answered reasonably fast (under 30 seconds)
    is_efficient := p_is_correct AND p_answer_time > 0 AND p_answer_time <= 30;
    
    IF is_efficient THEN
      UPDATE public.user_achievement_stats 
      SET efficient_answers = efficient_answers + 1
      WHERE user_id = p_user_id;
      
      p_increment := (SELECT efficient_answers FROM public.user_achievement_stats WHERE user_id = p_user_id);
    ELSE
      RETURN json_build_object('success', true, 'new_achievements', new_achievements);
    END IF;
  END IF;
  
  -- Process achievements with updated progress value
  FOR achievement_record IN 
    SELECT * FROM public.achievements_template 
    WHERE category::text = p_category AND type::text = p_type
  LOOP
    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record
    FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_id = achievement_record.id;
    
    IF user_achievement_record IS NULL THEN
      -- Achievement not yet tracked, create it
      INSERT INTO public.user_achievements (user_id, achievement_id, current_progress, is_completed)
      VALUES (p_user_id, achievement_record.id, p_increment, 
              p_increment >= achievement_record.requirement_value);
              
      -- If completed immediately, add to new achievements
      IF p_increment >= achievement_record.requirement_value THEN
        new_achievements := new_achievements || json_build_object(
          'name', achievement_record.name,
          'description', achievement_record.description,
          'reward_minutes', achievement_record.reward_minutes,
          'icon', achievement_record.icon,
          'color', achievement_record.color
        );
      END IF;
    ELSIF NOT user_achievement_record.is_completed THEN
      -- Update existing achievement progress
      UPDATE public.user_achievements 
      SET 
        current_progress = p_increment,
        is_completed = p_increment >= achievement_record.requirement_value,
        earned_at = CASE 
          WHEN p_increment >= achievement_record.requirement_value 
          THEN now() 
          ELSE earned_at 
        END
      WHERE id = user_achievement_record.id;
      
      -- If newly completed, add to new achievements
      IF p_increment >= achievement_record.requirement_value AND NOT user_achievement_record.is_completed THEN
        new_achievements := new_achievements || json_build_object(
          'name', achievement_record.name,
          'description', achievement_record.description,
          'reward_minutes', achievement_record.reward_minutes,
          'icon', achievement_record.icon,
          'color', achievement_record.color
        );
      END IF;
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'new_achievements', new_achievements
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
