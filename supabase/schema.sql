-- BOOK TO ACTION: reader_feedback table
-- Run this in the Supabase SQL Editor.

create table if not exists public.reader_feedback (
  id uuid primary key default gen_random_uuid(),
  age_group text not null default '回答しない',
  gender text not null default '回答しない',
  book_id text not null,
  book_title text not null,
  book_author text not null default '',
  book_framework text not null default '',
  worry text not null,
  morning_score integer not null check (morning_score between 1 and 10),
  today_action text not null,
  evening_score integer not null check (evening_score between 1 and 10),
  improvement_rate numeric(5, 1) not null default 0,
  learning text not null,
  message_to_author text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists reader_feedback_created_at_idx
  on public.reader_feedback (created_at desc);

create index if not exists reader_feedback_book_title_idx
  on public.reader_feedback (book_title);

alter table public.reader_feedback enable row level security;

-- Demo policies: open read/write for anon.
-- Replace SELECT policy with admin-only auth when login is added.
drop policy if exists "reader_feedback_insert_anon" on public.reader_feedback;
create policy "reader_feedback_insert_anon"
  on public.reader_feedback
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "reader_feedback_select_anon" on public.reader_feedback;
create policy "reader_feedback_select_anon"
  on public.reader_feedback
  for select
  to anon, authenticated
  using (true);

-- Realtime
alter publication supabase_realtime add table public.reader_feedback;
