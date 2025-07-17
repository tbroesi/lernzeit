-- LÖSUNG: Separate Policy für Kinder zum Beanspruchen von Codes
-- Das Kind braucht die Berechtigung, einen Code auf sich selbst zu setzen

-- Aktuelle restriktive Policy entfernen
DROP POLICY IF EXISTS "Claim invitation codes" ON public.invitation_codes;

-- Neue Policy: Kinder können Codes auf sich selbst beanspruchen
CREATE POLICY "Children can claim codes for themselves" 
ON public.invitation_codes 
FOR UPDATE 
USING (
  -- Alte Bedingungen: Code muss verfügbar sein
  is_used = false 
  AND expires_at > now() 
  AND child_id IS NULL
)
WITH CHECK (
  -- Neue Bedingungen: Kind kann Code nur auf sich selbst setzen
  child_id = auth.uid() 
  AND is_used = true
  AND used_at IS NOT NULL
);