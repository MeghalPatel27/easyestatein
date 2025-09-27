-- Create enum for user property status
CREATE TYPE public.user_property_status AS ENUM ('active', 'sold', 'inactive');

-- Add user_status column to properties table
ALTER TABLE public.properties 
ADD COLUMN user_status user_property_status NOT NULL DEFAULT 'active';

-- Update all existing properties to have active status
UPDATE public.properties 
SET user_status = 'active' 
WHERE user_status IS NULL;