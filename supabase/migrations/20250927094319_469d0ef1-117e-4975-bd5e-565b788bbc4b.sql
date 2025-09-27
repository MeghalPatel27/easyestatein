-- Ensure RLS and policies for requirements inserts
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

-- Explicit INSERT policy to satisfy RLS for creating requirements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'requirements' AND policyname = 'Buyers can insert their own requirements'
  ) THEN
    CREATE POLICY "Buyers can insert their own requirements"
    ON public.requirements
    FOR INSERT
    TO authenticated
    WITH CHECK (buyer_id = auth.uid());
  END IF;
END
$$;

-- Ensure buyers can always select their own requirements (in addition to existing broker policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'requirements' AND policyname = 'Buyers can view their own requirements'
  ) THEN
    CREATE POLICY "Buyers can view their own requirements"
    ON public.requirements
    FOR SELECT
    TO authenticated
    USING (buyer_id = auth.uid());
  END IF;
END
$$;

-- Keep updated_at fresh on requirements updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_requirements_updated_at'
  ) THEN
    CREATE TRIGGER set_requirements_updated_at
    BEFORE UPDATE ON public.requirements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Ensure profile auto-provisioning on signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;