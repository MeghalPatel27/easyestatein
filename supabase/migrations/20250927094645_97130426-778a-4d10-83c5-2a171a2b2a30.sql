-- Add business logic functions and remaining improvements

-- 1. Function to update user coin balance with transaction tracking
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

-- 2. Function to get user profile with additional info
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

-- 3. Function to create or get chat between buyer and broker
CREATE OR REPLACE FUNCTION public.get_or_create_chat(
    _buyer_id uuid,
    _broker_id uuid,
    _property_id uuid DEFAULT NULL,
    _requirement_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chat_id uuid;
BEGIN
    -- Try to find existing chat
    SELECT id INTO chat_id
    FROM chats
    WHERE buyer_id = _buyer_id 
    AND broker_id = _broker_id
    AND (property_id = _property_id OR (property_id IS NULL AND _property_id IS NULL))
    AND (requirement_id = _requirement_id OR (requirement_id IS NULL AND _requirement_id IS NULL))
    LIMIT 1;
    
    -- If no chat found, create one
    IF chat_id IS NULL THEN
        INSERT INTO chats (buyer_id, broker_id, property_id, requirement_id)
        VALUES (_buyer_id, _broker_id, _property_id, _requirement_id)
        RETURNING id INTO chat_id;
    END IF;
    
    RETURN chat_id;
END;
$$;

-- 4. Function to match requirements with properties
CREATE OR REPLACE FUNCTION public.match_properties_to_requirement(_requirement_id uuid)
RETURNS TABLE (
    property_id uuid,
    broker_id uuid,
    match_score integer,
    title text,
    price numeric,
    location jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    req_record RECORD;
BEGIN
    -- Get requirement details
    SELECT * INTO req_record FROM requirements WHERE id = _requirement_id;
    
    IF req_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Find matching properties with basic scoring
    RETURN QUERY
    SELECT 
        p.id as property_id,
        p.broker_id,
        (
            CASE WHEN p.property_type = req_record.property_type THEN 30 ELSE 0 END +
            CASE WHEN p.price BETWEEN req_record.budget_min AND req_record.budget_max THEN 25 ELSE 0 END +
            CASE WHEN p.bedrooms = req_record.bedrooms THEN 15 ELSE 0 END +
            CASE WHEN p.area >= req_record.area_min THEN 10 ELSE 0 END +
            CASE WHEN p.category = req_record.category THEN 20 ELSE 0 END
        ) as match_score,
        p.title,
        p.price,
        p.location
    FROM properties p
    WHERE p.status = 'active'
    AND p.price BETWEEN (req_record.budget_min * 0.8) AND (req_record.budget_max * 1.2)
    ORDER BY match_score DESC
    LIMIT 50;
END;
$$;