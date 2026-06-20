"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PracticeExampleFilterBar } from "@/components/practice-examples/PracticeExampleFilterBar";
import { PracticeExamplesList } from "@/components/practice-examples/PracticeExamplesList";
import { fetchApprovedReaderFeedback } from "@/lib/reader-feedback";
import {
  extractBookTitles,
  type PracticeExampleFilters,
} from "@/lib/practice-examples";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function PracticeExamplesPageContent() {
  const [filters, setFilters] = useState<PracticeExampleFilters>({});
  const [bookTitles, setBookTitles] = useState<string[]>([]);

  useEffect(() => {
    async function loadBooks() {
      if (!isSupabaseConfigured()) {
        return;
      }

      const data = await fetchApprovedReaderFeedback();
      setBookTitles(extractBookTitles(data));
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
            運営確認済みの事例だけを公開しています。悩みから学び、行動、変化までのプロセスをお届けします。
          </p>
        </header>

        <PracticeExampleFilterBar
          filters={filters}
          bookTitles={bookTitles}
          onChange={setFilters}
        />

        <PracticeExamplesList filters={filters} />
      </main>
    </div>
  );
}
