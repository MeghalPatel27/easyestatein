-- Drop the restrictive policy that only allows users to see their own properties
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;

-- Create new policies for better access control
-- Brokers can view all available properties (including buyer properties)
CREATE POLICY "Brokers can view all properties" ON public.properties
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'broker'
  )
);

-- Property owners can always view their own properties
CREATE POLICY "Property owners can view their own properties" ON public.properties
FOR SELECT 
USING (auth.uid() = user_id);

-- Public can view available properties (for general property search)
CREATE POLICY "Public can view available properties" ON public.properties
FOR SELECT 
USING (status = 'available' AND auth.role() = 'authenticated');