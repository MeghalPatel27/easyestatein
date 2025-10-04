-- Create a security definer function to get a single chat by id
create or replace function public.get_chat_by_id(_chat_id uuid)
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
  where c.id = _chat_id
    and (c.broker_id = auth.uid() or c.buyer_id = auth.uid())
  limit 1;
$$;