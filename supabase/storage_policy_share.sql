-- Allow public read access to objects if the owner (folder name) has an active share link
create policy "Public view shared artists"
on storage.objects for select
using (
  bucket_id = 'artworks' and
  (storage.foldername(name))[1]::uuid in (
    select user_id from public.share_links where is_active = true
  )
);
