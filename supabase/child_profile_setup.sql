-- 1. Create CHILDREN table
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  birth_date date,
  color text default 'blue', -- blue, pink, green, yellow, etc.
  created_at timestamptz default now()
);

-- Enable RLS for children
alter table public.children enable row level security;

-- Policies for children
create policy "Users can CRUD their own children"
on public.children for all
using ( auth.uid() = user_id );

-- 2. Update ARTWORKS table
-- Add child_id column to link artwork to a specific child
alter table public.artworks 
add column child_id uuid references public.children(id);

-- 3. Update Shared Access Function
-- We need to ensure the shared view can still fetch artworks even if they have a child_id.
-- The existing policy relies on user_id, so it should be fine. 
-- However, if we want to show the child's name in the guest view, we might need a join or public access to children table for guests.
-- For MVP: Guest view just shows the artwork. We can update get_shared_artworks later if needed.

-- But we should allow the owner to read the child info for the UI.
-- (Already covered by "Users can CRUD their own children")
