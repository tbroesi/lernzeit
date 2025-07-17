-- Fix the RLS policy for children updating invitation codes
DROP POLICY IF EXISTS "Children can update unused invitation codes" ON public.invitation_codes;

-- Create a corrected policy that allows children to use invitation codes
CREATE POLICY "Children can use invitation codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (
  (is_used = false) 
  AND (expires_at > now()) 
  AND (child_id IS NULL OR child_id = auth.uid())
)
WITH CHECK (
  -- Allow setting child_id to current user and marking as used
  (auth.uid() = child_id) 
  AND (is_used = true)
);