-- Create or update a property row whenever a property_approval becomes approved
-- 1) Function
CREATE OR REPLACE FUNCTION public.create_or_update_property_on_approval()
RETURNS trigger AS $$
BEGIN
  -- Only act on approved status
  IF NEW.status = 'approved' THEN
    -- If a property already exists for this approval, update it
    IF EXISTS (
      SELECT 1 FROM public.properties p WHERE p.approval_id = NEW.id
    ) THEN
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
        status = 'active',
        updated_at = now()
      WHERE approval_id = NEW.id;
    ELSE
      -- Otherwise create a new property record linked to this approval
      INSERT INTO public.properties (
        broker_id, approval_id, title, description, category, property_type,
        price, area, bedrooms, bathrooms, location, images, amenities, status, user_status
      ) VALUES (
        NEW.broker_id, NEW.id, NEW.title, NEW.description, NEW.category, NEW.property_type,
        NEW.price, NEW.area, NEW.bedrooms, NEW.bathrooms, NEW.location,
        COALESCE(NEW.images, '{}'), COALESCE(NEW.amenities, '{}'), 'active', 'active'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) Trigger
DROP TRIGGER IF EXISTS trg_property_approved_sync ON public.property_approvals;
CREATE TRIGGER trg_property_approved_sync
AFTER UPDATE OF status ON public.property_approvals
FOR EACH ROW
WHEN (NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status))
EXECUTE FUNCTION public.create_or_update_property_on_approval();

-- 3) Backfill existing approved approvals that don't yet have a property row
INSERT INTO public.properties (
  broker_id, approval_id, title, description, category, property_type,
  price, area, bedrooms, bathrooms, location, images, amenities, status, user_status
)
SELECT 
  pa.broker_id, pa.id, pa.title, pa.description, pa.category, pa.property_type,
  pa.price, pa.area, pa.bedrooms, pa.bathrooms, pa.location,
  COALESCE(pa.images, '{}'), COALESCE(pa.amenities, '{}'), 'active', 'active'
FROM public.property_approvals pa
LEFT JOIN public.properties p ON p.approval_id = pa.id
WHERE pa.status = 'approved' AND p.id IS NULL;