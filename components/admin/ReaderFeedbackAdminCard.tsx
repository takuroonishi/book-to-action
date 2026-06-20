import { getStatusLabel } from "@/lib/feedback-moderation";
import {
  getItemImprovementDelta,
  type FeedbackStatus,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import type { ReactNode } from "react";

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

function AdminCardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-[#f2f2f7] pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-semibold tracking-wide text-[#86868b]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function AdminTextBlock({
  value,
  emptyLabel = "未記入",
}: {
  value: string;
  emptyLabel?: string;
}) {
  const trimmed = value.trim();

  return (
    <p className="text-[15px] leading-relaxed text-[#1d1d1f]">
      {trimmed || <span className="text-[#86868b]">{emptyLabel}</span>}
    </p>
  );
}

function formatAdminImprovementLabel(delta: number) {
  if (delta > 0) {
    return {
      label: `改善度 +${delta.toFixed(1)}`,
      tone: "text-[#2e7d32] bg-[#f3faf4]",
    };
  }

  if (delta < 0) {
    return {
      label: `悪化 ${delta.toFixed(1)}`,
      tone: "text-[#c62828] bg-[#fff5f5]",
    };
  }

  return {
    label: "変化なし",
    tone: "text-[#636366] bg-[#f5f5f7]",
  };
}

function AdminPublicationState({ status }: { status: FeedbackStatus }) {
  if (status === "approved") {
    return (
      <p className="text-sm font-medium text-[#2e7d32]">公開済み</p>
    );
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
  const improvementDisplay = formatAdminImprovementLabel(improvement);
  const hasAmazonUrl = item.amazonUrl.trim().length > 0;

  return (
    <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#f2f2f7]">
      <div className="space-y-0 px-5 py-6 sm:px-6">
        <AdminCardSection title="ステータス">
          <StatusBadge status={item.status} />
        </AdminCardSection>

        <AdminCardSection title="読者情報">
          <dl className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#f5f5f7] px-3 py-3 text-center">
              <dt className="text-[11px] text-[#86868b]">年代</dt>
              <dd className="mt-1 text-[15px] font-medium text-[#1d1d1f]">
                {item.ageGroup}
              </dd>
            </div>
            <div className="rounded-2xl bg-[#f5f5f7] px-3 py-3 text-center">
              <dt className="text-[11px] text-[#86868b]">性別</dt>
              <dd className="mt-1 text-[15px] font-medium text-[#1d1d1f]">
                {item.gender}
              </dd>
            </div>
            <div className="rounded-2xl bg-[#f5f5f7] px-3 py-3 text-center">
              <dt className="text-[11px] text-[#86868b]">おすすめ度</dt>
              <dd className="mt-1 text-[15px] font-medium text-[#1d1d1f]">
                {item.recommendScore}
              </dd>
            </div>
          </dl>
        </AdminCardSection>

        <AdminCardSection title="本">
          <p
            className="text-[15px] font-medium leading-relaxed text-[#1d1d1f]"
            title={item.bookTitle}
          >
            {item.bookTitle}
          </p>
        </AdminCardSection>

        <AdminCardSection title="悩み">
          <AdminTextBlock value={item.worry} />
        </AdminCardSection>

        <AdminCardSection title="学び">
          <AdminTextBlock value={item.todayLearning} />
        </AdminCardSection>

        <AdminCardSection title="行動">
          <AdminTextBlock value={item.todayAction} />
        </AdminCardSection>

        <AdminCardSection title="結果">
          <div className="space-y-3">
            <div
              className={`rounded-2xl px-4 py-3 text-[15px] font-semibold ${improvementDisplay.tone}`}
            >
              {improvementDisplay.label}
            </div>
            <p className="text-sm text-[#86868b]">
              朝 {item.morningScore} → 夜 {item.eveningScore}
            </p>
          </div>
        </AdminCardSection>

        <AdminCardSection title="コメント">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs text-[#86868b]">読者の声</p>
              <AdminTextBlock value={item.todayReflection} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[#86868b]">著者へのメッセージ</p>
              <AdminTextBlock value={item.messageToAuthor} />
            </div>
          </div>
        </AdminCardSection>

        <AdminCardSection title="Amazonリンク">
          <p className="text-[15px] text-[#1d1d1f]">
            Amazonリンク：
            {hasAmazonUrl ? (
              <span className="font-medium text-[#2e7d32]">設定済み</span>
            ) : (
              <span className="text-[#86868b]">未設定</span>
            )}
          </p>
        </AdminCardSection>

        <AdminCardSection title="管理操作">
          <div className="space-y-4">
            <AdminPublicationState status={item.status} />
            <div className="grid grid-cols-1 gap-3">
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
          </div>
        </AdminCardSection>
      </div>
    </article>
  );
}
