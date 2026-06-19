-- 読者名から年代・性別へ移行する場合
alter table public.reader_feedback
  add column if not exists age_group text not null default '回答しない';

alter table public.reader_feedback
  add column if not exists gender text not null default '回答しない';

alter table public.reader_feedback
  drop column if exists reader_name;
