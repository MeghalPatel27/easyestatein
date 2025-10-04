-- Create a security definer function to send messages
create or replace function public.send_message(
  _chat_id uuid,
  _content text,
  _message_type text default 'text',
  _attachments text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  message_id uuid;
  sender_id uuid;
begin
  -- Get the current user id
  sender_id := auth.uid();
  
  -- Check if user has access to this chat
  if not exists (
    select 1 from public.chats c
    where c.id = _chat_id
      and (c.broker_id = sender_id or c.buyer_id = sender_id)
  ) then
    raise exception 'Access denied to chat';
  end if;
  
  -- Insert the message
  insert into public.messages (
    chat_id,
    sender_id,
    content,
    message_type,
    attachments
  ) values (
    _chat_id,
    sender_id,
    _content,
    _message_type,
    _attachments
  ) returning id into message_id;
  
  -- Update chat last message
  update public.chats
  set 
    last_message = _content,
    last_message_at = now(),
    updated_at = now()
  where id = _chat_id;
  
  return message_id;
end;
$$;