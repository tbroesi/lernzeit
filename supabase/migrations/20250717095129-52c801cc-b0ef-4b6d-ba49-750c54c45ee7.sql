-- Drop the current problematic policy
DROP POLICY IF EXISTS "Children can use invitation codes" ON public.invitation_codes;

-- Create a more permissive policy that allows children to claim unused codes
CREATE POLICY "Children can use invitation codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (
  -- Can update if code is unused, not expired, and either unclaimed or belongs to current user
  (is_used = false) 
  AND (expires_at > now()) 
  AND (child_id IS NULL OR child_id = auth.uid())
)
WITH CHECK (
  -- Allow any authenticated user to claim a code by setting themselves as child_id
  auth.uid() IS NOT NULL
);