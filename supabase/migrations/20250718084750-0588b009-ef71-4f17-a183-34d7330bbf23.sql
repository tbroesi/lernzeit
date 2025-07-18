-- Füge fehlende RLS Policy hinzu: Kinder können ihre eigene Eltern-Beziehung lesen
CREATE POLICY "Children can view their parent relationship" 
ON public.parent_child_relationships 
FOR SELECT 
USING (auth.uid() = child_id);