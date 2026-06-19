"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  computeFeedbackStats,
  fetchReaderFeedback,
  formatAverageRecommendScore,
  formatImprovementDelta,
  getItemImprovementDelta,
  subscribeReaderFeedback,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type ReaderFeedbackDashboardProps = {
  bookTitles: string[];
};

export function ReaderFeedbackDashboard({
  bookTitles,
}: ReaderFeedbackDashboardProps) {
  const [items, setItems] = useState<ReaderFeedback[]>([]);
  const [selectedBook, setSelectedBook] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => computeFeedbackStats(items), [items]);

  const filterOptions = useMemo(() => {
    const titles = new Set(bookTitles);
    for (const item of items) {
      titles.add(item.bookTitle);
    }
    return ["all", ...Array.from(titles)];
  }, [bookTitles, items]);

  const loadFeedback = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      setError("Supabaseが未設定です。.env.local を確認してください。");
      return;
    }

    if (!isAdminAuthenticated()) {
      setLoading(false);
      setError("管理者権限がありません。");
      return;
    }

    try {
      setError("");
      const data = await fetchReaderFeedback(
        selectedBook === "all" ? undefined : selectedBook,
      );
      setItems(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "読者の声の取得に失敗しました。",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBook]);

  useEffect(() => {
    setLoading(true);
    void loadFeedback();
  }, [loadFeedback]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const unsubscribe = subscribeReaderFeedback(() => {
      void loadFeedback();
    });

    return unsubscribe;
  }, [loadFeedback]);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">読者の行動変容</p>
        <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
          著者の思想が、読者の行動に変わった瞬間を記録します。
        </p>
      </div>

      <div className="space-y-2 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
        <p className="text-sm text-[#1d1d1f]">
          総投稿数：
          <span className="font-semibold">{stats.totalCount}件</span>
        </p>
        <p className="text-sm text-[#1d1d1f]">
          平均改善度：
          <span className="font-semibold">
            {formatImprovementDelta(stats.averageImprovementDelta)}
          </span>
        </p>
        <p className="text-sm text-[#1d1d1f]">
          平均おすすめ度：
          <span className="font-semibold">
            {formatAverageRecommendScore(stats.averageRecommendScore)}
          </span>
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">本で絞り込み</span>
        <select
          value={selectedBook}
          onChange={(event) => setSelectedBook(event.target.value)}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] text-[#1d1d1f] ring-1 ring-[#f2f2f7]"
        >
          {filterOptions.map((title) => (
            <option key={title} value={title}>
              {title === "all" ? "すべての本" : title}
            </option>
          ))}
        </select>
      </label>

      {loading ? (
        <p className="text-sm text-[#86868b]">読み込み中...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-[#86868b]" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className="text-sm text-[#86868b]">まだ行動変容の記録はありません。</p>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#f2f2f7]"
          >
            <div className="bg-[#1d1d1f] px-5 py-6 text-white">
              <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
                今日の行動
              </p>
              <p className="mt-3 text-[1.125rem] leading-snug font-semibold">
                {item.todayAction}
              </p>
            </div>

            <div className="space-y-4 px-5 py-5 text-sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">年代</p>
                  <p className="mt-1 font-semibold text-[#1d1d1f]">
                    {item.ageGroup}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">性別</p>
                  <p className="mt-1 font-semibold text-[#1d1d1f]">
                    {item.gender}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">おすすめ度</p>
                  <p className="mt-1 font-semibold text-[#1d1d1f]">
                    {item.recommendScore}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#86868b]">本</p>
                <p
                  className="mt-1 truncate font-medium text-[#1d1d1f]"
                  title={item.bookTitle}
                >
                  {item.bookTitle}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#86868b]">改善度</p>
                <p className="mt-1 text-lg font-semibold text-[#1d1d1f]">
                  {formatImprovementDelta(getItemImprovementDelta(item))}
                </p>
              </div>

              {item.messageToAuthor ? (
                <div>
                  <p className="text-xs text-[#86868b]">著者へのメッセージ</p>
                  <p className="mt-2 leading-relaxed text-[#1d1d1f]">
                    {item.messageToAuthor}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#86868b]">
                  著者へのメッセージ：未記入
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
