-- Ask / Q&A feature: visitors submit questions, owner answers publicly.

create table if not exists public.ask_questions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  question     text not null,
  answer       text,
  answered_at  timestamptz,
  is_visible   boolean not null default true
);

create index if not exists ask_questions_answered_idx
  on public.ask_questions (answered_at desc nulls last);

alter table public.ask_questions enable row level security;

drop policy if exists "ask_questions_select_public" on public.ask_questions;
create policy "ask_questions_select_public" on public.ask_questions
  for select using (answer is not null and is_visible = true);

notify pgrst, 'reload schema';
