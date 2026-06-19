import { formatImprovementRate } from "@/lib/daily-records";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  ReaderFeedbackInsert,
  ReaderFeedbackRow,
} from "@/lib/supabase/database.types";

export const AGE_GROUP_OPTIONS = [
  "10代",
  "20代",
  "30代",
  "40代",
  "50代",
  "60代以上",
  "回答しない",
] as const;

export const GENDER_OPTIONS = ["男性", "女性", "その他", "回答しない"] as const;

export type AgeGroup = (typeof AGE_GROUP_OPTIONS)[number];
export type Gender = (typeof GENDER_OPTIONS)[number];

export type ReaderFeedback = {
  id: string;
  ageGroup: AgeGroup;
  gender: Gender;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookFramework: string;
  worry: string;
  morningScore: number;
  todayAction: string;
  eveningScore: number;
  improvementRate: number;
  learning: string;
  messageToAuthor: string;
  createdAt: string;
};

export type ReaderFeedbackInput = Omit<ReaderFeedback, "id" | "createdAt">;

function mapRow(row: ReaderFeedbackRow): ReaderFeedback {
  return {
    id: row.id,
    ageGroup: row.age_group as AgeGroup,
    gender: row.gender as Gender,
    bookId: row.book_id,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    bookFramework: row.book_framework,
    worry: row.worry,
    morningScore: row.morning_score,
    todayAction: row.today_action,
    eveningScore: row.evening_score,
    improvementRate: Number(row.improvement_rate),
    learning: row.learning,
    messageToAuthor: row.message_to_author,
    createdAt: row.created_at,
  };
}

function toInsert(input: ReaderFeedbackInput): ReaderFeedbackInsert {
  return {
    age_group: input.ageGroup,
    gender: input.gender,
    book_id: input.bookId,
    book_title: input.bookTitle,
    book_author: input.bookAuthor,
    book_framework: input.bookFramework,
    worry: input.worry,
    morning_score: input.morningScore,
    today_action: input.todayAction,
    evening_score: input.eveningScore,
    improvement_rate: input.improvementRate,
    learning: input.learning,
    message_to_author: input.messageToAuthor,
  };
}

export function formatFeedbackDate(isoDate: string) {
  return new Date(isoDate).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function insertReaderFeedback(
  input: ReaderFeedbackInput,
): Promise<ReaderFeedback> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("reader_feedback")
    .insert(toInsert(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data);
}

export async function fetchReaderFeedback(
  bookTitle?: string,
): Promise<ReaderFeedback[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  let query = supabase
    .from("reader_feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (bookTitle && bookTitle !== "all") {
    query = query.eq("book_title", bookTitle);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRow);
}

export function subscribeReaderFeedback(
  onChange: () => void,
): () => void {
  if (!isSupabaseConfigured()) {
    return () => undefined;
  }

  const supabase = getSupabaseClient();
  const channel = supabase
    .channel("reader_feedback_admin")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reader_feedback" },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export { formatImprovementRate };
