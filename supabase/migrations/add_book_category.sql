-- 自動選択された本のカテゴリを保存
alter table public.reader_feedback
  add column if not exists book_category text not null default '';

update public.reader_feedback
set book_category = ''
where book_category is null;
