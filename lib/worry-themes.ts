export type WorryTheme = {
  id: string;
  label: string;
  keywords: string[];
};

export const WORRY_THEMES: WorryTheme[] = [
  {
    id: "relationship",
    label: "人間関係",
    keywords: [
      "人間関係",
      "上司",
      "部下",
      "友人",
      "同僚",
      "家族",
      "パートナー",
      "嫌われ",
      "評価",
      "断れない",
    ],
  },
  {
    id: "action",
    label: "行動できない",
    keywords: ["行動", "動けない", "始められ", "先延ばし", "やる気", "習慣"],
  },
  {
    id: "time",
    label: "時間管理",
    keywords: ["時間", "忙し", "多すぎ", "優先", "集中", "タスク"],
  },
  {
    id: "work",
    label: "仕事",
    keywords: ["仕事", "転職", "残業", "売上", "キャリア"],
  },
  {
    id: "learning",
    label: "学び・発信",
    keywords: ["学び", "アウトプット", "読書", "発信", "勉強"],
  },
  {
    id: "money",
    label: "お金・人生",
    keywords: ["お金", "収入", "人生", "後悔", "時間の使い方"],
  },
  {
    id: "change",
    label: "変化・不安",
    keywords: ["変化", "不安", "環境", "転勤", "異動"],
  },
];

export function classifyWorryTheme(worry: string) {
  const concern = worry.trim();

  for (const theme of WORRY_THEMES) {
    if (theme.keywords.some((keyword) => concern.includes(keyword))) {
      return theme.label;
    }
  }

  return "その他";
}

export type WorryRankingItem = {
  label: string;
  count: number;
};

export function computeWorryRanking(
  items: Array<{ worry: string; createdAt: string }>,
  days = 7,
): WorryRankingItem[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const counts = new Map<string, number>();

  for (const item of items) {
    if (new Date(item.createdAt).getTime() < cutoff) {
      continue;
    }

    const label = classifyWorryTheme(item.worry);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
