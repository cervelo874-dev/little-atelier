-- Re-create the function to ensure it exists and works correctly
create or replace function public.get_shared_artworks(share_token text)
returns setof public.artworks as $$
declare
  target_user_id uuid;
begin
  -- 1. Validate Token: Find user who owns this active token
  select user_id into target_user_id
  from public.share_links
  where token = share_token and is_active = true
  limit 1;

  -- 2. If no user found, return nothing
  if target_user_id is null then
    return; 
  end if;

  -- 3. Return Artworks for that user
  return query
  select * from public.artworks
  where user_id = target_user_id
  order by shot_at_date desc;
end;
$$ language plpgsql security definer;

-- Grant execute permission to everyone (anonymous users need this)
grant execute on function public.get_shared_artworks(text) to public;
grant execute on function public.get_shared_artworks(text) to anon;
grant execute on function public.get_shared_artworks(text) to authenticated;
