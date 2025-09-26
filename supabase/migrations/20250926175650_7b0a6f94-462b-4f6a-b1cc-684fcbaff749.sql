-- Add email column to profiles if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;

-- Update the handle_new_user function to store email and mobile, and upsert safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, email, mobile, first_name, last_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer'),
    NEW.email,
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        mobile = COALESCE(EXCLUDED.mobile, public.profiles.mobile),
        first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
        updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Ensure trigger exists to create profiles on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();