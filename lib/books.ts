import { getConcreteTodayAction } from "@/lib/concrete-actions";

export type ThoughtResult = {
  myTask: string;
  othersTask: string;
  todayAction: string;
};

export type CustomBook = {
  id: string;
  title: string;
  author: string;
  framework: string;
  amazonUrl: string;
  myTaskTemplate: string;
  othersTaskTemplate: string;
  actionTemplate: string;
};

export type BookCategory =
  | "人間関係"
  | "習慣・自己管理"
  | "仕事"
  | "人生設計"
  | "挑戦"
  | "学習"
  | "思考法"
  | "変化対応"
  | "行動習慣";

export const BOOK_CATEGORIES: BookCategory[] = [
  "人間関係",
  "習慣・自己管理",
  "仕事",
  "人生設計",
  "挑戦",
  "学習",
  "思考法",
  "変化対応",
  "行動習慣",
];

export type BuiltInBookId =
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

export type BookDefinition = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  framework: string;
  description: string;
  amazonUrl: string;
  labels: [string, string, string];
  isCustom: boolean;
  myTaskTemplate?: string;
  othersTaskTemplate?: string;
  actionTemplate?: string;
};

export const CUSTOM_BOOKS_KEY = "book-to-action-custom-books";
export const SELECTED_BOOK_KEY = "book-to-action-selected-book";

const BUILT_IN_BOOKS: BookDefinition[] = [
  {
    id: "courage",
    title: "嫌われる勇気",
    author: "岸見一郎・古賀史健",
    category: "人間関係",
    framework: "課題の分離",
    description: "他者の評価と自分の課題を分け、人間関係の悩みに向き合う。",
    amazonUrl: "https://www.amazon.co.jp/s?k=嫌われる勇気",
    labels: ["自分の課題", "相手の課題", "今日できる行動"],
    isCustom: false,
  },
  {
    id: "sevenHabits",
    title: "7つの習慣",
    author: "スティーブン・R・コヴィー",
    category: "習慣・自己管理",
    framework: "影響の輪",
    description: "自分に影響できる行動に集中し、習慣で人生を整える。",
    amazonUrl: "https://www.amazon.co.jp/s?k=7つの習慣",
    labels: ["影響の輪（自分）", "影響の輪（外側）", "今日の主体的行動"],
    isCustom: false,
  },
  {
    id: "essential",
    title: "エッセンシャル思考",
    author: "グレッグ・マキューン",
    category: "仕事",
    framework: "選択と集中",
    description: "本当に重要なことだけを選び、仕事と人生を絞り込む。",
    amazonUrl: "https://www.amazon.co.jp/s?k=エッセンシャル思考",
    labels: ["本当に重要なこと", "捨てていいこと", "今日の本質的な行動"],
    isCustom: false,
  },
  {
    id: "dieWithZero",
    title: "DIE WITH ZERO",
    author: "ビル・パーキンス",
    category: "人生設計",
    framework: "人生の時間配分",
    description: "人生の時間をどう使うか考え、後悔のない選択をする。",
    amazonUrl: "https://www.amazon.co.jp/s?k=DIE+WITH+ZERO",
    labels: ["人生の時間", "今は急がないこと", "今日の一歩"],
    isCustom: false,
  },
  {
    id: "grit",
    title: "GRIT やり抜く力",
    author: "アンジェラ・ダックワース",
    category: "挑戦",
    framework: "継続と情熱",
    description: "長期目標に向けて継続する力を培い、挫折を乗り越える。",
    amazonUrl: "https://www.amazon.co.jp/s?k=GRIT+やり抜く力",
    labels: ["継続する自分", "手放す不安", "今日の一歩"],
    isCustom: false,
  },
  {
    id: "output",
    title: "アウトプット大全",
    author: "ボー・プバティー",
    category: "学習",
    framework: "学びを行動に変える",
    description: "学んだことをすぐ行動に移し、成長を加速する。",
    amazonUrl: "https://www.amazon.co.jp/s?k=アウトプット大全",
    labels: ["学んだこと", "保留していいこと", "今日のアウトプット"],
    isCustom: false,
  },
  {
    id: "influence",
    title: "人を動かす",
    author: "デール・カーネギー",
    category: "人間関係",
    framework: "相手を理解する",
    description: "相手の立場を理解し、関係性を前向きに変える。",
    amazonUrl: "https://www.amazon.co.jp/s?k=人を動かす",
    labels: ["相手の視点", "自分の反応", "今日の関わり方"],
    isCustom: false,
  },
  {
    id: "factfulness",
    title: "FACTFULNESS",
    author: "ハンス・ロスリング",
    category: "思考法",
    framework: "思い込みを外す",
    description: "データと事実で見積もり、思い込みから自由になる。",
    amazonUrl: "https://www.amazon.co.jp/s?k=FACTFULNESS",
    labels: ["事実で見る", "思い込み", "今日の判断"],
    isCustom: false,
  },
  {
    id: "cheese",
    title: "チーズはどこへ消えた？",
    author: "スペンサー・ジョンソン",
    category: "変化対応",
    framework: "変化を受け入れる",
    description: "変化を恐れず受け入れ、新しい行動を始める。",
    amazonUrl: "https://www.amazon.co.jp/s?k=チーズはどこへ消えた",
    labels: ["変化の兆し", "古い考え", "今日の新しい行動"],
    isCustom: false,
  },
  {
    id: "elephant",
    title: "夢をかなえるゾウ",
    author: "水野敬也",
    category: "行動習慣",
    framework: "小さな行動を積み重ねる",
    description: "小さな一歩を毎日積み重ね、行動習慣を育てる。",
    amazonUrl: "https://www.amazon.co.jp/s?k=夢をかなえるゾウ",
    labels: ["小さな一歩", "先延ばし", "今日の行動"],
    isCustom: false,
  },
];

type WorryCategory = "relationship" | "work" | "money" | "other";

const RELATIONSHIP_KEYWORDS = [
  "上司",
  "部下",
  "恋人",
  "夫婦",
  "友人",
  "友達",
] as const;

const WORK_KEYWORDS = ["仕事", "転職", "評価", "売上"] as const;
const MONEY_KEYWORDS = ["お金", "収入", "貯金", "借金"] as const;

const CATEGORY_LABELS: Record<WorryCategory, string> = {
  relationship: "人間関係",
  work: "仕事",
  money: "お金",
  other: "その他",
};

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

function detectCategory(concern: string): WorryCategory {
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

const BOSS_OVERRIDES: Partial<Record<BuiltInBookId, ThoughtResult>> = {
  courage: {
    myTask:
      "上司の評価をコントロールするのではなく、自分の仕事への向き合い方と伝え方を選ぶこと。",
    othersTask: "上司がどう評価し、どう反応するかは上司自身の課題です。",
    todayAction:
      "自分が今日完了させる作業を1つ決め、終わったら上司に報告文を1文で送る。",
  },
  sevenHabits: {
    myTask:
      "影響の輪の内側に集中する。上司の評価ではなく、自分の仕事の質とコミュニケーションを高めること。",
    othersTask:
      "上司の機嫌や評価は影響の輪の外側。コントロールできないものとして受け入れる。",
    todayAction: "影響の輪の内側で、今日改善できる仕事を1つ実行する。",
  },
  essential: {
    myTask:
      "「認められること」と「自分の仕事を丁寧にすること」のどちらが本当に重要かを見極める。",
    othersTask:
      "上司の一時的な反応への過剰なこだわりは本質的ではない。手放す。",
    todayAction: "本当に重要なタスク1つに絞り、それ以外は今日はしない。",
  },
};

const THOUGHT_ENGINE: Partial<
  Record<BuiltInBookId, Record<WorryCategory, ThoughtResult>>
> = {
  courage: {
    relationship: {
      myTask:
        "相手の反応をコントロールするのではなく、自分の伝え方と関わり方を選ぶこと。",
      othersTask: "相手がどう感じ、どう返すかは相手自身の課題です。",
      todayAction: "伝えたいことを1文にまとめ、短く伝える。",
    },
    work: {
      myTask:
        "評価結果そのものではなく、自分の仕事への向き合い方を選ぶこと。",
      othersTask: "評価者がどう判断するかは評価者の課題です。",
      todayAction: "今日の仕事で誠実に向き合える行動を1つ実行する。",
    },
    money: {
      myTask:
        "お金の不安そのものではなく、今日自分で選べる支出や行動に集中すること。",
      othersTask:
        "景気や他人の判断は、自分では決められない相手や環境の課題です。",
      todayAction: "今日コントロールできる支出を1つ見直す。",
    },
    other: {
      myTask:
        "結果をコントロールするのではなく、今日自分が選べる行動と姿勢を決めること。",
      othersTask: "他人がどう感じ、どう判断するかは、それぞれの人の課題です。",
      todayAction: "自分にできる一歩を1つ決め、30分以内に実行する。",
    },
  },
  sevenHabits: {
    relationship: {
      myTask:
        "相手を変えるのではなく、影響の輪の内側である自分の言動を磨くこと。",
      othersTask:
        "相手の反応や態度は影響の輪の外側。コントロールできないものとして受け入れる。",
      todayAction: "自分から取れる前向きな行動を1つ実行する。",
    },
    work: {
      myTask:
        "結果ではなく、影響の輪の内側で自分が改善できる仕事のプロセスに集中すること。",
      othersTask:
        "会社の判断や評価は影響の輪の外側。内側の行動にエネルギーを向ける。",
      todayAction: "今日の仕事で主体的に改善できる点を1つ実行する。",
    },
    money: {
      myTask:
        "収入の結果ではなく、影響の輪の内側でできる支出管理や行動改善に集中すること。",
      othersTask:
        "市場や景気の動きは影響の輪の外側。自分の行動に集中する。",
      todayAction: "今日できる節約・準備・学習を1つ実行する。",
    },
    other: {
      myTask:
        "コントロールできないことへの不安より、影響の輪の内側の行動を選ぶこと。",
      othersTask:
        "外部の評価や環境は影響の輪の外側。受け入れて内側に集中する。",
      todayAction: "影響の輪の内側で今日できる行動を1つ実行する。",
    },
  },
  essential: {
    relationship: {
      myTask:
        "本当に大切な関係性のために、自分が選ぶ言葉と関わり方を絞り込むこと。",
      othersTask:
        "相手の反応すべてに反応することは、本質的ではない。手放す。",
      todayAction: "関係のために本当に必要な行動を1つだけ実行する。",
    },
    work: {
      myTask:
        "すべてを完璧にするのではなく、仕事の中で本当に重要な1つに集中すること。",
      othersTask:
        "緊急だが重要でない仕事や評価への過剰反応は、今日は捨てていい。",
      todayAction: "最重要タスク1つだけを選び、他は今日はしない。",
    },
    money: {
      myTask:
        "お金の不安すべてに反応するのではなく、本当に重要な支出と行動を選ぶこと。",
      othersTask: "本質的でない消費や比較は今日は捨てていい。",
      todayAction: "お金の面で本当に重要な行動を1つだけ実行する。",
    },
    other: {
      myTask:
        "たくさんやろうとせず、今の自分にとって本当に重要な1つを選ぶこと。",
      othersTask: "本質的でない心配や比較は、今日は手放していい。",
      todayAction: "最重要の行動1つに絞り、30分集中する。",
    },
  },
};

function generateFrameworkResult(
  book: BookDefinition,
  worry: string,
): ThoughtResult {
  const category = detectCategory(worry.trim());

  return {
    myTask: `${book.framework}の視点で、${CATEGORY_LABELS[category]}の悩みに対して自分が選べる考え方に集中すること。`,
    othersTask:
      "結果や相手の反応すべてをコントロールする必要はない。手放す。",
    todayAction: getConcreteTodayAction(book.id as BuiltInBookId, worry),
  };
}

function withConcreteAction(
  result: ThoughtResult,
  bookId: BuiltInBookId,
  worry: string,
): ThoughtResult {
  return {
    ...result,
    todayAction: getConcreteTodayAction(bookId, worry),
  };
}

function isBuiltInBookId(id: string): id is BuiltInBookId {
  return BUILT_IN_BOOKS.some((book) => book.id === id);
}

function applyTemplate(template: string, worry: string): string {
  const concern = worry.trim();
  const category = detectCategory(concern);
  const keyword =
    findKeyword(concern, RELATIONSHIP_KEYWORDS) ??
    findKeyword(concern, WORK_KEYWORDS) ??
    findKeyword(concern, MONEY_KEYWORDS) ??
    "相手";

  return template
    .replace(/\{worry\}/g, concern)
    .replace(/\{category\}/g, CATEGORY_LABELS[category])
    .replace(/\{keyword\}/g, keyword);
}

function generateBuiltInResult(
  bookId: BuiltInBookId,
  worry: string,
): ThoughtResult {
  const book = BUILT_IN_BOOKS.find((entry) => entry.id === bookId);
  if (!book) {
    return generateFrameworkResult(BUILT_IN_BOOKS[0], worry);
  }

  const concern = worry.trim();
  const category = detectCategory(concern);
  const relationshipKeyword = findKeyword(concern, RELATIONSHIP_KEYWORDS);

  if (relationshipKeyword === "上司" && BOSS_OVERRIDES[bookId]) {
    return withConcreteAction(BOSS_OVERRIDES[bookId], bookId, worry);
  }

  const engine = THOUGHT_ENGINE[bookId];
  if (engine) {
    return withConcreteAction(engine[category], bookId, worry);
  }

  return generateFrameworkResult(book, worry);
}

function customBookToDefinition(book: CustomBook): BookDefinition {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    category: "行動習慣",
    framework: book.framework,
    description: "",
    amazonUrl: book.amazonUrl ?? "",
    labels: ["自分の課題", "相手の課題", "今日の行動"],
    isCustom: true,
    myTaskTemplate: book.myTaskTemplate,
    othersTaskTemplate: book.othersTaskTemplate,
    actionTemplate: book.actionTemplate,
  };
}

export function getBuiltInBooks(): BookDefinition[] {
  return BUILT_IN_BOOKS;
}

export function resolveBookCategory(bookId: string, bookTitle: string) {
  const book = BUILT_IN_BOOKS.find(
    (entry) => entry.id === bookId || entry.title === bookTitle,
  );

  return book?.category ?? "行動習慣";
}

export function loadCustomBooks(): CustomBook[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(CUSTOM_BOOKS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as CustomBook[];
    return Array.isArray(parsed)
      ? parsed.map((book) => ({ ...book, amazonUrl: book.amazonUrl ?? "" }))
      : [];
  } catch {
    return [];
  }
}

export function saveCustomBooks(books: CustomBook[]) {
  localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(books));
}

export function getAllBooks(customBooks: CustomBook[] = []): BookDefinition[] {
  return [...BUILT_IN_BOOKS, ...customBooks.map(customBookToDefinition)];
}

export function getBookById(
  bookId: string,
  customBooks: CustomBook[] = [],
): BookDefinition {
  return (
    getAllBooks(customBooks).find((book) => book.id === bookId) ??
    BUILT_IN_BOOKS[0]
  );
}

export function loadSelectedBookId(customBooks: CustomBook[] = []): string {
  if (typeof window === "undefined") {
    return "courage";
  }

  const availableBooks = getBuiltInBooks();
  const stored = localStorage.getItem(SELECTED_BOOK_KEY);
  if (
    stored &&
    availableBooks.some((book) => book.id === stored)
  ) {
    return stored;
  }

  return "courage";
}

export function saveSelectedBookId(bookId: string) {
  localStorage.setItem(SELECTED_BOOK_KEY, bookId);
}

export function generateThoughtResult(
  bookId: string,
  worry: string,
  customBooks: CustomBook[] = [],
): ThoughtResult {
  const book = getBookById(bookId, customBooks);

  if (book.isCustom) {
    const todayAction = applyTemplate(book.actionTemplate ?? "", worry);
    return {
      myTask: applyTemplate(book.myTaskTemplate ?? "", worry),
      othersTask: applyTemplate(book.othersTaskTemplate ?? "", worry),
      todayAction: isAbstractAction(todayAction)
        ? getConcreteTodayAction("elephant", worry)
        : todayAction,
    };
  }

  if (isBuiltInBookId(bookId)) {
    return generateBuiltInResult(bookId, worry);
  }

  return generateBuiltInResult("courage", worry);
}

function isAbstractAction(action: string) {
  const trimmed = action.trim();
  return (
    /(実行する|意識する|考える|取り組む)$/.test(trimmed) ||
    /に沿った今日の一歩|一歩を1つ実行|行動を1つ実行/.test(trimmed)
  );
}

export function buildAmazonSearchUrl(bookTitle: string) {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(bookTitle.trim())}`;
}

function findBuiltInBook(bookId: string, bookTitle: string) {
  return BUILT_IN_BOOKS.find(
    (book) => book.id === bookId || book.title === bookTitle,
  );
}

export function getBuiltInBookAmazonUrl(bookId: string, bookTitle: string) {
  return findBuiltInBook(bookId, bookTitle)?.amazonUrl ?? "";
}

export function resolveAmazonUrlForFeedback(item: {
  amazonUrl: string;
  bookId: string;
  bookTitle: string;
}) {
  const stored = item.amazonUrl.trim();
  if (stored) {
    return stored;
  }

  return getBuiltInBookAmazonUrl(item.bookId, item.bookTitle);
}

export function getBookAmazonUrl(book: BookDefinition) {
  const url = book.amazonUrl?.trim();
  if (url) {
    return url;
  }

  return buildAmazonSearchUrl(book.title);
}

export function createCustomBook(
  input: Omit<CustomBook, "id">,
): CustomBook {
  const amazonUrl =
    input.amazonUrl.trim() || buildAmazonSearchUrl(input.title.trim());

  return {
    id: `custom-${Date.now()}`,
    ...input,
    amazonUrl,
  };
}

export const TEMPLATE_HINT =
  "使用可能: {worry} {category} {keyword}";
