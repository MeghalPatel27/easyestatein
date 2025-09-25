-- Fix database schema and relationships

-- First, let's ensure the leads table is properly connected to profiles
-- Add missing buyer_id reference to profiles if not already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'leads_buyer_id_fkey'
    ) THEN
        ALTER TABLE public.leads 
        ADD CONSTRAINT leads_buyer_id_fkey 
        FOREIGN KEY (buyer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure requirements table has proper foreign key to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'requirements_buyer_id_fkey'
    ) THEN
        ALTER TABLE public.requirements 
        ADD CONSTRAINT requirements_buyer_id_fkey 
        FOREIGN KEY (buyer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure sent_leads has proper foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sent_leads_lead_id_fkey'
    ) THEN
        ALTER TABLE public.sent_leads 
        ADD CONSTRAINT sent_leads_lead_id_fkey 
        FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sent_leads_broker_id_fkey'
    ) THEN
        ALTER TABLE public.sent_leads 
        ADD CONSTRAINT sent_leads_broker_id_fkey 
        FOREIGN KEY (broker_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sent_leads_property_id_fkey'
    ) THEN
        ALTER TABLE public.sent_leads 
        ADD CONSTRAINT sent_leads_property_id_fkey 
        FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_buyer_id ON public.leads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_requirements_buyer_id ON public.requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON public.requirements(status);
CREATE INDEX IF NOT EXISTS idx_sent_leads_lead_id ON public.sent_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_sent_leads_broker_id ON public.sent_leads(broker_id);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Update RLS policies to ensure proper data access

-- Drop and recreate leads policies with proper joins
DROP POLICY IF EXISTS "Brokers can view active leads" ON public.leads;
CREATE POLICY "Brokers can view active leads" 
ON public.leads 
FOR SELECT 
USING (status = 'active' AND auth.role() = 'authenticated');

-- Improve sent_leads policies to include proper joins
DROP POLICY IF EXISTS "Users can view their own sent leads" ON public.sent_leads;
CREATE POLICY "Users can view their own sent leads" 
ON public.sent_leads 
FOR SELECT 
USING (
  auth.uid() = broker_id OR 
  auth.uid() = (SELECT buyer_id FROM public.leads WHERE id = sent_leads.lead_id)
);

DROP POLICY IF EXISTS "Users can update their own sent leads" ON public.sent_leads;
CREATE POLICY "Users can update their own sent leads" 
ON public.sent_leads 
FOR UPDATE 
USING (
  auth.uid() = broker_id OR 
  auth.uid() = (SELECT buyer_id FROM public.leads WHERE id = sent_leads.lead_id)
);

-- Add proper trigger for updated_at columns if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_leads_updated_at'
    ) THEN
        CREATE TRIGGER update_leads_updated_at
        BEFORE UPDATE ON public.leads
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_requirements_updated_at'
    ) THEN
        CREATE TRIGGER update_requirements_updated_at
        BEFORE UPDATE ON public.requirements
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_sent_leads_updated_at'
    ) THEN
        CREATE TRIGGER update_sent_leads_updated_at
        BEFORE UPDATE ON public.sent_leads
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_properties_updated_at'
    ) THEN
        CREATE TRIGGER update_properties_updated_at
        BEFORE UPDATE ON public.properties
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Create a function to safely get location properties
CREATE OR REPLACE FUNCTION public.get_location_city(location_data jsonb)
RETURNS TEXT AS $$
BEGIN
  IF location_data IS NULL THEN
    RETURN 'Unknown';
  END IF;
  
  IF jsonb_typeof(location_data) = 'object' THEN
    RETURN COALESCE(location_data->>'city', 'Unknown');
  END IF;
  
  RETURN 'Unknown';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_location_area(location_data jsonb)
RETURNS TEXT AS $$
BEGIN
  IF location_data IS NULL THEN
    RETURN '';
  END IF;
  
  IF jsonb_typeof(location_data) = 'object' THEN
    RETURN COALESCE(location_data->>'area', '');
  END IF;
  
  RETURN '';
END;
$$ LANGUAGE plpgsql STABLE;