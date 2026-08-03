-- Store which sender handle is the "owner" (right-aligned) per post
alter table posts
  add column if not exists my_handle text;
