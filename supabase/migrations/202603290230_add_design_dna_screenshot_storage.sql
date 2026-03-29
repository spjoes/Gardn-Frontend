insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'garden-design-dna-screenshots',
  'garden-design-dna-screenshots',
  false,
  5242880,
  array['image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own Design DNA screenshots"
  on storage.objects;

create policy "Users can view their own Design DNA screenshots"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'garden-design-dna-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload their own Design DNA screenshots"
  on storage.objects;

create policy "Users can upload their own Design DNA screenshots"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'garden-design-dna-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(storage.extension(name)) = 'png'
);

drop policy if exists "Users can update their own Design DNA screenshots"
  on storage.objects;

create policy "Users can update their own Design DNA screenshots"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'garden-design-dna-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'garden-design-dna-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(storage.extension(name)) = 'png'
);

drop policy if exists "Users can delete their own Design DNA screenshots"
  on storage.objects;

create policy "Users can delete their own Design DNA screenshots"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'garden-design-dna-screenshots'
  and (storage.foldername(name))[1] = auth.uid()::text
);
