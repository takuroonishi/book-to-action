-- 既存テーブルに読者名カラムを追加する場合
alter table public.reader_feedback
  add column if not exists reader_name text not null default '匿名';
