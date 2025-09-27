-- Create enum for property approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Drop the policy that depends on the status column
DROP POLICY IF EXISTS "Brokers can update their own pending property approvals" ON public.property_approvals;

-- Remove the default value first
ALTER TABLE public.property_approvals 
ALTER COLUMN status DROP DEFAULT;

-- Change the column type to enum
ALTER TABLE public.property_approvals 
ALTER COLUMN status TYPE approval_status USING status::approval_status;

-- Set the new default value
ALTER TABLE public.property_approvals 
ALTER COLUMN status SET DEFAULT 'pending'::approval_status;

-- Recreate the policy with the enum type
CREATE POLICY "Brokers can update their own pending property approvals" 
ON public.property_approvals 
FOR UPDATE 
TO authenticated
USING (broker_id = auth.uid() AND status = 'pending'::approval_status);

-- Update the approve_property function to use enum
CREATE OR REPLACE FUNCTION public.approve_property(_approval_id UUID, _admin_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  approval_record RECORD;
  new_property_id UUID;
BEGIN
  -- Get the approval record
  SELECT * INTO approval_record 
  FROM property_approvals 
  WHERE id = _approval_id AND status = 'pending'::approval_status;
  
  IF approval_record IS NULL THEN
    RAISE EXCEPTION 'Property approval not found or already processed';
  END IF;
  
  -- Insert into properties table
  INSERT INTO properties (
    broker_id, title, description, category, property_type, 
    price, area, bedrooms, bathrooms, location, amenities, images, status
  ) VALUES (
    approval_record.broker_id,
    approval_record.title,
    approval_record.description,
    approval_record.category,
    approval_record.property_type,
    approval_record.price,
    approval_record.area,
    approval_record.bedrooms,
    approval_record.bathrooms,
    approval_record.location,
    approval_record.amenities,
    approval_record.images,
    'active'
  ) RETURNING id INTO new_property_id;
  
  -- Update approval record
  UPDATE property_approvals 
  SET 
    status = 'approved'::approval_status,
    approved_at = NOW(),
    approved_by = _admin_id,
    updated_at = NOW()
  WHERE id = _approval_id;
  
  RETURN new_property_id;
END;
$$;

-- Create function to reject property
CREATE OR REPLACE FUNCTION public.reject_property(_approval_id UUID, _admin_id UUID, _admin_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update approval record to rejected
  UPDATE property_approvals 
  SET 
    status = 'rejected'::approval_status,
    approved_by = _admin_id,
    admin_notes = _admin_notes,
    updated_at = NOW()
  WHERE id = _approval_id AND status = 'pending'::approval_status;
  
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;