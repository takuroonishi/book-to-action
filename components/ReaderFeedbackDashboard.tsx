"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookComparisonStats } from "@/components/admin/BookComparisonStats";
import { ReaderFeedbackAdminCard } from "@/components/admin/ReaderFeedbackAdminCard";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  computeBookFeedbackStats,
  computeFeedbackStats,
  fetchReaderFeedback,
  formatAverageRecommendScore,
  formatImprovementDelta,
  subscribeReaderFeedback,
  updateFeedbackStatus,
  type FeedbackStatus,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type ReaderFeedbackDashboardProps = {
  bookTitles: string[];
};

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "pending", label: "確認待ち" },
  { value: "approved", label: "公開" },
  { value: "rejected", label: "非公開" },
];

export function ReaderFeedbackDashboard({
  bookTitles,
}: ReaderFeedbackDashboardProps) {
  const [allItems, setAllItems] = useState<ReaderFeedback[]>([]);
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stats = useMemo(() => computeFeedbackStats(allItems), [allItems]);
  const bookStats = useMemo(
    () => computeBookFeedbackStats(allItems),
    [allItems],
  );

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (selectedBook !== "all" && item.bookTitle !== selectedBook) {
        return false;
      }

      if (
        selectedStatus !== "all" &&
        item.status !== (selectedStatus as FeedbackStatus)
      ) {
        return false;
      }

      return true;
    });
  }, [allItems, selectedBook, selectedStatus]);

  const filterOptions = useMemo(() => {
    const titles = new Set(bookTitles);
    for (const item of allItems) {
      titles.add(item.bookTitle);
    }
    return ["all", ...Array.from(titles)];
  }, [bookTitles, allItems]);

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
      const data = await fetchReaderFeedback();
      setAllItems(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "読者の声の取得に失敗しました。",
      );
    } finally {
      setLoading(false);
    }
  }, []);

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

  async function handleStatusChange(id: string, status: FeedbackStatus) {
    setUpdatingId(id);
    setError("");

    try {
      await updateFeedbackStatus(id, status);
      await loadFeedback();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "ステータスの更新に失敗しました。",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">読者の変化レポート</p>
        <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
          悩みから学び、行動、結果までの変化を確認し、承認した事例だけを一般公開します。
        </p>
        <Link
          href="/examples"
          className="mt-2 inline-block text-sm text-[#0071e3] underline"
        >
          読者の実践事例（公開ページ）を見る
        </Link>
      </div>

      <div className="space-y-2 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
        <p className="text-sm text-[#1d1d1f]">
          総投稿数：
          <span className="font-semibold">{stats.totalCount}件</span>
        </p>
        <p className="text-sm text-[#1d1d1f]">
          確認待ち：
          <span className="font-semibold">{stats.pendingCount}件</span>
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

      <BookComparisonStats stats={bookStats} />

      <div className="grid grid-cols-1 gap-3">
        <label className="block space-y-2">
          <span className="text-xs font-medium text-[#86868b]">
            本で絞り込み
          </span>
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

        <label className="block space-y-2">
          <span className="text-xs font-medium text-[#86868b]">
            ステータス
          </span>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] text-[#1d1d1f] ring-1 ring-[#f2f2f7]"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-[#86868b]">読み込み中...</p>
      ) : null}

      {error ? (
        <p className="text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <p className="text-sm text-[#86868b]">該当する投稿はありません。</p>
      ) : null}

      <div className="space-y-5">
        {filteredItems.map((item) => (
          <ReaderFeedbackAdminCard
            key={item.id}
            item={item}
            updating={updatingId === item.id}
            onApprove={() => void handleStatusChange(item.id, "approved")}
            onReject={() => void handleStatusChange(item.id, "rejected")}
          />
        ))}
      </div>
    </section>
  );
}
