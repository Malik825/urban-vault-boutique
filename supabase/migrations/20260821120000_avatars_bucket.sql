-- Create the avatars storage bucket (public so images are readable without auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── RLS policies ──────────────────────────────────────────────────────────────

-- 1. Anyone can read avatar objects (bucket is public, but policy is belt-and-suspenders)
create policy "avatars: public read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Authenticated users can upload their own avatar
--    File must be named <user_id>.<ext>  (e.g. b4c930df-...-2096c025ffe2.png)
create policy "avatars: owner insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.filename(name))::text like (auth.uid()::text || '.%')
  );

-- 3. Authenticated users can replace (upsert) their own avatar
create policy "avatars: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.filename(name))::text like (auth.uid()::text || '.%')
  );

-- 4. Authenticated users can delete their own avatar
create policy "avatars: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.filename(name))::text like (auth.uid()::text || '.%')
  );
