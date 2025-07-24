-- Fix constraint issues in learning_sessions and game_sessions tables
-- Update category constraints to allow proper values

-- First, check current constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.learning_sessions'::regclass;

-- Drop old constraints if they exist
ALTER TABLE public.learning_sessions DROP CONSTRAINT IF EXISTS learning_sessions_category_check;
ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_category_check;

-- Add updated category constraints that match our normalized values
ALTER TABLE public.learning_sessions 
ADD CONSTRAINT learning_sessions_category_check 
CHECK (category IN ('math', 'german', 'english', 'geography', 'history', 'physics', 'biology', 'chemistry', 'latin', 'mathematik', 'deutsch', 'englisch', 'geographie', 'geschichte', 'physik', 'biologie', 'chemie'));

ALTER TABLE public.game_sessions 
ADD CONSTRAINT game_sessions_category_check 
CHECK (category IN ('math', 'german', 'english', 'geography', 'history', 'physics', 'biology', 'chemistry', 'latin', 'mathematik', 'deutsch', 'englisch', 'geographie', 'geschichte', 'physik', 'biologie', 'chemie', 'unknown'));

-- Add more comprehensive logging to RPC function
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id uuid, 
  p_category text, 
  p_type text, 
  p_increment integer DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  achievement_record RECORD;
  user_achievement_record RECORD;
  new_achievements JSON[] := '{}';
  normalized_category text;
  result JSON;
  achievement_count integer := 0;
BEGIN
  -- Normalize category names to match database
  normalized_category := CASE 
    WHEN p_category = 'mathematik' THEN 'math'
    WHEN p_category = 'deutsch' THEN 'german'
    WHEN p_category = 'englisch' THEN 'english'
    WHEN p_category = 'geographie' THEN 'geography'
    WHEN p_category = 'geschichte' THEN 'history'
    WHEN p_category = 'physik' THEN 'physics'
    WHEN p_category = 'biologie' THEN 'biology'
    WHEN p_category = 'chemie' THEN 'chemistry'
    WHEN p_category = 'latein' THEN 'latin'
    ELSE p_category
  END;
  
  -- Log the achievement update attempt
  RAISE LOG 'Achievement update: user_id=%, category=% (normalized=%), type=%, increment=%', 
    p_user_id, p_category, normalized_category, p_type, p_increment;
  
  -- Count available achievement templates
  SELECT COUNT(*) INTO achievement_count
  FROM public.achievements_template 
  WHERE category::text = normalized_category AND type::text = p_type;
  
  RAISE LOG 'Found % achievement templates for category=%, type=%', 
    achievement_count, normalized_category, p_type;
  
  -- Find all relevant Achievement-Templates
  FOR achievement_record IN 
    SELECT * FROM public.achievements_template 
    WHERE category::text = normalized_category AND type::text = p_type
    ORDER BY requirement_value ASC
  LOOP
    RAISE LOG 'Processing achievement: % (req: %)', achievement_record.name, achievement_record.requirement_value;
    
    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record
    FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_id = achievement_record.id;
    
    IF user_achievement_record IS NULL THEN
      -- Achievement doesn't exist yet, create it
      INSERT INTO public.user_achievements (user_id, achievement_id, current_progress, is_completed)
      VALUES (p_user_id, achievement_record.id, LEAST(p_increment, achievement_record.requirement_value), 
              p_increment >= achievement_record.requirement_value);
              
      RAISE LOG 'Created new achievement progress: % with progress=%', 
        achievement_record.name, LEAST(p_increment, achievement_record.requirement_value);
              
      -- If immediately completed, add to new achievements
      IF p_increment >= achievement_record.requirement_value THEN
        new_achievements := new_achievements || json_build_object(
          'name', achievement_record.name,
          'description', achievement_record.description,
          'reward_minutes', achievement_record.reward_minutes,
          'icon', achievement_record.icon,
          'color', achievement_record.color
        );
        RAISE LOG 'New achievement completed immediately: %', achievement_record.name;
      END IF;
    ELSIF NOT user_achievement_record.is_completed THEN
      -- Achievement exists but not completed
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
      
      RAISE LOG 'Updated achievement progress: % from % to %', 
        achievement_record.name, 
        user_achievement_record.current_progress, 
        LEAST(user_achievement_record.current_progress + p_increment, achievement_record.requirement_value);
      
      -- If newly completed, add to new achievements
      IF (user_achievement_record.current_progress + p_increment) >= achievement_record.requirement_value THEN
        new_achievements := new_achievements || json_build_object(
          'name', achievement_record.name,
          'description', achievement_record.description,
          'reward_minutes', achievement_record.reward_minutes,
          'icon', achievement_record.icon,
          'color', achievement_record.color
        );
        RAISE LOG 'Achievement newly completed: %', achievement_record.name;
      END IF;
    ELSE
      RAISE LOG 'Achievement already completed: %', achievement_record.name;
    END IF;
  END LOOP;
  
  RAISE LOG 'Achievement update completed. New achievements: %', array_length(new_achievements, 1);
  
  RETURN json_build_object(
    'success', true,
    'new_achievements', new_achievements,
    'processed_category', normalized_category,
    'templates_found', achievement_count
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Achievement update error: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;