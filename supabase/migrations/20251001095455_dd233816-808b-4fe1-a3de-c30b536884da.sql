-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_or_create_chat(uuid, uuid, uuid, uuid);

-- Function to handle lead purchase with chat creation
CREATE OR REPLACE FUNCTION purchase_lead(
  p_match_id uuid,
  p_lead_price numeric,
  p_buyer_id uuid,
  p_requirement_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_broker_id uuid;
  v_current_balance numeric;
  v_property_id uuid;
  v_chat_id uuid;
BEGIN
  -- Get broker ID and current balance
  SELECT id, coin_balance INTO v_broker_id, v_current_balance
  FROM profiles
  WHERE id = auth.uid();

  -- Check if broker has sufficient balance
  IF v_current_balance < p_lead_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Get property_id from the match
  SELECT property_id INTO v_property_id
  FROM property_matches
  WHERE id = p_match_id;

  -- Deduct coins from broker's balance
  UPDATE profiles
  SET coin_balance = coin_balance - p_lead_price,
      updated_at = now()
  WHERE id = v_broker_id;

  -- Mark lead as purchased
  UPDATE property_matches
  SET is_lead_purchased = true,
      purchased_at = now(),
      updated_at = now()
  WHERE id = p_match_id;

  -- Create wallet transaction record
  INSERT INTO wallet_transactions (user_id, amount, type, description, reference_id)
  VALUES (
    v_broker_id,
    -p_lead_price,
    'debit',
    'Lead purchase',
    p_match_id
  );

  -- Create or get chat
  SELECT id INTO v_chat_id
  FROM chats
  WHERE broker_id = v_broker_id 
    AND buyer_id = p_buyer_id
    AND requirement_id = p_requirement_id;

  IF v_chat_id IS NULL THEN
    INSERT INTO chats (broker_id, buyer_id, property_id, requirement_id, last_message_at)
    VALUES (v_broker_id, p_buyer_id, v_property_id, p_requirement_id, now())
    RETURNING id INTO v_chat_id;
  END IF;

  -- Create lead record
  INSERT INTO leads (broker_id, buyer_id, property_id, requirement_id, status, notes)
  VALUES (v_broker_id, p_buyer_id, v_property_id, p_requirement_id, 'pending', 'Lead purchased')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'chat_id', v_chat_id,
    'new_balance', v_current_balance - p_lead_price
  );
END;
$$;

-- Function to update chat's last message
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE chats
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update chat's last message
DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON messages;
CREATE TRIGGER trigger_update_chat_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_last_message();