-- PROBLEM GEFUNDEN: Die WITH CHECK Klausel hat einen SQL-Fehler
-- Die Subquery referenziert sich selbst falsch

-- Bestehende fehlerhafte Policy löschen
DROP POLICY IF EXISTS "Claim invitation codes" ON public.invitation_codes;

-- Neue korrekte Policy erstellen
CREATE POLICY "Claim invitation codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (is_used = false AND expires_at > now() AND child_id IS NULL)
WITH CHECK (
  -- Erlaubt das Setzen der child_id auf die aktuelle User-ID
  child_id = auth.uid() AND 
  -- Stellt sicher, dass is_used auf true gesetzt wird
  is_used = true
);