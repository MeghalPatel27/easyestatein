-- Fix critical security issue: restrict property access to owners only
-- Drop the overly permissive policy that allows anyone to view all properties
DROP POLICY IF EXISTS "Users can view all properties" ON public.properties;

-- Create a new policy that only allows users to view their own properties
CREATE POLICY "Users can view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for public property listings (without sensitive data like user_id)
-- This will be used by a view or function that excludes sensitive fields
CREATE POLICY "Public property listings" 
ON public.properties 
FOR SELECT 
USING (status = 'available' AND auth.role() = 'anon');

-- Create a secure view for public property listings that excludes user_id
CREATE OR REPLACE VIEW public.public_properties AS
SELECT 
  id,
  title,
  description,
  category,
  type,
  location,
  price,
  area,
  status,
  bedrooms,
  bathrooms,
  images,
  specifications,
  completion_date,
  created_at,
  updated_at
FROM public.properties 
WHERE status = 'available';

-- Enable RLS on the view (though views inherit from base table)
-- Grant access to the public view for anonymous and authenticated users
GRANT SELECT ON public.public_properties TO anon, authenticated;