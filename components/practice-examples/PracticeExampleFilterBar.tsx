import { BOOK_CATEGORIES } from "@/lib/books";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  type PracticeExampleFilters,
} from "@/lib/practice-examples";

type PracticeExampleFilterBarProps = {
  filters: PracticeExampleFilters;
  bookTitles: string[];
  categories: string[];
  onChange: (filters: PracticeExampleFilters) => void;
};

export function PracticeExampleFilterBar({
  filters,
  bookTitles,
  categories,
  onChange,
}: PracticeExampleFilterBarProps) {
  if (bookTitles.length === 0) {
    return null;
  }

  const categoryOptions =
    categories.length > 0 ? categories : [...BOOK_CATEGORIES];

  return (
    <div className="mb-6 space-y-4">
      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">本で絞り込み</span>
        <select
          value={filters.bookTitle ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              bookTitle: value === "all" ? undefined : value,
            });
          }}
          className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none"
        >
          <option value="all">すべての本</option>
          {bookTitles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">
          カテゴリで絞り込み
        </span>
        <select
          value={filters.category ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              category: value === "all" ? undefined : value,
            });
          }}
          className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none"
        >
          <option value="all">すべてのカテゴリ</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">年代</span>
        <select
          value={filters.ageGroup ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              ageGroup: value === "all" ? undefined : (value as typeof filters.ageGroup),
            });
          }}
          className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none"
        >
          <option value="all">すべて</option>
          {AGE_GROUP_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">性別</span>
        <select
          value={filters.gender ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              gender: value === "all" ? undefined : (value as typeof filters.gender),
            });
          }}
          className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none"
        >
          <option value="all">すべて</option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">改善度</span>
        <select
          value={
            typeof filters.minImprovement === "number"
              ? String(filters.minImprovement)
              : "all"
          }
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              ...filters,
              minImprovement: value === "all" ? undefined : Number(value),
            });
          }}
          className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:outline-none"
        >
          <option value="all">すべて</option>
          <option value="1">+1.0 以上</option>
          <option value="2">+2.0 以上</option>
          <option value="3">+3.0 以上</option>
        </select>
      </label>
    </div>
  );
}
