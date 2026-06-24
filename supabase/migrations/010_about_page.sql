create table if not exists site_about (
  id integer primary key default 1 check (id = 1),
  avatar_emoji text not null default '🌙',
  screen_name text not null default 'soapie',
  member_since text not null default '2026',
  location text not null default 'somewhere online',
  age text not null default '20s',
  status text not null default 'away (probably)',
  bio text not null default '',
  interests jsonb not null default '{"music":[],"movies":[],"books":[],"games":[],"other":[]}',
  fun_facts jsonb not null default '[]',
  get_to_know_me jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- Seed with defaults so there's always a row
insert into site_about (id) values (1) on conflict (id) do nothing;

alter table site_about enable row level security;

create policy "public can read about" on site_about
  for select using (true);

create policy "service role can update about" on site_about
  for all using (auth.role() = 'service_role');
