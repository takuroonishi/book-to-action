import {
  formatAverageRecommendScore,
  formatImprovementDelta,
  type BookFeedbackStats,
} from "@/lib/reader-feedback";

type BookComparisonStatsProps = {
  stats: BookFeedbackStats[];
};

export function BookComparisonStats({ stats }: BookComparisonStatsProps) {
  return (
    <section className="space-y-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">本ごとの行動変容比較</p>
        <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
          登録10冊それぞれの投稿数・平均改善度・平均おすすめ度です。
        </p>
      </div>

      <div className="space-y-3">
        {stats.map((book) => (
          <article
            key={book.bookId}
            className="rounded-2xl bg-[#f5f5f7] px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="truncate font-medium text-[#1d1d1f]"
                  title={book.bookTitle}
                >
                  {book.bookTitle}
                </p>
                <p className="mt-1 text-xs text-[#86868b]">{book.category}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[#1d1d1f]">
                {book.postCount}件
              </p>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[11px] text-[#86868b]">平均改善度</dt>
                <dd className="mt-1 font-medium text-[#1d1d1f]">
                  {book.postCount > 0
                    ? formatImprovementDelta(book.averageImprovementDelta)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-[#86868b]">平均おすすめ度</dt>
                <dd className="mt-1 font-medium text-[#1d1d1f]">
                  {book.postCount > 0
                    ? formatAverageRecommendScore(book.averageRecommendScore)
                    : "—"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
