-- Fix the achievement update function to normalize category names before counting
CREATE OR REPLACE FUNCTION public.update_achievement_progress(p_user_id uuid, p_category text, p_type text, p_increment integer DEFAULT 1)
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
  total_questions_count integer := 0;
  subjects_count integer := 0;
BEGIN
  -- Normalize category names to match database
  normalized_category := CASE 
    WHEN p_category IN ('mathematik', 'math') THEN 'math'
    WHEN p_category IN ('deutsch', 'german') THEN 'german'
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
  
  -- For total_questions achievements, calculate total across all subjects
  IF p_type = 'total_questions' THEN
    SELECT COALESCE(SUM(correct_answers), 0) INTO total_questions_count
    FROM public.learning_sessions 
    WHERE user_id = p_user_id;
    
    RAISE LOG 'Total questions solved by user: %', total_questions_count;
  END IF;
  
  -- For subjects_mastered achievements, count distinct NORMALIZED subjects
  IF p_type = 'subjects_mastered' THEN
    SELECT COUNT(DISTINCT 
      CASE 
        WHEN category IN ('mathematik', 'math') THEN 'math'
        WHEN category IN ('deutsch', 'german') THEN 'german'
        WHEN category = 'englisch' THEN 'english'
        WHEN category = 'geographie' THEN 'geography'
        WHEN category = 'geschichte' THEN 'history'
        WHEN category = 'physik' THEN 'physics'
        WHEN category = 'biologie' THEN 'biology'
        WHEN category = 'chemie' THEN 'chemistry'
        WHEN category = 'latein' THEN 'latin'
        ELSE category
      END
    ) INTO subjects_count
    FROM public.learning_sessions 
    WHERE user_id = p_user_id AND correct_answers > 0;
    
    RAISE LOG 'Normalized subjects mastered by user: %', subjects_count;
  END IF;
  
  -- Count available achievement templates
  SELECT COUNT(*) INTO achievement_count
  FROM public.achievements_template 
  WHERE (category::text = normalized_category OR category::text = 'general') 
    AND type::text = p_type;
  
  RAISE LOG 'Found % achievement templates for category=%, type=%', 
    achievement_count, normalized_category, p_type;
  
  -- Find all relevant Achievement-Templates
  FOR achievement_record IN 
    SELECT * FROM public.achievements_template 
    WHERE (category::text = normalized_category OR category::text = 'general') 
      AND type::text = p_type
    ORDER BY requirement_value ASC
  LOOP
    RAISE LOG 'Processing achievement: % (req: %)', achievement_record.name, achievement_record.requirement_value;
    
    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record
    FROM public.user_achievements 
    WHERE user_id = p_user_id AND achievement_id = achievement_record.id;
    
    -- Determine progress value based on achievement type
    DECLARE
      progress_value integer := p_increment;
    BEGIN
      IF p_type = 'total_questions' THEN
        progress_value := total_questions_count + p_increment;
      ELSIF p_type = 'subjects_mastered' THEN
        progress_value := subjects_count;
      END IF;
      
      IF user_achievement_record IS NULL THEN
        -- Achievement doesn't exist yet, create it
        INSERT INTO public.user_achievements (user_id, achievement_id, current_progress, is_completed)
        VALUES (p_user_id, achievement_record.id, LEAST(progress_value, achievement_record.requirement_value), 
                progress_value >= achievement_record.requirement_value);
                
        RAISE LOG 'Created new achievement progress: % with progress=%', 
          achievement_record.name, LEAST(progress_value, achievement_record.requirement_value);
                
        -- If immediately completed, add to new achievements
        IF progress_value >= achievement_record.requirement_value THEN
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
        DECLARE
          new_progress integer := CASE 
            WHEN p_type IN ('total_questions', 'subjects_mastered') THEN progress_value
            ELSE user_achievement_record.current_progress + p_increment
          END;
        BEGIN
          UPDATE public.user_achievements 
          SET 
            current_progress = LEAST(new_progress, achievement_record.requirement_value),
            is_completed = new_progress >= achievement_record.requirement_value,
            earned_at = CASE 
              WHEN new_progress >= achievement_record.requirement_value 
              THEN now() 
              ELSE earned_at 
            END
          WHERE id = user_achievement_record.id;
          
          RAISE LOG 'Updated achievement progress: % from % to %', 
            achievement_record.name, 
            user_achievement_record.current_progress, 
            LEAST(new_progress, achievement_record.requirement_value);
          
          -- If newly completed, add to new achievements
          IF new_progress >= achievement_record.requirement_value THEN
            new_achievements := new_achievements || json_build_object(
              'name', achievement_record.name,
              'description', achievement_record.description,
              'reward_minutes', achievement_record.reward_minutes,
              'icon', achievement_record.icon,
              'color', achievement_record.color
            );
            RAISE LOG 'Achievement newly completed: %', achievement_record.name;
          END IF;
        END;
      ELSE
        RAISE LOG 'Achievement already completed: %', achievement_record.name;
      END IF;
    END;
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