-- Update all achievement reward_minutes to maximum 5 minutes
UPDATE public.achievements_template 
SET reward_minutes = LEAST(reward_minutes, 5)
WHERE reward_minutes > 5;