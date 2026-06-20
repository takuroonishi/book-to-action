import type { BuiltInBookId } from "@/lib/books";
import { getBuiltInBooks } from "@/lib/books";
import { detectWorryPattern } from "@/lib/concrete-actions";

export type BookRecommendation = {
  bookId: BuiltInBookId;
  reason: string;
};

type MatchRule = {
  keywords: string[];
  bookId: BuiltInBookId;
  weight: number;
  reason: string;
};

const BOOK_PRIORITY: BuiltInBookId[] = [
  "output",
  "courage",
  "essential",
  "sevenHabits",
  "grit",
  "dieWithZero",
  "cheese",
  "factfulness",
  "influence",
  "elephant",
];

const MATCH_RULES: MatchRule[] = [
  {
    keywords: [
      "アウトプット",
      "アウトプット",
      "学び",
      "発信",
      "読書",
      "インプット",
      "勉強",
      "記録",
    ],
    bookId: "output",
    weight: 3,
    reason: "学んだことを行動に変える悩みだからです。",
  },
  {
    keywords: ["上司", "評価", "嫌われる", "断れない", "部下", "課題"],
    bookId: "courage",
    weight: 3,
    reason: "自分と相手の課題を分ける悩みだからです。",
  },
  {
    keywords: ["人間関係", "共感", "伝え方", "人を動か", "説得", "関係"],
    bookId: "influence",
    weight: 2,
    reason: "相手を理解して関係を前に進める悩みだからです。",
  },
  {
    keywords: [
      "仕事が多",
      "多すぎ",
      "忙し",
      "優先順位",
      "集中でき",
      "やることが多",
      "タスク",
    ],
    bookId: "essential",
    weight: 3,
    reason: "本当に重要な1つに絞る悩みだからです。",
  },
  {
    keywords: ["習慣", "朝活", "時間管理", "7つ", "ルーティン"],
    bookId: "sevenHabits",
    weight: 2,
    reason: "自分に影響できる習慣から始める悩みだからです。",
  },
  {
    keywords: ["小さな", "毎日", "積み重ね", "ゾウ", "続け"],
    bookId: "elephant",
    weight: 2,
    reason: "小さな行動を積み重ねる悩みだからです。",
  },
  {
    keywords: ["挑戦", "続かない", "やる気", "努力", "挫折", "grit"],
    bookId: "grit",
    weight: 3,
    reason: "長く続ける力が試されている悩みだからです。",
  },
  {
    keywords: [
      "お金",
      "人生",
      "後悔",
      "時間の使い方",
      "時間配分",
      "die with zero",
    ],
    bookId: "dieWithZero",
    weight: 3,
    reason: "人生の時間やお金の使い方を見直す悩みだからです。",
  },
  {
    keywords: ["変化", "環境変化", "転勤", "異動", "不安", "チーズ"],
    bookId: "cheese",
    weight: 3,
    reason: "変化に適応する悩みだからです。",
  },
  {
    keywords: ["思い込み", "情報", "判断ミス", "偏見", "factfulness", "データ"],
    bookId: "factfulness",
    weight: 3,
    reason: "思い込みを事実で確かめたい悩みだからです。",
  },
];

const PATTERN_FALLBACK: Record<
  ReturnType<typeof detectWorryPattern>,
  BookRecommendation
> = {
  boss_evaluation: {
    bookId: "courage",
    reason: "評価への悩みを、課題の分離で整理できるからです。",
  },
  too_much_work: {
    bookId: "essential",
    reason: "優先順位を決めて絞り込む悩みだからです。",
  },
  output_learning: {
    bookId: "output",
    reason: "学んだことを行動に変える悩みだからです。",
  },
  procrastination: {
    bookId: "elephant",
    reason: "小さな一歩から始める悩みだからです。",
  },
  change: {
    bookId: "cheese",
    reason: "変化に適応する悩みだからです。",
  },
  money: {
    bookId: "dieWithZero",
    reason: "人生の時間やお金の使い方を見直す悩みだからです。",
  },
  relationship: {
    bookId: "courage",
    reason: "人との関係を整理する悩みだからです。",
  },
  general: {
    bookId: "sevenHabits",
    reason: "自分に影響できる行動から始める悩みだからです。",
  },
};

function pickHighestScore(
  scores: Partial<Record<BuiltInBookId, number>>,
  reasons: Partial<Record<BuiltInBookId, string>>,
): BookRecommendation | null {
  let bestId: BuiltInBookId | null = null;
  let bestScore = 0;

  for (const bookId of BOOK_PRIORITY) {
    const score = scores[bookId] ?? 0;
    if (score > bestScore) {
      bestScore = score;
      bestId = bookId;
    }
  }

  if (!bestId || bestScore === 0) {
    return null;
  }

  return {
    bookId: bestId,
    reason: reasons[bestId] ?? PATTERN_FALLBACK.general.reason,
  };
}

export function recommendBook(worry: string): BookRecommendation {
  const concern = worry.trim();
  const scores: Partial<Record<BuiltInBookId, number>> = {};
  const reasons: Partial<Record<BuiltInBookId, string>> = {};

  for (const rule of MATCH_RULES) {
    const matched = rule.keywords.some((keyword) => concern.includes(keyword));
    if (!matched) {
      continue;
    }

    scores[rule.bookId] = (scores[rule.bookId] ?? 0) + rule.weight;
    reasons[rule.bookId] = rule.reason;
  }

  const keywordMatch = pickHighestScore(scores, reasons);
  if (keywordMatch) {
    return keywordMatch;
  }

  return PATTERN_FALLBACK[detectWorryPattern(concern)];
}

export function getBookByIdFromCatalog(bookId: BuiltInBookId) {
  return getBuiltInBooks().find((book) => book.id === bookId) ?? getBuiltInBooks()[0];
}

export const MANUAL_BOOK_SELECTION_REASON = "ご自身で選び直した本です。";
