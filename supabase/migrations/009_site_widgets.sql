-- "Currently" card: reading / watching / listening / thinking
create table if not exists public.site_currently (
  id      int primary key default 1 check (id = 1),
  reading   text,
  watching  text,
  listening text,
  thinking  text,
  updated_at timestamptz not null default now()
);
insert into public.site_currently (id) values (1) on conflict do nothing;

alter table public.site_currently enable row level security;
drop policy if exists "site_currently_select_public" on public.site_currently;
create policy "site_currently_select_public" on public.site_currently for select using (true);

-- Mood line
create table if not exists public.site_mood (
  id   int primary key default 1 check (id = 1),
  mood text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.site_mood (id, mood) values (1, '') on conflict do nothing;

alter table public.site_mood enable row level security;
drop policy if exists "site_mood_select_public" on public.site_mood;
create policy "site_mood_select_public" on public.site_mood for select using (true);

-- Hit counter
create table if not exists public.site_hits (
  id    int primary key default 1 check (id = 1),
  count bigint not null default 0
);
insert into public.site_hits (id, count) values (1, 0) on conflict do nothing;

alter table public.site_hits enable row level security;
drop policy if exists "site_hits_select_public" on public.site_hits;
create policy "site_hits_select_public" on public.site_hits for select using (true);

-- Atomic increment function (security definer so it bypasses RLS for the write)
create or replace function public.increment_hit_count()
returns bigint
language plpgsql
security definer
as $$
declare
  new_count bigint;
begin
  update public.site_hits set count = count + 1 where id = 1 returning count into new_count;
  return new_count;
end;
$$;

notify pgrst, 'reload schema';
