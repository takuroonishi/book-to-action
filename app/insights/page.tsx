import type { Metadata } from "next";
import { InsightsPageContent } from "@/components/insights/InsightsPageContent";

export const metadata: Metadata = {
  title: "行動変容インサイト | BOOK TO ACTION",
  description:
    "本の効果ランキングと今週の悩みランキング。本による行動変容データベース。",
};

export default function InsightsPage() {
  return <InsightsPageContent />;
}
