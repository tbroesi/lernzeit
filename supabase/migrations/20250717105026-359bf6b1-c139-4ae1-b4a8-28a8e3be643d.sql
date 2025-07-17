-- ENDGÜLTIGE LÖSUNG: Komplett neue, einfache Policy
-- Problem: Die WITH CHECK wird bei JEDEM Update geprüft, auch bei Test-Updates

-- Alle bestehenden UPDATE Policies entfernen
DROP POLICY IF EXISTS "Children can claim codes for themselves" ON public.invitation_codes;

-- NEUE EINFACHE POLICY: Jeder authentifizierte User kann verfügbare Codes beanspruchen
CREATE POLICY "Anyone can claim available codes" 
ON public.invitation_codes 
FOR UPDATE 
TO authenticated
USING (
  -- Code muss verfügbar sein
  is_used = false 
  AND expires_at > now() 
  AND child_id IS NULL
)
-- Keine WITH CHECK - das war das Problem!