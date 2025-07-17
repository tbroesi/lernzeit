-- Fix the RLS policies for invitation_codes table completely

-- First, drop all existing policies
DROP POLICY IF EXISTS "Parents manage their codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Children can read valid codes" ON public.invitation_codes;
DROP POLICY IF EXISTS "Children can claim codes" ON public.invitation_codes;

-- Create proper policies that actually work
-- Policy 1: Parents can do everything with their codes
CREATE POLICY "Parents can manage their codes" 
ON public.invitation_codes 
FOR ALL 
USING (auth.uid() = parent_id);

-- Policy 2: Anyone can read unused, valid codes (needed for children to find codes)
CREATE POLICY "Anyone can read valid codes" 
ON public.invitation_codes 
FOR SELECT 
USING (is_used = false AND expires_at > now());

-- Policy 3: Children can update ANY unused code to claim it (simplified approach)
CREATE POLICY "Children can claim any valid code" 
ON public.invitation_codes 
FOR UPDATE 
USING (is_used = false AND expires_at > now());

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON public.invitation_codes TO authenticated;