-- Fix RLS policies for invitation_codes table to allow children to update codes they use

-- Drop existing update policy for children
DROP POLICY IF EXISTS "Children can update codes they use" ON invitation_codes;

-- Create new policy that allows children to update unused, valid codes
CREATE POLICY "Children can update unused invitation codes" ON invitation_codes
  FOR UPDATE USING (
    is_used = FALSE 
    AND expires_at > NOW() 
    AND (child_id IS NULL OR child_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = child_id 
    AND is_used = true
  );