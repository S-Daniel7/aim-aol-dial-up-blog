-- Add ownership, workspace scoping, and visibility to existing content tables.
-- Run after 004_auth_foundation.sql.

alter table public.posts
  add column if not exists workspace_id uuid references public.workspaces (id) on delete set null,
  add column if not exists author_id uuid references public.profiles (id) on delete set null,
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'workspace', 'private'));

alter table public.messages
  add column if not exists workspace_id uuid references public.workspaces (id) on delete set null,
  add column if not exists author_id uuid references public.profiles (id) on delete set null;

alter table public.live_feed_entries
  add column if not exists workspace_id uuid references public.workspaces (id) on delete set null,
  add column if not exists author_id uuid references public.profiles (id) on delete set null,
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'workspace', 'private'));

alter table public.board_items
  add column if not exists workspace_id uuid references public.workspaces (id) on delete set null,
  add column if not exists author_id uuid references public.profiles (id) on delete set null,
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'workspace', 'private'));

create index if not exists posts_workspace_created_idx
  on public.posts (workspace_id, created_at desc);

create index if not exists messages_workspace_post_order_idx
  on public.messages (workspace_id, post_id, order_index);

create index if not exists live_feed_workspace_created_idx
  on public.live_feed_entries (workspace_id, created_at desc);

create index if not exists board_items_workspace_z_idx
  on public.board_items (workspace_id, z_index asc, created_at asc);

drop policy if exists "posts_select_public" on public.posts;
create policy "posts_select_public" on public.posts
  for select using (visibility = 'public');

drop policy if exists "messages_select_public" on public.messages;
create policy "messages_select_public" on public.messages
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = messages.post_id
        and p.visibility = 'public'
    )
  );

drop policy if exists "live_feed_select_public" on public.live_feed_entries;
create policy "live_feed_select_public" on public.live_feed_entries
  for select using (visibility = 'public');

drop policy if exists "board_items_select_public" on public.board_items;
create policy "board_items_select_public" on public.board_items
  for select using (visibility = 'public');

drop policy if exists "posts_select_workspace_member" on public.posts;
create policy "posts_select_workspace_member" on public.posts
  for select using (
    workspace_id is not null
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = posts.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "messages_select_workspace_member" on public.messages;
create policy "messages_select_workspace_member" on public.messages
  for select using (
    workspace_id is not null
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = messages.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "live_feed_select_workspace_member" on public.live_feed_entries;
create policy "live_feed_select_workspace_member" on public.live_feed_entries
  for select using (
    workspace_id is not null
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = live_feed_entries.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists "board_items_select_workspace_member" on public.board_items;
create policy "board_items_select_workspace_member" on public.board_items
  for select using (
    workspace_id is not null
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = board_items.workspace_id
        and wm.user_id = auth.uid()
    )
  );

notify pgrst, 'reload schema';
