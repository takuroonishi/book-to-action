import type { Metadata } from "next";
import { PracticeExamplesPageContent } from "@/components/PracticeExamplesPage";

export const metadata: Metadata = {
  title: "読者の実践事例 | BOOK TO ACTION",
  description:
    "著者の考え方を読者が実践した事例。年代・性別・本・行動・結果・著者へのメッセージを公開しています。",
};

export default function ExamplesPage() {
  return <PracticeExamplesPageContent />;
}
