-- Fix security warnings by setting search_path for all functions

-- Update handle_property_approval_deletion function
CREATE OR REPLACE FUNCTION handle_property_approval_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- When a property approval is deleted, also delete the associated property if it exists
  DELETE FROM public.properties WHERE approval_id = OLD.id;
  RETURN OLD;
END;
$$;

-- Update sync_property_approval_updates function
CREATE OR REPLACE FUNCTION sync_property_approval_updates()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only update properties if the approval is approved and a property exists
  IF NEW.status = 'approved' AND EXISTS (SELECT 1 FROM public.properties WHERE approval_id = NEW.id) THEN
    UPDATE public.properties
    SET 
      title = NEW.title,
      description = NEW.description,
      category = NEW.category,
      property_type = NEW.property_type,
      price = NEW.price,
      area = NEW.area,
      bedrooms = NEW.bedrooms,
      bathrooms = NEW.bathrooms,
      location = NEW.location,
      images = COALESCE(NEW.images, '{}'),
      amenities = COALESCE(NEW.amenities, '{}'),
      updated_at = now()
    WHERE approval_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;