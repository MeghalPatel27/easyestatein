-- Add approval_id column to properties table to reference property_approvals
ALTER TABLE public.properties 
ADD COLUMN approval_id UUID REFERENCES public.property_approvals(id);

-- Create index for better performance
CREATE INDEX idx_properties_approval_id ON public.properties(approval_id);

-- Update existing properties to link them with their approvals (if any match)
UPDATE public.properties 
SET approval_id = pa.id
FROM public.property_approvals pa
WHERE properties.broker_id = pa.broker_id 
  AND properties.title = pa.title 
  AND properties.price = pa.price
  AND pa.status = 'approved';