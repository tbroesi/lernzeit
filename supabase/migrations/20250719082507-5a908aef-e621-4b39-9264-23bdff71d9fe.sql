-- Erweitere RLS-Policies für child_subject_visibility
-- Kinder müssen ihre eigene Fächer-Sichtbarkeit lesen können

-- Policy hinzufügen: Kinder können ihre eigene Subject-Visibility lesen
CREATE POLICY "Children can view their own subject visibility" 
ON public.child_subject_visibility 
FOR SELECT 
USING (auth.uid() = child_id);