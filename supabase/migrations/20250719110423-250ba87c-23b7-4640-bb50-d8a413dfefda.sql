
-- Add RLS policy to allow parents to update their linked children's grades
CREATE POLICY "Parents can update linked children grades" 
ON public.profiles 
FOR UPDATE 
USING (
  id IN (
    SELECT child_id 
    FROM public.parent_child_relationships 
    WHERE parent_id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT child_id 
    FROM public.parent_child_relationships 
    WHERE parent_id = auth.uid()
  )
);
