-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_type AS ENUM ('buyer', 'broker');
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'house', 'plot', 'commercial', 'office');
CREATE TYPE property_status AS ENUM ('active', 'sold', 'inactive');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE requirement_status AS ENUM ('active', 'matched', 'closed');
CREATE TYPE transaction_type AS ENUM ('debit', 'credit', 'refund');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type user_type NOT NULL,
    first_name TEXT,
    last_name TEXT,
    mobile TEXT UNIQUE,
    avatar_url TEXT,
    company_name TEXT,
    business_license TEXT,
    kyc_status TEXT DEFAULT 'pending',
    operating_areas JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    subscription_type TEXT DEFAULT 'basic',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    coin_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    category TEXT DEFAULT 'residential',
    price DECIMAL(15,2) NOT NULL,
    area DECIMAL(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    location JSONB,
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    status property_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create requirements table  
CREATE TABLE public.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    category TEXT DEFAULT 'residential',
    type TEXT DEFAULT 'buy',
    location JSONB,
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    area_min DECIMAL(10,2),
    area_max DECIMAL(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    amenities TEXT[] DEFAULT '{}',
    urgency urgency_level DEFAULT 'medium',
    status requirement_status DEFAULT 'active',
    rejection_rate DECIMAL(5,2) DEFAULT 0,
    lead_price DECIMAL(10,2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sent_leads view for tracking sent leads
CREATE VIEW public.sent_leads AS
SELECT 
    l.*,
    r.property_type,
    r.category,
    r.type,
    r.location,
    r.budget_min,
    r.budget_max,
    r.urgency,
    r.rejection_rate,
    r.lead_price,
    r.status as requirement_status
FROM public.leads l
JOIN public.requirements r ON l.requirement_id = r.id
WHERE l.status = 'sent';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles  
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for properties
CREATE POLICY "Anyone can view active properties" ON public.properties
    FOR SELECT USING (status = 'active' OR broker_id = auth.uid());

CREATE POLICY "Brokers can manage their own properties" ON public.properties
    FOR ALL USING (broker_id = auth.uid());

-- Create RLS policies for requirements
CREATE POLICY "Buyers can manage their own requirements" ON public.requirements
    FOR ALL USING (buyer_id = auth.uid());

CREATE POLICY "Brokers can view active requirements" ON public.requirements
    FOR SELECT USING (status = 'active' OR buyer_id = auth.uid());

-- Create RLS policies for leads  
CREATE POLICY "Users can view their own leads" ON public.leads
    FOR SELECT USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Brokers can create leads" ON public.leads
    FOR INSERT WITH CHECK (broker_id = auth.uid());

CREATE POLICY "Users can update their own leads" ON public.leads
    FOR UPDATE USING (broker_id = auth.uid() OR buyer_id = auth.uid());

-- Create RLS policies for chats
CREATE POLICY "Users can view their own chats" ON public.chats
    FOR SELECT USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can update their own chats" ON public.chats
    FOR UPDATE USING (broker_id = auth.uid() OR buyer_id = auth.uid());

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE id = messages.chat_id 
            AND (broker_id = auth.uid() OR buyer_id = auth.uid())
        )
    );

CREATE POLICY "Users can create messages in their chats" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE id = messages.chat_id 
            AND (broker_id = auth.uid() OR buyer_id = auth.uid())
        )
    );

-- Create RLS policies for wallet_transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX idx_properties_broker_id ON public.properties(broker_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_requirements_buyer_id ON public.requirements(buyer_id);
CREATE INDEX idx_requirements_status ON public.requirements(status);
CREATE INDEX idx_leads_broker_id ON public.leads(broker_id);
CREATE INDEX idx_leads_buyer_id ON public.leads(buyer_id);
CREATE INDEX idx_chats_broker_id ON public.chats(broker_id);
CREATE INDEX idx_chats_buyer_id ON public.chats(buyer_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_requirements_updated_at
    BEFORE UPDATE ON public.requirements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();