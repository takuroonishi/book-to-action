import type { PracticeExampleFilters } from "@/lib/practice-examples";

type PracticeExampleFilterBarProps = {
  filters: PracticeExampleFilters;
  bookTitles: string[];
  onChange: (filters: PracticeExampleFilters) => void;
};

export function PracticeExampleFilterBar({
  filters,
  bookTitles,
  onChange,
}: PracticeExampleFilterBarProps) {
  if (bookTitles.length === 0) {
    return null;
  }

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

      {/* 将来: 年代・性別フィルターをここに追加 */}
    </div>
  );
}
