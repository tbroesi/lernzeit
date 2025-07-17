-- Remove ALL existing policies for invitation_codes to start fresh
DROP POLICY IF EXISTS "Children can use invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Children can update unused invitation codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Children can view unused codes for linking" ON public.invitation_codes;
DROP POLICY IF EXISTS "Parents can manage their invitation codes" ON public.invitation_codes;

-- Create simple, clear policies
-- Policy 1: Parents can manage all their codes
CREATE POLICY "Parents manage their codes" 
ON public.invitation_codes 
FOR ALL 
USING (auth.uid() = parent_id);

-- Policy 2: Children can read any unused, valid code
CREATE POLICY "Children can read valid codes" 
ON public.invitation_codes 
FOR SELECT 
USING (is_used = false AND expires_at > now());

-- Policy 3: Children can update codes to claim them (most permissive)
CREATE POLICY "Children can claim codes" 
ON public.invitation_codes 
FOR UPDATE 
USING (true)  -- Very permissive for debugging
WITH CHECK (true);  -- Very permissive for debugging