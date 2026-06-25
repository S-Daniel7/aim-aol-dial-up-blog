-- live_feed_entries: tags array + pinned flag
alter table live_feed_entries
  add column if not exists tags     text[]  not null default '{}',
  add column if not exists is_pinned boolean not null default false;

-- ask_questions: featured flag
alter table ask_questions
  add column if not exists is_featured boolean not null default false;

-- visitor_stamps: soft-delete for moderation
alter table visitor_stamps
  add column if not exists is_hidden boolean not null default false;
