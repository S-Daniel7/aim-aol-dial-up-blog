-- Scheduled publishing, pinning and tags for posts.
-- publish_at defaults to now() so every existing post stays visible.
-- Rollback: drop the three columns and restore the 005 policies.

alter table public.posts
  add column if not exists publish_at timestamptz not null default now(),
  add column if not exists is_pinned  boolean     not null default false,
  add column if not exists tags       text[]      not null default '{}';

create index if not exists posts_publish_at_idx on public.posts (publish_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);

-- Public (anon) readers only see posts whose publish time has passed.
drop policy if exists "posts_select_public" on public.posts;
create policy "posts_select_public" on public.posts
  for select using (visibility = 'public' and publish_at <= now());

-- Messages of a scheduled post must stay hidden too.
drop policy if exists "messages_select_public" on public.messages;
create policy "messages_select_public" on public.messages
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = messages.post_id
        and p.visibility = 'public'
        and p.publish_at <= now()
    )
  );
