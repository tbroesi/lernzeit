-- Create invitation_codes table for parent-child linking
CREATE TABLE invitation_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for invitation_codes
CREATE POLICY "Parents can manage their invitation codes" ON invitation_codes
  FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Children can view unused codes for linking" ON invitation_codes
  FOR SELECT USING (is_used = FALSE AND expires_at > NOW());

CREATE POLICY "Children can update codes they use" ON invitation_codes
  FOR UPDATE USING (auth.uid() = child_id OR (child_id IS NULL AND is_used = FALSE));

-- Function to generate random 6-digit code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  code VARCHAR(6);
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6-digit code
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM invitation_codes 
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
$$ LANGUAGE plpgsql;

-- Function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM invitation_codes 
  WHERE expires_at < NOW() AND is_used = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance
CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX idx_invitation_codes_expires ON invitation_codes(expires_at);
CREATE INDEX idx_invitation_codes_parent ON invitation_codes(parent_id);