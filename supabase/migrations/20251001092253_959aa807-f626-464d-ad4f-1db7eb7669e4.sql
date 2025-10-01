-- Fix permission denied on property_matches for authenticated clients

-- 1) Ensure base privileges (RLS still applies)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.property_matches TO authenticated;

-- 2) Recreate clear, permissive RLS policies for SELECT/UPDATE
DROP POLICY IF EXISTS "Brokers can view their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "Brokers can update their property matches" ON public.property_matches;
DROP POLICY IF EXISTS "System can insert property matches" ON public.property_matches;
DROP POLICY IF EXISTS "System can delete property matches" ON public.property_matches;

CREATE POLICY "Brokers can view their matches (by broker_id)"
ON public.property_matches
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their matches"
ON public.property_matches
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (broker_id = auth.uid());

-- Note: inserts/deletes are performed by SECURITY DEFINER functions; no client policy needed

-- 3) Ensure full row payloads for realtime (idempotent)
ALTER TABLE public.property_matches REPLICA IDENTITY FULL;