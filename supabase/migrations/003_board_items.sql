-- Digital pin board (free-positioned images and styled text)
create table if not exists public.board_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'text')),
  image_url text,
  text text,
  x numeric not null default 10,
  y numeric not null default 10,
  width numeric not null default 220,
  height numeric,
  rotation numeric not null default 0,
  z_index int not null default 1,
  font_family text,
  font_size numeric,
  color text,
  is_bold boolean not null default false,
  is_italic boolean not null default false,
  is_underline boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_items_content_chk check (
    (kind = 'image' and image_url is not null and char_length(trim(image_url)) > 0)
    or
    (kind = 'text' and text is not null and char_length(trim(text)) > 0)
  )
);

alter table public.board_items
  add column if not exists is_bold boolean not null default false,
  add column if not exists is_italic boolean not null default false,
  add column if not exists is_underline boolean not null default false;

create index if not exists board_items_z_idx
  on public.board_items (z_index asc, created_at asc);

alter table public.board_items enable row level security;

drop policy if exists "board_items_select_public" on public.board_items;
create policy "board_items_select_public" on public.board_items
  for select using (true);

notify pgrst, 'reload schema';
