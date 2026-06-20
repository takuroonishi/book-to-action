-- 既存投稿の amazon_url を書籍タイトルから仮URLで補完
update public.reader_feedback
set amazon_url = 'https://www.amazon.co.jp/s?k=嫌われる勇気'
where book_title = '嫌われる勇気'
  and amazon_url = '';

update public.reader_feedback
set amazon_url = 'https://www.amazon.co.jp/s?k=7つの習慣'
where book_title = '7つの習慣'
  and amazon_url = '';

update public.reader_feedback
set amazon_url = 'https://www.amazon.co.jp/s?k=エッセンシャル思考'
where book_title = 'エッセンシャル思考'
  and amazon_url = '';

update public.reader_feedback
set amazon_url = 'https://www.amazon.co.jp/s?k=LIFE+SHIFT'
where book_title = 'LIFE SHIFT'
  and amazon_url = '';
