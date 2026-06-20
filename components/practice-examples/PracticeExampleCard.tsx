import {
  formatImprovementDelta,
  getItemImprovementDelta,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import { resolveAmazonUrlForFeedback } from "@/lib/books";
import type { ReactNode } from "react";

function PracticeExampleSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium tracking-wide text-[#86868b]">
        {label}
      </h3>
      <div className="text-[15px] leading-relaxed text-[#1d1d1f]">
        {children}
      </div>
    </section>
  );
}

function PracticeExampleResult({
  item,
  improvement,
}: {
  item: ReaderFeedback;
  improvement: number;
}) {
  const tone =
    improvement > 0
      ? {
          container: "bg-[#e8f5e9] ring-[#c8e6c9]",
          delta: "text-[#1b5e20]",
          sub: "text-[#2e7d32]",
          icon: "↑",
        }
      : improvement < 0
        ? {
            container: "bg-[#ffebee] ring-[#ffcdd2]",
            delta: "text-[#b71c1c]",
            sub: "text-[#c62828]",
            icon: "↓",
          }
        : {
            container: "bg-[#f5f5f7] ring-[#e5e5ea]",
            delta: "text-[#636366]",
            sub: "text-[#86868b]",
            icon: "→",
          };

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium tracking-wide text-[#86868b]">
        結果
      </h3>
      <div
        className={`rounded-2xl px-4 py-4 ring-1 ${tone.container}`}
        aria-label={
          improvement > 0
            ? "改善あり"
            : improvement < 0
              ? "改善なし"
              : "変化なし"
        }
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-2xl leading-none font-semibold ${tone.delta}`}
            aria-hidden
          >
            {tone.icon}
          </span>
          <p className={`text-2xl font-semibold tracking-tight ${tone.delta}`}>
            改善度 {formatImprovementDelta(improvement)}
          </p>
        </div>
        <p className={`mt-2 text-sm ${tone.sub}`}>
          朝 {item.morningScore} → 夜 {item.eveningScore}
        </p>
      </div>
    </section>
  );
}

function AmazonButton({ amazonUrl }: { amazonUrl: string }) {
  if (!amazonUrl.trim()) {
    return null;
  }

  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[52px] items-center justify-center rounded-full bg-[#ff9900] px-5 py-4 text-center text-sm font-medium text-[#1d1d1f] transition active:opacity-80"
    >
      この本をAmazonで見る
    </a>
  );
}

export function PracticeExampleCard({ item }: { item: ReaderFeedback }) {
  const improvement = getItemImprovementDelta(item);
  const amazonUrl = resolveAmazonUrlForFeedback(item);

  return (
    <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#f2f2f7]">
      <div className="space-y-5 px-5 py-6">
        {item.worry.trim() ? (
          <PracticeExampleSection label="悩み">
            <p className="text-pretty">{item.worry}</p>
          </PracticeExampleSection>
        ) : null}

        {item.todayLearning.trim() ? (
          <PracticeExampleSection label="本から得た学び">
            <p className="text-pretty">{item.todayLearning}</p>
          </PracticeExampleSection>
        ) : null}

        {item.todayAction.trim() ? (
          <PracticeExampleSection label="今日の行動">
            <p className="text-pretty font-medium">{item.todayAction}</p>
          </PracticeExampleSection>
        ) : null}

        <PracticeExampleResult item={item} improvement={improvement} />

        {item.todayReflection.trim() ? (
          <PracticeExampleSection label="読者の声">
            <p className="text-pretty">{item.todayReflection}</p>
          </PracticeExampleSection>
        ) : null}

        <PracticeExampleSection label="本のタイトル">
          <p className="truncate font-medium" title={item.bookTitle}>
            {item.bookTitle}
          </p>
        </PracticeExampleSection>

        <AmazonButton amazonUrl={amazonUrl} />
      </div>
    </article>
  );
}
