export type DailyRecord = {
  id: string;
  date: string;
  createdAt: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookFramework: string;
  worry: string;
  myTask: string;
  othersTask: string;
  todayAction: string;
  morningScore: number;
  eveningScore: number;
  improvementRate: number;
  learning: string;
};

export type DailyRecordInput = Omit<DailyRecord, "id" | "createdAt">;

export const DAILY_RECORDS_KEY = "book-to-action-daily-records";

export function calculateImprovementRate(
  morningScore: number,
  eveningScore: number,
): number {
  if (morningScore <= 0) {
    return 0;
  }

  const rate = ((morningScore - eveningScore) / morningScore) * 100;
  return Math.max(0, Math.round(rate * 10) / 10);
}

export function calculateImprovementDelta(
  morningScore: number,
  eveningScore: number,
): number {
  const delta = morningScore - eveningScore;
  return Math.round(delta * 10) / 10;
}

export function formatImprovementRate(rate: number) {
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;
}

export function formatImprovementDelta(delta: number) {
  const sign = delta > 0 ? "+" : delta < 0 ? "" : "+";
  return `${sign}${delta.toFixed(1)}`;
}

export function loadDailyRecords(): DailyRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(DAILY_RECORDS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as DailyRecord[];
    return Array.isArray(parsed)
      ? parsed.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      : [];
  } catch {
    return [];
  }
}

export function saveDailyRecords(records: DailyRecord[]) {
  localStorage.setItem(DAILY_RECORDS_KEY, JSON.stringify(records));
}

export function appendDailyRecord(input: DailyRecordInput): DailyRecord {
  const record: DailyRecord = {
    id: `daily-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  };

  const records = loadDailyRecords();
  saveDailyRecords([record, ...records]);
  return record;
}

export function formatRecordDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}
