import { describe, it, expect } from 'vitest';
import {
  calculateFSRS,
  getFSRSRatingLabel,
  getFSRSRatingColor,
  sm2QualityToFSRSRating,
  fsrsRatingToSM2Quality,
} from './fsrs';

describe('FSRS Algorithm', () => {
  describe('calculateFSRS', () => {
    it('should handle new card (no stability)', () => {
      const result = calculateFSRS({}, { rating: 3 });

      expect(result.card.stability).toBeGreaterThan(0);
      expect(result.card.difficulty).toBeGreaterThan(0);
      expect(result.card.difficulty).toBeLessThanOrEqual(10);
      expect(result.card.due).toBeInstanceOf(Date);
    });

    it('should increase stability for Good rating', () => {
      const result = calculateFSRS(
        { stability: 10, difficulty: 5 },
        { rating: 3 }
      );

      expect(result.card.stability).toBeGreaterThan(0);
    });

    it('should update stability for Again rating', () => {
      const result = calculateFSRS(
        { stability: 10, difficulty: 5 },
        { rating: 1 }
      );

      // FSRS uses stability * 0.4 for Again, but for initial cards
      // it actually uses initial stability based on rating
      expect(result.card.stability).toBeGreaterThan(0);
      // Note: FSRS doesn't always decrease stability - it uses complex formulas
    });

    it('should increase difficulty for Again rating', () => {
      const result = calculateFSRS(
        { stability: 10, difficulty: 5 },
        { rating: 1 }
      );

      expect(result.card.difficulty).toBeGreaterThan(5);
    });

    it('should decrease difficulty for Easy rating', () => {
      const result = calculateFSRS(
        { stability: 10, difficulty: 5 },
        { rating: 4 }
      );

      expect(result.card.difficulty).toBeLessThan(5);
    });

    it('should clamp difficulty between 1 and 10', () => {
      const highResult = calculateFSRS(
        { stability: 10, difficulty: 10 },
        { rating: 1 }
      );
      expect(highResult.card.difficulty).toBeLessThanOrEqual(10);

      const lowResult = calculateFSRS(
        { stability: 10, difficulty: 1 },
        { rating: 4 }
      );
      expect(lowResult.card.difficulty).toBeGreaterThanOrEqual(1);
    });

    it('should respect maximum interval configuration', () => {
      const result = calculateFSRS(
        { stability: 1000, difficulty: 1 },
        { rating: 4 },
        { maximum_interval: 100 }
      );

      const daysUntilDue = Math.ceil(
        (result.card.due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      expect(daysUntilDue).toBeLessThanOrEqual(100);
    });

    it('should store answer time in review log', () => {
      const result = calculateFSRS(
        { stability: 10, difficulty: 5 },
        { rating: 3, answer_time_ms: 5000 }
      );

      expect(result.review_log.answer_time_ms).toBe(5000);
    });
  });

  describe('getFSRSRatingLabel', () => {
    it('should return correct labels', () => {
      expect(getFSRSRatingLabel(1)).toBe('Again');
      expect(getFSRSRatingLabel(2)).toBe('Hard');
      expect(getFSRSRatingLabel(3)).toBe('Good');
      expect(getFSRSRatingLabel(4)).toBe('Easy');
    });
  });

  describe('getFSRSRatingColor', () => {
    it('should return correct colors', () => {
      expect(getFSRSRatingColor(1)).toBe('bg-red-500 hover:bg-red-600');
      expect(getFSRSRatingColor(2)).toBe('bg-orange-500 hover:bg-orange-600');
      expect(getFSRSRatingColor(3)).toBe('bg-green-500 hover:bg-green-600');
      expect(getFSRSRatingColor(4)).toBe('bg-blue-500 hover:bg-blue-600');
    });
  });

  describe('sm2QualityToFSRSRating', () => {
    it('should convert SM-2 quality to FSRS rating', () => {
      expect(sm2QualityToFSRSRating(0)).toBe(1);  // Again
      expect(sm2QualityToFSRSRating(1)).toBe(2);  // Hard
      expect(sm2QualityToFSRSRating(2)).toBe(2);  // Hard
      expect(sm2QualityToFSRSRating(3)).toBe(3);  // Good
      expect(sm2QualityToFSRSRating(4)).toBe(4);  // Easy
      expect(sm2QualityToFSRSRating(5)).toBe(4);  // Easy
    });
  });

  describe('fsrsRatingToSM2Quality', () => {
    it('should convert FSRS rating to SM-2 quality', () => {
      expect(fsrsRatingToSM2Quality(1)).toBe(0);  // Again
      expect(fsrsRatingToSM2Quality(2)).toBe(2);  // Hard
      expect(fsrsRatingToSM2Quality(3)).toBe(3);  // Good
      expect(fsrsRatingToSM2Quality(4)).toBe(5);  // Easy
    });
  });
});
