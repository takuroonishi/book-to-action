"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookEffectivenessRanking } from "@/components/insights/BookEffectivenessRanking";
import { WorryRanking } from "@/components/insights/WorryRanking";
import { getBookEffectivenessRanking } from "@/lib/platform-analytics";
import { getWeeklyWorryRanking } from "@/lib/platform-analytics";
import { fetchApprovedReaderFeedback } from "@/lib/reader-feedback";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function InsightsPageContent() {
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

  const bookRanking = useMemo(() => getBookEffectivenessRanking(items), [items]);
  const worryRanking = useMemo(() => getWeeklyWorryRanking(items), [items]);

  return (
    <div className="min-h-full bg-white text-[#1d1d1f]">
      <main className="mx-auto flex w-full max-w-md flex-col px-5 py-12 pb-28 sm:px-6">
        <header className="mb-10 space-y-4">
          <Link href="/" className="inline-block text-xs text-[#86868b] underline">
            BOOK TO ACTION へ戻る
          </Link>
          <p className="text-xs font-medium tracking-[0.35em] text-[#86868b]">
            INSIGHTS
          </p>
          <h1 className="text-[1.625rem] font-semibold tracking-tight">
            行動変容インサイト
          </h1>
          <p className="text-[15px] leading-relaxed text-[#86868b]">
            本が読者の悩みにどう効いたかを、公開済みデータから可視化しています。
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-[#86868b]">読み込み中...</p>
        ) : (
          <div className="space-y-5">
            <BookEffectivenessRanking stats={bookRanking} />
            <WorryRanking items={worryRanking} />
          </div>
        )}
      </main>
    </div>
  );
}
