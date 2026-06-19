export type ReaderFeedbackRow = {
  id: string;
  reader_name: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_framework: string;
  worry: string;
  morning_score: number;
  today_action: string;
  evening_score: number;
  improvement_rate: number;
  learning: string;
  message_to_author: string;
  created_at: string;
};

export type ReaderFeedbackInsert = {
  reader_name?: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_framework: string;
  worry: string;
  morning_score: number;
  today_action: string;
  evening_score: number;
  improvement_rate: number;
  learning: string;
  message_to_author: string;
};

export type Database = {
  public: {
    Tables: {
      reader_feedback: {
        Row: ReaderFeedbackRow;
        Insert: ReaderFeedbackInsert;
        Update: Partial<ReaderFeedbackInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
