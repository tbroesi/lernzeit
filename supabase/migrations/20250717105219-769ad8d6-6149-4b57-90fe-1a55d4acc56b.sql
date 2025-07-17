-- ENDGÜLTIGE LÖSUNG: Das Problem war die ALL Policy für Parents!
-- Diese blockiert alle anderen UPDATE Policies

-- Die problematische ALL Policy entfernen und durch spezifische Policies ersetzen
DROP POLICY IF EXISTS "Parents full access to their codes" ON public.invitation_codes;

-- Neue spezifische Policies für Parents (ohne UPDATE zu blockieren)
CREATE POLICY "Parents can select their codes" 
ON public.invitation_codes 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their codes" 
ON public.invitation_codes 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their codes" 
ON public.invitation_codes 
FOR DELETE 
USING (auth.uid() = parent_id);