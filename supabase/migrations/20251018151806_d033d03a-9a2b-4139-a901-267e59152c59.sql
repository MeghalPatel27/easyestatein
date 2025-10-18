-- Fix RLS policies for leads table to work properly with both brokers and buyers

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Leads can be viewed by participants" ON public.leads;

-- Create new SELECT policy that explicitly allows both brokers and buyers
CREATE POLICY "Leads can be viewed by participants"
ON public.leads
FOR SELECT
TO authenticated
USING (
  (broker_id = auth.uid()) OR (buyer_id = auth.uid())
);