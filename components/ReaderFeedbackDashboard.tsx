"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  fetchReaderFeedback,
  formatFeedbackDate,
  formatImprovementRate,
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
    <section className="space-y-4 border-t border-[#e8e8ed] pt-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#1d1d1f]">読者の声</p>
          <p className="mt-1 text-xs text-[#86868b]">
            Supabaseにリアルタイム反映
          </p>
        </div>
        <span className="text-xs text-[#86868b]">{items.length}件</span>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">本で絞り込み</span>
        <select
          value={selectedBook}
          onChange={(event) => setSelectedBook(event.target.value)}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-[#1d1d1f] ring-1 ring-[#f2f2f7]"
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
        <p className="text-sm text-[#86868b]">まだ読者の声はありません。</p>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#f2f2f7]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[#1d1d1f]">{item.bookTitle}</p>
                <p className="mt-1 text-xs text-[#86868b]">
                  {item.ageGroup} · {item.gender} ·{" "}
                  {formatFeedbackDate(item.createdAt)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[#1d1d1f]">
                {formatImprovementRate(item.improvementRate)}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed">
              <div>
                <p className="text-xs text-[#86868b]">悩み</p>
                <p className="mt-1 text-[#1d1d1f]">{item.worry}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">年代</p>
                  <p className="mt-1 font-semibold">{item.ageGroup}</p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">性別</p>
                  <p className="mt-1 font-semibold">{item.gender}</p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">朝</p>
                  <p className="mt-1 font-semibold">{item.morningScore}</p>
                </div>
                <div className="rounded-xl bg-[#f5f5f7] px-2 py-2">
                  <p className="text-[10px] text-[#86868b]">夜</p>
                  <p className="mt-1 font-semibold">{item.eveningScore}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#86868b]">今日の行動</p>
                <p className="mt-1 text-[#1d1d1f]">{item.todayAction}</p>
              </div>

              <div>
                <p className="text-xs text-[#86868b]">学び</p>
                <p className="mt-1 text-[#86868b]">{item.learning}</p>
              </div>

              {item.messageToAuthor ? (
                <div>
                  <p className="text-xs text-[#86868b]">振り返り</p>
                  <p className="mt-1 text-[#86868b]">{item.messageToAuthor}</p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
