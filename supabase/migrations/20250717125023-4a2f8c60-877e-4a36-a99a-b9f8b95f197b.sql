-- Create child_settings table for individual child limits
CREATE TABLE public.child_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  weekday_max_minutes INTEGER NOT NULL DEFAULT 30,
  weekend_max_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Enable RLS
ALTER TABLE public.child_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Parents can view their child settings" 
ON public.child_settings 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create child settings" 
ON public.child_settings 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update child settings" 
ON public.child_settings 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete child settings" 
ON public.child_settings 
FOR DELETE 
USING (auth.uid() = parent_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_child_settings_updated_at
BEFORE UPDATE ON public.child_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();