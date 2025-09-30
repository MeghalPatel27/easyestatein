-- Fix authentication issue by removing problematic RLS policy
-- The "Brokers can view buyer profiles for matches" policy causes permission errors
-- when users try to fetch their own profiles because it references property_matches table

DROP POLICY IF EXISTS "Brokers can view buyer profiles for matches" ON public.profiles;

-- The existing "Enable read access for authenticated users" policy is sufficient
-- for users to view their own profiles: qual:(auth.uid() = id)