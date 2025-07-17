-- Fix the invitation codes RLS policies completely
-- The issue is that the WITH CHECK clause is incorrect for claiming codes

-- Drop the problematic policy
DROP POLICY IF EXISTS "Children can claim any valid code" ON public.invitation_codes;

-- Create a correct policy for children claiming codes
-- This allows updating unused codes and sets proper constraints on the result
CREATE POLICY "Children can claim unused codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (
  -- Can update if code is unused and not expired
  is_used = false AND expires_at > now()
)
WITH CHECK (
  -- After update: code must be marked as used and claimed by current user
  is_used = true AND 
  child_id = auth.uid() AND 
  expires_at > now()
);