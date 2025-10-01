-- Fix RLS policy for property_matches to allow brokers to view their matches
-- The current policy might be too restrictive

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Brokers can view their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can update their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "System can insert property matches" ON public.property_matches;
DROP POLICY IF EXISTS "System can delete property matches" ON public.property_matches;

-- Allow brokers to view property matches assigned to them
CREATE POLICY "Brokers can view their property matches"
ON public.property_matches
FOR SELECT
TO authenticated
USING (broker_id = auth.uid());

-- Allow brokers to update their property matches
CREATE POLICY "Brokers can update their property matches"
ON public.property_matches
FOR UPDATE
TO authenticated
USING (broker_id = auth.uid());

-- Allow system to insert property matches (via triggers/functions)
CREATE POLICY "System can insert property matches"
ON public.property_matches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow system to delete property matches
CREATE POLICY "System can delete property matches"
ON public.property_matches
FOR DELETE
TO authenticated
USING (true);