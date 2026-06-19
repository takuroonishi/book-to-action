export type ReaderVoice = {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookFramework: string;
  whatChanged: string;
  messageToAuthor: string;
  dailyRecordCount: number;
  submittedAt: string;
  createdAt: string;
};

export type ReaderVoiceInput = Omit<ReaderVoice, "id" | "createdAt">;

export type ReaderVoiceBookSummary = {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  count: number;
};

export type ReaderVoiceAuthorSummary = {
  bookAuthor: string;
  count: number;
  books: string[];
};

export const READER_VOICES_KEY = "book-to-action-reader-voices";

export function loadReaderVoices(): ReaderVoice[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(READER_VOICES_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as ReaderVoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReaderVoices(voices: ReaderVoice[]) {
  localStorage.setItem(READER_VOICES_KEY, JSON.stringify(voices));
}

export function createReaderVoice(input: ReaderVoiceInput): ReaderVoice {
  return {
    id: `voice-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
}

export function appendReaderVoice(input: ReaderVoiceInput): ReaderVoice {
  const voices = loadReaderVoices();
  const voice = createReaderVoice(input);
  saveReaderVoices([voice, ...voices]);
  return voice;
}

export function getReaderVoicesByBookId(bookId: string): ReaderVoice[] {
  return loadReaderVoices().filter((voice) => voice.bookId === bookId);
}

export function getReaderVoicesByAuthor(author: string): ReaderVoice[] {
  return loadReaderVoices().filter((voice) => voice.bookAuthor === author);
}

export function aggregateVoicesByBook(
  voices: ReaderVoice[] = loadReaderVoices(),
): ReaderVoiceBookSummary[] {
  const map = new Map<string, ReaderVoiceBookSummary>();

  for (const voice of voices) {
    const existing = map.get(voice.bookId);

    if (!existing) {
      map.set(voice.bookId, {
        bookId: voice.bookId,
        bookTitle: voice.bookTitle,
        bookAuthor: voice.bookAuthor,
        count: 1,
      });
      continue;
    }

    existing.count += 1;
  }

  return [...map.values()];
}

export function aggregateVoicesByAuthor(
  voices: ReaderVoice[] = loadReaderVoices(),
): ReaderVoiceAuthorSummary[] {
  const map = new Map<string, ReaderVoiceAuthorSummary>();

  for (const voice of voices) {
    const existing = map.get(voice.bookAuthor);

    if (!existing) {
      map.set(voice.bookAuthor, {
        bookAuthor: voice.bookAuthor,
        count: 1,
        books: [voice.bookTitle],
      });
      continue;
    }

    existing.count += 1;
    if (!existing.books.includes(voice.bookTitle)) {
      existing.books.push(voice.bookTitle);
    }
  }

  return [...map.values()];
}
