"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchApprovedReaderFeedback,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import {
  matchesPracticeExampleFilters,
  type PracticeExampleFilters,
} from "@/lib/practice-examples";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { PracticeExampleCard } from "@/components/practice-examples/PracticeExampleCard";

type PracticeExamplesListProps = {
  filters: PracticeExampleFilters;
};

export function PracticeExamplesList({ filters }: PracticeExamplesListProps) {
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
        const data = await fetchApprovedReaderFeedback();
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
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesPracticeExampleFilters(item, filters)),
    [filters, items],
  );

  const emptyMessage = useMemo(() => {
    if (filters.bookTitle) {
      return "この本の公開済み実践事例はまだありません。";
    }
    return "公開済みの実践事例はまだありません。";
  }, [filters.bookTitle]);

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

  if (filteredItems.length === 0) {
    return <p className="text-sm text-[#86868b]">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <PracticeExampleCard key={item.id} item={item} />
      ))}
    </div>
  );
}
