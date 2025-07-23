-- Create tables for the new AI template generation system

-- Generated templates storage
CREATE TABLE IF NOT EXISTS public.generated_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  grade INTEGER NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text-input',
  quality_score REAL NOT NULL DEFAULT 0.0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generation sessions tracking
CREATE TABLE IF NOT EXISTS public.generation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  category TEXT NOT NULL,
  grade INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  templates_generated INTEGER NOT NULL DEFAULT 0,
  average_quality_score REAL NOT NULL DEFAULT 0.0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template quality metrics
CREATE TABLE IF NOT EXISTS public.template_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.generated_templates(id) ON DELETE CASCADE,
  curriculum_alignment REAL NOT NULL DEFAULT 0.0,
  difficulty_appropriateness REAL NOT NULL DEFAULT 0.0,
  uniqueness_score REAL NOT NULL DEFAULT 0.0,
  overall_score REAL NOT NULL DEFAULT 0.0,
  evaluation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_templates
CREATE POLICY "Anyone can view generated templates" 
ON public.generated_templates 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage templates" 
ON public.generated_templates 
FOR ALL 
USING (true);

-- RLS Policies for generation_sessions  
CREATE POLICY "Anyone can view generation sessions" 
ON public.generation_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage sessions" 
ON public.generation_sessions 
FOR ALL 
USING (true);

-- RLS Policies for template_metrics
CREATE POLICY "Anyone can view template metrics" 
ON public.template_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage metrics" 
ON public.template_metrics 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_templates_category_grade ON public.generated_templates(category, grade);
CREATE INDEX IF NOT EXISTS idx_generated_templates_content_hash ON public.generated_templates(content_hash);
CREATE INDEX IF NOT EXISTS idx_generated_templates_quality_score ON public.generated_templates(quality_score);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_session_id ON public.generation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_template_metrics_template_id ON public.template_metrics(template_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_generated_templates_updated_at
BEFORE UPDATE ON public.generated_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_generation_sessions_updated_at
BEFORE UPDATE ON public.generation_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();