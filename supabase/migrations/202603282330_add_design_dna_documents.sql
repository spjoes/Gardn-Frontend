create table if not exists public.garden_site_design_documents (
  id uuid primary key default gen_random_uuid(),
  garden_site_id uuid not null,
  user_id uuid,
  source_url text,
  document_markdown text,
  style_fingerprint jsonb default '{}'::jsonb,
  search_tags text[] default '{}',
  model_provider text default 'google',
  model_name text,
  prompt_version text default 'website-design-dna-v1',
  analysis_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.garden_site_design_documents
  add column if not exists user_id uuid,
  add column if not exists source_url text,
  add column if not exists document_markdown text,
  add column if not exists style_fingerprint jsonb default '{}'::jsonb,
  add column if not exists search_tags text[] default '{}',
  add column if not exists model_provider text default 'google',
  add column if not exists model_name text,
  add column if not exists prompt_version text default 'website-design-dna-v1',
  add column if not exists analysis_metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.garden_site_design_documents as documents
set source_url = garden_sites.normalized_url
from public.garden_sites
where documents.garden_site_id = garden_sites.id
  and documents.source_url is null;

update public.garden_site_design_documents as documents
set user_id = garden_sites.user_id
from public.garden_sites
where documents.garden_site_id = garden_sites.id
  and documents.user_id is null;

update public.garden_site_design_documents
set
  source_url = coalesce(source_url, ''),
  document_markdown = coalesce(document_markdown, ''),
  style_fingerprint = coalesce(style_fingerprint, '{}'::jsonb),
  search_tags = coalesce(search_tags, '{}'),
  model_provider = coalesce(model_provider, 'google'),
  model_name = coalesce(model_name, 'unknown'),
  prompt_version = coalesce(prompt_version, 'website-design-dna-v1'),
  analysis_metadata = coalesce(analysis_metadata, '{}'::jsonb),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()));

alter table public.garden_site_design_documents
  alter column user_id set not null,
  alter column source_url set default '',
  alter column source_url set not null,
  alter column document_markdown set default '',
  alter column document_markdown set not null,
  alter column style_fingerprint set default '{}'::jsonb,
  alter column style_fingerprint set not null,
  alter column search_tags set default '{}',
  alter column search_tags set not null,
  alter column model_provider set default 'google',
  alter column model_provider set not null,
  alter column model_name set default 'unknown',
  alter column model_name set not null,
  alter column prompt_version set default 'website-design-dna-v1',
  alter column prompt_version set not null,
  alter column analysis_metadata set default '{}'::jsonb,
  alter column analysis_metadata set not null,
  alter column created_at set default timezone('utc', now()),
  alter column created_at set not null,
  alter column updated_at set default timezone('utc', now()),
  alter column updated_at set not null;

create unique index if not exists garden_site_design_documents_garden_site_id_idx
  on public.garden_site_design_documents (garden_site_id);

create index if not exists garden_site_design_documents_user_id_idx
  on public.garden_site_design_documents (user_id);

create index if not exists garden_site_design_documents_search_tags_idx
  on public.garden_site_design_documents
  using gin (search_tags);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'garden_site_design_documents_garden_site_id_fkey'
      and conrelid = 'public.garden_site_design_documents'::regclass
  ) then
    alter table public.garden_site_design_documents
      add constraint garden_site_design_documents_garden_site_id_fkey
      foreign key (garden_site_id)
      references public.garden_sites (id)
      on delete cascade;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'garden_site_design_documents_user_id_fkey'
      and conrelid = 'public.garden_site_design_documents'::regclass
  ) then
    alter table public.garden_site_design_documents
      add constraint garden_site_design_documents_user_id_fkey
      foreign key (user_id)
      references auth.users (id)
      on delete cascade;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'garden_site_design_documents_source_url_length'
      and conrelid = 'public.garden_site_design_documents'::regclass
  ) then
    alter table public.garden_site_design_documents
      add constraint garden_site_design_documents_source_url_length
      check (char_length(source_url) <= 2048);
  end if;
end
$$;

drop trigger if exists garden_site_design_documents_set_updated_at
  on public.garden_site_design_documents;

create trigger garden_site_design_documents_set_updated_at
before update on public.garden_site_design_documents
for each row
execute function public.set_updated_at();

alter table public.garden_site_design_documents enable row level security;

drop policy if exists "Users can view their own garden site design documents"
  on public.garden_site_design_documents;

create policy "Users can view their own garden site design documents"
on public.garden_site_design_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.garden_sites
    where garden_sites.id = garden_site_design_documents.garden_site_id
      and garden_sites.user_id = auth.uid()
  )
);
