import {
  computeReaderChangeReport,
  formatReaderChangeReport,
  type ReaderChangeReport,
} from "@/lib/change-report";
import { type DailyRecord } from "@/lib/daily-records";

type ReaderChangeReportCardProps = {
  records: DailyRecord[];
};

export function ReaderChangeReportCard({ records }: ReaderChangeReportCardProps) {
  const report = computeReaderChangeReport(records);
  const formatted = formatReaderChangeReport(report);

  if (report.totalPracticeCount === 0) {
    return (
      <section className="rounded-3xl bg-[#f5f5f7] px-5 py-5">
        <p className="text-sm font-medium text-[#1d1d1f]">あなたの変化レポート</p>
        <p className="mt-2 text-sm leading-relaxed text-[#86868b]">
          記録を重ねると、実践回数や改善度の推移がここに表示されます。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-[#f5f5f7] px-5 py-5">
      <p className="text-sm font-medium text-[#1d1d1f]">あなたの変化レポート</p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <Metric label="累計実践回数" value={formatted.totalPracticeCount} />
        <Metric label="平均改善度" value={formatted.averageImprovement} />
        <Metric label="最も改善した本" value={formatted.bestBookTitle} />
        <Metric label="最も選ばれたカテゴリ" value={formatted.topCategory} />
      </dl>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#f2f2f7]">
      <dt className="text-[11px] text-[#86868b]">{label}</dt>
      <dd className="mt-2 text-[15px] font-semibold text-[#1d1d1f]">{value}</dd>
    </div>
  );
}

export { computeReaderChangeReport, type ReaderChangeReport };
