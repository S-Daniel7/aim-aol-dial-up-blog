create table if not exists away_message_history (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  saved_at timestamptz not null default now()
);

alter table away_message_history enable row level security;

create policy "public can read away history" on away_message_history
  for select using (true);

create policy "service role can manage away history" on away_message_history
  for all using (auth.role() = 'service_role');
