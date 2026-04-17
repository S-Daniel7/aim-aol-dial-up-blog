-- Run once in Supabase SQL Editor if live_feed_entries already exists from an older schema.
-- Adds optional images and allows empty caption when an image is present.

alter table public.live_feed_entries
  add column if not exists image_url text;

-- Drop old body-only check (name may vary). If this errors, inspect constraints in
-- Table editor → live_feed_entries → Constraints, drop the CHECK on body, then continue.
alter table public.live_feed_entries
  drop constraint if exists live_feed_entries_body_check;

alter table public.live_feed_entries
  drop constraint if exists live_feed_entries_content_chk;

alter table public.live_feed_entries
  alter column body set default '';

alter table public.live_feed_entries
  add constraint live_feed_entries_content_chk check (
    char_length(trim(body)) > 0
    or (
      image_url is not null
      and char_length(trim(image_url)) > 0
    )
  );

notify pgrst, 'reload schema';
