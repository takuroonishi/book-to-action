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
  appendDailyRecord,
  formatRecordDate,
  loadDailyRecords,
  type DailyRecord,
} from "@/lib/daily-records";
import {
  aggregateVoicesByBook,
  appendReaderVoice,
  loadReaderVoices,
} from "@/lib/reader-voices";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
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
        {(
          [
            ["title", "書籍名", "例：嫌われる勇気"],
            ["author", "著者名", "例：岸見一郎・古賀史健"],
            ["framework", "思想", "例：課題の分離"],
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
                  {summary.bookAuthor} · {summary.count}件
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#86868b]">まだ読者の声はありません。</p>
        )}
      </div>
    </section>
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
    <section className="mt-16 space-y-6 rounded-3xl bg-[#f5f5f7] px-6 py-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-medium tracking-widest text-[#86868b]">
          著者フィードバック
        </p>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">読者の声</h2>
        <p className="text-sm text-[#86868b]">
          {bookTitle}（{bookAuthor}）
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
              <p className="text-xs font-medium text-[#86868b]">
                {record.bookTitle}
              </p>
              <p className="text-xs text-[#86868b]">
                {formatRecordDate(record.date)}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-[#86868b]">今日の悩み</p>
                <p className="mt-1 text-[15px] leading-relaxed text-[#1d1d1f]">
                  {record.worry}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#86868b]">今日の行動</p>
                <p className="mt-1 text-[15px] leading-relaxed text-[#1d1d1f]">
                  {record.todayAction}
                </p>
              </div>
              {record.reflection ? (
                <div>
                  <p className="text-xs text-[#86868b]">今日の振り返り</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#86868b]">
                    {record.reflection}
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
  const [worry, setWorry] = useState("");
  const [result, setResult] = useState<ThoughtResult | null>(null);
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [records, setRecords] = useState<DailyRecord[]>([]);

  const todayKey = getTodayKey();
  const allBooks = useMemo(() => getAllBooks(customBooks), [customBooks]);
  const activeBook = getBookById(selectedBookId, customBooks);
  const resultItems = [
    { num: "①", label: activeBook.labels[0], key: "myTask" as const },
    { num: "②", label: activeBook.labels[1], key: "othersTask" as const },
    { num: "③", label: "今日の行動", key: "todayAction" as const },
  ];

  useEffect(() => {
    const loadedCustomBooks = loadCustomBooks();
    setCustomBooks(loadedCustomBooks);
    setRecords(loadDailyRecords());
    setSelectedBookId(loadSelectedBookId(loadedCustomBooks));
  }, [todayKey]);

  function handleConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!worry.trim()) {
      setError("今日の悩みを入力してください。");
      setResult(null);
      return;
    }

    setError("");
    setResult(generateThoughtResult(selectedBookId, worry, customBooks));
    setReflection("");
    setSaveMessage("");
  }

  function handleSaveDailyRecord() {
    if (!result || !worry.trim()) {
      return;
    }

    if (!reflection.trim()) {
      setSaveMessage("今日の振り返りを入力してください。");
      return;
    }

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
      reflection: reflection.trim(),
    });

    setRecords([record, ...records]);
    setSaveMessage("今日の記録を保存しました。");
    setWorry("");
    setResult(null);
    setReflection("");
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
      dailyRecordCount: records.length,
      submittedAt: todayKey,
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
            毎日の悩みを、今日の行動と振り返りに変える。
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

            <form onSubmit={handleConvert} className="mt-10 space-y-6">
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
              <section aria-live="polite" className="mt-16 space-y-10">
                <div className="rounded-2xl bg-[#f5f5f7] px-4 py-3 text-center">
                  <p className="text-xs text-[#86868b]">思想エンジン</p>
                  <p className="mt-1 text-sm font-medium text-[#1d1d1f]">
                    {activeBook.title} · {activeBook.framework}
                  </p>
                </div>

                <article className="rounded-3xl bg-white px-6 py-6 ring-1 ring-[#f2f2f7]">
                  <p className="text-xs font-medium text-[#86868b]">
                    今日の悩み
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#1d1d1f]">
                    {worry.trim()}
                  </p>
                </article>

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

                <div className="space-y-4">
                  <label htmlFor="reflection" className="block space-y-3">
                    <span className="text-sm font-medium text-[#1d1d1f]">
                      今日の振り返り
                    </span>
                    <textarea
                      id="reflection"
                      rows={4}
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="例：行動に集中できた。相手の反応より自分の一歩が大事だと感じた"
                      className={textareaClassName}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveDailyRecord}
                    className="w-full rounded-full bg-[#1d1d1f] px-6 py-4 text-[15px] font-medium text-white transition hover:bg-[#333336] active:opacity-80"
                  >
                    今日の記録を保存
                  </button>

                  {saveMessage ? (
                    <p className="text-center text-sm text-[#86868b]">
                      {saveMessage}
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}

            <HistoryList records={records} />

            <AuthorFeedbackForm
              bookTitle={activeBook.title}
              bookAuthor={activeBook.author}
              onSubmit={handleSaveReaderVoice}
              savedMessage={feedbackMessage}
            />

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
