-- Das Problem: Die UPDATE Policy prüft nur ob child_id IS NULL, 
-- aber erlaubt nicht das SETZEN der child_id durch WITH CHECK
-- Lösung: WITH CHECK Klausel hinzufügen

-- Bestehende Policy löschen und neu erstellen
DROP POLICY IF EXISTS "Claim invitation codes" ON public.invitation_codes;

-- Neue Policy mit korrekter WITH CHECK Klausel
CREATE POLICY "Claim invitation codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (is_used = false AND expires_at > now() AND child_id IS NULL)
WITH CHECK (
  -- Erlaubt das Setzen der child_id auf die aktuelle User-ID
  child_id = auth.uid() AND 
  -- Stellt sicher, dass is_used auf true gesetzt wird
  is_used = true AND
  -- Der Code darf nicht verändert werden (gleicher Code)
  code = (SELECT code FROM public.invitation_codes WHERE id = invitation_codes.id)
);