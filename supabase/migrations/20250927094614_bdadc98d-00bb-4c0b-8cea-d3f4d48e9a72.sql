-- Add useful database functions for business logic
CREATE OR REPLACE FUNCTION public.update_user_coin_balance(
    _user_id uuid,
    _amount numeric,
    _transaction_type transaction_type,
    _description text DEFAULT NULL,
    _reference_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_balance numeric;
BEGIN
    -- Get current balance
    SELECT coin_balance INTO current_balance
    FROM profiles
    WHERE id = _user_id;
    
    -- Check if user exists
    IF current_balance IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check for sufficient balance on debit
    IF _transaction_type = 'debit' AND current_balance < _amount THEN
        RETURN false;
    END IF;
    
    -- Update balance
    IF _transaction_type = 'credit' THEN
        UPDATE profiles SET coin_balance = coin_balance + _amount WHERE id = _user_id;
    ELSE
        UPDATE profiles SET coin_balance = coin_balance - _amount WHERE id = _user_id;
    END IF;
    
    -- Insert transaction record
    INSERT INTO wallet_transactions (user_id, amount, type, description, reference_id)
    VALUES (_user_id, _amount, _transaction_type, _description, _reference_id);
    
    RETURN true;
END;
$$;

-- Function to get user profile with additional info
CREATE OR REPLACE FUNCTION public.get_user_profile(_user_id uuid)
RETURNS TABLE (
    id uuid,
    user_type user_type,
    first_name text,
    last_name text,
    email text,
    mobile text,
    company_name text,
    coin_balance integer,
    kyc_status text,
    avatar_url text,
    rating numeric,
    total_reviews integer,
    created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        p.id,
        p.user_type,
        p.first_name,
        p.last_name,
        p.email,
        p.mobile,
        p.company_name,
        p.coin_balance,
        p.kyc_status,
        p.avatar_url,
        p.rating,
        p.total_reviews,
        p.created_at
    FROM profiles p
    WHERE p.id = _user_id;
$$;