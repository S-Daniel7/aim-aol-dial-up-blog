-- Aggregated visitor counts by country (for the "visitors from" map widget).
-- Individual visits are never stored; only per-country tallies.
create table if not exists public.visitor_geo (
  country_code text primary key check (char_length(country_code) = 2),
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.visitor_geo enable row level security;

create policy "public can read visitor_geo" on public.visitor_geo
  for select using (true);

create policy "service role can manage visitor_geo" on public.visitor_geo
  for all using (auth.role() = 'service_role');

-- Upsert-increment a country's tally in one atomic call.
create or replace function increment_visitor(cc text)
returns void
language sql
security definer
as $$
  insert into public.visitor_geo (country_code, count, updated_at)
  values (upper(cc), 1, now())
  on conflict (country_code)
  do update set count = public.visitor_geo.count + 1, updated_at = now();
$$;
