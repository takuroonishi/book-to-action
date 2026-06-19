alter table public.reader_feedback
  add column if not exists recommend_score integer not null default 0;

alter table public.reader_feedback
  drop constraint if exists reader_feedback_recommend_score_check;

alter table public.reader_feedback
  add constraint reader_feedback_recommend_score_check
  check (recommend_score between 0 and 10);
