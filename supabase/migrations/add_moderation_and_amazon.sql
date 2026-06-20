-- コメント管理 + Amazonリンク用カラム
-- Supabase SQL Editor で実行してください。

alter table public.reader_feedback
  add column if not exists status text not null default 'pending';

alter table public.reader_feedback
  add column if not exists amazon_url text not null default '';

alter table public.reader_feedback
  drop constraint if exists reader_feedback_status_check;

alter table public.reader_feedback
  add constraint reader_feedback_status_check
  check (status in ('pending', 'approved', 'rejected'));

create index if not exists reader_feedback_status_idx
  on public.reader_feedback (status);

-- 管理者モードから status を更新するため（デモ用）
drop policy if exists "reader_feedback_update_anon" on public.reader_feedback;
create policy "reader_feedback_update_anon"
  on public.reader_feedback
  for update
  to anon, authenticated
  using (true)
  with check (true);
