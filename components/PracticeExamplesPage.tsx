"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchReaderFeedback,
  formatImprovementDelta,
  getItemImprovementDelta,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function PracticeExampleCard({ item }: { item: ReaderFeedback }) {
  const improvement = getItemImprovementDelta(item);

  return (
    <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#f2f2f7]">
      <div className="bg-[#1d1d1f] px-5 py-6 text-white">
        <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
          今日の行動
        </p>
        <p className="mt-3 text-pretty text-[1.125rem] leading-snug font-semibold sm:text-xl">
          {item.todayAction}
        </p>
      </div>

      <div className="space-y-4 px-5 py-5 text-sm leading-relaxed">
        <p className="text-[#86868b]">
          {item.ageGroup} · {item.gender}
        </p>

        <div>
          <p className="text-xs text-[#86868b]">本</p>
          <p
            className="mt-1 truncate font-medium text-[#1d1d1f]"
            title={item.bookTitle}
          >
            {item.bookTitle}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f5f5f7] px-4 py-4">
          <p className="text-xs text-[#86868b]">結果</p>
          <p className="mt-2 text-lg font-semibold text-[#1d1d1f]">
            改善度 {formatImprovementDelta(improvement)}
          </p>
          <p className="mt-2 text-xs text-[#86868b]">
            朝 {item.morningScore} → 夜 {item.eveningScore}
          </p>
          {item.todayReflection ? (
            <p className="mt-3 text-[#1d1d1f]">{item.todayReflection}</p>
          ) : null}
          {!item.todayReflection && item.todayLearning ? (
            <p className="mt-3 text-[#1d1d1f]">{item.todayLearning}</p>
          ) : null}
        </div>

        {item.messageToAuthor ? (
          <div>
            <p className="text-xs text-[#86868b]">著者へのメッセージ</p>
            <p className="mt-2 text-[#1d1d1f]">{item.messageToAuthor}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function PracticeExamplesList({
  bookTitle,
}: {
  bookTitle?: string;
}) {
  const [items, setItems] = useState<ReaderFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        setError("公開データを読み込めません。");
        return;
      }

      try {
        setError("");
        const data = await fetchReaderFeedback(bookTitle);
        setItems(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "実践事例の取得に失敗しました。",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [bookTitle]);

  const emptyMessage = useMemo(() => {
    if (bookTitle) {
      return "この本の実践事例はまだありません。";
    }
    return "実践事例はまだありません。";
  }, [bookTitle]);

  if (loading) {
    return <p className="text-sm text-[#86868b]">読み込み中...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-[#86868b]" role="alert">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-[#86868b]">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <PracticeExampleCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export function PracticeExamplesPageContent() {
  const [selectedBook, setSelectedBook] = useState("all");
  const [bookTitles, setBookTitles] = useState<string[]>([]);

  useEffect(() => {
    async function loadBooks() {
      if (!isSupabaseConfigured()) {
        return;
      }

      const data = await fetchReaderFeedback();
      const titles = [...new Set(data.map((item) => item.bookTitle))];
      setBookTitles(titles);
    }

    void loadBooks();
  }, []);

  return (
    <div className="min-h-full bg-white text-[#1d1d1f]">
      <main className="mx-auto flex w-full max-w-md flex-col px-5 py-12 pb-28 sm:px-6">
        <header className="mb-10 space-y-4 text-center">
          <Link
            href="/"
            className="inline-block text-xs text-[#86868b] underline"
          >
            BOOK TO ACTION へ戻る
          </Link>
          <p className="text-xs font-medium tracking-[0.35em] text-[#86868b]">
            BOOK TO ACTION
          </p>
          <h1 className="text-balance text-[1.625rem] font-semibold tracking-tight sm:text-[1.75rem]">
            読者の実践事例
          </h1>
          <p className="text-pretty text-[15px] leading-relaxed text-[#86868b]">
            著者の考え方を実践し、行動につながった事例です。名前は公開しません。
          </p>
        </header>

        {bookTitles.length > 0 ? (
          <label className="mb-6 block space-y-2">
            <span className="text-xs font-medium text-[#86868b]">
              本で絞り込み
            </span>
            <select
              value={selectedBook}
              onChange={(event) => setSelectedBook(event.target.value)}
              className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none"
            >
              <option value="all">すべての本</option>
              {bookTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <PracticeExamplesList
          bookTitle={selectedBook === "all" ? undefined : selectedBook}
        />
      </main>
    </div>
  );
}
