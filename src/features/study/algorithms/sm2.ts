import type { SM2Result } from '../../../lib/types/study';

/**
 * SM-2 Algorithm Implementation - for spaced repetition learning.
 * @param quality User's answer quality (0-5).
 *   5: Perfect recall.
 *   4: Correct but with hesitation.
 *   3: Correct but with difficulty.
 *   2: Incorrect but seems familiar.
 *   1: Incorrect but had an impression.
 *   0: Complete blackout.
 * @param repetitions Current number of repetitions.
 * @param interval Current interval in days.
 * @param easeFactor Current ease factor.
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  interval: number,
  easeFactor: number
): SM2Result {
  // Calculate new ease factor.
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // The minimum ease factor is 1.3.
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newRepetitions = repetitions;
  let newInterval = interval;

  // If the quality of the answer is less than 3, reset the learning progress.
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;

    // Calculate interval based on repetitions.
    if (newRepetitions === 1) {
      newInterval = 1; // First time: review after 1 day.
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second time: review after 6 days.
    } else {
      // Afterwards: interval = last interval * ease factor.
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calculate next review date.
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReviewDate,
  };
}

/**
 * Quality rating colors only (labels should use i18n in components).
 */
export const qualityColors = {
  0: 'bg-red-500',
  1: 'bg-orange-500',
  2: 'bg-yellow-500',
  3: 'bg-blue-400',
  4: 'bg-green-500',
  5: 'bg-emerald-600',
};

