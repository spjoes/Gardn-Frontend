create table if not exists public.garden_mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null unique references public.gardens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,
  token_prefix text not null,
  last_used_at timestamptz,
  last_used_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint garden_mcp_tokens_token_hash_length check (
    char_length(token_hash) = 64
  ),
  constraint garden_mcp_tokens_token_prefix_length check (
    char_length(token_prefix) between 8 and 32
  ),
  constraint garden_mcp_tokens_last_used_by_length check (
    last_used_by is null or char_length(last_used_by) <= 512
  )
);

create index if not exists garden_mcp_tokens_user_id_idx
  on public.garden_mcp_tokens (user_id);

create index if not exists garden_mcp_tokens_last_used_at_idx
  on public.garden_mcp_tokens (last_used_at desc nulls last);

drop trigger if exists garden_mcp_tokens_set_updated_at
  on public.garden_mcp_tokens;

create trigger garden_mcp_tokens_set_updated_at
before update on public.garden_mcp_tokens
for each row
execute function public.set_updated_at();

alter table public.garden_mcp_tokens enable row level security;

drop policy if exists "Users can view their own garden mcp tokens"
  on public.garden_mcp_tokens;

create policy "Users can view their own garden mcp tokens"
on public.garden_mcp_tokens
for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.gardens
    where gardens.id = garden_mcp_tokens.garden_id
      and gardens.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own garden mcp tokens"
  on public.garden_mcp_tokens;

create policy "Users can create their own garden mcp tokens"
on public.garden_mcp_tokens
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.gardens
    where gardens.id = garden_mcp_tokens.garden_id
      and gardens.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own garden mcp tokens"
  on public.garden_mcp_tokens;

create policy "Users can update their own garden mcp tokens"
on public.garden_mcp_tokens
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.gardens
    where gardens.id = garden_mcp_tokens.garden_id
      and gardens.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.gardens
    where gardens.id = garden_mcp_tokens.garden_id
      and gardens.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own garden mcp tokens"
  on public.garden_mcp_tokens;

create policy "Users can delete their own garden mcp tokens"
on public.garden_mcp_tokens
for delete
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.gardens
    where gardens.id = garden_mcp_tokens.garden_id
      and gardens.user_id = auth.uid()
  )
);
