-- Fix Achievement System: Update RPC function to handle correct parameters
DROP FUNCTION IF EXISTS public.update_achievement_progress(uuid, text, text, integer, boolean, boolean, real);

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
  
  -- Find all relevant Achievement-Templates
  FOR achievement_record IN 
    SELECT * FROM public.achievements_template 
    WHERE category::text = normalized_category AND type::text = p_type
  LOOP
    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record
    FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_id = achievement_record.id;
    
    IF user_achievement_record IS NULL THEN
      -- Achievement doesn't exist yet, create it
      INSERT INTO public.user_achievements (user_id, achievement_id, current_progress, is_completed)
      VALUES (p_user_id, achievement_record.id, LEAST(p_increment, achievement_record.requirement_value), 
              p_increment >= achievement_record.requirement_value);
              
      -- If immediately completed, add to new achievements
      IF p_increment >= achievement_record.requirement_value THEN
        new_achievements := new_achievements || json_build_object(
          'name', achievement_record.name,
          'description', achievement_record.description,
          'reward_minutes', achievement_record.reward_minutes,
          'icon', achievement_record.icon,
          'color', achievement_record.color
        );
        RAISE LOG 'New achievement completed: %', achievement_record.name;
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
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'new_achievements', new_achievements,
    'processed_category', normalized_category
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