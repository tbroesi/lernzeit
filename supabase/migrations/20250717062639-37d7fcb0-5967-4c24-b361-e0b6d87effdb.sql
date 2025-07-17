-- First, let's drop the existing trigger and function to fix the issue
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, grade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'child'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'child') = 'child' 
      THEN COALESCE((NEW.raw_user_meta_data->>'grade')::integer, 1)
      ELSE NULL 
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also fix the search_path for other functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS VARCHAR(6) 
SECURITY DEFINER SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  code VARCHAR(6);
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6-digit code
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM public.invitation_codes 
      WHERE invitation_codes.code = code 
      AND expires_at > NOW()
      AND is_used = FALSE
    ) INTO exists_code;
    
    -- Exit loop if code is unique
    IF NOT exists_code THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void 
SECURITY DEFINER SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.invitation_codes 
  WHERE expires_at < NOW() AND is_used = FALSE;
END;
$$;