export type StudyRecord = {
  id: string;
  user_id: string;
  card_id: string;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  // New statistical fields
  total_reviews: number;
  correct_reviews: number;
  last_quality: number | null;
  created_at: string;
  updated_at: string;
};

export type SM2Result = {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: Date;
};

export type StudyMode = 'spaced-repetition' | 'simple-review';

export type StudySession = {
  deckId: string;
  cards: Card[];
  currentIndex: number;
  mode: StudyMode;
};

export type Card = {
  id: string;
  deck_id: string;
  front_content: string;
  back_content: string;
  position: number;
  created_at: string;
  deleted_at: string | null;
};

// Type for the study_sessions table in the database
export type StudySessionRecord = {
  id: string;
  user_id: string;
  deck_id: string;
  study_mode: StudyMode;
  cards_studied: number;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
};

// Overall user study statistics
export type UserStats = {
  totalCards: number;
  studiedCards: number;
  totalReviews: number;
  correctReviews: number;
  successRate: number;
};

// Deck study statistics
export type DeckStats = {
  totalCards: number;
  studiedCards: number;
  totalReviews: number;
  correctReviews: number;
  averageEasiness: number;
  successRate: number;
};

// Study session (with deck information)
export type StudySessionWithDeck = {
  id: string;
  user_id: string;
  deck_id: string;
  study_mode: string;
  cards_studied: number;
  duration_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  decks: {
    name: string;
  } | null;
};

