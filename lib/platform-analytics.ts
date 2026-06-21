import { getBuiltInBooks, type BookDefinition } from "@/lib/books";
import {
  computeBookFeedbackStats,
  getItemImprovementDelta,
  type BookFeedbackStats,
  type ReaderFeedback,
} from "@/lib/reader-feedback";
import { computeWorryRanking, type WorryRankingItem } from "@/lib/worry-themes";

export type AuthorStats = {
  author: string;
  books: BookDefinition[];
  postCount: number;
  averageImprovementDelta: number;
  averageRecommendScore: number;
};

export type PlatformKGI = {
  registeredReaders: number;
  totalPosts: number;
  practiceRate: number;
  averageImprovementDelta: number;
  averageRecommendScore: number;
};

export type TopActionItem = {
  action: string;
  count: number;
};

export function sortBookEffectiveness(
  stats: BookFeedbackStats[],
): BookFeedbackStats[] {
  return [...stats]
    .filter((book) => book.postCount > 0)
    .sort((a, b) => {
      if (b.averageImprovementDelta !== a.averageImprovementDelta) {
        return b.averageImprovementDelta - a.averageImprovementDelta;
      }
      return b.postCount - a.postCount;
    });
}

export function computeAuthorStats(items: ReaderFeedback[]): AuthorStats[] {
  const booksByAuthor = new Map<string, BookDefinition[]>();

  for (const book of getBuiltInBooks()) {
    const current = booksByAuthor.get(book.author) ?? [];
    booksByAuthor.set(book.author, [...current, book]);
  }

  const stats: AuthorStats[] = [];

  for (const [author, books] of booksByAuthor.entries()) {
    const bookTitles = new Set(books.map((book) => book.title));
    const authorItems = items.filter((item) => bookTitles.has(item.bookTitle));

    if (authorItems.length === 0) {
      stats.push({
        author,
        books,
        postCount: 0,
        averageImprovementDelta: 0,
        averageRecommendScore: 0,
      });
      continue;
    }

    stats.push({
      author,
      books,
      postCount: authorItems.length,
      averageImprovementDelta:
        authorItems.reduce(
          (sum, item) => sum + getItemImprovementDelta(item),
          0,
        ) / authorItems.length,
      averageRecommendScore:
        authorItems.reduce((sum, item) => sum + item.recommendScore, 0) /
        authorItems.length,
    });
  }

  return stats.sort((a, b) => b.postCount - a.postCount);
}

export function computePlatformKGI(items: ReaderFeedback[]): PlatformKGI {
  const totalPosts = items.length;
  const uniqueReaders = new Set(
    items.map((item) => `${item.ageGroup}:${item.gender}`),
  ).size;
  const practicedItems = items.filter((item) => item.todayAction.trim().length > 0);

  const averageImprovementDelta =
    totalPosts === 0
      ? 0
      : items.reduce((sum, item) => sum + getItemImprovementDelta(item), 0) /
        totalPosts;
  const averageRecommendScore =
    totalPosts === 0
      ? 0
      : items.reduce((sum, item) => sum + item.recommendScore, 0) / totalPosts;

  return {
    registeredReaders: uniqueReaders,
    totalPosts,
    practiceRate: totalPosts === 0 ? 0 : practicedItems.length / totalPosts,
    averageImprovementDelta,
    averageRecommendScore,
  };
}

export function computeTopActions(
  items: ReaderFeedback[],
  limit = 5,
): TopActionItem[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    const action = item.todayAction.trim();
    if (!action) {
      continue;
    }
    counts.set(action, (counts.get(action) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getWeeklyWorryRanking(
  items: ReaderFeedback[],
): WorryRankingItem[] {
  return computeWorryRanking(items, 7);
}

export function getBookEffectivenessRanking(items: ReaderFeedback[]) {
  return sortBookEffectiveness(computeBookFeedbackStats(items));
}
