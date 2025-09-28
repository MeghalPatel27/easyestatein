-- Fix RLS policies for property_matches, chats, and properties tables

-- Enable RLS on all tables (ensure they're enabled)
ALTER TABLE public.property_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Brokers can view their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can update their property matches" ON public.property_matches;

-- Create comprehensive property_matches policies
CREATE POLICY "Brokers can view their property matches"
ON public.property_matches
FOR SELECT
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their property matches"
ON public.property_matches
FOR UPDATE
USING (broker_id = auth.uid());

-- Allow system functions to insert/delete property matches
CREATE POLICY "System can manage property matches"
ON public.property_matches
FOR ALL
USING (true)
WITH CHECK (true);

-- Drop existing chat policies and recreate them
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;

-- Create comprehensive chat policies
CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can create chats"
ON public.chats
FOR INSERT
WITH CHECK (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can delete their own chats"
ON public.chats
FOR DELETE
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

-- Ensure properties policies are working correctly
DROP POLICY IF EXISTS "Brokers can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Brokers can insert their own properties" ON public.properties;
DROP POLICY IF EXISTS "Brokers can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Brokers can delete their own properties" ON public.properties;

-- Recreate properties policies
CREATE POLICY "Brokers can view their own properties"
ON public.properties
FOR SELECT
USING (broker_id = auth.uid());

CREATE POLICY "Public can view active properties"
ON public.properties
FOR SELECT
USING (status = 'active'::property_status);

CREATE POLICY "Brokers can insert their own properties"
ON public.properties
FOR INSERT
WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can update their own properties"
ON public.properties
FOR UPDATE
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can delete their own properties"
ON public.properties
FOR DELETE
USING (broker_id = auth.uid());