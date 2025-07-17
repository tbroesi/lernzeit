-- Komplette Neuerstellung der invitation_codes RLS-Richtlinien
-- Problem: Die bisherige Logik war zu komplex und widersprüchlich

-- Alle bestehenden Richtlinien löschen
DROP POLICY IF EXISTS "Parents can manage their codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Anyone can read valid codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Children can claim unused codes" ON public.invitation_codes;

-- NEUE EINFACHE RICHTLINIEN:

-- 1. Eltern können alles mit ihren Codes machen
CREATE POLICY "Parents full access to their codes" 
ON public.invitation_codes 
FOR ALL 
USING (auth.uid() = parent_id);

-- 2. Jeder kann unbenutzte, gültige Codes lesen (für Code-Suche)
CREATE POLICY "Read valid unused codes" 
ON public.invitation_codes 
FOR SELECT 
USING (is_used = false AND expires_at > now());

-- 3. Benutzer können Codes beanspruchen (einfache UPDATE-Regel)
CREATE POLICY "Claim invitation codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (is_used = false AND expires_at > now() AND child_id IS NULL);

-- Wichtig: Keine WITH CHECK Klausel - das war das Problem!