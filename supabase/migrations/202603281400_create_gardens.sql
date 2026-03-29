create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.gardens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gardens_name_length check (char_length(name) between 2 and 80),
  constraint gardens_description_length check (
    description is null or char_length(description) <= 280
  )
);

create unique index if not exists gardens_user_name_unique
  on public.gardens (user_id, lower(name));

create index if not exists gardens_user_updated_at_idx
  on public.gardens (user_id, updated_at desc);

drop trigger if exists gardens_set_updated_at on public.gardens;

create trigger gardens_set_updated_at
before update on public.gardens
for each row
execute function public.set_updated_at();

create table if not exists public.garden_sites (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  site_url text not null,
  normalized_url text not null,
  processing_status text not null default 'queued',
  processor_status_message text,
  processing_requested_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint garden_sites_status_check check (
    processing_status in ('queued', 'processing', 'ready', 'failed')
  ),
  constraint garden_sites_url_length check (char_length(site_url) <= 2048),
  constraint garden_sites_normalized_url_length check (
    char_length(normalized_url) <= 2048
  )
);

create unique index if not exists garden_sites_garden_url_unique
  on public.garden_sites (garden_id, normalized_url);

create index if not exists garden_sites_user_created_at_idx
  on public.garden_sites (user_id, created_at desc);

create index if not exists garden_sites_status_idx
  on public.garden_sites (processing_status);

drop trigger if exists garden_sites_set_updated_at on public.garden_sites;

create trigger garden_sites_set_updated_at
before update on public.garden_sites
for each row
execute function public.set_updated_at();

alter table public.gardens enable row level security;
alter table public.garden_sites enable row level security;

drop policy if exists "Users can view their own gardens" on public.gardens;
create policy "Users can view their own gardens"
on public.gardens
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own gardens" on public.gardens;
create policy "Users can create their own gardens"
on public.gardens
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own gardens" on public.gardens;
create policy "Users can update their own gardens"
on public.gardens
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own gardens" on public.gardens;
create policy "Users can delete their own gardens"
on public.gardens
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view their own garden sites" on public.garden_sites;
create policy "Users can view their own garden sites"
on public.garden_sites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own garden sites" on public.garden_sites;
create policy "Users can create their own garden sites"
on public.garden_sites
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.gardens
    where gardens.id = garden_sites.garden_id
      and gardens.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own garden sites" on public.garden_sites;
create policy "Users can update their own garden sites"
on public.garden_sites
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own garden sites" on public.garden_sites;
create policy "Users can delete their own garden sites"
on public.garden_sites
for delete
to authenticated
using (auth.uid() = user_id);
