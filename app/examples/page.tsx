import type { Metadata } from "next";
import { PracticeExamplesPageContent } from "@/components/PracticeExamplesPage";

export const metadata: Metadata = {
  title: "読者の実践事例 | BOOK TO ACTION",
  description:
    "悩みから学び、行動、変化までを記録する行動変容プラットフォーム。",
};

export default function ExamplesPage() {
  return <PracticeExamplesPageContent />;
}
