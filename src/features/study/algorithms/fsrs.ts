/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 * Based on FSRS-v4 algorithm by Open Spaced Repetition
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 */

// Default FSRS parameters (17 weights)
const DEFAULT_W = [
  0.4,   // w0: initial stability for again
  0.6,   // w1: initial stability for hard
  2.4,   // w2: initial stability for good
  5.8,   // w3: initial stability for easy
  4.93,  // w4: next stability scale for again
  0.94,  // w5: next stability scale for hard
  0.86,  // w6: next stability scale for good
  0.01,  // w7: next stability scale for easy
  1.49,  // w8: difficulty scale for again
  0.14,  // w9: difficulty scale for hard
  -0.94, // w10: difficulty scale for good
  -0.71, // w11: difficulty scale for easy
  0.001, // w12: stability decay for hard
  0.32,  // w13: stability decay for good
  0.3,   // w14: stability decay for easy
  1.01,  // w15: difficulty increase for again
  0.5    // w16: difficulty increase for hard
];

export interface FSRSCard {
  stability: number;    // S: how long memory is retained (in days)
  difficulty: number;   // D: how hard the item is (0-10)
  due: Date;
  last_review?: Date;
}

export interface FSRSReview {
  rating: number;           // 1=Again, 2=Hard, 3=Good, 4=Easy
  answer_time_ms?: number;  // Time taken to answer
}

export interface FSRSResult {
  card: FSRSCard;
  review_log: {
    rating: number;
    answer_time_ms: number;
    stability: number;
    difficulty: number;
    due: Date;
  };
}

export interface FSRSConfig {
  request_retention: number;  // Target memory retention (0-1)
  maximum_interval: number;   // Maximum interval in days
  enable_fuzz: boolean;       // Add randomness to intervals
}

const DEFAULT_CONFIG: FSRSConfig = {
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: true,
};

/**
 * Calculate the next interval for a given stability and retention
 */
function nextInterval(stability: number, retention: number): number {
  return Math.max(1, Math.round(stability * 9 * (1 / retention - 1)));
}

/**
 * Calculate new difficulty based on current difficulty and rating
 */
function nextDifficulty(difficulty: number, rating: number): number {
  const D = difficulty;
  let nextD;

  if (rating === 1) { // Again
    nextD = D + DEFAULT_W[15];
  } else if (rating === 2) { // Hard
    nextD = D + DEFAULT_W[16] * (1 - D);
  } else if (rating === 3) { // Good
    nextD = D - DEFAULT_W[11] * (1 - D) - DEFAULT_W[9];
  } else { // Easy (rating === 4)
    nextD = D - DEFAULT_W[10] * (1 - D) - DEFAULT_W[12];
  }

  return Math.min(Math.max(nextD, 1), 10);
}

/**
 * Calculate initial stability based on rating
 */
function initialStability(rating: number): number {
  if (rating === 1) return DEFAULT_W[0];
  if (rating === 2) return DEFAULT_W[1];
  if (rating === 3) return DEFAULT_W[2];
  return DEFAULT_W[3];
}

/**
 * Calculate next stability based on current stability, difficulty, and rating
 */
function nextStability(stability: number, difficulty: number, rating: number): number {
  const S = stability;
  const D = difficulty;
  let nextS;

  if (rating === 1) { // Again
    nextS = S * DEFAULT_W[4];
  } else if (rating === 2) { // Hard
    nextS = S * (1 + DEFAULT_W[5]) * Math.pow(D, -DEFAULT_W[13]);
  } else if (rating === 3) { // Good
    nextS = S * (1 + DEFAULT_W[6]) * Math.pow(D, -DEFAULT_W[14]);
  } else { // Easy (rating === 4)
    nextS = S * (1 + DEFAULT_W[7]);
  }

  return Math.max(0.1, nextS);
}

/**
 * Apply fuzz factor to interval (add randomness)
 */
function applyFuzz(interval: number, enableFuzz: boolean): number {
  if (!enableFuzz) return interval;

  const fuzz = interval * 0.15; // 15% variance
  const randomOffset = (Math.random() - 0.5) * 2 * fuzz;
  return Math.max(1, Math.round(interval + randomOffset));
}

/**
 * Main FSRS calculation function
 * @param card - Current card state
 * @param review - Review parameters
 * @param config - FSRS configuration
 * @returns New card state with updated values
 */
export function calculateFSRS(
  card: Partial<FSRSCard>,
  review: FSRSReview,
  config: Partial<FSRSConfig> = {}
): FSRSResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { rating } = review;
  const { stability = 0, difficulty = 5 } = card;

  // Calculate new difficulty
  const newDifficulty = nextDifficulty(difficulty, rating);

  // Calculate new stability
  const newStability = stability === 0
    ? initialStability(rating)
    : nextStability(stability, difficulty, rating);

  // Calculate next interval
  const interval = nextInterval(newStability, finalConfig.request_retention);
  const fuzzedInterval = Math.min(
    applyFuzz(interval, finalConfig.enable_fuzz),
    finalConfig.maximum_interval
  );

  // Calculate next due date
  const now = new Date();
  const nextDue = new Date(now);
  nextDue.setDate(nextDue.getDate() + fuzzedInterval);

  return {
    card: {
      stability: newStability,
      difficulty: newDifficulty,
      due: nextDue,
      last_review: now,
    },
    review_log: {
      rating,
      answer_time_ms: review.answer_time_ms || 0,
      stability: newStability,
      difficulty: newDifficulty,
      due: nextDue,
    },
  };
}

/**
 * Get the label for a rating
 */
export function getFSRSRatingLabel(rating: number): string {
  switch (rating) {
    case 1: return 'Again';
    case 2: return 'Hard';
    case 3: return 'Good';
    case 4: return 'Easy';
    default: return 'Unknown';
  }
}

/**
 * Get the color for a rating button
 */
export function getFSRSRatingColor(rating: number): string {
  switch (rating) {
    case 1: return 'bg-red-500 hover:bg-red-600';
    case 2: return 'bg-orange-500 hover:bg-orange-600';
    case 3: return 'bg-green-500 hover:bg-green-600';
    case 4: return 'bg-blue-500 hover:bg-blue-600';
    default: return 'bg-gray-500 hover:bg-gray-600';
  }
}

/**
 * Convert SM-2 quality rating (0-5) to FSRS rating (1-4)
 */
export function sm2QualityToFSRSRating(quality: number): number {
  if (quality <= 0) return 1;  // Again
  if (quality === 1 || quality === 2) return 2;  // Hard
  if (quality === 3) return 3;  // Good
  return 4;  // Easy (quality 4 or 5)
}

/**
 * Convert FSRS rating (1-4) to SM-2 quality rating (0-5)
 */
export function fsrsRatingToSM2Quality(rating: number): number {
  switch (rating) {
    case 1: return 0;  // Again
    case 2: return 2;  // Hard
    case 3: return 3;  // Good
    case 4: return 5;  // Easy
    default: return 0;
  }
}
