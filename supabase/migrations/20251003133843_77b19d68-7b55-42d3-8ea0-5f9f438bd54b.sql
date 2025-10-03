-- Create a security definer function to check if user has access to a chat
create or replace function public.user_has_chat_access(_chat_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chats
    where id = _chat_id
      and (_user_id = broker_id or _user_id = buyer_id)
  );
$$;

-- Drop existing RLS policies on messages
drop policy if exists "Users can view messages in their chats" on public.messages;
drop policy if exists "Users can create messages in their chats" on public.messages;

-- Recreate RLS policies using the security definer function
create policy "Users can view messages in their chats"
on public.messages
for select
using (public.user_has_chat_access(chat_id, auth.uid()));

create policy "Users can create messages in their chats"
on public.messages
for insert
with check (
  sender_id = auth.uid() 
  and public.user_has_chat_access(chat_id, auth.uid())
);