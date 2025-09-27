-- Ensure privileges and RLS alignment for requirements table
REVOKE ALL ON TABLE public.requirements FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.requirements TO authenticated;