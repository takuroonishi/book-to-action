import { resolveBookCategory } from "@/lib/books";
import type { AgeGroup, Gender, ReaderFeedback } from "@/lib/reader-feedback";

export type PracticeExampleFilters = {
  bookTitle?: string;
  category?: string;
  ageGroup?: AgeGroup;
  gender?: Gender;
};

export function matchesPracticeExampleFilters(
  item: ReaderFeedback,
  filters: PracticeExampleFilters,
) {
  if (filters.bookTitle && item.bookTitle !== filters.bookTitle) {
    return false;
  }

  if (
    filters.category &&
    resolveBookCategory(item.bookId, item.bookTitle) !== filters.category
  ) {
    return false;
  }

  if (filters.ageGroup && item.ageGroup !== filters.ageGroup) {
    return false;
  }

  if (filters.gender && item.gender !== filters.gender) {
    return false;
  }

  return true;
}

export function extractBookTitles(items: ReaderFeedback[]) {
  return [...new Set(items.map((item) => item.bookTitle))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
}

export function extractCategories(items: ReaderFeedback[]) {
  return [
    ...new Set(
      items.map((item) => resolveBookCategory(item.bookId, item.bookTitle)),
    ),
  ].sort((a, b) => a.localeCompare(b, "ja"));
}
