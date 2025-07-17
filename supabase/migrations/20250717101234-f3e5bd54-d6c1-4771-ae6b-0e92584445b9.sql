-- Fix the WITH CHECK clause for the update policy
DROP POLICY IF EXISTS "Children can claim any valid code" ON public.invitation_codes;

-- Create the correct policy with proper WITH CHECK clause
CREATE POLICY "Children can claim any valid code" 
ON public.invitation_codes 
FOR UPDATE 
USING (is_used = false AND expires_at > now())
WITH CHECK (
  -- Allow the new row to have is_used = true and child_id set to current user
  auth.uid() = child_id AND 
  expires_at > now()
);