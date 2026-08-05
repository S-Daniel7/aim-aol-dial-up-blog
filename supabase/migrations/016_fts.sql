-- Full-text search: generated tsvector columns + GIN indexes on posts and messages

alter table posts
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(blurb, ''))
  ) stored;

alter table messages
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(body, '') || ' ' ||
      coalesce(sender, '') || ' ' ||
      coalesce(image_caption, '')
    )
  ) stored;

create index if not exists posts_fts_idx on posts using gin(fts);
create index if not exists messages_fts_idx on messages using gin(fts);
