export type ReaderFeedbackRow = {
  id: string;
  age_group: string;
  gender: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_framework: string;
  worry: string;
  morning_score: number;
  today_action: string;
  evening_score: number;
  improvement_rate: number;
  today_reflection: string;
  today_learning: string;
  message_to_author: string;
  recommend_score: number;
  created_at: string;
  learning?: string;
};

export type ReaderFeedbackInsert = {
  age_group: string;
  gender: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_framework: string;
  worry: string;
  morning_score: number;
  today_action: string;
  evening_score: number;
  improvement_rate: number;
  today_reflection: string;
  today_learning: string;
  message_to_author: string;
  recommend_score: number;
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
