-- Create table to store pending registrations with OTP
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  otp TEXT NOT NULL,
  user_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (needed for signup)
CREATE POLICY "Anyone can insert pending registrations"
  ON public.pending_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create function to verify OTP and create user
CREATE OR REPLACE FUNCTION public.verify_otp_and_create_user(
  _email TEXT,
  _otp TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_record RECORD;
  new_user_id UUID;
  user_data JSONB;
BEGIN
  -- Get pending registration
  SELECT * INTO pending_record
  FROM public.pending_registrations
  WHERE email = _email
    AND otp = _otp
    AND expires_at > now()
  LIMIT 1;

  IF pending_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired OTP'
    );
  END IF;

  user_data := pending_record.user_data;

  -- Create auth user with Supabase
  -- This will be done from the client side after successful OTP verification
  -- We just return success and the user data
  
  -- Delete the pending registration
  DELETE FROM public.pending_registrations WHERE id = pending_record.id;

  RETURN jsonb_build_object(
    'success', true,
    'user_data', user_data
  );
END;
$$;

-- Create index for faster lookups
CREATE INDEX idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX idx_pending_registrations_expires_at ON public.pending_registrations(expires_at);

-- Clean up expired registrations periodically (optional - can be done via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_registrations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.pending_registrations WHERE expires_at < now();
$$;