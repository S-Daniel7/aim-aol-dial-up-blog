-- Visitor comments on posts. Held as 'pending' until the owner approves them.
-- Inserts, approvals and deletes go through the service client (bypasses RLS).
-- Rollback: drop table public.comments;

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 40),
  body        text not null check (char_length(body) between 1 and 500),
  status      text not null default 'pending'
              check (status in ('pending', 'approved')),
  created_at  timestamptz not null default now()
);

create index if not exists comments_post_idx
  on public.comments (post_id, created_at)
  where status = 'approved';
create index if not exists comments_pending_idx
  on public.comments (created_at desc)
  where status = 'pending';

alter table public.comments enable row level security;

-- Anonymous readers see approved comments on posts they can already see.
drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select using (
    status = 'approved'
    and exists (
      select 1 from public.posts p
      where p.id = comments.post_id
        and p.visibility = 'public'
        and p.publish_at <= now()
    )
  );

notify pgrst, 'reload schema';
