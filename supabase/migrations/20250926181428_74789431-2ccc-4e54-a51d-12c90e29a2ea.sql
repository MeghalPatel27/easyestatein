-- Fix handle_new_user to cast user_type text to enum safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_type public.user_type;
BEGIN
  -- Safely derive enum value from metadata, default to 'buyer'
  BEGIN
    _user_type := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'user_type','')::public.user_type,
      'buyer'::public.user_type
    );
  EXCEPTION WHEN invalid_text_representation THEN
    _user_type := 'buyer'::public.user_type;
  END;

  INSERT INTO public.profiles (id, user_type, email, mobile, first_name, last_name, created_at)
  VALUES (
    NEW.id,
    _user_type,
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