-- Fix function search path security warning
ALTER FUNCTION public.get_account_type_by_email(text) SET search_path FROM CURRENT;

-- All other functions already have search_path set correctly in their definitions