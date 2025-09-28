-- Fix RLS policies for property_matches table
DROP POLICY IF EXISTS "Brokers can view matches for their properties" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can update their property matches" ON public.property_matches;

-- Create proper RLS policies for property_matches
CREATE POLICY "Brokers can view their property matches" 
ON public.property_matches 
FOR SELECT 
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their property matches" 
ON public.property_matches 
FOR UPDATE 
USING (broker_id = auth.uid());

-- Also ensure leads table has proper policies
CREATE POLICY "Brokers can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can view their leads" 
ON public.leads 
FOR SELECT 
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Brokers can update their leads" 
ON public.leads 
FOR UPDATE 
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Brokers can delete their leads" 
ON public.leads 
FOR DELETE 
USING (broker_id = auth.uid() OR buyer_id = auth.uid());