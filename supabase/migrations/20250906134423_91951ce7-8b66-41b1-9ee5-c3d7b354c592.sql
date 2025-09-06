-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'broker', 'developer', 'admin')),
  display_name TEXT,
  phone TEXT,
  company_name TEXT,
  business_license TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  operating_areas JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  coin_balance INTEGER DEFAULT 0,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads/requirements table for buyer requirements
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'industrial', 'agricultural')),
  type TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  budget_min NUMERIC,
  budget_max NUMERIC,
  area_min NUMERIC,
  area_max NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  description TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  rejection_rate DECIMAL(5,2) DEFAULT 0.00,
  lead_price INTEGER DEFAULT 10, -- coin price to unlock this lead
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sent_leads table to track broker-lead interactions
CREATE TABLE public.sent_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  coins_spent INTEGER NOT NULL DEFAULT 10,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'interested', 'rejected', 'closed')),
  broker_notes TEXT,
  buyer_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, broker_id, property_id)
);

-- Create wallet_transactions table for coin management
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund', 'bonus')),
  amount INTEGER NOT NULL, -- positive for credits, negative for debits
  description TEXT NOT NULL,
  reference_id UUID, -- reference to related transaction (lead_id, property_id, etc)
  payment_id TEXT, -- external payment gateway transaction id
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create disputes table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_lead_id UUID REFERENCES public.sent_leads(id) ON DELETE SET NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('wrong_lead', 'fake_requirement', 'payment_issue', 'other')),
  description TEXT NOT NULL,
  evidence_files TEXT[] DEFAULT ARRAY[]::text[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'rejected')),
  admin_notes TEXT,
  resolution_amount INTEGER DEFAULT 0, -- coins refunded
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies  
CREATE POLICY "Brokers can view active leads" ON public.leads FOR SELECT USING (status = 'active');
CREATE POLICY "Buyers can manage their own leads" ON public.leads FOR ALL USING (auth.uid() = buyer_id);

-- Sent leads policies
CREATE POLICY "Users can view their own sent leads" ON public.sent_leads FOR SELECT USING (auth.uid() = broker_id OR auth.uid() = (SELECT buyer_id FROM public.leads WHERE id = lead_id));
CREATE POLICY "Brokers can create sent leads" ON public.sent_leads FOR INSERT WITH CHECK (auth.uid() = broker_id);
CREATE POLICY "Users can update their own sent leads" ON public.sent_leads FOR UPDATE USING (auth.uid() = broker_id OR auth.uid() = (SELECT buyer_id FROM public.leads WHERE id = lead_id));

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Disputes policies
CREATE POLICY "Users can manage their own disputes" ON public.disputes FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sent_leads_updated_at BEFORE UPDATE ON public.sent_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update coin balance after wallet transactions
CREATE OR REPLACE FUNCTION public.update_coin_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.profiles 
    SET coin_balance = coin_balance + NEW.amount 
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_coin_balance_trigger 
  AFTER INSERT OR UPDATE ON public.wallet_transactions 
  FOR EACH ROW EXECUTE FUNCTION public.update_coin_balance();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, display_name)
  VALUES (NEW.id, 'buyer', COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();