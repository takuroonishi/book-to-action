import Link from "next/link";
import {
  formatAverageRecommendScore,
  formatImprovementDelta,
  type BookFeedbackStats,
} from "@/lib/reader-feedback";

type BookEffectivenessRankingProps = {
  stats: BookFeedbackStats[];
  title?: string;
  showLink?: boolean;
};

export function BookEffectivenessRanking({
  stats,
  title = "本の効果ランキング",
  showLink = false,
}: BookEffectivenessRankingProps) {
  const ranked = stats.filter((book) => book.postCount > 0);

  return (
    <section className="space-y-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
          投稿数・平均改善度・平均おすすめ度で本の効果を比較します。
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-[#86868b]">まだ比較できるデータがありません。</p>
      ) : (
        <div className="space-y-3">
          {ranked.map((book, index) => (
            <article
              key={book.bookId}
              className="rounded-2xl bg-[#f5f5f7] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#86868b]">{index + 1}位</p>
                  <p className="mt-1 font-medium text-[#1d1d1f]">{book.bookTitle}</p>
                  <p className="mt-1 text-xs text-[#86868b]">{book.category}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#1d1d1f]">
                  {book.postCount}件
                </p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] text-[#86868b]">平均改善度</dt>
                  <dd className="mt-1 font-medium text-[#2e7d32]">
                    {formatImprovementDelta(book.averageImprovementDelta)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[#86868b]">平均おすすめ度</dt>
                  <dd className="mt-1 font-medium text-[#1d1d1f]">
                    {formatAverageRecommendScore(book.averageRecommendScore)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {showLink ? (
        <Link href="/insights" className="inline-block text-sm text-[#0071e3] underline">
          詳しい分析を見る
        </Link>
      ) : null}
    </section>
  );
}
