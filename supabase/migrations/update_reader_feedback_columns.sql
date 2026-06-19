-- BOOK TO ACTION: reader_feedback カラム更新
-- Supabase SQL Editor で実行してください。

-- おすすめ度
alter table public.reader_feedback
  add column if not exists recommend_score integer not null default 0;

alter table public.reader_feedback
  drop constraint if exists reader_feedback_recommend_score_check;

alter table public.reader_feedback
  add constraint reader_feedback_recommend_score_check
  check (recommend_score between 0 and 10);

-- 振り返り
alter table public.reader_feedback
  add column if not exists today_reflection text not null default '';

-- 学び（旧 learning カラムから移行）
alter table public.reader_feedback
  add column if not exists today_learning text not null default '';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reader_feedback'
      and column_name = 'learning'
  ) then
    update public.reader_feedback
    set today_learning = learning
    where today_learning = '' and learning is not null and learning <> '';
  end if;
end $$;
