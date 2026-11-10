-- Keep rate_limit_log from growing forever.
-- The longest window used by the app is 24h (reactions), so anything older
-- than that can never affect a rate-limit decision.

create or replace function public.prune_rate_limit_log()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limit_log
  where created_at < now() - interval '25 hours';
$$;

revoke all on function public.prune_rate_limit_log() from public, anon, authenticated;

-- Schedule hourly via pg_cron when available (enable it under
-- Database → Extensions in the Supabase dashboard). If pg_cron isn't
-- enabled this block is a no-op; run `select prune_rate_limit_log();`
-- manually or enable the extension and re-run this migration.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
      from cron.job where jobname = 'prune-rate-limit-log';
    perform cron.schedule(
      'prune-rate-limit-log',
      '17 * * * *',
      'select public.prune_rate_limit_log();'
    );
  end if;
end;
$$;
