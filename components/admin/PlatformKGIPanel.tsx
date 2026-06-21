import {
  formatAverageRecommendScore,
  formatImprovementDelta,
} from "@/lib/reader-feedback";
import type { PlatformKGI } from "@/lib/platform-analytics";

type PlatformKGIPanelProps = {
  kgi: PlatformKGI;
};

export function PlatformKGIPanel({ kgi }: PlatformKGIPanelProps) {
  return (
    <section className="space-y-3 rounded-2xl bg-[#1d1d1f] px-5 py-5 text-white">
      <div>
        <p className="text-sm font-medium">BOOK TO ACTION KGI</p>
        <p className="mt-1 text-xs leading-relaxed text-white/70">
          成功指標はダウンロード数ではなく、行動変容数です。
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <KGIMetric label="登録読者数" value={`${kgi.registeredReaders}人`} />
        <KGIMetric label="投稿数" value={`${kgi.totalPosts}件`} />
        <KGIMetric
          label="実践率"
          value={`${Math.round(kgi.practiceRate * 100)}%`}
        />
        <KGIMetric
          label="平均改善度"
          value={formatImprovementDelta(kgi.averageImprovementDelta)}
        />
      </dl>

      <p className="text-xs text-white/70">
        平均おすすめ度 {formatAverageRecommendScore(kgi.averageRecommendScore)}
      </p>
    </section>
  );
}

function KGIMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3">
      <dt className="text-[11px] text-white/70">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{value}</dd>
    </div>
  );
}
