export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          default_study_mode: 'spaced' | 'simple';
          daily_goal_cards: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_study_mode?: 'spaced' | 'simple';
          daily_goal_cards?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_study_mode?: 'spaced' | 'simple';
          daily_goal_cards?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          front_content: string;
          back_content: string;
          position: number;
          created_at: string;
          deleted_at: string | null;
          card_type: 'basic' | 'cloze';
          cloze_data: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          deck_id: string;
          front_content: string;
          back_content: string;
          position: number;
          created_at?: string;
          deleted_at?: string | null;
          card_type?: 'basic' | 'cloze';
          cloze_data?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          deck_id?: string;
          front_content?: string;
          back_content?: string;
          position?: number;
          created_at?: string;
          deleted_at?: string | null;
          card_type?: 'basic' | 'cloze';
          cloze_data?: Record<string, unknown> | null;
        };
      };
      study_records: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          easiness_factor: number;
          interval: number;
          repetitions: number;
          next_review_date: string;
          last_reviewed_at: string | null;
          last_quality: number | null;
          total_reviews: number;
          correct_reviews: number;
          stability: number;
          difficulty: number;
          answer_time_ms: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          easiness_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review_date?: string;
          last_reviewed_at?: string | null;
          last_quality?: number | null;
          total_reviews?: number;
          correct_reviews?: number;
          stability?: number;
          difficulty?: number;
          answer_time_ms?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          easiness_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review_date?: string;
          last_reviewed_at?: string | null;
          last_quality?: number | null;
          total_reviews?: number;
          correct_reviews?: number;
          stability?: number;
          difficulty?: number;
          answer_time_ms?: number;
        };
      };
      marketplace_decks: {
        Row: {
          id: string;
          deck_id: string;
          author_id: string;
          title: string;
          description: string | null;
          price: number;
          download_count: number;
          rating: number;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          deck_id: string;
          author_id: string;
          title: string;
          description?: string | null;
          price?: number;
          download_count?: number;
          rating?: number;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          deck_id?: string;
          author_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          download_count?: number;
          rating?: number;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          marketplace_deck_id: string;
          amount: number;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          marketplace_deck_id: string;
          amount: number;
          purchased_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          marketplace_deck_id?: string;
          amount?: number;
          purchased_at?: string;
        };
      };
    };
  };
};

