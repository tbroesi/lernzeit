-- Add policy to allow children to create their own relationships
CREATE POLICY "Children can create their own relationships" 
ON public.parent_child_relationships 
FOR INSERT 
WITH CHECK (auth.uid() = child_id);