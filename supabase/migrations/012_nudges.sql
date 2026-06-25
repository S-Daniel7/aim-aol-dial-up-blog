create table if not exists site_nudges (
  id integer primary key default 1 check (id = 1),
  count bigint not null default 0,
  last_nudged_at timestamptz
);

insert into site_nudges (id) values (1) on conflict (id) do nothing;

alter table site_nudges enable row level security;

create policy "public can read nudges" on site_nudges
  for select using (true);

create policy "service role can update nudges" on site_nudges
  for all using (auth.role() = 'service_role');

create or replace function increment_nudge_count()
returns bigint
language sql
security definer
as $$
  update site_nudges
  set count = count + 1, last_nudged_at = now()
  where id = 1
  returning count;
$$;
