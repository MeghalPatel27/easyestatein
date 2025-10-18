-- Fix RLS policy for leads table to allow SECURITY DEFINER function inserts
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Brokers can create leads" ON public.leads;

-- Create a more permissive policy that works with SECURITY DEFINER functions
CREATE POLICY "Brokers can create leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  broker_id = auth.uid() 
  OR 
  -- Allow inserts from SECURITY DEFINER functions when broker_id matches the calling user
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = broker_id AND id = auth.uid()
  )
);

-- Ensure the leads table is set up for real-time
ALTER TABLE public.leads REPLICA IDENTITY FULL;

-- Add leads table to realtime publication if not already added
DO $$ 
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;
END $$;