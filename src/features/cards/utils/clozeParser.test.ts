import { describe, it, expect } from 'vitest';
import {
  parseCloze,
  renderClozeFront,
  renderClozeBack,
  getClozeFieldCount,
  validateCloze,
  generateClozeCards,
  getClozeFieldLabel,
} from './clozeParser';

describe('clozeParser', () => {
  describe('parseCloze', () => {
    it('should parse simple cloze deletions', () => {
      const text = '{{c1::Paris}} is the capital of {{c2::France}}';
      const result = parseCloze(text);

      expect(result.original).toBe(text);
      expect(result.fields).toHaveLength(2);
      expect(result.fields[0]).toEqual({ id: 'c1', answer: 'Paris', hint: undefined });
      expect(result.fields[1]).toEqual({ id: 'c2', answer: 'France', hint: undefined });
    });

    it('should parse cloze deletions with hints', () => {
      const text = '{{c1::Eiffel Tower::hint: landmark}} is in {{c2::Paris}}';
      const result = parseCloze(text);

      expect(result.fields).toHaveLength(2);
      expect(result.fields[0]).toEqual({
        id: 'c1',
        answer: 'Eiffel Tower',
        hint: 'hint: landmark',
      });
      expect(result.fields[1]).toEqual({ id: 'c2', answer: 'Paris', hint: undefined });
    });

    it('should handle special characters in answers', () => {
      const text = '{{c1::Hello, world!}} contains {{c2::special @#$ characters}}';
      const result = parseCloze(text);

      expect(result.fields[0].answer).toBe('Hello, world!');
      expect(result.fields[1].answer).toBe('special @#$ characters');
    });

    it('should handle Chinese text', () => {
      const text = '{{c1::巴黎}}是{{c2::法国}}的首都';
      const result = parseCloze(text);

      expect(result.fields[0].answer).toBe('巴黎');
      expect(result.fields[1].answer).toBe('法国');
    });

    it('should return empty fields for text without cloze deletions', () => {
      const text = 'This is plain text with no cloze deletions';
      const result = parseCloze(text);

      expect(result.fields).toHaveLength(0);
    });
  });

  describe('renderClozeFront', () => {
    const data = {
      original: '{{c1::Paris}} is the capital of {{c2::France}}',
      fields: [
        { id: 'c1', answer: 'Paris', hint: undefined },
        { id: 'c2', answer: 'France', hint: undefined },
      ],
    };

    it('should render blank for specified field', () => {
      const result = renderClozeFront(data, 'c1');
      expect(result).toBe('[...] is the capital of France');
    });

    it('should render blank for different field', () => {
      const result = renderClozeFront(data, 'c2');
      expect(result).toBe('Paris is the capital of [...]');
    });

    it('should render all blanks for non-existent field', () => {
      const result = renderClozeFront(data, 'c999');
      expect(result).toBe('[...] is the capital of [...]');
    });
  });

  describe('renderClozeBack', () => {
    const data = {
      original: '{{c1::Paris}} is the capital of {{c2::France}}',
      fields: [
        { id: 'c1', answer: 'Paris', hint: undefined },
        { id: 'c2', answer: 'France', hint: undefined },
      ],
    };

    it('should reveal answer for specified field', () => {
      const result = renderClozeBack(data, 'c1');
      expect(result).toBe('**Paris** is the capital of France');
    });

    it('should reveal answer for different field', () => {
      const result = renderClozeBack(data, 'c2');
      expect(result).toBe('Paris is the capital of **France**');
    });

    it('should reveal all answers for non-existent field', () => {
      const result = renderClozeBack(data, 'c999');
      expect(result).toBe('Paris is the capital of France');
    });
  });

  describe('getClozeFieldCount', () => {
    it('should count cloze fields correctly', () => {
      expect(getClozeFieldCount('{{c1::a}}{{c2::b}}{{c3::c}}')).toBe(3);
      expect(getClozeFieldCount('No cloze here')).toBe(0);
      expect(getClozeFieldCount('{{c1::only one}}')).toBe(1);
    });
  });

  describe('validateCloze', () => {
    it('should validate correct cloze syntax', () => {
      const result = validateCloze('{{c1::Paris}} is {{c2::France}}');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unbalanced braces', () => {
      const result = validateCloze('{{c1::Paris is {{c2::France}}');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Unbalanced'))).toBe(true);
    });

    it('should detect empty cloze fields', () => {
      const result = validateCloze('{{c1::}} empty');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Empty'))).toBe(true);
    });

    it('should detect duplicate cloze IDs', () => {
      const result = validateCloze('{{c1::a}}{{c1::b}}');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('should detect invalid cloze format', () => {
      const result = validateCloze('{{cx::invalid}}');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid'))).toBe(true);
    });
  });

  describe('generateClozeCards', () => {
    it('should generate card IDs for each field', () => {
      const data = {
        original: '{{c1::a}}{{c2::b}}{{c3::c}}',
        fields: [
          { id: 'c1', answer: 'a' },
          { id: 'c2', answer: 'b' },
          { id: 'c3', answer: 'c' },
        ],
      };

      const result = generateClozeCards(data);
      expect(result).toEqual(['c1', 'c2', 'c3']);
    });
  });

  describe('getClozeFieldLabel', () => {
    it('should return human-readable labels', () => {
      expect(getClozeFieldLabel('c1')).toBe('Cloze 1');
      expect(getClozeFieldLabel('c2')).toBe('Cloze 2');
      expect(getClozeFieldLabel('c10')).toBe('Cloze 10');
    });
  });
});
