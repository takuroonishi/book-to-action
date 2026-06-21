import {
  formatAverageRecommendScore,
  formatImprovementDelta,
} from "@/lib/reader-feedback";
import type {
  AuthorStats,
  PlatformKGI,
  TopActionItem,
} from "@/lib/platform-analytics";
import type { WorryRankingItem } from "@/lib/worry-themes";
import { WorryRanking } from "@/components/insights/WorryRanking";

type AuthorInsightsPanelProps = {
  authors: AuthorStats[];
  worryRanking: WorryRankingItem[];
  topActions: TopActionItem[];
};

export function AuthorInsightsPanel({
  authors,
  worryRanking,
  topActions,
}: AuthorInsightsPanelProps) {
  const activeAuthors = authors.filter((author) => author.postCount > 0);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">著者向けダッシュボード</p>
        <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
          将来的な有料提供に向けた集計データです。
        </p>
      </div>

      <WorryRanking items={worryRanking} />

      <section className="space-y-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
        <p className="text-sm font-medium text-[#1d1d1f]">著者別サマリー</p>
        {activeAuthors.length === 0 ? (
          <p className="text-sm text-[#86868b]">まだ著者別データがありません。</p>
        ) : (
          <div className="space-y-3">
            {activeAuthors.map((author) => (
              <article
                key={author.author}
                className="rounded-2xl bg-[#f5f5f7] px-4 py-4"
              >
                <p className="font-medium text-[#1d1d1f]">{author.author}</p>
                <p className="mt-1 text-xs text-[#86868b]">
                  登録書籍：
                  {author.books.map((book) => book.title).join(" / ")}
                </p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-[11px] text-[#86868b]">投稿数</dt>
                    <dd className="mt-1 font-medium">{author.postCount}件</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[#86868b]">平均改善度</dt>
                    <dd className="mt-1 font-medium">
                      {formatImprovementDelta(author.averageImprovementDelta)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[#86868b]">平均おすすめ度</dt>
                    <dd className="mt-1 font-medium">
                      {formatAverageRecommendScore(author.averageRecommendScore)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
        <p className="text-sm font-medium text-[#1d1d1f]">多い行動</p>
        {topActions.length === 0 ? (
          <p className="text-sm text-[#86868b]">まだ集計できる行動がありません。</p>
        ) : (
          <ol className="space-y-2">
            {topActions.map((item, index) => (
              <li
                key={item.action}
                className="rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f]"
              >
                <span className="text-xs text-[#86868b]">{index + 1}位 </span>
                {item.action}
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
