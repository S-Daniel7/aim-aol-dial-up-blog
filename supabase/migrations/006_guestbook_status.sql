-- Guestbook: public text-only submissions, admin moderates by deleting.
-- No website field — text is sanitized server-side before storage.
create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
alter table public.guestbook_entries enable row level security;
create policy "public read guestbook" on public.guestbook_entries
  for select using (true);
-- inserts and deletes go through the service client (bypasses RLS)

-- Away message: enforced single row via primary key check
create table if not exists public.away_message (
  id int primary key default 1 check (id = 1),
  body text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.away_message enable row level security;
create policy "public read away_message" on public.away_message
  for select using (true);
-- writes via service client

-- Now playing: same single-row pattern
create table if not exists public.now_playing (
  id int primary key default 1 check (id = 1),
  track_title text not null default '',
  artist_name text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.now_playing enable row level security;
create policy "public read now_playing" on public.now_playing
  for select using (true);
-- writes via service client
