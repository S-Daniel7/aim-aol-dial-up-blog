-- Let clients subscribe to INSERTs on public content tables via Supabase Realtime.
-- Realtime evaluates RLS per subscriber, so unapproved/hidden rows are never delivered.
do $$
declare t text;
begin
  foreach t in array array['guestbook_entries', 'live_feed_entries'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;
