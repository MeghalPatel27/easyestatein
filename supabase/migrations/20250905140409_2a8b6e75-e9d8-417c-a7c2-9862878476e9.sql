-- Fix security definer view issue
-- Recreate the view without SECURITY DEFINER to fix the linter warning
DROP VIEW IF EXISTS public.public_properties;

-- Create a regular view for public property listings that excludes user_id
CREATE VIEW public.public_properties AS
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

-- Grant access to the public view for anonymous and authenticated users
GRANT SELECT ON public.public_properties TO anon, authenticated;