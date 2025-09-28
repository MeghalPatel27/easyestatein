-- Create the missing trigger functions with proper search_path

-- Create trigger function to handle requirement deletions
CREATE OR REPLACE FUNCTION handle_requirement_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- When a requirement is deleted, clean up related property matches and leads
  DELETE FROM public.property_matches WHERE requirement_id = OLD.id;
  DELETE FROM public.leads WHERE requirement_id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger for requirement deletions
DROP TRIGGER IF EXISTS trigger_requirement_deletion ON public.requirements;
CREATE TRIGGER trigger_requirement_deletion
  BEFORE DELETE ON public.requirements
  FOR EACH ROW
  EXECUTE FUNCTION handle_requirement_deletion();

-- Create trigger function to handle property deletions
CREATE OR REPLACE FUNCTION handle_property_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- When a property is deleted, clean up related property matches and leads
  DELETE FROM public.property_matches WHERE property_id = OLD.id;
  UPDATE public.leads SET property_id = NULL WHERE property_id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger for property deletions
DROP TRIGGER IF EXISTS trigger_property_deletion ON public.properties;
CREATE TRIGGER trigger_property_deletion
  BEFORE DELETE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION handle_property_deletion();