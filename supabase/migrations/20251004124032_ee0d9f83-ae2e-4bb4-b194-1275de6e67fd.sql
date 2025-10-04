-- Create a security definer function to get messages for a chat
create or replace function public.get_chat_messages(_chat_id uuid)
returns table (
  id uuid,
  chat_id uuid,
  sender_id uuid,
  content text,
  message_type text,
  attachments text[],
  created_at timestamp with time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    m.id,
    m.chat_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.attachments,
    m.created_at
  from public.messages m
  where m.chat_id = _chat_id
    and exists (
      select 1 from public.chats c
      where c.id = _chat_id
        and (c.broker_id = auth.uid() or c.buyer_id = auth.uid())
    )
  order by m.created_at asc;
$$;