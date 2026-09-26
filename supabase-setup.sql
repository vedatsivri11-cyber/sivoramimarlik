-- Sivora public project gallery + single-owner management. Run in Supabase SQL Editor.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  location text not null,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;

create policy "Public can read portfolio" on public.projects for select to anon, authenticated using (true);
create policy "Owner can add portfolio projects" on public.projects for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owner can update portfolio projects" on public.projects for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owner can delete portfolio projects" on public.projects for delete to authenticated using (auth.uid() = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projects', 'projects', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "Owner can upload portfolio photos" on storage.objects for insert to authenticated
with check (bucket_id = 'projects' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Owner can remove portfolio photos" on storage.objects for delete to authenticated
using (bucket_id = 'projects' and (storage.foldername(name))[1] = (select auth.uid()::text));
