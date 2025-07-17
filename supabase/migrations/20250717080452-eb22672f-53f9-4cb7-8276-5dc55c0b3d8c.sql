-- Create parent settings table
CREATE TABLE public.parent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weekday_max_minutes INTEGER NOT NULL DEFAULT 30,
  weekend_max_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.parent_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for parent settings
CREATE POLICY "Parents can view their own settings" 
ON public.parent_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Parents can create their own settings" 
ON public.parent_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update their own settings" 
ON public.parent_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_parent_settings_updated_at
BEFORE UPDATE ON public.parent_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();