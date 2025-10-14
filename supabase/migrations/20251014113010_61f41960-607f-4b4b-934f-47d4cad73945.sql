-- Add missing columns to property_approvals table
ALTER TABLE public.property_approvals
ADD COLUMN IF NOT EXISTS completion_date TEXT,
ADD COLUMN IF NOT EXISTS directions TEXT[],
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS super_builtup NUMERIC,
ADD COLUMN IF NOT EXISTS number_of_halls INTEGER,
ADD COLUMN IF NOT EXISTS number_of_balconies INTEGER;

-- Add the same columns to properties table for consistency
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS completion_date TEXT,
ADD COLUMN IF NOT EXISTS directions TEXT[],
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS super_builtup NUMERIC,
ADD COLUMN IF NOT EXISTS number_of_halls INTEGER,
ADD COLUMN IF NOT EXISTS number_of_balconies INTEGER;

-- Update the trigger function to sync these new fields
CREATE OR REPLACE FUNCTION public.create_or_update_property_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'approved' THEN
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
        completion_date = NEW.completion_date,
        directions = NEW.directions,
        floor = NEW.floor,
        super_builtup = NEW.super_builtup,
        number_of_halls = NEW.number_of_halls,
        number_of_balconies = NEW.number_of_balconies,
        status = 'active',
        updated_at = now()
      WHERE approval_id = NEW.id;
    ELSE
      INSERT INTO public.properties (
        broker_id, approval_id, title, description, category, property_type,
        price, area, bedrooms, bathrooms, location, images, amenities, 
        completion_date, directions, floor, super_builtup, number_of_halls, 
        number_of_balconies, status, user_status
      ) VALUES (
        NEW.broker_id, NEW.id, NEW.title, NEW.description, NEW.category, NEW.property_type,
        NEW.price, NEW.area, NEW.bedrooms, NEW.bathrooms, NEW.location,
        COALESCE(NEW.images, '{}'), COALESCE(NEW.amenities, '{}'),
        NEW.completion_date, NEW.directions, NEW.floor, NEW.super_builtup,
        NEW.number_of_halls, NEW.number_of_balconies, 'active', 'active'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update the sync trigger function as well
CREATE OR REPLACE FUNCTION public.sync_property_approval_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
      completion_date = NEW.completion_date,
      directions = NEW.directions,
      floor = NEW.floor,
      super_builtup = NEW.super_builtup,
      number_of_halls = NEW.number_of_halls,
      number_of_balconies = NEW.number_of_balconies,
      updated_at = now()
    WHERE approval_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;