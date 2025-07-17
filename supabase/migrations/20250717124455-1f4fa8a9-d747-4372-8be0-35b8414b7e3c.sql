-- Add policy for parents to view their linked children's profiles
CREATE POLICY "Parents can view linked children profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT child_id 
    FROM public.parent_child_relationships 
    WHERE parent_id = auth.uid()
  )
);