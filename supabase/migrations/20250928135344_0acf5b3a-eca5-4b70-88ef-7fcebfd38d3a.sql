-- Fix function search path issues for the functions that don't have it set properly
CREATE OR REPLACE FUNCTION public.handle_property_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh matches for this broker
  PERFORM refresh_broker_property_matches(NEW.broker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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