-- First, let's check what triggers exist on achievements_template
-- and drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS update_achievements_template_updated_at ON public.achievements_template;

-- Now update all achievement reward_minutes to maximum 5 minutes
UPDATE public.achievements_template 
SET reward_minutes = LEAST(reward_minutes, 5)
WHERE reward_minutes > 5;