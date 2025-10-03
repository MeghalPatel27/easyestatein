-- Create a safe RPC to fetch limited public profile info for chat participants
create or replace function public.get_profile_public(target_user_id uuid)
returns table (
  first_name text,
  last_name text,
  company_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.first_name, p.last_name, p.company_name
  from public.profiles p
  where p.id = target_user_id
    and (
      target_user_id = auth.uid()
      or exists (
        select 1 from public.chats c
        where (c.broker_id = auth.uid() and c.buyer_id = target_user_id)
           or (c.buyer_id = auth.uid() and c.broker_id = target_user_id)
      )
    )
$$;