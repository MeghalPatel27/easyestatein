-- Fix RLS policies for requirements table to ensure buyers can access their data

-- Drop conflicting policies
DROP POLICY IF EXISTS "Buyers can view their own requirements" ON public.requirements;
DROP POLICY IF EXISTS "Buyers can manage their own requirements" ON public.requirements;
DROP POLICY IF EXISTS "Brokers can view active requirements" ON public.requirements;

-- Create clean, non-conflicting RLS policies for requirements
CREATE POLICY "buyers_can_select_own_requirements" 
ON public.requirements 
FOR SELECT 
USING (buyer_id = auth.uid());

CREATE POLICY "buyers_can_insert_own_requirements" 
ON public.requirements 
FOR INSERT 
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "buyers_can_update_own_requirements" 
ON public.requirements 
FOR UPDATE 
USING (buyer_id = auth.uid());

CREATE POLICY "buyers_can_delete_own_requirements" 
ON public.requirements 
FOR DELETE 
USING (buyer_id = auth.uid());

CREATE POLICY "brokers_can_view_active_requirements" 
ON public.requirements 
FOR SELECT 
USING (status = 'active'::requirement_status);

-- Ensure RLS is enabled
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;