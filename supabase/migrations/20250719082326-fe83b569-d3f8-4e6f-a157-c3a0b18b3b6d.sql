-- Erweitere RLS-Policies für child_settings
-- Kinder müssen ihre eigenen Settings lesen können

-- Policy hinzufügen: Kinder können ihre eigenen Settings lesen
CREATE POLICY "Children can view their own settings" 
ON public.child_settings 
FOR SELECT 
USING (auth.uid() = child_id);