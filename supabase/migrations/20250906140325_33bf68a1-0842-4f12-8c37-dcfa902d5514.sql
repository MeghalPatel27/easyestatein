-- Create requirements table for buyer requirements
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{}',
  budget_min NUMERIC,
  budget_max NUMERIC,
  area_min NUMERIC,
  area_max NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  urgency TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS 
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for requirements
CREATE POLICY "Buyers can manage their own requirements" ON public.requirements FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Anyone can view active requirements" ON public.requirements FOR SELECT USING (status = 'active');

-- Create trigger for updated_at column
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();