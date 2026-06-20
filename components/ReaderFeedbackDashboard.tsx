"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStatusLabel } from "@/lib/feedback-moderation";
import { isAdminAuthenticated } from "@/lib/admin/session";
import {
  computeFeedbackStats,
  fetchReaderFeedback,
  formatAverageRecommendScore,
  formatImprovementDelta,
  getItemImprovementDelta,
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

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    pending: "bg-[#fff7e6] text-[#ad6800]",
    approved: "bg-[#e8f5e9] text-[#2e7d32]",
    rejected: "bg-[#f5f5f7] text-[#86868b]",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export function ReaderFeedbackDashboard({
  bookTitles,
}: ReaderFeedbackDashboardProps) {
  const [items, setItems] = useState<ReaderFeedback[]>([]);
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      const data = await fetchReaderFeedback({
        bookTitle: selectedBook === "all" ? undefined : selectedBook,
        status:
          selectedStatus === "all"
            ? undefined
            : (selectedStatus as FeedbackStatus),
      });
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
  }, [selectedBook, selectedStatus]);

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
        <p className="text-sm font-medium text-[#1d1d1f]">コメント管理</p>
        <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
          公開前に投稿を確認し、承認した事例だけを一般公開します。
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

      {!loading && !error && items.length === 0 ? (
        <p className="text-sm text-[#86868b]">該当する投稿はありません。</p>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#f2f2f7]"
          >
            <div className="bg-[#1d1d1f] px-5 py-6 text-white">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
                  今日の行動
                </p>
                <StatusBadge status={item.status} />
              </div>
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
                <p className="mt-1 text-xs text-[#86868b]">
                  Amazon：
                  {item.amazonUrl ? (
                    <a
                      href={item.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-[#0071e3] underline"
                    >
                      リンク設定済み
                    </a>
                  ) : (
                    "未設定"
                  )}
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

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  disabled={updatingId === item.id || item.status === "approved"}
                  onClick={() => void handleStatusChange(item.id, "approved")}
                  className="min-h-[48px] rounded-full bg-[#0071e3] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  承認する
                </button>
                <button
                  type="button"
                  disabled={updatingId === item.id || item.status === "rejected"}
                  onClick={() => void handleStatusChange(item.id, "rejected")}
                  className="min-h-[48px] rounded-full border border-[#d2d2d7] bg-white px-4 py-3 text-sm font-medium text-[#1d1d1f] disabled:opacity-50"
                >
                  非公開にする
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
