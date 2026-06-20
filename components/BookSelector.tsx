"use client";

import { useMemo, useState } from "react";
import {
  BOOK_CATEGORIES,
  type BookDefinition,
} from "@/lib/books";

type BookSelectorProps = {
  books: BookDefinition[];
  selectedBookId: string;
  onChange: (bookId: string) => void;
};

export function BookSelector({
  books,
  selectedBookId,
  onChange,
}: BookSelectorProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredBooks = useMemo(() => {
    if (categoryFilter === "all") {
      return books;
    }

    return books.filter((book) => book.category === categoryFilter);
  }, [books, categoryFilter]);

  return (
    <div className="space-y-4">
      <label className="block space-y-2">
        <span className="text-xs font-medium text-[#86868b]">
          カテゴリで絞り込み
        </span>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:bg-[#ebebef] focus:outline-none"
        >
          <option value="all">すべてのカテゴリ</option>
          {BOOK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-1">
        <p className="text-xs font-medium text-[#86868b]">参考にする本</p>
        <div className="grid grid-cols-1 gap-3">
          {filteredBooks.map((book) => {
            const selected = book.id === selectedBookId;

            return (
              <button
                key={book.id}
                type="button"
                onClick={() => onChange(book.id)}
                className={`rounded-2xl px-4 py-4 text-left transition ${
                  selected
                    ? "bg-white ring-2 ring-[#0071e3]"
                    : "bg-[#f5f5f7] ring-1 ring-transparent hover:bg-[#ebebef]"
                }`}
              >
                <p className="text-[15px] font-semibold text-[#1d1d1f]">
                  {book.title}
                </p>
                <p className="mt-2 text-xs text-[#0071e3]">{book.category}</p>
                <p className="mt-1 text-xs text-[#86868b]">
                  思考：{book.framework}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#636366]">
                  {book.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-sm text-[#86868b]">
          このカテゴリの本はありません。
        </p>
      ) : null}
    </div>
  );
}
