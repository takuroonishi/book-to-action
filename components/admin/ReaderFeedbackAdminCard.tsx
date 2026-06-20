import { resolveBookCategory } from "@/lib/books";
import { getStatusLabel } from "@/lib/feedback-moderation";
import {
  getItemImprovementDelta,
  type FeedbackStatus,
  type ReaderFeedback,
} from "@/lib/reader-feedback";

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const styles: Record<FeedbackStatus, string> = {
    pending: "bg-[#fff7e6] text-[#ad6800]",
    approved: "bg-[#e8f5e9] text-[#2e7d32]",
    rejected: "bg-[#f5f5f7] text-[#86868b]",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1.5 text-xs font-medium ${styles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function formatReaderMeta(item: ReaderFeedback) {
  const profile =
    item.gender === "回答しない"
      ? item.ageGroup
      : `${item.ageGroup}${item.gender}`;
  const category =
    item.bookCategory.trim() ||
    resolveBookCategory(item.bookId, item.bookTitle);

  return `${item.bookTitle}（${category}）　｜　${profile}　｜　おすすめ度 ${item.recommendScore}`;
}

function ReportField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const trimmed = value.trim();

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#86868b]">{label}</p>
      <p className="text-pretty text-[17px] leading-relaxed text-[#1d1d1f] sm:text-lg">
        {trimmed || <span className="text-[#86868b]">未記入</span>}
      </p>
    </div>
  );
}

function formatResultDisplay(delta: number) {
  if (delta > 0) {
    return {
      headline: `改善度 +${delta.toFixed(1)}`,
      container: "bg-[#eef8f0] ring-[#d4ead9]",
      headlineTone: "text-[#1b5e20]",
      scoreTone: "text-[#2e7d32]",
    };
  }

  if (delta < 0) {
    return {
      headline: `悪化 ${delta.toFixed(1)}`,
      container: "bg-[#fff3f3] ring-[#f5d0d0]",
      headlineTone: "text-[#b71c1c]",
      scoreTone: "text-[#c62828]",
    };
  }

  return {
    headline: "変化なし",
    container: "bg-[#f5f5f7] ring-[#e5e5ea]",
    headlineTone: "text-[#636366]",
    scoreTone: "text-[#86868b]",
  };
}

function ReportResult({
  item,
  improvement,
}: {
  item: ReaderFeedback;
  improvement: number;
}) {
  const result = formatResultDisplay(improvement);

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#86868b]">結果</p>
      <div
        className={`rounded-2xl px-4 py-4 ring-1 ${result.container}`}
      >
        <p className={`text-[17px] font-semibold sm:text-lg ${result.scoreTone}`}>
          朝 {item.morningScore} → 夜 {item.eveningScore}
        </p>
        <p
          className={`mt-2 text-[15px] font-semibold ${result.headlineTone}`}
        >
          {result.headline}
        </p>
      </div>
    </div>
  );
}

function AdminPublicationState({ status }: { status: FeedbackStatus }) {
  if (status === "approved") {
    return <p className="text-sm font-medium text-[#2e7d32]">公開済み</p>;
  }

  if (status === "rejected") {
    return <p className="text-sm font-medium text-[#86868b]">非公開</p>;
  }

  return null;
}

type ReaderFeedbackAdminCardProps = {
  item: ReaderFeedback;
  updating: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function ReaderFeedbackAdminCard({
  item,
  updating,
  onApprove,
  onReject,
}: ReaderFeedbackAdminCardProps) {
  const improvement = getItemImprovementDelta(item);
  const hasAmazonUrl = item.amazonUrl.trim().length > 0;

  return (
    <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#f2f2f7]">
      <header className="border-b border-[#f2f2f7] px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
          読者の変化
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
          {formatReaderMeta(item)}
        </p>
      </header>

      <div className="space-y-7 px-5 py-6 sm:px-6">
        <ReportField label="悩み" value={item.worry} />
        <ReportField label="本から得た学び" value={item.todayLearning} />
        <ReportField label="今日の行動" value={item.todayAction} />
        <ReportResult item={item} improvement={improvement} />
        <ReportField label="著者へのメッセージ" value={item.messageToAuthor} />
      </div>

      <footer className="space-y-4 border-t border-[#f2f2f7] bg-[#fafafa] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold text-[#86868b]">管理操作</p>
          <StatusBadge status={item.status} />
          <AdminPublicationState status={item.status} />
        </div>

        <p className="text-sm text-[#1d1d1f]">
          Amazonリンク：
          {hasAmazonUrl ? (
            <span className="font-medium text-[#2e7d32]">設定済み</span>
          ) : (
            <span className="text-[#86868b]">未設定</span>
          )}
        </p>

        <div className="grid grid-cols-1 gap-3 pt-1">
          <button
            type="button"
            disabled={updating || item.status === "approved"}
            onClick={onApprove}
            className="min-h-[52px] rounded-2xl bg-[#0071e3] px-4 py-3.5 text-[15px] font-medium text-white disabled:opacity-50"
          >
            承認する
          </button>
          <button
            type="button"
            disabled={updating || item.status === "rejected"}
            onClick={onReject}
            className="min-h-[52px] rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3.5 text-[15px] font-medium text-[#1d1d1f] disabled:opacity-50"
          >
            非公開にする
          </button>
        </div>
      </footer>
    </article>
  );
}
