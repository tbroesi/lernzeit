-- Fix the generate_invitation_code function to avoid ambiguous column reference
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS VARCHAR(6) 
SECURITY DEFINER SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  new_code VARCHAR(6);
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6-digit code
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM public.invitation_codes ic
      WHERE ic.code = new_code 
      AND ic.expires_at > NOW()
      AND ic.is_used = FALSE
    ) INTO exists_code;
    
    -- Exit loop if code is unique
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;