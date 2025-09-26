-- Allow SECURITY DEFINER trigger to insert profiles by bypassing RLS via owner roles
DROP POLICY IF EXISTS "Allow trigger insert (postgres)" ON public.profiles;
CREATE POLICY "Allow trigger insert (postgres)"
ON public.profiles
FOR INSERT
TO postgres
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow trigger insert (supabase_admin)" ON public.profiles;
CREATE POLICY "Allow trigger insert (supabase_admin)"
ON public.profiles
FOR INSERT
TO supabase_admin
WITH CHECK (true);

-- Ensure schema usage for anon/auth (safe defaults)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;