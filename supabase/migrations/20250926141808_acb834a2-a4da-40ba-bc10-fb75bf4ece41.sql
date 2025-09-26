-- Create profile for existing user
INSERT INTO public.profiles (id, user_type, created_at, updated_at)
VALUES ('133b50ec-e220-4025-83e0-af8150c51a97', 'buyer', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  user_type = COALESCE(profiles.user_type, 'buyer'),
  updated_at = NOW();