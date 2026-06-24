-- Emoji reactions on posts
create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  emoji text not null check (emoji in (':-)', ':-O', '<3', ':''(', ':-P')),
  created_at timestamptz not null default now()
);

create index if not exists post_reactions_post_id_idx on post_reactions (post_id);

alter table post_reactions enable row level security;

create policy "public can read reactions" on post_reactions
  for select using (true);

create policy "service role can manage reactions" on post_reactions
  for all using (auth.role() = 'service_role');

-- Visitor stamps ("i was here")
create table if not exists visitor_stamps (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  emoji text,
  created_at timestamptz not null default now()
);

alter table visitor_stamps enable row level security;

create policy "public can read stamps" on visitor_stamps
  for select using (true);

create policy "service role can manage stamps" on visitor_stamps
  for all using (auth.role() = 'service_role');
