-- Countdown / days-since widget
create table if not exists site_countdown (
  id integer primary key default 1 check (id = 1),
  label text not null default '',
  target_date date,
  mode text not null default 'since' check (mode in ('since', 'until')),
  is_visible boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into site_countdown (id) values (1) on conflict (id) do nothing;

alter table site_countdown enable row level security;
create policy "public can read countdown" on site_countdown for select using (true);
create policy "service role can update countdown" on site_countdown for all using (auth.role() = 'service_role');

-- Links / blogroll
create table if not exists site_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description text,
  category text not null default 'links',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table site_links enable row level security;
create policy "public can read links" on site_links for select using (true);
create policy "service role can manage links" on site_links for all using (auth.role() = 'service_role');
