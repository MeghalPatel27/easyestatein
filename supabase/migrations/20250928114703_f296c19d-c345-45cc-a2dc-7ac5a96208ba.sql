-- Ensure roles have proper privileges; RLS will still enforce row-level access
BEGIN;

-- Grant schema usage (safe; required if not already set)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Properties table privileges
GRANT SELECT ON TABLE public.properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.properties TO authenticated;

COMMIT;