drop table if exists public.garden_site_design_documents__canonical;

create table public.garden_site_design_documents__canonical (
  id uuid primary key default gen_random_uuid(),
  garden_site_id uuid not null unique references public.garden_sites (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  source_url text not null default '',
  document_markdown text not null default '',
  style_fingerprint jsonb not null default '{}'::jsonb,
  search_tags text[] not null default '{}',
  model_provider text not null default 'unknown',
  model_name text not null default 'unknown',
  prompt_version text not null default 'website-design-dna-v1',
  analysis_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint garden_site_design_documents_canonical_source_url_length check (
    char_length(source_url) <= 2048
  )
);

do $$
begin
  if to_regclass('public.garden_site_design_documents') is not null then
    execute $copy$
      insert into public.garden_site_design_documents__canonical (
        id,
        garden_site_id,
        user_id,
        source_url,
        document_markdown,
        style_fingerprint,
        search_tags,
        model_provider,
        model_name,
        prompt_version,
        analysis_metadata,
        created_at,
        updated_at
      )
      select
        coalesce(nullif(payload->>'id', '')::uuid, gen_random_uuid()),
        garden_sites.id,
        garden_sites.user_id,
        coalesce(
          nullif(payload->>'source_url', ''),
          nullif(payload->>'normalized_url', ''),
          garden_sites.normalized_url,
          ''
        ),
        coalesce(payload->>'document_markdown', ''),
        case
          when jsonb_typeof(payload->'style_fingerprint') = 'object'
            then payload->'style_fingerprint'
          when jsonb_typeof(payload->'styleFingerprint') = 'object'
            then payload->'styleFingerprint'
          else '{}'::jsonb
        end,
        case
          when jsonb_typeof(payload->'search_tags') = 'array'
            then array(select jsonb_array_elements_text(payload->'search_tags'))
          when jsonb_typeof(payload->'searchTags') = 'array'
            then array(select jsonb_array_elements_text(payload->'searchTags'))
          else '{}'::text[]
        end,
        coalesce(nullif(payload->>'model_provider', ''), 'unknown'),
        coalesce(nullif(payload->>'model_name', ''), 'unknown'),
        coalesce(nullif(payload->>'prompt_version', ''), 'website-design-dna-v1'),
        case
          when jsonb_typeof(payload->'analysis_metadata') = 'object'
            then payload->'analysis_metadata'
          when jsonb_typeof(payload->'analysisMetadata') = 'object'
            then payload->'analysisMetadata'
          else '{}'::jsonb
        end,
        coalesce(
          nullif(payload->>'created_at', '')::timestamptz,
          timezone('utc', now())
        ),
        coalesce(
          nullif(payload->>'updated_at', '')::timestamptz,
          timezone('utc', now())
        )
      from (
        select to_jsonb(documents) as payload
        from public.garden_site_design_documents as documents
      ) as legacy_documents
      join public.garden_sites
        on public.garden_sites.id = nullif(legacy_documents.payload->>'garden_site_id', '')::uuid
      on conflict (garden_site_id) do update
      set
        id = excluded.id,
        user_id = excluded.user_id,
        source_url = excluded.source_url,
        document_markdown = excluded.document_markdown,
        style_fingerprint = excluded.style_fingerprint,
        search_tags = excluded.search_tags,
        model_provider = excluded.model_provider,
        model_name = excluded.model_name,
        prompt_version = excluded.prompt_version,
        analysis_metadata = excluded.analysis_metadata,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
    $copy$;

    drop table public.garden_site_design_documents cascade;
  end if;
end
$$;

alter table public.garden_site_design_documents__canonical
  rename to garden_site_design_documents;

create index if not exists garden_site_design_documents_user_id_idx
  on public.garden_site_design_documents (user_id);

create index if not exists garden_site_design_documents_search_tags_idx
  on public.garden_site_design_documents
  using gin (search_tags);

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
