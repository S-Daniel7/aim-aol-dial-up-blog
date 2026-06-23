-- Serverless-safe rate limiting log
-- Only accessed via service client; no RLS needed
create table public.rate_limit_log (
  id bigserial primary key,
  key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_log_key_idx on public.rate_limit_log (key, created_at);

-- Periodically clean up old entries to keep the table small.
-- Run manually in the Supabase SQL editor as needed:
--   delete from rate_limit_log where created_at < now() - interval '2 hours';
