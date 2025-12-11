-- Create the 'artworks' bucket
insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', false);

-- Ensure RLS is enabled on objects (redundant but safe)
alter table storage.objects enable row level security;
