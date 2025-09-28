-- Create property_matches table for storing matches between broker properties and buyer requirements
CREATE TABLE public.property_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  requirement_id UUID NOT NULL,
  broker_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  is_lead_purchased BOOLEAN NOT NULL DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique matches
  UNIQUE(property_id, requirement_id)
);

-- Enable RLS
ALTER TABLE public.property_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_matches
CREATE POLICY "Brokers can view matches for their properties" 
ON public.property_matches 
FOR SELECT 
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their property matches" 
ON public.property_matches 
FOR UPDATE 
USING (broker_id = auth.uid());

-- Create enhanced matching function
CREATE OR REPLACE FUNCTION public.calculate_property_match_score(
  _property_id UUID,
  _requirement_id UUID
) RETURNS INTEGER AS $$
DECLARE
  property_record RECORD;
  requirement_record RECORD;
  score INTEGER := 0;
BEGIN
  -- Get property details
  SELECT * INTO property_record 
  FROM properties 
  WHERE id = _property_id AND status = 'active';
  
  -- Get requirement details  
  SELECT * INTO requirement_record 
  FROM requirements 
  WHERE id = _requirement_id AND status = 'active';
  
  -- Return 0 if either record doesn't exist
  IF property_record IS NULL OR requirement_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Property type match (highest weight - 40 points)
  IF property_record.property_type = requirement_record.property_type THEN
    score := score + 40;
  END IF;
  
  -- Budget range match (30 points)
  IF property_record.price BETWEEN requirement_record.budget_min AND requirement_record.budget_max THEN
    score := score + 30;
  ELSIF property_record.price <= requirement_record.budget_max * 1.1 AND 
        property_record.price >= requirement_record.budget_min * 0.9 THEN
    -- Within 10% tolerance
    score := score + 20;
  END IF;
  
  -- Bedroom match (15 points)
  IF property_record.bedrooms = requirement_record.bedrooms THEN
    score := score + 15;
  ELSIF abs(property_record.bedrooms - requirement_record.bedrooms) = 1 THEN
    -- Within 1 bedroom difference
    score := score + 10;
  END IF;
  
  -- Area match (10 points)
  IF property_record.area >= requirement_record.area_min AND 
     (requirement_record.area_max IS NULL OR property_record.area <= requirement_record.area_max) THEN
    score := score + 10;
  END IF;
  
  -- Category match (5 points)
  IF property_record.category = requirement_record.category THEN
    score := score + 5;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function to refresh matches for a specific broker
CREATE OR REPLACE FUNCTION public.refresh_broker_property_matches(_broker_id UUID)
RETURNS INTEGER AS $$
DECLARE
  match_count INTEGER := 0;
  property_rec RECORD;
  requirement_rec RECORD;
  calculated_score INTEGER;
BEGIN
  -- Delete existing matches for this broker
  DELETE FROM property_matches WHERE broker_id = _broker_id;
  
  -- Generate new matches
  FOR property_rec IN 
    SELECT id, broker_id FROM properties 
    WHERE broker_id = _broker_id AND status = 'active'
  LOOP
    FOR requirement_rec IN 
      SELECT id, buyer_id FROM requirements 
      WHERE status = 'active'
    LOOP
      -- Calculate match score
      calculated_score := calculate_property_match_score(property_rec.id, requirement_rec.id);
      
      -- Only insert matches with score > 30 (meaningful matches)
      IF calculated_score > 30 THEN
        INSERT INTO property_matches (
          property_id, requirement_id, broker_id, buyer_id, match_score
        ) VALUES (
          property_rec.id, requirement_rec.id, property_rec.broker_id, requirement_rec.buyer_id, calculated_score
        );
        match_count := match_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to refresh matches when properties change
CREATE OR REPLACE FUNCTION public.handle_property_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh matches for this broker
  PERFORM refresh_broker_property_matches(NEW.broker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to refresh matches when requirements change  
CREATE OR REPLACE FUNCTION public.handle_requirement_change()
RETURNS TRIGGER AS $$
DECLARE
  broker_rec RECORD;
BEGIN
  -- Refresh matches for all brokers when requirements change
  FOR broker_rec IN 
    SELECT DISTINCT broker_id FROM properties WHERE status = 'active'
  LOOP
    PERFORM refresh_broker_property_matches(broker_rec.broker_id);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for real-time match updates
CREATE TRIGGER trg_property_match_update
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.handle_property_change();

CREATE TRIGGER trg_requirement_match_update  
AFTER INSERT OR UPDATE OR DELETE ON public.requirements
FOR EACH ROW
EXECUTE FUNCTION public.handle_requirement_change();

-- Function to purchase a lead (convert match to lead)
CREATE OR REPLACE FUNCTION public.purchase_lead(
  _match_id UUID,
  _broker_id UUID
) RETURNS JSONB AS $$
DECLARE
  match_record RECORD;
  lead_price NUMERIC;
  current_balance INTEGER;
  new_lead_id UUID;
  result JSONB;
BEGIN
  -- Get match details
  SELECT pm.*, r.lead_price INTO match_record
  FROM property_matches pm
  JOIN requirements r ON r.id = pm.requirement_id
  WHERE pm.id = _match_id AND pm.broker_id = _broker_id AND pm.is_lead_purchased = false
  LIMIT 1;
  
  IF match_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found or already purchased');
  END IF;
  
  lead_price := COALESCE(match_record.lead_price, 100);
  
  -- Check broker balance
  SELECT coin_balance INTO current_balance
  FROM profiles
  WHERE id = _broker_id;
  
  IF current_balance < lead_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coin balance');
  END IF;
  
  -- Deduct coins
  IF NOT update_user_coin_balance(_broker_id, lead_price, 'debit', 'Lead purchase', match_record.requirement_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Failed to deduct coins');
  END IF;
  
  -- Create lead
  INSERT INTO leads (broker_id, buyer_id, requirement_id, property_id, status, notes)
  VALUES (
    _broker_id,
    match_record.buyer_id,
    match_record.requirement_id,
    match_record.property_id,
    'active',
    'Lead purchased from property match'
  ) RETURNING id INTO new_lead_id;
  
  -- Mark match as purchased
  UPDATE property_matches
  SET is_lead_purchased = true, purchased_at = now()
  WHERE id = _match_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'lead_id', new_lead_id,
    'cost', lead_price,
    'remaining_balance', current_balance - lead_price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable real-time for property_matches table
ALTER TABLE public.property_matches REPLICA IDENTITY FULL;

-- Add property_matches to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_matches;

-- Initial population of matches for existing data
INSERT INTO property_matches (property_id, requirement_id, broker_id, buyer_id, match_score)
SELECT 
  p.id as property_id,
  r.id as requirement_id, 
  p.broker_id,
  r.buyer_id,
  calculate_property_match_score(p.id, r.id) as match_score
FROM properties p
CROSS JOIN requirements r  
WHERE p.status = 'active' 
  AND r.status = 'active'
  AND calculate_property_match_score(p.id, r.id) > 30;