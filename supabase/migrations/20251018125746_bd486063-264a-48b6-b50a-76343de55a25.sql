-- Update purchase_lead function to accept selected property and not create chat immediately
CREATE OR REPLACE FUNCTION public.purchase_lead(
  p_match_id uuid, 
  p_lead_price numeric, 
  p_buyer_id uuid, 
  p_requirement_id uuid,
  p_selected_property_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_broker_id uuid;
  v_current_balance numeric;
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

  -- Create lead record with pending status (NO CHAT YET)
  INSERT INTO leads (broker_id, buyer_id, property_id, requirement_id, status, notes)
  VALUES (v_broker_id, p_buyer_id, p_selected_property_id, p_requirement_id, 'pending', 'Lead purchase pending buyer approval')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'lead_id', (SELECT id FROM leads WHERE broker_id = v_broker_id AND requirement_id = p_requirement_id AND status = 'pending' ORDER BY created_at DESC LIMIT 1),
    'new_balance', v_current_balance - p_lead_price
  );
END;
$function$;

-- Create function for buyer to approve lead
CREATE OR REPLACE FUNCTION public.approve_lead(p_lead_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lead RECORD;
  v_chat_id uuid;
BEGIN
  -- Get lead details and verify buyer owns it
  SELECT * INTO v_lead
  FROM leads
  WHERE id = p_lead_id AND buyer_id = auth.uid() AND status = 'pending';

  IF v_lead IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead not found or not pending'
    );
  END IF;

  -- Update lead status to approved
  UPDATE leads
  SET status = 'approved',
      updated_at = now()
  WHERE id = p_lead_id;

  -- Create chat between broker and buyer
  INSERT INTO chats (broker_id, buyer_id, property_id, requirement_id, last_message_at)
  VALUES (v_lead.broker_id, v_lead.buyer_id, v_lead.property_id, v_lead.requirement_id, now())
  RETURNING id INTO v_chat_id;

  RETURN jsonb_build_object(
    'success', true,
    'chat_id', v_chat_id
  );
END;
$function$;

-- Create function for buyer to reject lead
CREATE OR REPLACE FUNCTION public.reject_lead(p_lead_id uuid, p_rejection_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lead RECORD;
BEGIN
  -- Get lead details and verify buyer owns it
  SELECT * INTO v_lead
  FROM leads
  WHERE id = p_lead_id AND buyer_id = auth.uid() AND status = 'pending';

  IF v_lead IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lead not found or not pending'
    );
  END IF;

  -- Update lead status to rejected
  UPDATE leads
  SET status = 'rejected',
      notes = COALESCE(p_rejection_reason, notes),
      updated_at = now()
  WHERE id = p_lead_id;

  RETURN jsonb_build_object(
    'success', true,
    'broker_id', v_lead.broker_id
  );
END;
$function$;