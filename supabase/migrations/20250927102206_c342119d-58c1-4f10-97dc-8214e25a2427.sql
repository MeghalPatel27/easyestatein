-- Create trigger function for updating timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create property_approvals table for pending property submissions
CREATE TABLE public.property_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'residential',
  property_type property_type NOT NULL,
  price NUMERIC NOT NULL,
  area NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  location JSONB,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_approvals ENABLE ROW LEVEL SECURITY;

-- Create policies for property_approvals
CREATE POLICY "Brokers can insert their own property approvals" 
ON public.property_approvals 
FOR INSERT 
WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Brokers can view their own property approvals" 
ON public.property_approvals 
FOR SELECT 
USING (broker_id = auth.uid());

CREATE POLICY "Brokers can update their own pending property approvals" 
ON public.property_approvals 
FOR UPDATE 
USING (broker_id = auth.uid() AND status = 'pending');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_approvals_updated_at
BEFORE UPDATE ON public.property_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to approve property and move to properties table
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
  WHERE id = _approval_id AND status = 'pending';
  
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
    status = 'approved',
    approved_at = NOW(),
    approved_by = _admin_id,
    updated_at = NOW()
  WHERE id = _approval_id;
  
  RETURN new_property_id;
END;
$$;