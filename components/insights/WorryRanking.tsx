import type { WorryRankingItem } from "@/lib/worry-themes";

type WorryRankingProps = {
  items: WorryRankingItem[];
  title?: string;
  periodLabel?: string;
};

export function WorryRanking({
  items,
  title = "今週多い悩み",
  periodLabel = "直近7日",
}: WorryRankingProps) {
  return (
    <section className="space-y-3 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]">
      <div>
        <p className="text-sm font-medium text-[#1d1d1f]">{title}</p>
        <p className="mt-1 text-xs text-[#86868b]">{periodLabel}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[#86868b]">まだ集計できる悩みがありません。</p>
      ) : (
        <ol className="space-y-2">
          {items.slice(0, 5).map((item, index) => (
            <li
              key={item.label}
              className="flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-4 py-3"
            >
              <span className="text-sm text-[#1d1d1f]">
                {index + 1}位 {item.label}
              </span>
              <span className="text-xs text-[#86868b]">{item.count}件</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
