-- Drop existing RLS policies on properties table
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Brokers can manage their own properties" ON public.properties;
DROP POLICY IF EXISTS "Brokers can delete their own properties" ON public.properties;

-- Create new RLS policies for properties table
CREATE POLICY "Brokers can view their own properties" 
ON public.properties 
FOR SELECT 
TO authenticated
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can insert their own properties" 
ON public.properties 
FOR INSERT 
TO authenticated
WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can update their own properties" 
ON public.properties 
FOR UPDATE 
TO authenticated
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can delete their own properties" 
ON public.properties 
FOR DELETE 
TO authenticated
USING (broker_id = auth.uid());

-- Allow public to view active properties (for buyers/search)
CREATE POLICY "Public can view active properties" 
ON public.properties 
FOR SELECT 
TO public
USING (status = 'active'::property_status);