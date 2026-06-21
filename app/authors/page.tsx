import type { Metadata } from "next";
import { AuthorsPageContent } from "@/components/authors/AuthorsPageContent";

export const metadata: Metadata = {
  title: "著者ページ | BOOK TO ACTION",
  description:
    "著者ごとの登録書籍・投稿数・平均改善度。著者向け行動変容レポート。",
};

export default function AuthorsPage() {
  return <AuthorsPageContent />;
}
