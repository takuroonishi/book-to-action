type BuiltInBookId =
  | "courage"
  | "sevenHabits"
  | "essential"
  | "dieWithZero"
  | "grit"
  | "output"
  | "influence"
  | "factfulness"
  | "cheese"
  | "elephant";

type WorryCategory = "relationship" | "work" | "money" | "other";

export type WorryPattern =
  | "boss_evaluation"
  | "too_much_work"
  | "output_learning"
  | "procrastination"
  | "change"
  | "money"
  | "relationship"
  | "general";

const RELATIONSHIP_KEYWORDS = [
  "上司",
  "部下",
  "恋人",
  "夫婦",
  "友人",
  "友達",
  "同僚",
  "親",
  "パートナー",
] as const;

const WORK_KEYWORDS = ["仕事", "転職", "評価", "売上", "残業", "タスク"] as const;
const MONEY_KEYWORDS = ["お金", "収入", "貯金", "借金", "支出"] as const;

function findKeyword<T extends readonly string[]>(
  concern: string,
  keywords: T,
): T[number] | null {
  for (const keyword of keywords) {
    if (concern.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

export function detectWorryCategory(concern: string): WorryCategory {
  if (findKeyword(concern, RELATIONSHIP_KEYWORDS)) {
    return "relationship";
  }
  if (findKeyword(concern, WORK_KEYWORDS)) {
    return "work";
  }
  if (findKeyword(concern, MONEY_KEYWORDS)) {
    return "money";
  }
  return "other";
}

export function detectWorryPattern(worry: string): WorryPattern {
  const concern = worry.trim();

  if (
    concern.includes("上司") ||
    /評価.*(気|怖|不安)|上司.*(評価|目線)/.test(concern)
  ) {
    return "boss_evaluation";
  }

  if (
    /アウトプット|アウトプット/i.test(concern) ||
    concern.includes("アウトプット") ||
    /学び.*(どう|方法|活か)|インプット.*(アウト|出)|勉強.*(活か|続)/.test(
      concern,
    )
  ) {
    return "output_learning";
  }

  if (
    /仕事.*(多|忙)|多すぎ|忙しすぎ|タスク.*(多|溢)|やることが多/.test(concern)
  ) {
    return "too_much_work";
  }

  if (/先延ばし|やる気.*(出|ない)|動けない|始められ/.test(concern)) {
    return "procrastination";
  }

  if (/変化|転勤|異動|環境.*(変|替)|レイオフ|リストラ/.test(concern)) {
    return "change";
  }

  if (findKeyword(concern, MONEY_KEYWORDS)) {
    return "money";
  }

  if (findKeyword(concern, RELATIONSHIP_KEYWORDS)) {
    return "relationship";
  }

  return "general";
}

const PATTERN_ACTIONS: Partial<
  Record<BuiltInBookId, Partial<Record<WorryPattern, string>>>
> = {
  courage: {
    boss_evaluation:
      "自分が今日完了させる作業を1つ決め、終わったら上司に報告文を1文で送る。",
    relationship:
      "伝えたいことを1文に書き、今日中にその1文だけを相手に送る。",
    too_much_work:
      "今日必ず終える作業を1つ選び、紙に書いて机の上に置く。",
    money: "今日使うお金の上限を1つ決め、家計簿アプリにその金額を入力する。",
  },
  sevenHabits: {
    boss_evaluation:
      "上司の評価は置き、今日改善できる仕事を1つ選び、30分集中して仕上げる。",
    too_much_work:
      "影響の輪の内側の仕事を1つ選び、今日の最初の30分だけそれに使う。",
    relationship:
      "相手を変えず、自分から送る短いメッセージを1文書き、今日中に送る。",
    money: "今日できる節約を1つ決め、金額と方法をメモ帳に書く。",
  },
  essential: {
    boss_evaluation:
      "今日の仕事から最重要1つを選び、評価関連のメールは今日は開かない。",
    too_much_work:
      "今日やる仕事を3つ書き出し、その中で一番成果に近い1つだけを最初に終わらせる。",
    relationship:
      "今日関係のために必要な行動を1つ選び、カレンダーに15分ブロックを入れる。",
    money:
      "今月の支出から「本当に必要でないもの」を1つ選び、解約手続きのページを開く。",
  },
  dieWithZero: {
    money:
      "今週「使ってよいお金」を1つ決め、今日その使い道を1行でメモする。",
    procrastination:
      "今日会いたい人・やりたい体験を1つ書き、連絡文を1文で下書きする。",
    change:
      "今週使う時間を5分見直し、削る予定を1つカレンダーから消す。",
  },
  grit: {
    procrastination:
      "今日の最低限ゴールを1行で書き、25分タイマーをセットして始める。",
    too_much_work:
      "長期目標に直結するタスクを1つ選び、今日25分だけ取り組む。",
  },
  output: {
    output_learning:
      "今日読んだ内容から1つ選び、スマホのメモに「学び・自分の状況・明日やること」を1行ずつ書く。",
    procrastination:
      "昨日の学びを1つ思い出し、スマホのメモに3行で書く。",
    general:
      "今日得た情報を1つ選び、スマホのメモに3行で要約する。",
  },
  influence: {
    boss_evaluation:
      "上司の立場で不安に感じそうな点を1つ書き、明日の会話の最初の一文を下書きする。",
    relationship:
      "今日話す相手の良い点を1つ思い出し、短いメッセージで伝える。",
  },
  factfulness: {
    money:
      "お金の不安を数字で1行書き、家計簿で実際の数字を確認して差分をメモする。",
    general:
      "いま信じている不安を1つ書き、確認できる事実を1つ調べてメモする。",
  },
  cheese: {
    change:
      "最近変わったことを1つ書き、今日試す新しい方法を1つ決めて15分試す。",
    procrastination:
      "「もし変化が来たら」今日から始める行動を1つ書き、最初の一歩を今すぐ踏む。",
  },
  elephant: {
    procrastination:
      "5分で終わる行動を1つ決め、今すぐ5分タイマーをセットして始める。",
    general:
      "明日やりたいことを1つ書き、今日の夜22時にリマインダーを1つセットする。",
  },
};

const CATEGORY_ACTIONS: Partial<
  Record<BuiltInBookId, Partial<Record<WorryCategory, string>>>
> = {
  courage: {
    relationship:
      "伝えたいことを1文に書き、今日中にその1文だけを相手に送る。",
    work: "今日完了させる作業を1つ書き出し、30分タイマーをセットして着手する。",
    money: "今日使うお金の上限を1つ決め、家計簿アプリにその金額を入力する。",
    other: "今日30分以内に終わる行動を1つ決め、タイマーを25分セットして始める。",
  },
  sevenHabits: {
    relationship:
      "相手を変えず、自分から送る短いメッセージを1文書き、今日中に送る。",
    work: "今日の仕事から「自分で決められる部分」を1つ書き、その部分だけ30分改善する。",
    money: "今日できる節約を1つ決め、金額と方法をメモ帳に書く。",
    other: "影響の輪の内側で今日できる行動を1つ書き、今すぐ始める。",
  },
  essential: {
    relationship:
      "今日関係のために必要な行動を1つ選び、カレンダーに15分ブロックを入れる。",
    work: "今日やる仕事を3つ書き出し、最重要1つだけに印を付けて最初に終わらせる。",
    money:
      "今月の支出から「本当に必要でないもの」を1つ選び、解約手続きのページを開く。",
    other: "今日やることを3つ書き、最重要1つだけに印を付けて最初に終わらせる。",
  },
  dieWithZero: {
    relationship:
      "今週会いたい人を1人選び、連絡文を1文で下書きして送る。",
    work: "今日の残業を15分減らす方法を1つ決め、定時退社のリマインダーをセットする。",
    money: "今週「使ってよいお金」を1つ決め、今日その使い道を1行でメモする。",
    other: "今週の時間の使い方を5分見直し、削る予定を1つカレンダーから消す。",
  },
  grit: {
    relationship:
      "大切な人への感謝を1文書き、今日中にその1文を送る。",
    work: "長期目標に直結するタスクを1つ選び、今日25分だけ取り組む。",
    money: "今月の固定費を1つ見直し、見直し結果を1行でメモする。",
    other: "今日の最低限ゴールを1行で書き、25分タイマーをセットして始める。",
  },
  output: {
    relationship:
      "今日の会話で得た気づきを1つ選び、スマホのメモに3行で書く。",
    work: "今日の仕事で学んだことを1つ選び、スマホのメモに3行で書く。",
    money: "今日読んだお金の記事から1つ選び、メモに3行で要約する。",
    other: "今日得た情報を1つ選び、スマホのメモに3行で要約する。",
  },
  influence: {
    relationship:
      "今日話す相手の良い点を1つ思い出し、短いメッセージで伝える。",
    work: "今日会う人の名前を1人選び、その人が嬉しそうな話題で会話を始める。",
    money:
      "お金の話で相手の不安を1つ想像し、共感の一文をメモして伝える。",
    other:
      "今日話す相手の名前を1人選び、その人の良い点を1つ具体的に伝える。",
  },
  factfulness: {
    relationship:
      "相手への思い込みを1つ書き、確認できる事実を1つメモする。",
    work: "いま信じている前提を1つ書き、裏取りできるデータを1つ検索してメモする。",
    money:
      "お金の不安を数字で1行書き、家計簿で実際の数字を確認して差分をメモする。",
    other:
      "いま信じている不安を1つ書き、確認できる事実を1つ調べてメモする。",
  },
  cheese: {
    relationship:
      "関係の変化を1つ書き、今日試す新しい関わり方を1つ15分試す。",
    work: "変わった環境で今日試せる新しいやり方を1つ選び、15分試す。",
    money: "支出の変化を1つ書き、今日試す新しい管理方法を1つ決める。",
    other:
      "最近変わったことを1つ書き、今日試す新しい方法を1つ決めて15分試す。",
  },
  elephant: {
    relationship: "相手への連絡を5分で終わる内容に絞り、今すぐ1文送る。",
    work: "今日の仕事で5分で終わる部分を1つ選び、今すぐ終わらせる。",
    money: "今日使うお金の上限を1つ決め、家計簿アプリに入力する。",
    other:
      "5分で終わる行動を1つ決め、今すぐ5分タイマーをセットして始める。",
  },
};

const BOOK_DEFAULT_ACTIONS: Record<BuiltInBookId, string> = {
  courage:
    "今日30分以内に終わる行動を1つ決め、タイマーを25分セットして始める。",
  sevenHabits:
    "影響の輪の内側で今日できる行動を1つ書き、今すぐ始める。",
  essential:
    "今日やることを3つ書き、最重要1つだけに印を付けて最初に終わらせる。",
  dieWithZero:
    "今週の時間の使い方を5分見直し、削る予定を1つカレンダーから消す。",
  grit: "今日の最低限ゴールを1行で書き、25分タイマーをセットして始める。",
  output: "今日得た情報を1つ選び、スマホのメモに3行で要約する。",
  influence:
    "今日話す相手の名前を1人選び、その人の良い点を1つ具体的に伝える。",
  factfulness:
    "いま信じている不安を1つ書き、確認できる事実を1つ調べてメモする。",
  cheese:
    "最近変わったことを1つ書き、今日試す新しい方法を1つ決めて15分試す。",
  elephant:
    "5分で終わる行動を1つ決め、今すぐ5分タイマーをセットして始める。",
};

const BANNED_ACTION_PATTERNS = [
  /意識する$/,
  /考える$/,
  /頑張る$/,
  /実践する$/,
  /取り組む$/,
  /実行する$/,
];

function finalizeMeasurableAction(action: string, fallback: string) {
  const trimmed = action.trim();
  if (!trimmed) {
    return fallback;
  }

  if (BANNED_ACTION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return fallback;
  }

  return trimmed;
}

export function getConcreteTodayAction(
  bookId: BuiltInBookId,
  worry: string,
): string {
  const pattern = detectWorryPattern(worry);
  const category = detectWorryCategory(worry);
  const fallback = BOOK_DEFAULT_ACTIONS[bookId];

  let action = fallback;

  if (bookId === "output") {
    const outputActions = PATTERN_ACTIONS.output;
    action =
      outputActions?.[pattern] ??
      outputActions?.output_learning ??
      outputActions?.general ??
      fallback;
  } else {
    action =
      PATTERN_ACTIONS[bookId]?.[pattern] ??
      CATEGORY_ACTIONS[bookId]?.[category] ??
      fallback;
  }

  return finalizeMeasurableAction(action, fallback);
}
