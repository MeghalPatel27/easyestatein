-- Drop all existing RLS policies for property_matches table to start fresh
DROP POLICY IF EXISTS "Brokers can view their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can update their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can view matches for their properties" ON public.property_matches;

-- Create correct RLS policies for property_matches table
CREATE POLICY "Brokers can view their property matches" 
ON public.property_matches 
FOR SELECT 
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their property matches" 
ON public.property_matches 
FOR UPDATE 
USING (broker_id = auth.uid());

-- Drop duplicate lead policies and recreate clean ones
DROP POLICY IF EXISTS "Brokers can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Brokers can view their leads" ON public.leads;
DROP POLICY IF EXISTS "Brokers can update their leads" ON public.leads;
DROP POLICY IF EXISTS "Brokers can delete their leads" ON public.leads;
DROP POLICY IF EXISTS "Brokers can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Create clean lead policies
CREATE POLICY "Leads can be viewed by participants" 
ON public.leads 
FOR SELECT 
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Brokers can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Participants can update leads" 
ON public.leads 
FOR UPDATE 
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Participants can delete leads" 
ON public.leads 
FOR DELETE 
USING (broker_id = auth.uid() OR buyer_id = auth.uid());