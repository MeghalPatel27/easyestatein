-- Clean up orphaned data before adding foreign key constraints

-- Remove property_matches that reference non-existent properties
DELETE FROM public.property_matches 
WHERE property_id NOT IN (SELECT id FROM public.properties);

-- Remove property_matches that reference non-existent requirements  
DELETE FROM public.property_matches 
WHERE requirement_id NOT IN (SELECT id FROM public.requirements);

-- Remove leads that reference non-existent properties
UPDATE public.leads 
SET property_id = NULL 
WHERE property_id IS NOT NULL AND property_id NOT IN (SELECT id FROM public.properties);

-- Remove leads that reference non-existent requirements
UPDATE public.leads 
SET requirement_id = NULL 
WHERE requirement_id IS NOT NULL AND requirement_id NOT IN (SELECT id FROM public.requirements);

-- Now add foreign key constraints to ensure referential integrity
-- Add foreign key from properties to property_approvals
ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_approval_id 
FOREIGN KEY (approval_id) REFERENCES public.property_approvals(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key from property_matches to properties
ALTER TABLE public.property_matches 
ADD CONSTRAINT fk_property_matches_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key from property_matches to requirements
ALTER TABLE public.property_matches 
ADD CONSTRAINT fk_property_matches_requirement_id 
FOREIGN KEY (requirement_id) REFERENCES public.requirements(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key from leads to properties (nullable)
ALTER TABLE public.leads 
ADD CONSTRAINT fk_leads_property_id 
FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key from leads to requirements (nullable)
ALTER TABLE public.leads 
ADD CONSTRAINT fk_leads_requirement_id 
FOREIGN KEY (requirement_id) REFERENCES public.requirements(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create trigger function to handle property approval deletions
CREATE OR REPLACE FUNCTION handle_property_approval_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- When a property approval is deleted, also delete the associated property if it exists
  DELETE FROM public.properties WHERE approval_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for property approval deletions
CREATE TRIGGER trigger_property_approval_deletion
  BEFORE DELETE ON public.property_approvals
  FOR EACH ROW
  EXECUTE FUNCTION handle_property_approval_deletion();

-- Create trigger function to sync property approval updates to properties
CREATE OR REPLACE FUNCTION sync_property_approval_updates()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for property approval updates
CREATE TRIGGER trigger_sync_property_approval_updates
  AFTER UPDATE ON public.property_approvals
  FOR EACH ROW
  EXECUTE FUNCTION sync_property_approval_updates();