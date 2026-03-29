drop table if exists public.garden_site_design_documents;

alter table public.garden_sites
  drop constraint if exists garden_sites_processing_progress_check;

alter table public.garden_sites
  drop column if exists processing_step,
  drop column if exists processing_progress;

update public.garden_sites
set
  processing_status = 'ready',
  processor_status_message = 'Saved to this garden.',
  processing_requested_at = coalesce(processing_requested_at, created_at),
  processed_at = coalesce(processed_at, timezone('utc', now()))
where processing_status <> 'ready'
   or processor_status_message is distinct from 'Saved to this garden.'
   or processed_at is null;
