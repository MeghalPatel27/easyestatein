-- Add missing columns to requirements table
ALTER TABLE public.requirements
ADD COLUMN IF NOT EXISTS directions TEXT[],
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS min_parking INTEGER,
ADD COLUMN IF NOT EXISTS balconies INTEGER,
ADD COLUMN IF NOT EXISTS furnishing TEXT,
ADD COLUMN IF NOT EXISTS facilities TEXT[],
ADD COLUMN IF NOT EXISTS dislikes TEXT[],
ADD COLUMN IF NOT EXISTS financing TEXT,
ADD COLUMN IF NOT EXISTS property_types TEXT[];

-- Update the matching algorithm to be more comprehensive
CREATE OR REPLACE FUNCTION public.calculate_property_match_score(
  _property_id UUID,
  _requirement_id UUID
) RETURNS INTEGER AS $$
DECLARE
  property_record RECORD;
  requirement_record RECORD;
  score INTEGER := 0;
  amenity_overlap INTEGER := 0;
  direction_match BOOLEAN := FALSE;
BEGIN
  -- Get property details
  SELECT * INTO property_record 
  FROM properties 
  WHERE id = _property_id AND status = 'active';
  
  -- Get requirement details  
  SELECT * INTO requirement_record 
  FROM requirements 
  WHERE id = _requirement_id AND status = 'active';
  
  -- Return 0 if either record doesn't exist
  IF property_record IS NULL OR requirement_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- 1. Property type match (25 points)
  IF property_record.property_type = requirement_record.property_type THEN
    score := score + 25;
  END IF;
  
  -- 2. Budget range match (20 points)
  IF property_record.price BETWEEN requirement_record.budget_min AND requirement_record.budget_max THEN
    score := score + 20;
  ELSIF property_record.price <= requirement_record.budget_max * 1.1 AND 
        property_record.price >= requirement_record.budget_min * 0.9 THEN
    score := score + 12;
  END IF;
  
  -- 3. Category match (10 points)
  IF property_record.category = requirement_record.category THEN
    score := score + 10;
  END IF;
  
  -- 4. Location match (10 points)
  IF property_record.location->>'city' = requirement_record.location->>'city' THEN
    score := score + 10;
  END IF;
  
  -- 5. Bedroom match (10 points)
  IF property_record.bedrooms IS NOT NULL AND requirement_record.bedrooms IS NOT NULL THEN
    IF property_record.bedrooms = requirement_record.bedrooms THEN
      score := score + 10;
    ELSIF abs(property_record.bedrooms - requirement_record.bedrooms) = 1 THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- 6. Bathroom match (5 points)
  IF property_record.bathrooms IS NOT NULL AND requirement_record.bathrooms IS NOT NULL THEN
    IF property_record.bathrooms = requirement_record.bathrooms THEN
      score := score + 5;
    ELSIF abs(property_record.bathrooms - requirement_record.bathrooms) = 1 THEN
      score := score + 2;
    END IF;
  END IF;
  
  -- 7. Area match (5 points)
  IF property_record.area IS NOT NULL AND requirement_record.area_min IS NOT NULL THEN
    IF property_record.area >= requirement_record.area_min AND 
       (requirement_record.area_max IS NULL OR property_record.area <= requirement_record.area_max) THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- 8. Amenities overlap (5 points max)
  IF property_record.amenities IS NOT NULL AND requirement_record.amenities IS NOT NULL THEN
    SELECT COUNT(*) INTO amenity_overlap
    FROM unnest(property_record.amenities) AS amenity
    WHERE amenity = ANY(requirement_record.amenities);
    
    -- Award 1 point per matching amenity, max 5 points
    score := score + LEAST(amenity_overlap, 5);
  END IF;
  
  -- 9. Entry directions match (3 points)
  IF property_record.directions IS NOT NULL AND requirement_record.directions IS NOT NULL 
     AND array_length(property_record.directions, 1) > 0 AND array_length(requirement_record.directions, 1) > 0 THEN
    SELECT EXISTS (
      SELECT 1 FROM unnest(property_record.directions) AS dir
      WHERE dir = ANY(requirement_record.directions)
    ) INTO direction_match;
    
    IF direction_match THEN
      score := score + 3;
    END IF;
  END IF;
  
  -- 10. Floor preference match (2 points)
  IF property_record.floor IS NOT NULL AND requirement_record.floor IS NOT NULL THEN
    IF property_record.floor = requirement_record.floor THEN
      score := score + 2;
    END IF;
  END IF;
  
  -- 11. Balconies match (2 points)
  IF property_record.number_of_balconies IS NOT NULL AND requirement_record.balconies IS NOT NULL THEN
    IF property_record.number_of_balconies >= requirement_record.balconies THEN
      score := score + 2;
    END IF;
  END IF;
  
  -- 12. Halls match (1 point)
  IF property_record.number_of_halls IS NOT NULL THEN
    score := score + 1;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;