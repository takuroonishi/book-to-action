"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBuiltInBooks } from "@/lib/books";
import { computeAuthorStats } from "@/lib/platform-analytics";
import {
  fetchApprovedReaderFeedback,
  formatAverageRecommendScore,
  formatImprovementDelta,
} from "@/lib/reader-feedback";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthorsPageContent() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchApprovedReaderFeedback>>>([]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const data = await fetchApprovedReaderFeedback();
      setItems(data);
      setLoading(false);
    }

    void load();
  }, []);

  const authors = useMemo(() => computeAuthorStats(items), [items]);
  const catalogAuthors = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getBuiltInBooks>>();
    for (const book of getBuiltInBooks()) {
      const current = map.get(book.author) ?? [];
      map.set(book.author, [...current, book]);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="min-h-full bg-white text-[#1d1d1f]">
      <main className="mx-auto flex w-full max-w-md flex-col px-5 py-12 pb-28 sm:px-6">
        <header className="mb-10 space-y-4">
          <Link href="/" className="inline-block text-xs text-[#86868b] underline">
            BOOK TO ACTION へ戻る
          </Link>
          <p className="text-xs font-medium tracking-[0.35em] text-[#86868b]">
            AUTHORS
          </p>
          <h1 className="text-[1.625rem] font-semibold tracking-tight">著者ページ</h1>
          <p className="text-[15px] leading-relaxed text-[#86868b]">
            著者と登録書籍、読者の行動変容データを一覧できます。
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-[#86868b]">読み込み中...</p>
        ) : (
          <div className="space-y-5">
            {catalogAuthors.map(([authorName, books]) => {
              const stats = authors.find((author) => author.author === authorName);

              return (
                <article
                  key={authorName}
                  className="rounded-3xl bg-[#f5f5f7] px-5 py-5"
                >
                  <h2 className="text-lg font-semibold text-[#1d1d1f]">
                    {authorName}
                  </h2>
                  <p className="mt-2 text-xs text-[#86868b]">登録書籍</p>
                  <ul className="mt-2 space-y-2">
                    {books.map((book) => (
                      <li
                        key={book.id}
                        className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#f2f2f7]"
                      >
                        <p className="font-medium text-[#1d1d1f]">{book.title}</p>
                        <p className="mt-1 text-xs text-[#86868b]">
                          {book.category} · {book.framework}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-[11px] text-[#86868b]">投稿数</dt>
                      <dd className="mt-1 font-medium">
                        {stats?.postCount ?? 0}件
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-[#86868b]">平均改善度</dt>
                      <dd className="mt-1 font-medium">
                        {stats && stats.postCount > 0
                          ? formatImprovementDelta(stats.averageImprovementDelta)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-[#86868b]">平均おすすめ度</dt>
                      <dd className="mt-1 font-medium">
                        {stats && stats.postCount > 0
                          ? formatAverageRecommendScore(stats.averageRecommendScore)
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
