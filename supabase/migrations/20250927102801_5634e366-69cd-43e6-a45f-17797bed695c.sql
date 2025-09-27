-- Check if RLS is enabled and fix permissions for property_approvals table
ALTER TABLE public.property_approvals ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.property_approvals TO authenticated;
GRANT ALL ON public.property_approvals TO service_role;

-- Recreate the INSERT policy to ensure it works correctly
DROP POLICY IF EXISTS "Brokers can insert their own property approvals" ON public.property_approvals;

CREATE POLICY "Brokers can insert their own property approvals" 
ON public.property_approvals 
FOR INSERT 
TO authenticated
WITH CHECK (broker_id = auth.uid());

-- Also ensure the SELECT policy works for authenticated users
DROP POLICY IF EXISTS "Brokers can view their own property approvals" ON public.property_approvals;

CREATE POLICY "Brokers can view their own property approvals" 
ON public.property_approvals 
FOR SELECT 
TO authenticated
USING (broker_id = auth.uid());