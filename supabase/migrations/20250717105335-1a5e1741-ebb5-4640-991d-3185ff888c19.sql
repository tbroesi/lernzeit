-- RADIKALE LÖSUNG: Database Function die RLS umgeht
-- Da RLS nicht funktioniert, verwenden wir eine SECURITY DEFINER Funktion

CREATE OR REPLACE FUNCTION public.claim_invitation_code(
  code_to_claim TEXT,
  claiming_child_id UUID
) 
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Läuft mit Superuser-Rechten, umgeht RLS
SET search_path = ''
AS $$
DECLARE
  code_record RECORD;
  relationship_record RECORD;
  result JSON;
BEGIN
  -- Schritt 1: Code finden und validieren
  SELECT * INTO code_record 
  FROM public.invitation_codes 
  WHERE code = code_to_claim
    AND is_used = false 
    AND expires_at > NOW()
    AND child_id IS NULL;
  
  -- Code nicht gefunden oder ungültig
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code nicht gefunden oder ungültig'
    );
  END IF;
  
  -- Schritt 2: Code beanspruchen (UPDATE)
  UPDATE public.invitation_codes 
  SET 
    child_id = claiming_child_id,
    is_used = true,
    used_at = NOW()
  WHERE id = code_record.id;
  
  -- Schritt 3: Parent-Child Beziehung erstellen
  INSERT INTO public.parent_child_relationships (parent_id, child_id)
  VALUES (code_record.parent_id, claiming_child_id);
  
  -- Erfolg
  RETURN json_build_object(
    'success', true,
    'parent_id', code_record.parent_id,
    'child_id', claiming_child_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback erfolgt automatisch bei Exception
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;