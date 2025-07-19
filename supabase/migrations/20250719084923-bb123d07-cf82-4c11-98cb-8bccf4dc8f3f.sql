-- Add policy for children to view their linked parent profiles
CREATE POLICY "Children can view linked parent profiles" 
ON public.profiles 
FOR SELECT 
USING (id IN ( 
  SELECT parent_child_relationships.parent_id
  FROM parent_child_relationships
  WHERE parent_child_relationships.child_id = auth.uid()
));