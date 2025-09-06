-- Remove email confirmation requirement completely
-- Set email_confirmed_at for all existing users to allow immediate sign-in
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- This ensures all users (existing and new) can sign in without email confirmation