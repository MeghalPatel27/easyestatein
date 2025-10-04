-- Create a security definer function to get chats for a user
create or replace function public.get_user_chats(_user_id uuid)
returns table (
  id uuid,
  broker_id uuid,
  buyer_id uuid,
  property_id uuid,
  requirement_id uuid,
  last_message text,
  last_message_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    c.id,
    c.broker_id,
    c.buyer_id,
    c.property_id,
    c.requirement_id,
    c.last_message,
    c.last_message_at,
    c.created_at,
    c.updated_at
  from public.chats c
  where c.broker_id = _user_id or c.buyer_id = _user_id
  order by c.last_message_at desc nulls last;
$$;