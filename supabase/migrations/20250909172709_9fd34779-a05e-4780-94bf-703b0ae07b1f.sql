-- First, ensure we have the proper trigger for creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to handle all the data properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    user_type, 
    display_name,
    phone
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer'),
    COALESCE(
      CONCAT(
        NEW.raw_user_meta_data->>'first_name', 
        ' ', 
        NEW.raw_user_meta_data->>'last_name'
      ),
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'mobile_number'
  );
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (user_id, user_type, display_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'account_type', 'buyer'),
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;