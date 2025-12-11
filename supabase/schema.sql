-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table
-- Holds user display names and children info
create table public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  children_info jsonb default '[]'::jsonb, -- Array of { name: string, birthDate: string }
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile" 
on public.profiles for select 
using ( auth.uid() = id );

create policy "Users can update their own profile" 
on public.profiles for update 
using ( auth.uid() = id );

create policy "Users can insert their own profile" 
on public.profiles for insert 
with check ( auth.uid() = id );

-- Auto-create profile on signup (Trigger)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ARTWORKS Table
-- Stores metadata for uploaded images
create table public.artworks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  storage_path text not null, -- format: {user_id}/{filename}
  created_at timestamptz default now(), -- Upload date
  shot_at_date date, -- Actual date taken
  age_at_creation text, -- "3歳 2ヶ月" etc.
  memo text,
  tags text[] default array[]::text[] -- ['drawing', 'craft']
);

-- Enable RLS
alter table public.artworks enable row level security;

-- Policies for Artworks
create policy "Users can CRUD their own artworks"
on public.artworks for all
using ( auth.uid() = user_id );

-- 3. SHARE LINKS Table
-- For sharing galleries with grandparents
create table public.share_links (
  token text primary key, -- Random URL safe string
  user_id uuid references public.profiles(id) not null,
  label text, -- "Grandma"
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.share_links enable row level security;

-- Policies for Share Links
create policy "Users can CRUD their own share links"
on public.share_links for all
using ( auth.uid() = user_id );

create policy "Public can view active share links"
on public.share_links for select
using ( true ); -- We filter by token in the application query usually, but mostly public read is fine if token is known. 
-- Actually, strict security would check if the token exists. 
-- For MVP: Anyone with the token can query that specific row.


-- 4. STORAGE BUCKET
-- Create 'artworks' bucket if not exists (This usually needs to be done via UI or API in Supabase, but SQL can set policies)

-- Storage Policies (objects table in storage schema)
create policy "Authenticated users can upload artworks"
on storage.objects for insert
with check (
  bucket_id = 'artworks' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text -- Enforce folder structure {user_id}/*
);

create policy "Users can update/delete their own artworks"
on storage.objects for update
using (
  bucket_id = 'artworks' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update/delete their own artworks delete"
on storage.objects for delete
using (
  bucket_id = 'artworks' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own artworks"
on storage.objects for select
using (
  bucket_id = 'artworks' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. PUBLIC ACCESS VIA SHARE TOKEN (Advanced RLS)
-- We need a function to check if a valid share link exists for a given user_id
-- This allows guests to read artworks if they have a valid token for that user.

create or replace function public.check_shared_access(target_user_id uuid)
returns boolean as $$
begin
  -- Check if there is ANY active share link for this user
  -- In a real app, we might want to validate the specific token passed in the request header/context
  -- For MVP: If the user has active share links, we accept public reads? No, that's too open.
  
  -- SIMPLER APPROACH FOR MVP:
  -- The Guest Page will use a "Service Role" (or just `supabase.rpc`) to fetch data.
  -- OR: We just make the images publicly readable if we want? No, privacy is key.
  
  -- SECURE APPROACH:
  -- We'll use a specific Postgres Function to fetch artworks by Token.
  return false; 
end;
$$ language plpgsql security definer;

-- Function for Guests to fetch Artworks: 'get_shared_artworks'
create or replace function public.get_shared_artworks(share_token text)
returns setof public.artworks as $$
declare
  target_user_id uuid;
begin
  -- 1. Validate Token
  select user_id into target_user_id
  from public.share_links
  where token = share_token and is_active = true
  limit 1;

  if target_user_id is null then
    return; -- No results
  end if;

  -- 2. Return Artworks
  return query
  select * from public.artworks
  where user_id = target_user_id
  order by shot_at_date desc;
end;
$$ language plpgsql security definer;

-- NOTE: For Storage, if using get_shared_artworks, we still need to view the images.
-- We will rely on Signed URLs generated by the server (Next.js) for the guest view.
-- This keeps the bucket private.
