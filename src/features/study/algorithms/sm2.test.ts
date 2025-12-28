import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('SM-2 Algorithm', () => {
  describe('calculateSM2', () => {
    it('should correctly handle first learning (quality 5)', () => {
      const result = calculateSM2(5, 0, 0, 2.5);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });

    it('should correctly handle first learning (quality 4)', () => {
      const result = calculateSM2(4, 0, 0, 2.5);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.0);
    });

    it('should correctly handle second review (quality 5)', () => {
      const result = calculateSM2(5, 1, 1, 2.5);
      
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('should correctly handle third and subsequent reviews', () => {
      const result = calculateSM2(5, 2, 6, 2.5);
      
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(6);
      expect(result.interval).toBe(Math.round(6 * result.easeFactor));
    });

    it('should reset progress when quality is less than 3', () => {
      const result = calculateSM2(2, 5, 30, 2.5);
      
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('should maintain minimum ease factor of 1.3', () => {
      const result = calculateSM2(0, 0, 0, 2.5);
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should correctly calculate next review date', () => {
      const result = calculateSM2(5, 0, 0, 2.5);
      const today = new Date();
      const expectedDate = new Date();
      expectedDate.setDate(today.getDate() + 1);
      
      expect(result.nextReviewDate.getDate()).toBe(expectedDate.getDate());
    });

    it('should handle different quality ratings', () => {
      const qualities = [0, 1, 2, 3, 4, 5];
      
      qualities.forEach(quality => {
        const result = calculateSM2(quality, 0, 0, 2.5);
        
        expect(result.interval).toBeGreaterThanOrEqual(0);
        expect(result.repetitions).toBeGreaterThanOrEqual(0);
        expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
        expect(result.nextReviewDate).toBeInstanceOf(Date);
      });
    });

    it('should correctly calculate ease factor changes', () => {
      // High quality answers should increase ease factor
      const highQuality = calculateSM2(5, 1, 1, 2.5);

      // Low quality answers should decrease ease factor
      const lowQuality = calculateSM2(1, 1, 1, 2.5);
      
      expect(highQuality.easeFactor).toBeGreaterThan(2.5);
      expect(lowQuality.easeFactor).toBeLessThan(2.5);
    });

    it('should handle edge case: quality rating 3', () => {
      const result = calculateSM2(3, 0, 0, 2.5);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });
  });
});

