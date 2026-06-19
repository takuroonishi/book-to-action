"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createCustomBook,
  generateThoughtResult,
  getAllBooks,
  getBookById,
  loadCustomBooks,
  loadSelectedBookId,
  saveCustomBooks,
  saveSelectedBookId,
  TEMPLATE_HINT,
  type CustomBook,
  type ThoughtResult,
} from "@/lib/books";
import {
  aggregateVoicesByBook,
  appendReaderVoice,
  loadReaderVoices,
} from "@/lib/reader-voices";

type DayRecord = {
  id: string;
  date: string;
  worry: string;
  myTask: string;
  othersTask: string;
  todayAction: string;
  practiced: boolean;
  reflection: string;
  learning: string;
};

const RECORDS_STORAGE_KEY = "book-to-action-records";
const STREAK_STORAGE_KEY = "book-to-action-streak-days";
const INITIAL_SCORE_KEY = "book-to-action-initial-score";
const CURRENT_SCORE_KEY = "book-to-action-current-score";
const MAX_RECORDS = 7;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

function loadRecords(): DayRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as DayRecord[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECORDS) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: DayRecord[]) {
  localStorage.setItem(
    RECORDS_STORAGE_KEY,
    JSON.stringify(records.slice(0, MAX_RECORDS)),
  );
}

function loadStreakDays(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!stored) {
      return 0;
    }

    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

function saveStreakDays(days: number) {
  localStorage.setItem(STREAK_STORAGE_KEY, String(days));
}

function loadInitialScore(): number {
  if (typeof window === "undefined") {
    return 8;
  }

  try {
    const stored = localStorage.getItem(INITIAL_SCORE_KEY);
    if (!stored) {
      return 8;
    }

    const parsed = Number.parseInt(stored, 10);
    return parsed >= 1 && parsed <= 10 ? parsed : 8;
  } catch {
    return 8;
  }
}

function saveInitialScore(score: number) {
  localStorage.setItem(INITIAL_SCORE_KEY, String(score));
}

function loadCurrentScore(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(CURRENT_SCORE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = Number.parseInt(stored, 10);
    return parsed >= 1 && parsed <= 10 ? parsed : null;
  } catch {
    return null;
  }
}

function saveCurrentScore(score: number) {
  localStorage.setItem(CURRENT_SCORE_KEY, String(score));
}

function calculateImprovementRate(initial: number, current: number) {
  if (initial <= 0) {
    return 0;
  }

  const rate = Math.round(((initial - current) / initial) * 100);
  return Math.max(0, rate);
}

function upsertRecord(records: DayRecord[], record: DayRecord): DayRecord[] {
  const others = records.filter((item) => item.id !== record.id);
  return [record, ...others].slice(0, MAX_RECORDS);
}

function findCurrentRecord(
  records: DayRecord[],
  date: string,
  worryText: string,
): DayRecord | undefined {
  return records.find(
    (record) => record.date === date && record.worry === worryText.trim(),
  );
}

function getTopWorries(records: DayRecord[]): string[] {
  const counts = new Map<string, number>();

  for (const record of records) {
    const worry = record.worry.trim();
    if (!worry) {
      continue;
    }
    counts.set(worry, (counts.get(worry) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([worry]) => worry);
}

function buildGrowthReport(records: DayRecord[]) {
  const practiceCount = records.filter((record) => record.practiced).length;
  const insightCount = records.filter(
    (record) => record.learning.trim().length > 0,
  ).length;

  return {
    practiceCount,
    insightCount,
    topWorries: getTopWorries(records),
  };
}

const textareaClassName =
  "w-full resize-none rounded-2xl bg-[#f5f5f7] px-4 py-4 text-[15px] leading-relaxed text-[#1d1d1f] placeholder:text-[#aeaeb2] transition focus:bg-[#ebebef] focus:outline-none";

const inputClassName =
  "w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] transition focus:bg-[#ebebef] focus:outline-none";

function BookSelector({
  books,
  selectedBookId,
  onChange,
}: {
  books: ReturnType<typeof getAllBooks>;
  selectedBookId: string;
  onChange: (bookId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#1d1d1f]">使用する本</p>
      <div className="grid grid-cols-2 gap-2">
        {books.map((book) => {
          const selected = selectedBookId === book.id;

          return (
            <button
              key={book.id}
              type="button"
              onClick={() => onChange(book.id)}
              className={`rounded-2xl px-4 py-3 text-left transition ${
                selected
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebef]"
              }`}
            >
              <span className="block text-[14px] font-medium">{book.title}</span>
              <span
                className={`mt-1 block text-xs ${
                  selected ? "text-white/70" : "text-[#86868b]"
                }`}
              >
                {book.framework}
              </span>
              {book.author ? (
                <span
                  className={`mt-1 block text-[11px] ${
                    selected ? "text-white/60" : "text-[#aeaeb2]"
                  }`}
                >
                  {book.author}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type AdminFormState = {
  title: string;
  author: string;
  framework: string;
  myTaskTemplate: string;
  othersTaskTemplate: string;
  actionTemplate: string;
};

const emptyAdminForm: AdminFormState = {
  title: "",
  author: "",
  framework: "",
  myTaskTemplate:
    "「{worry}」について、{keyword}の反応をコントロールするのではなく、自分が選べる行動に集中すること。",
  othersTaskTemplate:
    "{keyword}がどう感じ、どう判断するかは{keyword}自身の課題です。",
  actionTemplate:
    "「{worry}」に関して、今日自分にできる一歩を1つ実行する。",
};

function AdminPanel({
  customBooks,
  onRegister,
  onDelete,
}: {
  customBooks: CustomBook[];
  onRegister: (book: Omit<CustomBook, "id">) => void;
  onDelete: (bookId: string) => void;
}) {
  const [form, setForm] = useState<AdminFormState>(emptyAdminForm);
  const [message, setMessage] = useState("");
  const readerVoiceSummary = useMemo(
    () => aggregateVoicesByBook(loadReaderVoices()),
    [],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.framework.trim() ||
      !form.myTaskTemplate.trim() ||
      !form.othersTaskTemplate.trim() ||
      !form.actionTemplate.trim()
    ) {
      setMessage("すべての項目を入力してください。");
      return;
    }

    onRegister({
      title: form.title.trim(),
      author: form.author.trim(),
      framework: form.framework.trim(),
      myTaskTemplate: form.myTaskTemplate.trim(),
      othersTaskTemplate: form.othersTaskTemplate.trim(),
      actionTemplate: form.actionTemplate.trim(),
    });

    setForm(emptyAdminForm);
    setMessage("書籍を登録しました。");
  }

  return (
    <section className="mt-10 space-y-8 rounded-3xl border border-[#e8e8ed] bg-[#f5f5f7] px-5 py-8">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-[#86868b]">
          管理者モード
        </p>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">書籍を登録</h2>
        <p className="text-sm text-[#86868b]">
          登録した書籍は利用者が選択できます。{TEMPLATE_HINT}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#1d1d1f]">書籍名</span>
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="例：嫌われる勇気"
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#1d1d1f]">著者名</span>
          <input
            value={form.author}
            onChange={(event) =>
              setForm((current) => ({ ...current, author: event.target.value }))
            }
            placeholder="例：岸見一郎・古賀史健"
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#1d1d1f]">思想</span>
          <input
            value={form.framework}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                framework: event.target.value,
              }))
            }
            placeholder="例：課題の分離"
            className={inputClassName}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#1d1d1f]">
            自分の課題テンプレート
          </span>
          <textarea
            rows={3}
            value={form.myTaskTemplate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                myTaskTemplate: event.target.value,
              }))
            }
            className={textareaClassName}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#1d1d1f]">
            相手の課題テンプレート
          </span>
          <textarea
            rows={3}
            value={form.othersTaskTemplate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                othersTaskTemplate: event.target.value,
              }))
            }
            className={textareaClassName}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#1d1d1f]">
            行動提案テンプレート
          </span>
          <textarea
            rows={3}
            value={form.actionTemplate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                actionTemplate: event.target.value,
              }))
            }
            className={textareaClassName}
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-[#0071e3] px-6 py-4 text-[15px] font-medium text-white transition hover:bg-[#0077ed]"
        >
          書籍を登録
        </button>

        {message ? (
          <p className="text-center text-sm text-[#86868b]">{message}</p>
        ) : null}
      </form>

      {customBooks.length > 0 ? (
        <div className="space-y-3 border-t border-[#e8e8ed] pt-6">
          <p className="text-sm font-medium text-[#1d1d1f]">登録済みの書籍</p>
          {customBooks.map((book) => (
            <article
              key={book.id}
              className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#f2f2f7]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1d1d1f]">{book.title}</p>
                  <p className="mt-1 text-xs text-[#86868b]">
                    {book.author} · {book.framework}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(book.id)}
                  className="shrink-0 text-xs text-[#86868b] underline"
                >
                  削除
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="space-y-3 border-t border-[#e8e8ed] pt-6">
        <p className="text-sm font-medium text-[#1d1d1f]">読者の声（集計プレビュー）</p>
        {readerVoiceSummary.length > 0 ? (
          <div className="space-y-2">
            {readerVoiceSummary.map((summary) => (
              <article
                key={summary.bookId}
                className="rounded-2xl bg-white px-4 py-4 ring-1 ring-[#f2f2f7]"
              >
                <p className="font-medium text-[#1d1d1f]">{summary.bookTitle}</p>
                <p className="mt-1 text-xs text-[#86868b]">
                  {summary.bookAuthor} · {summary.count}件 · 平均改善率{" "}
                  {summary.averageImprovementRate}%
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#86868b]">
            まだ読者の声はありません。
          </p>
        )}
      </div>
    </section>
  );
}

function ScoreSlider({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl bg-[#f5f5f7] px-5 py-5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[#1d1d1f]">
          {label}
        </label>
        <span className="text-[2rem] leading-none font-semibold text-[#1d1d1f]">
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d2d2d7] accent-[#0071e3]"
      />
      <div className="flex justify-between text-xs text-[#86868b]">
        <span>1 軽い</span>
        <span>10 つらい</span>
      </div>
    </div>
  );
}

function WorryScoreGraph({
  initialScore,
  currentScore,
}: {
  initialScore: number;
  currentScore: number;
}) {
  const improvementRate = calculateImprovementRate(initialScore, currentScore);
  const maxBarHeight = 120;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-center gap-10 px-2 pt-2">
        {[
          { label: "開始時", score: initialScore, color: "bg-[#ff9500]" },
          { label: "現在", score: currentScore, color: "bg-[#0071e3]" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-3">
            <span className="text-[1.75rem] font-semibold text-[#1d1d1f]">
              {item.score}
            </span>
            <div
              className="flex w-14 items-end justify-center rounded-2xl bg-[#ebebef]"
              style={{ height: maxBarHeight }}
            >
              <div
                className={`w-full rounded-2xl ${item.color} transition-all duration-500`}
                style={{
                  height: `${(item.score / 10) * maxBarHeight}px`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-[#86868b]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white px-5 py-4 text-center ring-1 ring-[#f2f2f7]">
        <p className="text-xs text-[#86868b]">改善率</p>
        <p className="mt-1 text-[2.5rem] font-semibold tracking-tight text-[#1d1d1f]">
          {improvementRate}%
        </p>
      </div>

      <p className="rounded-2xl bg-[#1d1d1f] px-5 py-5 text-center text-[15px] leading-relaxed font-medium text-white">
        この7日で読者は{improvementRate}%悩みが軽減しました
      </p>
    </div>
  );
}

function AuthorFeedbackForm({
  bookTitle,
  bookAuthor,
  onSubmit,
  savedMessage,
}: {
  bookTitle: string;
  bookAuthor: string;
  onSubmit: (whatChanged: string, messageToAuthor: string) => void;
  savedMessage: string;
}) {
  const [whatChanged, setWhatChanged] = useState("");
  const [messageToAuthor, setMessageToAuthor] = useState("");
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!whatChanged.trim() && !messageToAuthor.trim()) {
      setFormError("どちらか一方は入力してください。");
      return;
    }

    setFormError("");
    onSubmit(whatChanged.trim(), messageToAuthor.trim());
    setWhatChanged("");
    setMessageToAuthor("");
  }

  return (
    <section className="mt-8 space-y-6 rounded-3xl bg-white px-6 py-8 ring-1 ring-[#f2f2f7]">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-widest text-[#86868b]">
          著者フィードバック
        </p>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">読者の声</h2>
        <p className="text-sm text-[#86868b]">
          {bookTitle}（{bookAuthor}）へのフィードバック
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-3">
          <span className="text-sm font-medium text-[#1d1d1f]">
            この本を読んで何が変わりましたか？
          </span>
          <textarea
            rows={4}
            value={whatChanged}
            onChange={(event) => setWhatChanged(event.target.value)}
            placeholder="例：人の評価より、自分の行動に集中できるようになった"
            className={textareaClassName}
          />
        </label>

        <label className="block space-y-3">
          <span className="text-sm font-medium text-[#1d1d1f]">
            著者へメッセージ
          </span>
          <textarea
            rows={4}
            value={messageToAuthor}
            onChange={(event) => setMessageToAuthor(event.target.value)}
            placeholder="例：この本の思想が日常の選択に活きています"
            className={textareaClassName}
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-[#1d1d1f] px-6 py-4 text-[15px] font-medium text-white transition hover:bg-[#333336]"
        >
          読者の声を送る
        </button>

        {savedMessage ? (
          <p className="text-center text-sm text-[#86868b]">{savedMessage}</p>
        ) : null}
        {formError ? (
          <p className="text-center text-sm text-[#86868b]">{formError}</p>
        ) : null}
      </form>
    </section>
  );
}

export default function Home() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [customBooks, setCustomBooks] = useState<CustomBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("courage");
  const [worry, setWorry] = useState("");
  const [result, setResult] = useState<ThoughtResult | null>(null);
  const [error, setError] = useState("");
  const [practicedToday, setPracticedToday] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [reflection, setReflection] = useState("");
  const [learning, setLearning] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [initialScore, setInitialScore] = useState(8);
  const [currentScore, setCurrentScore] = useState(4);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const todayKey = getTodayKey();
  const showGrowthReport = records.length >= MAX_RECORDS;
  const growthReport = useMemo(() => buildGrowthReport(records), [records]);
  const improvementRate = calculateImprovementRate(initialScore, currentScore);
  const allBooks = useMemo(() => getAllBooks(customBooks), [customBooks]);
  const activeBook = getBookById(selectedBookId, customBooks);
  const resultItems = [
    { num: "①", label: activeBook.labels[0], key: "myTask" as const },
    { num: "②", label: activeBook.labels[1], key: "othersTask" as const },
    { num: "③", label: activeBook.labels[2], key: "todayAction" as const },
  ];

  useEffect(() => {
    const loadedCustomBooks = loadCustomBooks();
    const loadedRecords = loadRecords();
    setCustomBooks(loadedCustomBooks);
    setRecords(loadedRecords);
    setStreakDays(loadStreakDays());
    setInitialScore(loadInitialScore());
    setSelectedBookId(loadSelectedBookId(loadedCustomBooks));

    const savedCurrentScore = loadCurrentScore();
    if (savedCurrentScore !== null) {
      setCurrentScore(savedCurrentScore);
    }
  }, [todayKey]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!worry.trim()) {
      setError("悩みを入力してください。");
      setResult(null);
      return;
    }

    setError("");
    setResult(generateThoughtResult(selectedBookId, worry, customBooks));
    setPracticedToday(false);
    setReflection("");
    setLearning("");
    setSaveMessage("");

    const existing = findCurrentRecord(records, todayKey, worry);
    if (existing) {
      setReflection(existing.reflection);
      setLearning(existing.learning);
      setPracticedToday(existing.practiced);
    }
  }

  function buildTodayRecord(practiced: boolean): DayRecord | null {
    if (!result || !worry.trim()) {
      return null;
    }

    const existing = findCurrentRecord(records, todayKey, worry);

    return {
      id: existing?.id ?? `${todayKey}-${Date.now()}`,
      date: todayKey,
      worry: worry.trim(),
      myTask: result.myTask,
      othersTask: result.othersTask,
      todayAction: result.todayAction,
      practiced,
      reflection: reflection.trim(),
      learning: learning.trim(),
    };
  }

  function handlePractice() {
    const nextStreak = streakDays + 1;
    setStreakDays(nextStreak);
    setPracticedToday(true);
    saveStreakDays(nextStreak);

    const record = buildTodayRecord(true);
    if (record) {
      const updated = upsertRecord(records, record);
      setRecords(updated);
      saveRecords(updated);
    }

    setSaveMessage("");
  }

  function handleSaveJournal() {
    const record = buildTodayRecord(practicedToday);
    if (!record) {
      return;
    }

    const updated = upsertRecord(records, record);
    setRecords(updated);
    saveRecords(updated);
    setSaveMessage("記録を保存しました。");
  }

  function handleInitialScoreChange(score: number) {
    setInitialScore(score);
    saveInitialScore(score);
  }

  function handleCurrentScoreChange(score: number) {
    setCurrentScore(score);
    saveCurrentScore(score);
  }

  function handleBookChange(bookId: string) {
    setSelectedBookId(bookId);
    saveSelectedBookId(bookId);

    if (worry.trim()) {
      setResult(generateThoughtResult(bookId, worry, customBooks));
    }
  }

  function handleRegisterBook(book: Omit<CustomBook, "id">) {
    const nextBooks = [...customBooks, createCustomBook(book)];
    setCustomBooks(nextBooks);
    saveCustomBooks(nextBooks);
  }

  function handleDeleteBook(bookId: string) {
    const nextBooks = customBooks.filter((book) => book.id !== bookId);
    setCustomBooks(nextBooks);
    saveCustomBooks(nextBooks);

    if (selectedBookId === bookId) {
      const fallbackId = "courage";
      setSelectedBookId(fallbackId);
      saveSelectedBookId(fallbackId);

      if (worry.trim()) {
        setResult(generateThoughtResult(fallbackId, worry, nextBooks));
      }
    }
  }

  function handleSaveReaderVoice(whatChanged: string, messageToAuthor: string) {
    appendReaderVoice({
      bookId: activeBook.id,
      bookTitle: activeBook.title,
      bookAuthor: activeBook.author,
      bookFramework: activeBook.framework,
      whatChanged,
      messageToAuthor,
      initialWorryScore: initialScore,
      currentWorryScore: currentScore,
      improvementRate,
      practiceCount: growthReport.practiceCount,
      insightCount: growthReport.insightCount,
      programCompletedAt: todayKey,
    });

    setFeedbackMessage("読者の声を保存しました。ありがとうございます。");
  }

  return (
    <div className="min-h-full bg-white text-[#1d1d1f]">
      <main className="mx-auto flex w-full max-w-md flex-col px-6 py-16 pb-24">
        <header className="mb-14 space-y-4 text-center">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsAdminMode((current) => !current)}
              className="text-xs text-[#86868b] underline"
            >
              {isAdminMode ? "利用者モードへ" : "管理者モード"}
            </button>
          </div>
          <p className="text-xs font-medium tracking-[0.35em] text-[#86868b]">
            BOOK TO ACTION
          </p>
          <h1 className="text-[1.75rem] leading-snug font-semibold tracking-tight text-[#1d1d1f]">
            読んだ本を、今日の行動へ。
          </h1>
          <p className="text-[15px] leading-relaxed text-[#86868b]">
            思想を理解で終わらせず、実践・記録・変化までつなげる読後アプリ。
          </p>
        </header>

        {isAdminMode ? (
          <AdminPanel
            customBooks={customBooks}
            onRegister={handleRegisterBook}
            onDelete={handleDeleteBook}
          />
        ) : (
          <>
            <BookSelector
              books={allBooks}
              selectedBookId={selectedBookId}
              onChange={handleBookChange}
            />

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <ScoreSlider
            id="initial-score"
            label="開始前の悩みスコア"
            value={initialScore}
            onChange={handleInitialScoreChange}
          />

          <label htmlFor="worry" className="block space-y-3">
            <span className="text-sm font-medium text-[#1d1d1f]">
              今の悩み
            </span>
            <textarea
              id="worry"
              name="worry"
              rows={4}
              value={worry}
              onChange={(event) => setWorry(event.target.value)}
              placeholder="例：上司が自分の仕事を認めてくれない"
              className={textareaClassName}
            />
          </label>

          {error ? (
            <p className="text-sm text-[#86868b]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-[#0071e3] px-6 py-4 text-[15px] font-medium text-white transition hover:bg-[#0077ed] active:opacity-80"
          >
            行動に変換する
          </button>
        </form>

        {result ? (
          <section aria-live="polite" className="mt-16 space-y-12">
            <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3 text-center">
              <p className="text-xs text-[#86868b]">思想エンジン</p>
              <p className="mt-1 text-sm font-medium text-[#1d1d1f]">
                {activeBook.title} · {activeBook.framework}
              </p>
              <p className="mt-1 text-xs text-[#86868b]">{activeBook.author}</p>
            </div>

            <div className="space-y-5">
              {resultItems.map((item) => (
                <article
                  key={item.key}
                  className={`rounded-3xl px-6 py-6 ${
                    item.key === "todayAction"
                      ? "bg-[#f5f5f7]"
                      : "bg-white ring-1 ring-[#f2f2f7]"
                  }`}
                >
                  <p className="text-xs font-medium text-[#86868b]">
                    {item.num} {item.label}
                  </p>
                  <p
                    className={`mt-3 leading-relaxed text-[#1d1d1f] ${
                      item.key === "todayAction"
                        ? "text-[17px] font-medium"
                        : "text-[15px]"
                    }`}
                  >
                    {result[item.key]}
                  </p>
                </article>
              ))}
            </div>

            <div className="space-y-8 rounded-3xl bg-[#f5f5f7] px-6 py-8">
              <div>
                <p className="text-xs font-medium text-[#86868b]">
                  ④ 実行チェック
                </p>
                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={practicedToday}
                    onChange={(event) => setPracticedToday(event.target.checked)}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <span className="text-[15px] text-[#1d1d1f]">
                    今日実践した
                  </span>
                </label>
              </div>

              <div className="space-y-5 border-t border-[#e8e8ed] pt-8">
                <p className="text-xs font-medium text-[#86868b]">
                  ⑤ 連続実践日数
                </p>
                <p className="text-center text-[15px] text-[#86868b]">
                  現在{" "}
                  <span className="text-[3rem] leading-none font-semibold tracking-tight text-[#1d1d1f]">
                    {streakDays}
                  </span>
                  日
                </p>
                <button
                  type="button"
                  onClick={handlePractice}
                  className="w-full rounded-full bg-[#1d1d1f] px-6 py-4 text-[15px] font-medium text-white transition hover:bg-[#333336] active:opacity-80"
                >
                  実践する
                </button>
              </div>
            </div>

            {practicedToday ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#86868b]">
                    実践後の振り返り
                  </p>
                  <p className="text-sm text-[#1d1d1f]">
                    今日実践してどうでしたか？
                  </p>
                  <textarea
                    rows={3}
                    value={reflection}
                    onChange={(event) => setReflection(event.target.value)}
                    placeholder="例：思ったより落ち着いて話せた"
                    className={textareaClassName}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-[#86868b]">学び</p>
                  <p className="text-sm text-[#1d1d1f]">今日気づいたこと</p>
                  <textarea
                    rows={3}
                    value={learning}
                    onChange={(event) => setLearning(event.target.value)}
                    placeholder="例：相手の反応より、自分の行動に集中できる"
                    className={textareaClassName}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveJournal}
                  className="w-full rounded-full bg-[#0071e3] px-6 py-4 text-[15px] font-medium text-white transition hover:bg-[#0077ed] active:opacity-80"
                >
                  記録を保存
                </button>

                {saveMessage ? (
                  <p className="text-center text-sm text-[#86868b]">
                    {saveMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {records.length > 0 ? (
          <section className="mt-16 space-y-5">
            <div className="flex items-end justify-between">
              <h2 className="text-sm font-medium text-[#1d1d1f]">
                過去7日分の記録
              </h2>
              <span className="text-xs text-[#86868b]">
                {records.length} / {MAX_RECORDS}
              </span>
            </div>

            <div className="space-y-3">
              {records.map((record, index) => (
                <article
                  key={record.id}
                  className="rounded-3xl bg-[#f5f5f7] px-5 py-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-[#86868b]">
                      Day {MAX_RECORDS - index}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {formatDisplayDate(record.date)}
                    </p>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#1d1d1f]">
                    {record.worry}
                  </p>
                  {record.reflection ? (
                    <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
                      振り返り：{record.reflection}
                    </p>
                  ) : null}
                  {record.learning ? (
                    <p className="mt-2 text-sm leading-relaxed text-[#86868b]">
                      学び：{record.learning}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {showGrowthReport ? (
          <section className="mt-16 space-y-6 rounded-3xl bg-[#f5f5f7] px-6 py-8">
            <div className="space-y-2 text-center">
              <p className="text-xs font-medium tracking-widest text-[#86868b]">
                成長レポート
              </p>
              <h2 className="text-xl font-semibold text-[#1d1d1f]">
                7日間の振り返り
              </h2>
            </div>

            <ScoreSlider
              id="current-score"
              label="7日後の悩みスコア"
              value={currentScore}
              onChange={handleCurrentScoreChange}
            />

            <WorryScoreGraph
              initialScore={initialScore}
              currentScore={currentScore}
            />

            <div className="grid grid-cols-2 gap-3">
              <article className="rounded-2xl bg-white px-4 py-5 text-center ring-1 ring-[#f2f2f7]">
                <p className="text-xs text-[#86868b]">実践回数</p>
                <p className="mt-2 text-[2rem] font-semibold text-[#1d1d1f]">
                  {growthReport.practiceCount}
                </p>
              </article>
              <article className="rounded-2xl bg-white px-4 py-5 text-center ring-1 ring-[#f2f2f7]">
                <p className="text-xs text-[#86868b]">気づき数</p>
                <p className="mt-2 text-[2rem] font-semibold text-[#1d1d1f]">
                  {growthReport.insightCount}
                </p>
              </article>
            </div>

            <article className="rounded-2xl bg-white px-5 py-5 ring-1 ring-[#f2f2f7]">
              <p className="text-xs text-[#86868b]">よく出た悩み</p>
              {growthReport.topWorries.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {growthReport.topWorries.map((item) => (
                    <li
                      key={item}
                      className="text-[15px] leading-relaxed text-[#1d1d1f]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#86868b]">
                  記録された悩みはありません。
                </p>
              )}
            </article>

            <p className="text-center text-xs leading-relaxed text-[#86868b]">
              開始 {initialScore} → 現在 {currentScore}（改善率 {improvementRate}%）
            </p>

            <AuthorFeedbackForm
              bookTitle={activeBook.title}
              bookAuthor={activeBook.author}
              onSubmit={handleSaveReaderVoice}
              savedMessage={feedbackMessage}
            />
          </section>
        ) : records.length > 0 ? (
          <p className="mt-10 text-center text-sm text-[#86868b]">
            成長レポートは7日分の記録が揃うと表示されます。
          </p>
        ) : null}

        <footer className="mt-20 text-center">
          <p className="text-sm leading-loose text-[#86868b]">
            読んで終わらせない。行動に変える。
          </p>
        </footer>
          </>
        )}
      </main>
    </div>
  );
}
