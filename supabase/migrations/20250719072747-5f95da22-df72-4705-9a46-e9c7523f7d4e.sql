-- Create table for child subject visibility settings
CREATE TABLE IF NOT EXISTS public.child_subject_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  subject TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id, subject)
);

-- Enable Row Level Security
ALTER TABLE public.child_subject_visibility ENABLE ROW LEVEL SECURITY;

-- Create policies for child subject visibility
CREATE POLICY "Parents can view their child subject visibility" 
ON public.child_subject_visibility 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create child subject visibility" 
ON public.child_subject_visibility 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update child subject visibility" 
ON public.child_subject_visibility 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete child subject visibility" 
ON public.child_subject_visibility 
FOR DELETE 
USING (auth.uid() = parent_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_child_subject_visibility_updated_at
BEFORE UPDATE ON public.child_subject_visibility
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();