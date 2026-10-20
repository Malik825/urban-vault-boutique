-- Create the product-images storage bucket (public so images are readable on storefront)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── RLS policies ──────────────────────────────────────────────────────────────

-- 1. Anyone can read product-images objects
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_images_public_read'
  ) then
    create policy "product_images_public_read"
      on storage.objects for select
      using ( bucket_id = 'product-images' );
  end if;
end $$;

-- 2. Authenticated users can upload product images
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_images_auth_insert'
  ) then
    create policy "product_images_auth_insert"
      on storage.objects for insert
      to authenticated
      with check ( bucket_id = 'product-images' );
  end if;
end $$;

-- 3. Authenticated users can update product images
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_images_auth_update'
  ) then
    create policy "product_images_auth_update"
      on storage.objects for update
      to authenticated
      using ( bucket_id = 'product-images' );
  end if;
end $$;

-- 4. Authenticated users can delete product images
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'product_images_auth_delete'
  ) then
    create policy "product_images_auth_delete"
      on storage.objects for delete
      to authenticated
      using ( bucket_id = 'product-images' );
  end if;
end $$;
