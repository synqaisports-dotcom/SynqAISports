-- Bucket público para banner y escudo del club
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'club-media',
  'club-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "club_media_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'club-media');

create policy "club_media_authenticated_upload"
  on storage.objects for insert
  to authenticated, anon
  with check (bucket_id = 'club-media');

create policy "club_media_authenticated_update"
  on storage.objects for update
  to authenticated, anon
  using (bucket_id = 'club-media');

create policy "club_media_authenticated_delete"
  on storage.objects for delete
  to authenticated, anon
  using (bucket_id = 'club-media');
