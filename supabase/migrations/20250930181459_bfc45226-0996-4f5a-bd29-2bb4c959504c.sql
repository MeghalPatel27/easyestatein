-- Fix RLS policies for property_matches, chats, and profiles tables

-- Drop and recreate property_matches policies
DROP POLICY IF EXISTS "Brokers can view their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can update their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "System can manage property matches" ON public.property_matches;

CREATE POLICY "Brokers can view their property matches"
ON public.property_matches
FOR SELECT
TO authenticated
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their property matches"
ON public.property_matches
FOR UPDATE
TO authenticated
USING (broker_id = auth.uid());

CREATE POLICY "System can insert property matches"
ON public.property_matches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can delete property matches"
ON public.property_matches
FOR DELETE
TO authenticated
USING (true);

-- Drop and recreate chats policies
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;

CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
TO authenticated
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can create chats"
ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
TO authenticated
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can delete their own chats"
ON public.chats
FOR DELETE
TO authenticated
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

-- Add policy for brokers to view buyer profiles (for matching)
DROP POLICY IF EXISTS "Brokers can view buyer profiles for matches" ON public.profiles;

CREATE POLICY "Brokers can view buyer profiles for matches"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  id = auth.uid() 
  OR
  -- Brokers can see profiles of buyers they have matches with
  EXISTS (
    SELECT 1 FROM public.property_matches pm
    WHERE pm.broker_id = auth.uid()
    AND pm.buyer_id = profiles.id
  )
);