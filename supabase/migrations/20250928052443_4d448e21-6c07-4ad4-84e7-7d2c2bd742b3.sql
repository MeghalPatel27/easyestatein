-- Fix RLS so buyers (public) can read active properties
-- Recreate SELECT policies as PERMISSIVE

BEGIN;

-- Drop existing SELECT policies to avoid restrictive behavior
DROP POLICY IF EXISTS "Brokers can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view active properties" ON public.properties;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Brokers can view their own properties"
ON public.properties
AS PERMISSIVE
FOR SELECT
USING (broker_id = auth.uid());

CREATE POLICY "Public can view active properties"
ON public.properties
AS PERMISSIVE
FOR SELECT
USING (status = 'active'::property_status);

COMMIT;