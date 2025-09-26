-- Create a security definer function to check account type by email (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.get_account_type_by_email(_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_type text;
BEGIN
  SELECT user_type::text INTO account_type
  FROM public.profiles
  WHERE email = _email
  LIMIT 1;
  
  RETURN account_type;
END;
$$;

-- Grant execute to anon for account type checking during login
GRANT EXECUTE ON FUNCTION public.get_account_type_by_email(text) TO anon, authenticated;