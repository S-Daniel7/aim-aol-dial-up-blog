-- One-time local bootstrap after creating your first Supabase Auth account.
-- Replace the values in the settings CTE, then run this in Supabase SQL Editor.

with settings as (
  select
    'sophie.kelati@gmail.com'::text as owner_email,
    'Creative Studio'::text as workspace_name,
    'creative-studio'::text as workspace_slug
),
owner_user as (
  select u.id, u.email
  from auth.users u
  join settings s on lower(u.email) = lower(s.owner_email)
  limit 1
),
owner_profile as (
  insert into public.profiles (id, email, display_name)
  select
    owner_user.id,
    owner_user.email,
    split_part(owner_user.email, '@', 1)
  from owner_user
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now()
  returning id
),
created_workspace as (
  insert into public.workspaces (name, slug, created_by)
  select settings.workspace_name, settings.workspace_slug, owner_profile.id
  from settings, owner_profile
  on conflict (slug) do update set
    name = excluded.name,
    updated_at = now()
  returning id
)
insert into public.workspace_members (workspace_id, user_id, role)
select created_workspace.id, owner_profile.id, 'admin'
from created_workspace, owner_profile
on conflict (workspace_id, user_id) do update set
  role = 'admin';

-- Optional: attach old content to the first workspace so it can be edited.
with first_workspace as (
  select id from public.workspaces order by created_at asc limit 1
),
first_admin as (
  select user_id from public.workspace_members
  where role = 'admin'
  order by created_at asc
  limit 1
)
update public.posts
set
  workspace_id = coalesce(workspace_id, (select id from first_workspace)),
  author_id = coalesce(author_id, (select user_id from first_admin))
where workspace_id is null;

with first_workspace as (
  select id from public.workspaces order by created_at asc limit 1
),
first_admin as (
  select user_id from public.workspace_members
  where role = 'admin'
  order by created_at asc
  limit 1
)
update public.messages
set
  workspace_id = coalesce(workspace_id, (select id from first_workspace)),
  author_id = coalesce(author_id, (select user_id from first_admin))
where workspace_id is null;

with first_workspace as (
  select id from public.workspaces order by created_at asc limit 1
),
first_admin as (
  select user_id from public.workspace_members
  where role = 'admin'
  order by created_at asc
  limit 1
)
update public.live_feed_entries
set
  workspace_id = coalesce(workspace_id, (select id from first_workspace)),
  author_id = coalesce(author_id, (select user_id from first_admin))
where workspace_id is null;

with first_workspace as (
  select id from public.workspaces order by created_at asc limit 1
),
first_admin as (
  select user_id from public.workspace_members
  where role = 'admin'
  order by created_at asc
  limit 1
)
update public.board_items
set
  workspace_id = coalesce(workspace_id, (select id from first_workspace)),
  author_id = coalesce(author_id, (select user_id from first_admin))
where workspace_id is null;
