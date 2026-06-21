import { resolveBookCategory } from "@/lib/books";
import {
  getItemImprovementDelta,
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  type AgeGroup,
  type Gender,
  type ReaderFeedback,
} from "@/lib/reader-feedback";

export type PracticeExampleFilters = {
  bookTitle?: string;
  category?: string;
  ageGroup?: AgeGroup;
  gender?: Gender;
  minImprovement?: number;
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
    (item.bookCategory.trim() ||
      resolveBookCategory(item.bookId, item.bookTitle)) !== filters.category
  ) {
    return false;
  }

  if (filters.ageGroup && item.ageGroup !== filters.ageGroup) {
    return false;
  }

  if (filters.gender && item.gender !== filters.gender) {
    return false;
  }

  if (
    typeof filters.minImprovement === "number" &&
    getItemImprovementDelta(item) < filters.minImprovement
  ) {
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
      items.map(
        (item) =>
          item.bookCategory.trim() ||
          resolveBookCategory(item.bookId, item.bookTitle),
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, "ja"));
}

export { AGE_GROUP_OPTIONS, GENDER_OPTIONS };
