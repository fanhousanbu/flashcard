import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, formatRelativeTime, isDue, getDaysUntil } from './dateHelpers';

describe('Date Helpers', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-15 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = '2024-01-15';
      const result = formatDate(date);
      
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should format date with custom format', () => {
      const date = '2024-01-15';
      const result = formatDate(date, 'yyyy/MM/dd');
      
      expect(result).toBe('2024/01/15');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time', () => {
      const pastDate = new Date('2024-01-10');
      const result = formatRelativeTime(pastDate);
      
      expect(result).toContain('ago');
    });

    it('should handle date strings', () => {
      const date = '2024-01-10';
      const result = formatRelativeTime(date);
      
      expect(typeof result).toBe('string');
    });
  });

  describe('isDue', () => {
    it('should return true if the date is today', () => {
      const today = new Date('2024-01-15T12:00:00Z');
      expect(isDue(today)).toBe(true);
    });

    it('should return true if the date is in the past', () => {
      const pastDate = new Date('2024-01-10');
      expect(isDue(pastDate)).toBe(true);
    });

    it('should return false if the date is in the future', () => {
      const futureDate = new Date('2024-01-20');
      expect(isDue(futureDate)).toBe(false);
    });

    it('should handle date strings', () => {
      expect(isDue('2024-01-10')).toBe(true);
      expect(isDue('2024-01-20')).toBe(false);
    });
  });

  describe('getDaysUntil', () => {
    it('should calculate days until a future date', () => {
      const futureDate = new Date('2024-01-20');
      const days = getDaysUntil(futureDate);
      
      expect(days).toBe(5);
    });

    it('should return a negative number for past dates', () => {
      const pastDate = new Date('2024-01-10');
      const days = getDaysUntil(pastDate);
      
      expect(days).toBeLessThan(0);
    });

    it('should return 0 for today', () => {
      const today = new Date('2024-01-15T12:00:00Z');
      const days = getDaysUntil(today);
      
      expect(days).toBe(0);
    });

    it('should handle date strings', () => {
      const days = getDaysUntil('2024-01-20');
      expect(days).toBe(5);
    });
  });
});

