-- Move approved properties from property_approvals to properties table
INSERT INTO properties (
  broker_id, title, description, category, property_type, 
  price, area, bedrooms, bathrooms, location, amenities, images, status, user_status, approval_id
) 
SELECT 
  pa.broker_id, pa.title, pa.description, pa.category, pa.property_type, 
  pa.price, pa.area, pa.bedrooms, pa.bathrooms, pa.location, pa.amenities, pa.images, 
  'active'::property_status, 'active'::user_property_status, pa.id
FROM property_approvals pa
LEFT JOIN properties p ON p.approval_id = pa.id
WHERE pa.status = 'approved' AND p.id IS NULL;

-- Update approval records to mark as processed
UPDATE property_approvals 
SET approved_at = NOW(), approved_by = broker_id 
WHERE status = 'approved' AND approved_at IS NULL;