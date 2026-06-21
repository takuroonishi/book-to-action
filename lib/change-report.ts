import { resolveBookCategory } from "@/lib/books";
import {
  calculateImprovementDelta,
  formatImprovementDelta,
  type DailyRecord,
} from "@/lib/daily-records";

export type ReaderChangeReport = {
  totalPracticeCount: number;
  averageImprovementDelta: number;
  bestBookTitle: string | null;
  topCategory: string | null;
};

export function computeReaderChangeReport(
  records: DailyRecord[],
): ReaderChangeReport {
  if (records.length === 0) {
    return {
      totalPracticeCount: 0,
      averageImprovementDelta: 0,
      bestBookTitle: null,
      topCategory: null,
    };
  }

  const totalPracticeCount = records.length;
  const averageImprovementDelta =
    records.reduce(
      (sum, record) =>
        sum + calculateImprovementDelta(record.morningScore, record.eveningScore),
      0,
    ) / totalPracticeCount;

  const bookScores = new Map<string, { total: number; count: number }>();
  const categoryCounts = new Map<string, number>();

  for (const record of records) {
    const delta = calculateImprovementDelta(
      record.morningScore,
      record.eveningScore,
    );
    const current = bookScores.get(record.bookTitle) ?? { total: 0, count: 0 };
    bookScores.set(record.bookTitle, {
      total: current.total + delta,
      count: current.count + 1,
    });

    const category =
      record.bookCategory?.trim() ||
      resolveBookCategory(record.bookId, record.bookTitle);
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  let bestBookTitle: string | null = null;
  let bestAverage = Number.NEGATIVE_INFINITY;

  for (const [title, { total, count }] of bookScores.entries()) {
    const average = total / count;
    if (average > bestAverage) {
      bestAverage = average;
      bestBookTitle = title;
    }
  }

  let topCategory: string | null = null;
  let topCount = 0;

  for (const [category, count] of categoryCounts.entries()) {
    if (count > topCount) {
      topCount = count;
      topCategory = category;
    }
  }

  return {
    totalPracticeCount,
    averageImprovementDelta,
    bestBookTitle,
    topCategory,
  };
}

export function formatReaderChangeReport(report: ReaderChangeReport) {
  return {
    totalPracticeCount: `${report.totalPracticeCount}回`,
    averageImprovement: formatImprovementDelta(report.averageImprovementDelta),
    bestBookTitle: report.bestBookTitle ?? "—",
    topCategory: report.topCategory ?? "—",
  };
}
