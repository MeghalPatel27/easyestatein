-- Create user roles enum
CREATE TYPE user_role AS ENUM ('buyer', 'seller');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  phone TEXT,
  user_role user_role NOT NULL DEFAULT 'buyer',
  wallet_balance INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requirements table for buyer requirements
CREATE TABLE public.requirements (
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

-- Create properties table for seller properties
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  category TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{}',
  price NUMERIC NOT NULL,
  area NUMERIC NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  status TEXT DEFAULT 'available',
  verification_status TEXT DEFAULT 'pending',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table for connections between buyers and sellers
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID NOT NULL,
  property_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  status TEXT DEFAULT 'qualified',
  coins_spent INTEGER DEFAULT 10,
  seller_notes TEXT,
  buyer_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  lead_id UUID,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for requirements
CREATE POLICY "Buyers can manage their own requirements" ON public.requirements FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view active requirements" ON public.requirements FOR SELECT USING (status = 'active');

-- RLS Policies for properties
CREATE POLICY "Sellers can manage their own properties" ON public.properties FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Public can view available properties" ON public.properties FOR SELECT USING (status = 'available' AND verification_status = 'verified');

-- RLS Policies for leads
CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Sellers can create leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for wallet transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chats
CREATE POLICY "Users can view their own chats" ON public.chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can update their own chats" ON public.chats FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for chat messages
CREATE POLICY "Users can view messages in their chats" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_messages.chat_id 
    AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their chats" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = chat_messages.chat_id 
    AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
  ) AND auth.uid() = sender_id
);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, user_role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'user_role')::user_role, 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + NEW.amount 
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for wallet balance updates
CREATE TRIGGER update_wallet_on_transaction
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();