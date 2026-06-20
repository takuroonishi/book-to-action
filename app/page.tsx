"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookSelector } from "@/components/BookSelector";
import {
  createCustomBook,
  generateThoughtResult,
  getAllBooks,
  getBookAmazonUrl,
  getBookById,
  getBuiltInBooks,
  loadCustomBooks,
  saveCustomBooks,
  TEMPLATE_HINT,
  type CustomBook,
  type ThoughtResult,
} from "@/lib/books";
import {
  MANUAL_BOOK_SELECTION_REASON,
  recommendBook,
} from "@/lib/book-matcher";
import {
  appendDailyRecord,
  calculateImprovementDelta,
  calculateImprovementRate,
  formatImprovementDelta,
  formatRecordDate,
  loadDailyRecords,
  type DailyRecord,
} from "@/lib/daily-records";
import { insertReaderFeedback } from "@/lib/reader-feedback";
import {
  loadReaderProfile,
  saveReaderProfile,
  type ReaderProfile,
} from "@/lib/reader-profile";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ReaderFeedbackDashboard } from "@/components/ReaderFeedbackDashboard";
import { ReaderProfileSection } from "@/components/ReaderProfileSection";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

const textareaClassName =
  "w-full resize-none rounded-2xl bg-[#f5f5f7] px-4 py-4 text-[15px] leading-relaxed text-[#1d1d1f] placeholder:text-[#aeaeb2] transition focus:bg-[#ebebef] focus:outline-none";

const inputClassName =
  "w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#aeaeb2] transition focus:bg-[#ebebef] focus:outline-none";

const selectClassName =
  "w-full rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-[15px] text-[#1d1d1f] transition focus:bg-[#ebebef] focus:outline-none";

const feedbackNoticeText =
  "投稿いただいたコメント・振り返り・学びは、個人が特定されない形で、サービス改善や著者へのフィードバック、紹介資料等に活用させていただく場合があります。";

const primaryButtonClassName =
  "min-h-[56px] w-full rounded-full bg-[#0071e3] px-6 py-5 text-base font-medium text-white transition hover:bg-[#0077ed] active:opacity-80";

const saveButtonClassName =
  "min-h-[56px] w-full rounded-full bg-[#1d1d1f] px-6 py-5 text-base font-medium text-white transition hover:bg-[#333336] active:opacity-80 disabled:opacity-60";

const secondaryButtonClassName =
  "min-h-[56px] w-full rounded-2xl px-5 py-5 text-base font-medium text-[#1d1d1f] transition active:opacity-80";

function ScoreSlider({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  hintLeft = "1 軽い",
  hintRight = "10 つらい",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  hintLeft?: string;
  hintRight?: string;
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
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d2d2d7] accent-[#0071e3]"
      />
      <div className="flex justify-between text-xs text-[#86868b]">
        <span>{hintLeft}</span>
        <span>{hintRight}</span>
      </div>
    </div>
  );
}

function ImprovementSummary({
  morningScore,
  eveningScore,
}: {
  morningScore: number;
  eveningScore: number;
}) {
  const improvementDelta = calculateImprovementDelta(morningScore, eveningScore);

  return (
    <div className="rounded-3xl bg-[#1d1d1f] px-6 py-6 text-center text-white">
      <p className="text-xs text-white/70">改善度</p>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div>
          <p className="text-xs text-white/70">朝</p>
          <p className="mt-1 text-[2rem] font-semibold">{morningScore}</p>
        </div>
        <p className="text-white/50">→</p>
        <div>
          <p className="text-xs text-white/70">夜</p>
          <p className="mt-1 text-[2rem] font-semibold">{eveningScore}</p>
        </div>
      </div>
      <p className="mt-4 text-[2rem] font-semibold tracking-tight">
        {formatImprovementDelta(improvementDelta)}
      </p>
    </div>
  );
}

type AdminFormState = {
  title: string;
  author: string;
  framework: string;
  amazonUrl: string;
  myTaskTemplate: string;
  othersTaskTemplate: string;
  actionTemplate: string;
};

const emptyAdminForm: AdminFormState = {
  title: "",
  author: "",
  framework: "",
  amazonUrl: "",
  myTaskTemplate:
    "「{worry}」について、{keyword}の反応をコントロールするのではなく、自分が選べる行動に集中すること。",
  othersTaskTemplate:
    "{keyword}がどう感じ、どう判断するかは{keyword}自身の課題です。",
  actionTemplate:
    "今日30分以内に終わる行動を1つ決め、タイマーを25分セットして始める。",
};

function AdminPanel({
  customBooks,
  bookTitles,
  onRegister,
  onDelete,
}: {
  customBooks: CustomBook[];
  bookTitles: string[];
  onRegister: (book: Omit<CustomBook, "id">) => void;
  onDelete: (bookId: string) => void;
}) {
  const [form, setForm] = useState<AdminFormState>(emptyAdminForm);
  const [message, setMessage] = useState("");

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
      amazonUrl: form.amazonUrl.trim(),
      myTaskTemplate: form.myTaskTemplate.trim(),
      othersTaskTemplate: form.othersTaskTemplate.trim(),
      actionTemplate: form.actionTemplate.trim(),
    });

    setForm(emptyAdminForm);
    setMessage("書籍を登録しました。");
  }

  return (
    <section className="mt-6 space-y-8">
      <ReaderFeedbackDashboard bookTitles={bookTitles} />

      <section className="space-y-8 rounded-3xl border border-[#e8e8ed] bg-[#f5f5f7] px-5 py-8">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-[#86868b]">
          書籍管理
        </p>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">参考書籍を登録</h2>
        <p className="text-sm leading-relaxed text-[#86868b]">
          行動変容の参考にする書籍を追加できます。{TEMPLATE_HINT}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(
          [
            ["title", "書籍名", "例：嫌われる勇気"],
            ["author", "著者名", "例：岸見一郎・古賀史健"],
            ["framework", "考え方", "例：課題の分離"],
            [
              "amazonUrl",
              "Amazon購入リンク",
              "例：https://www.amazon.co.jp/dp/XXXXXXXXXX",
            ],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label key={key} className="block space-y-2">
            <span className="text-sm font-medium text-[#1d1d1f]">{label}</span>
            <input
              value={form[key]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [key]: event.target.value }))
              }
              placeholder={placeholder}
              className={inputClassName}
            />
          </label>
        ))}

        {(
          [
            ["myTaskTemplate", "自分の課題テンプレート"],
            ["othersTaskTemplate", "相手の課題テンプレート"],
            ["actionTemplate", "行動提案テンプレート"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-2">
            <span className="text-sm font-medium text-[#1d1d1f]">{label}</span>
            <textarea
              rows={3}
              value={form[key]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [key]: event.target.value }))
              }
              className={textareaClassName}
            />
          </label>
        ))}

        <button
          type="submit"
          className={primaryButtonClassName}
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
                  <p className="truncate font-medium text-[#1d1d1f]" title={book.title}>
                    {book.title}
                  </p>
                  <p className="mt-1 text-xs text-[#86868b]">
                    {book.author} · {book.framework}
                  </p>
                  <p className="mt-1 text-xs text-[#86868b]">
                    Amazon：{book.amazonUrl ? "設定済み" : "未設定"}
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
      </section>
    </section>
  );
}

function HistoryList({ records }: { records: DailyRecord[] }) {
  if (records.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 space-y-5">
      <div className="flex items-end justify-between">
        <h2 className="text-sm font-medium text-[#1d1d1f]">履歴</h2>
        <span className="text-xs text-[#86868b]">{records.length}件</span>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <article
            key={record.id}
            className="rounded-3xl bg-[#f5f5f7] px-5 py-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className="truncate text-xs text-[#86868b]"
                title={record.bookTitle}
              >
                {record.bookTitle}
              </p>
              <p className="text-xs text-[#86868b]">
                {formatRecordDate(record.date)}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-[#86868b]">今日の行動</p>
                <p className="mt-2 text-[17px] leading-snug font-semibold text-[#1d1d1f]">
                  {record.todayAction}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#86868b]">悩み</p>
                <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
                  {record.worry}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white px-2 py-3">
                  <p className="text-[10px] text-[#86868b]">朝</p>
                  <p className="mt-1 text-lg font-semibold text-[#1d1d1f]">
                    {record.morningScore ?? "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-2 py-3">
                  <p className="text-[10px] text-[#86868b]">夜</p>
                  <p className="mt-1 text-lg font-semibold text-[#1d1d1f]">
                    {record.eveningScore ?? "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-2 py-3">
                  <p className="text-[10px] text-[#86868b]">改善度</p>
                  <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">
                    {record.morningScore != null && record.eveningScore != null
                      ? formatImprovementDelta(
                          calculateImprovementDelta(
                            record.morningScore,
                            record.eveningScore,
                          ),
                        )
                      : "—"}
                  </p>
                </div>
              </div>
              {record.learning ? (
                <div>
                  <p className="text-xs text-[#86868b]">学び</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
                    {record.learning}
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [customBooks, setCustomBooks] = useState<CustomBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("courage");
  const [bookSelectionReason, setBookSelectionReason] = useState("");
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [worry, setWorry] = useState("");
  const [morningScore, setMorningScore] = useState(8);
  const [eveningScore, setEveningScore] = useState(5);
  const [result, setResult] = useState<ThoughtResult | null>(null);
  const [todayReflection, setTodayReflection] = useState("");
  const [todayLearning, setTodayLearning] = useState("");
  const [messageToAuthor, setMessageToAuthor] = useState("");
  const [readerProfile, setReaderProfile] = useState<ReaderProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [agreedToFeedbackUse, setAgreedToFeedbackUse] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [records, setRecords] = useState<DailyRecord[]>([]);

  const todayKey = getTodayKey();
  const allBooks = useMemo(() => getAllBooks(customBooks), [customBooks]);
  const builtInBooks = useMemo(() => getBuiltInBooks(), []);
  const allBookTitles = useMemo(
    () => allBooks.map((book) => book.title),
    [allBooks],
  );
  const activeBook = getBookById(selectedBookId, customBooks);
  const resultItems = [
    { num: "①", label: activeBook.labels[0], key: "myTask" as const },
    { num: "②", label: activeBook.labels[1], key: "othersTask" as const },
    { num: "③", label: "今日の行動", key: "todayAction" as const },
  ];

  useEffect(() => {
    const loadedCustomBooks = loadCustomBooks();
    const loadedProfile = loadReaderProfile();
    setCustomBooks(loadedCustomBooks);
    setRecords(loadDailyRecords());
    setReaderProfile(loadedProfile);
    setIsEditingProfile(!loadedProfile);
  }, [todayKey]);

  function handleSaveProfile(profile: ReaderProfile) {
    saveReaderProfile(profile);
    setReaderProfile(profile);
    setIsEditingProfile(false);
  }

  function handleConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!readerProfile) {
      setError("先に読者情報を保存してください。");
      setIsEditingProfile(true);
      setResult(null);
      return;
    }

    if (!worry.trim()) {
      setError("今日の悩みを入力してください。");
      setResult(null);
      return;
    }

    setError("");
    const recommendation = recommendBook(worry);
    setSelectedBookId(recommendation.bookId);
    setBookSelectionReason(recommendation.reason);
    setShowBookPicker(false);
    setResult(generateThoughtResult(recommendation.bookId, worry, customBooks));
    setEveningScore(5);
    setTodayReflection("");
    setTodayLearning("");
    setMessageToAuthor("");
    setAgreedToFeedbackUse(false);
    setSaveMessage("");
    setSaveError("");
  }

  function handleEdit() {
    setResult(null);
    setBookSelectionReason("");
    setShowBookPicker(false);
    setEveningScore(5);
    setTodayReflection("");
    setTodayLearning("");
    setMessageToAuthor("");
    setAgreedToFeedbackUse(false);
    setSaveMessage("");
    setSaveError("");
    setError("");
  }

  function handleTryNewWorry() {
    setResult(null);
    setBookSelectionReason("");
    setShowBookPicker(false);
    setWorry("");
    setMorningScore(8);
    setEveningScore(5);
    setTodayReflection("");
    setTodayLearning("");
    setMessageToAuthor("");
    setAgreedToFeedbackUse(false);
    setSaveMessage("");
    setSaveError("");
    setError("");
  }

  async function handleSaveDailyRecord() {
    if (!result || !worry.trim()) {
      return;
    }

    if (!readerProfile) {
      setSaveMessage("");
      setSaveError("先に読者情報を保存してください。");
      setIsEditingProfile(true);
      return;
    }

    if (!todayReflection.trim()) {
      setSaveError("");
      setSaveMessage("振り返りを入力してください。");
      return;
    }

    if (!todayLearning.trim()) {
      setSaveError("");
      setSaveMessage("学びを入力してください。");
      return;
    }

    if (!agreedToFeedbackUse) {
      setSaveMessage("");
      setSaveError("内容の利用に同意してください。");
      return;
    }

    if (!isSupabaseConfigured()) {
      setSaveMessage("");
      setSaveError(
        "Supabaseが未設定です。.env.local に接続情報を設定してください。",
      );
      return;
    }

    const improvementRate = calculateImprovementRate(morningScore, eveningScore);

    setIsSaving(true);
    setSaveMessage("保存中...");
    setSaveError("");

    try {
      await insertReaderFeedback({
        ageGroup: readerProfile.ageGroup,
        gender: readerProfile.gender,
        recommendScore: readerProfile.recommendScore,
        bookId: activeBook.id,
        bookTitle: activeBook.title,
        bookAuthor: activeBook.author,
        bookFramework: activeBook.framework,
        bookCategory: activeBook.category,
        worry: worry.trim(),
        morningScore,
        todayAction: result.todayAction,
        eveningScore,
        improvementRate,
        todayReflection: todayReflection.trim(),
        todayLearning: todayLearning.trim(),
        messageToAuthor: messageToAuthor.trim(),
        amazonUrl: getBookAmazonUrl(activeBook),
      });

      const record = appendDailyRecord({
        date: todayKey,
        bookId: activeBook.id,
        bookTitle: activeBook.title,
        bookAuthor: activeBook.author,
        bookFramework: activeBook.framework,
        worry: worry.trim(),
        myTask: result.myTask,
        othersTask: result.othersTask,
        todayAction: result.todayAction,
        morningScore,
        eveningScore,
        improvementRate,
        learning: todayLearning.trim(),
      });

      setRecords([record, ...records]);
      setSaveError("");
      setSaveMessage(
        "今日の記録を保存しました。運営確認後に実践事例として公開されます。",
      );
      setWorry("");
      setMorningScore(8);
      setEveningScore(5);
      setResult(null);
      setTodayReflection("");
      setTodayLearning("");
      setMessageToAuthor("");
      setAgreedToFeedbackUse(false);
    } catch (err) {
      setSaveMessage("");
      setSaveError(
        err instanceof Error
          ? `保存に失敗しました: ${err.message}`
          : "保存に失敗しました。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleBookChange(bookId: string) {
    setSelectedBookId(bookId);
    setBookSelectionReason(MANUAL_BOOK_SELECTION_REASON);
    setShowBookPicker(false);

    if (worry.trim() && result) {
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
    }
  }

  return (
    <div className="min-h-full bg-white text-[#1d1d1f]">
      <main className="mx-auto flex w-full max-w-md flex-col px-5 py-12 pb-28 sm:px-6">
        <header className="mb-10 space-y-4 text-center">
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
          <h1 className="text-balance text-[1.625rem] leading-snug font-semibold tracking-tight text-[#1d1d1f] sm:text-[1.75rem]">
            思考が、行動に変わる。
          </h1>
          <p className="text-pretty text-[15px] leading-relaxed text-[#86868b]">
            著者の思考を読者の行動に変えるアプリ。
          </p>
        </header>

        {isAdminMode ? (
          <AdminPanel
            customBooks={customBooks}
            bookTitles={allBookTitles}
            onRegister={handleRegisterBook}
            onDelete={handleDeleteBook}
          />
        ) : (
          <>
            <ReaderProfileSection
              profile={readerProfile}
              isEditing={isEditingProfile}
              onEdit={() => setIsEditingProfile(true)}
              onCancelEdit={() => setIsEditingProfile(false)}
              onSave={handleSaveProfile}
            />

            {!readerProfile ? (
              <p className="mt-6 rounded-2xl bg-[#f5f5f7] px-4 py-4 text-sm leading-relaxed text-[#86868b]">
                STEP 1 · 読者情報を保存すると、毎日の記録を始められます。
              </p>
            ) : (
              <p className="mt-6 text-sm text-[#86868b]">
                STEP 2 · 毎日の悩みと行動を記録
              </p>
            )}

            <div
              className={`mt-6 space-y-6 ${
                !readerProfile ? "pointer-events-none opacity-40" : ""
              }`}
            >
            {!result ? (
              <form onSubmit={handleConvert} className="space-y-6">
                <p className="text-xs font-medium tracking-widest text-[#86868b]">
                  朝
                </p>

                <label htmlFor="worry" className="block space-y-3">
                  <span className="text-sm font-medium text-[#1d1d1f]">
                    今日の悩み
                  </span>
                  <textarea
                    id="worry"
                    name="worry"
                    rows={4}
                    value={worry}
                    onChange={(event) => setWorry(event.target.value)}
                    placeholder="例：アウトプットをどうすればいいかわからない"
                    className={textareaClassName}
                  />
                </label>

                <ScoreSlider
                  id="morning-score"
                  label="悩みレベル"
                  value={morningScore}
                  onChange={setMorningScore}
                />

                {error ? (
                  <p className="text-sm text-[#86868b]" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className={primaryButtonClassName}
                >
                  本を選んで行動に変える
                </button>
              </form>
            ) : null}

            {result ? (
              <section aria-live="polite" className="mt-8 space-y-8">
                <article className="rounded-3xl bg-[#f5f5f7] px-5 py-5">
                  <p className="text-xs font-medium text-[#86868b]">
                    あなたの悩みに合う本
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#1d1d1f]">
                    {activeBook.title}
                  </p>
                  <p className="mt-4 text-xs font-medium text-[#86868b]">
                    選んだ理由
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1d1d1f]">
                    {bookSelectionReason}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowBookPicker((current) => !current)}
                    className="mt-4 text-sm text-[#0071e3] underline"
                  >
                    別の本を選ぶ
                  </button>
                </article>

                {showBookPicker ? (
                  <BookSelector
                    books={builtInBooks}
                    selectedBookId={selectedBookId}
                    onChange={handleBookChange}
                  />
                ) : null}

                <article className="rounded-[2rem] bg-[#1d1d1f] px-5 py-10 text-center text-white shadow-sm sm:px-6">
                  <p className="text-[11px] font-medium tracking-[0.25em] text-white/60">
                    今日の行動
                  </p>
                  <p className="mt-5 text-pretty text-[1.625rem] leading-snug font-semibold tracking-tight sm:text-[1.875rem]">
                    {result.todayAction}
                  </p>
                </article>

                <article className="rounded-3xl bg-[#f5f5f7] px-5 py-5">
                  <p className="text-xs font-medium text-[#86868b]">
                    悩みから、行動へ
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#86868b]">
                    {worry.trim()}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[#86868b]">
                    <span className="rounded-full bg-white px-3 py-1">
                      朝 {morningScore}
                    </span>
                    <span aria-hidden="true">→</span>
                    <span className="rounded-full bg-[#1d1d1f] px-3 py-1 text-white">
                      行動
                    </span>
                  </div>
                </article>

                <div className="space-y-3">
                  <p className="text-xs font-medium tracking-widest text-[#86868b]">
                    思考の変換
                  </p>
                  {resultItems
                    .filter((item) => item.key !== "todayAction")
                    .map((item) => (
                      <article
                        key={item.key}
                        className="rounded-2xl bg-white px-5 py-4 ring-1 ring-[#f2f2f7]"
                      >
                        <p className="text-xs font-medium text-[#86868b]">
                          {item.num} {item.label}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#1d1d1f]">
                          {result[item.key]}
                        </p>
                      </article>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className={`${secondaryButtonClassName} border border-[#d2d2d7] bg-white active:bg-[#f5f5f7]`}
                  >
                    編集する
                  </button>
                  <button
                    type="button"
                    onClick={handleTryNewWorry}
                    className={`${secondaryButtonClassName} bg-[#f5f5f7] active:bg-[#ebebef]`}
                  >
                    別の悩みで試す
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-medium tracking-widest text-[#86868b]">
                    夜
                  </p>

                  <ScoreSlider
                    id="evening-score"
                    label="現在の悩みレベル"
                    value={eveningScore}
                    onChange={setEveningScore}
                  />

                  <label htmlFor="today-reflection" className="block space-y-3">
                    <span className="text-sm font-medium text-[#1d1d1f]">
                      振り返り
                    </span>
                    <textarea
                      id="today-reflection"
                      rows={4}
                      value={todayReflection}
                      onChange={(event) =>
                        setTodayReflection(event.target.value)
                      }
                      placeholder="例：今日は相手の反応より、自分の行動に集中できた"
                      className={textareaClassName}
                    />
                  </label>

                  <label htmlFor="today-learning" className="block space-y-3">
                    <span className="text-sm font-medium text-[#1d1d1f]">
                      学び
                    </span>
                    <textarea
                      id="today-learning"
                      rows={4}
                      value={todayLearning}
                      onChange={(event) => setTodayLearning(event.target.value)}
                      placeholder="例：課題の分離を意識すると、気持ちが楽になる"
                      className={textareaClassName}
                    />
                  </label>

                  <label htmlFor="message-to-author" className="block space-y-3">
                    <span className="text-sm font-medium text-[#1d1d1f]">
                      著者に伝えたいこと
                    </span>
                    <textarea
                      id="message-to-author"
                      rows={4}
                      value={messageToAuthor}
                      onChange={(event) =>
                        setMessageToAuthor(event.target.value)
                      }
                      placeholder="この本を読んで実践したことや感謝を自由に記入してください"
                      className={textareaClassName}
                    />
                  </label>

                  <p className="text-xs leading-relaxed text-[#86868b]">
                    {feedbackNoticeText}
                  </p>

                  <label className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={agreedToFeedbackUse}
                      onChange={(event) =>
                        setAgreedToFeedbackUse(event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]"
                    />
                    <span className="text-sm text-[#1d1d1f]">
                      上記内容に同意する
                    </span>
                  </label>

                  <ImprovementSummary
                    morningScore={morningScore}
                    eveningScore={eveningScore}
                  />

                  <button
                    type="button"
                    onClick={() => void handleSaveDailyRecord()}
                    disabled={isSaving || !agreedToFeedbackUse}
                    className={saveButtonClassName}
                  >
                    {isSaving ? "保存中..." : "今日の記録を保存"}
                  </button>

                  {saveMessage ? (
                    <p className="text-center text-sm text-[#86868b]">
                      {saveMessage}
                    </p>
                  ) : null}

                  {saveError ? (
                    <p
                      className="rounded-2xl bg-[#fff2f2] px-4 py-3 text-center text-sm text-[#b42318]"
                      role="alert"
                    >
                      {saveError}
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            <HistoryList records={records} />
            </div>

            <footer className="mt-20 space-y-3 text-center">
              <Link
                href="/examples"
                className="inline-block text-sm text-[#0071e3] underline"
              >
                読者の実践事例を見る
              </Link>
              <p className="text-sm leading-loose text-[#86868b]">
                本を読むだけで終わらない。行動で変える。
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
