-- Update all existing users to have confirmed emails
-- This is safe to run and will allow existing users to sign in immediately
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;