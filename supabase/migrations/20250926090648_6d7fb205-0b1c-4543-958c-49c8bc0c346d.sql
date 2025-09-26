-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_type as enum ('buyer', 'broker');
create type property_type as enum ('apartment', 'villa', 'house', 'plot', 'commercial', 'office');
create type property_status as enum ('active', 'sold', 'rented', 'inactive');
create type requirement_status as enum ('active', 'fulfilled', 'paused', 'expired');
create type urgency_level as enum ('low', 'medium', 'high', 'urgent');
create type transaction_type as enum ('credit', 'debit');

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text not null,
  last_name text not null,
  mobile text unique not null,
  user_type user_type not null,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create properties table
create table public.properties (
  id uuid not null default gen_random_uuid(),
  broker_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  property_type property_type not null,
  location jsonb not null,
  price decimal(12,2) not null,
  area decimal(8,2),
  bedrooms integer,
  bathrooms integer,
  amenities text[],
  images text[],
  status property_status not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create requirements table
create table public.requirements (
  id uuid not null default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  property_type property_type not null,
  location jsonb not null,
  budget_min decimal(12,2),
  budget_max decimal(12,2),
  area_min decimal(8,2),
  area_max decimal(8,2),
  bedrooms integer,
  bathrooms integer,
  amenities text[],
  urgency urgency_level not null default 'medium',
  status requirement_status not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create chats table
create table public.chats (
  id uuid not null default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  requirement_id uuid references public.requirements(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  broker_id uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create messages table
create table public.messages (
  id uuid not null default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  message_type text not null default 'text',
  attachments text[],
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create leads table
create table public.leads (
  id uuid not null default gen_random_uuid(),
  broker_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  requirement_id uuid references public.requirements(id) on delete set null,
  status text not null default 'new',
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create wallet_transactions table
create table public.wallet_transactions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount decimal(10,2) not null,
  transaction_type transaction_type not null,
  description text,
  reference_id text,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.requirements enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;
alter table public.wallet_transactions enable row level security;

-- Create RLS policies for profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Public profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Create RLS policies for properties
create policy "Anyone can view active properties" on public.properties
  for select using (status = 'active' or broker_id = auth.uid());

create policy "Brokers can manage their own properties" on public.properties
  for all using (broker_id = auth.uid());

create policy "Brokers can insert properties" on public.properties
  for insert with check (broker_id = auth.uid());

-- Create RLS policies for requirements
create policy "Anyone can view active requirements" on public.requirements
  for select using (status = 'active' or buyer_id = auth.uid());

create policy "Buyers can manage their own requirements" on public.requirements
  for all using (buyer_id = auth.uid());

create policy "Buyers can insert requirements" on public.requirements
  for insert with check (buyer_id = auth.uid());

-- Create RLS policies for chats
create policy "Users can view their own chats" on public.chats
  for select using (buyer_id = auth.uid() or broker_id = auth.uid());

create policy "Users can insert chats they participate in" on public.chats
  for insert with check (buyer_id = auth.uid() or broker_id = auth.uid());

create policy "Users can update their own chats" on public.chats
  for update using (buyer_id = auth.uid() or broker_id = auth.uid());

-- Create RLS policies for messages
create policy "Users can view messages in their chats" on public.messages
  for select using (
    exists (
      select 1 from public.chats 
      where chats.id = messages.chat_id 
      and (chats.buyer_id = auth.uid() or chats.broker_id = auth.uid())
    )
  );

create policy "Users can insert messages in their chats" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.chats 
      where chats.id = chat_id 
      and (chats.buyer_id = auth.uid() or chats.broker_id = auth.uid())
    )
  );

-- Create RLS policies for leads
create policy "Brokers can view their own leads" on public.leads
  for select using (broker_id = auth.uid());

create policy "Buyers can view leads where they are involved" on public.leads
  for select using (buyer_id = auth.uid());

create policy "Brokers can manage their own leads" on public.leads
  for all using (broker_id = auth.uid());

create policy "Brokers can insert leads" on public.leads
  for insert with check (broker_id = auth.uid());

-- Create RLS policies for wallet transactions
create policy "Users can view their own transactions" on public.wallet_transactions
  for select using (user_id = auth.uid());

create policy "Users can insert their own transactions" on public.wallet_transactions
  for insert with check (user_id = auth.uid());

-- Create function to update updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_properties_updated_at
  before update on public.properties
  for each row execute function update_updated_at_column();

create trigger update_requirements_updated_at
  before update on public.requirements
  for each row execute function update_updated_at_column();

create trigger update_chats_updated_at
  before update on public.chats
  for each row execute function update_updated_at_column();

create trigger update_leads_updated_at
  before update on public.leads
  for each row execute function update_updated_at_column();

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, mobile, user_type)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'mobile',
    (new.raw_user_meta_data ->> 'user_type')::user_type
  );
  return new;
end;
$$;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for better performance
create index idx_properties_broker_id on public.properties(broker_id);
create index idx_properties_status on public.properties(status);
create index idx_properties_type on public.properties(property_type);
create index idx_requirements_buyer_id on public.requirements(buyer_id);
create index idx_requirements_status on public.requirements(status);
create index idx_chats_buyer_id on public.chats(buyer_id);
create index idx_chats_broker_id on public.chats(broker_id);
create index idx_messages_chat_id on public.messages(chat_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_leads_broker_id on public.leads(broker_id);
create index idx_leads_buyer_id on public.leads(buyer_id);
create index idx_wallet_transactions_user_id on public.wallet_transactions(user_id);