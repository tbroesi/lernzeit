-- Erstelle Achievement-Kategorien Enum
CREATE TYPE public.achievement_category AS ENUM ('math', 'german', 'english', 'geography', 'history', 'physics', 'biology', 'chemistry', 'latin', 'general');

-- Erstelle Achievement-Typen Enum 
CREATE TYPE public.achievement_type AS ENUM ('questions_solved', 'time_earned', 'streak', 'accuracy', 'speed', 'milestone');

-- Erstelle Achievements-Template Tabelle
CREATE TABLE public.achievements_template (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  type achievement_type NOT NULL,
  requirement_value INTEGER NOT NULL,
  reward_minutes INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🏆',
  color TEXT NOT NULL DEFAULT '#fbbf24',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Erstelle User-Achievements Tabelle (welche Achievements hat ein User erreicht)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements_template(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies für achievements_template (alle können lesen)
CREATE POLICY "Anyone can view achievement templates" 
ON public.achievements_template 
FOR SELECT 
USING (true);

-- RLS Policies für user_achievements
CREATE POLICY "Users can view own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger für timestamp updates
CREATE TRIGGER update_achievements_template_updated_at
BEFORE UPDATE ON public.achievements_template
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Füge Standard-Achievements ein
INSERT INTO public.achievements_template (name, description, category, type, requirement_value, reward_minutes, icon, color) VALUES
-- Mathematik Achievements
('Mathe Anfänger', 'Löse deine erste Mathe-Aufgabe', 'math', 'questions_solved', 1, 5, '🧮', '#3b82f6'),
('Mathe Entdecker', 'Löse 10 Mathe-Aufgaben', 'math', 'questions_solved', 10, 10, '📐', '#3b82f6'),
('Mathe Profi', 'Löse 50 Mathe-Aufgaben', 'math', 'questions_solved', 50, 20, '🎯', '#3b82f6'),
('Mathe Meister', 'Löse 100 Mathe-Aufgaben', 'math', 'questions_solved', 100, 30, '👑', '#3b82f6'),

-- Deutsch Achievements  
('Sprach-Talent', 'Löse deine erste Deutsch-Aufgabe', 'german', 'questions_solved', 1, 5, '📚', '#ef4444'),
('Wort-Forscher', 'Löse 10 Deutsch-Aufgaben', 'german', 'questions_solved', 10, 10, '✍️', '#ef4444'),
('Sprach-Experte', 'Löse 50 Deutsch-Aufgaben', 'german', 'questions_solved', 50, 20, '📖', '#ef4444'),
('Dichter-Meister', 'Löse 100 Deutsch-Aufgaben', 'german', 'questions_solved', 100, 30, '🎭', '#ef4444'),

-- Englisch Achievements
('English Starter', 'Löse deine erste Englisch-Aufgabe', 'english', 'questions_solved', 1, 5, '🇬🇧', '#10b981'),
('Word Explorer', 'Löse 10 Englisch-Aufgaben', 'english', 'questions_solved', 10, 10, '🌍', '#10b981'),
('Language Expert', 'Löse 50 Englisch-Aufgaben', 'english', 'questions_solved', 50, 20, '🎓', '#10b981'),
('English Master', 'Löse 100 Englisch-Aufgaben', 'english', 'questions_solved', 100, 30, '👑', '#10b981'),

-- Allgemeine Achievements
('Fleißiger Lerner', 'Sammle 60 Minuten Lernzeit', 'general', 'time_earned', 60, 15, '⏰', '#fbbf24'),
('Zeit-Sammler', 'Sammle 180 Minuten Lernzeit', 'general', 'time_earned', 180, 25, '⏳', '#fbbf24'),
('Lern-Champion', 'Sammle 360 Minuten Lernzeit', 'general', 'time_earned', 360, 40, '🏆', '#fbbf24'),

-- Streak Achievements
('Tag-Streaker', 'Lerne 3 Tage hintereinander', 'general', 'streak', 3, 10, '🔥', '#f97316'),
('Wochen-Held', 'Lerne 7 Tage hintereinander', 'general', 'streak', 7, 20, '⚡', '#f97316'),
('Monats-Meister', 'Lerne 30 Tage hintereinander', 'general', 'streak', 30, 50, '💫', '#f97316');

-- Function um User-Achievement-Progress zu aktualisieren
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id UUID,
  p_category TEXT,
  p_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  achievement_record RECORD;
  user_achievement_record RECORD;
  new_achievements JSON[] := '{}';
  result JSON;
BEGIN
  -- Finde alle relevanten Achievement-Templates
  FOR achievement_record IN 
    SELECT * FROM public.achievements_template 
    WHERE category::text = p_category AND type::text = p_type
  LOOP
    -- Prüfe ob User bereits dieses Achievement hat
    SELECT * INTO user_achievement_record
    FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_id = achievement_record.id;
    
    IF user_achievement_record IS NULL THEN
      -- Achievement noch nicht vorhanden, erstelle es
      INSERT INTO public.user_achievements (user_id, achievement_id, current_progress, is_completed)
      VALUES (p_user_id, achievement_record.id, LEAST(p_increment, achievement_record.requirement_value), 
              p_increment >= achievement_record.requirement_value);
              
      -- Wenn sofort erreicht, füge zu neuen Achievements hinzu
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
      -- Achievement existiert aber ist noch nicht abgeschlossen
      UPDATE public.user_achievements 
      SET 
        current_progress = LEAST(user_achievement_record.current_progress + p_increment, achievement_record.requirement_value),
        is_completed = (user_achievement_record.current_progress + p_increment) >= achievement_record.requirement_value,
        earned_at = CASE 
          WHEN (user_achievement_record.current_progress + p_increment) >= achievement_record.requirement_value 
          THEN now() 
          ELSE earned_at 
        END
      WHERE id = user_achievement_record.id;
      
      -- Wenn neu abgeschlossen, füge zu neuen Achievements hinzu
      IF (user_achievement_record.current_progress + p_increment) >= achievement_record.requirement_value THEN
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