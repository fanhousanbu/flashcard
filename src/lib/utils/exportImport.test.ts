import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportDeck, parseImportData, downloadDeck } from './exportImport';
import type { Deck, Card } from '../types/deck';

describe('Export/Import Functions', () => {
  const mockDeck: Deck = {
    id: 'deck-1',
    user_id: 'user-1',
    name: 'Test Deck',
    description: 'Test Description',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
  };

  const mockCards: Card[] = [
    {
      id: 'card-1',
      deck_id: 'deck-1',
      front_content: 'Front 1',
      back_content: 'Back 1',
      position: 0,
      created_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
    },
    {
      id: 'card-2',
      deck_id: 'deck-1',
      front_content: 'Front 2',
      back_content: 'Back 2',
      position: 1,
      created_at: '2024-01-01T00:00:00Z',
      deleted_at: null,
    },
  ];

  describe('exportDeck', () => {
    it('should export deck data correctly', () => {
      const result = exportDeck(mockDeck, mockCards);
      const parsed = JSON.parse(result);

      expect(parsed.deck.name).toBe('Test Deck');
      expect(parsed.deck.description).toBe('Test Description');
      expect(parsed.deck.is_public).toBe(false);
      expect(parsed.cards).toHaveLength(2);
    });

    it('should exclude sensitive fields', () => {
      const result = exportDeck(mockDeck, mockCards);
      const parsed = JSON.parse(result);

      expect(parsed.deck.id).toBeUndefined();
      expect(parsed.deck.user_id).toBeUndefined();
      expect(parsed.deck.created_at).toBeUndefined();
      expect(parsed.deck.deleted_at).toBeUndefined();
    });

    it('should export card data correctly', () => {
      const result = exportDeck(mockDeck, mockCards);
      const parsed = JSON.parse(result);

      expect(parsed.cards[0].front_content).toBe('Front 1');
      expect(parsed.cards[0].back_content).toBe('Back 1');
      expect(parsed.cards[0].position).toBe(0);
    });

    it('should exclude sensitive fields from cards', () => {
      const result = exportDeck(mockDeck, mockCards);
      const parsed = JSON.parse(result);

      expect(parsed.cards[0].id).toBeUndefined();
      expect(parsed.cards[0].deck_id).toBeUndefined();
      expect(parsed.cards[0].created_at).toBeUndefined();
      expect(parsed.cards[0].deleted_at).toBeUndefined();
    });

    it('should handle empty cards array', () => {
      const result = exportDeck(mockDeck, []);
      const parsed = JSON.parse(result);

      expect(parsed.cards).toEqual([]);
    });
  });

  describe('parseImportData', () => {
    it('should parse valid import data correctly', () => {
      const validData = {
        deck: {
          name: 'Imported Deck',
          description: 'Imported Description',
          is_public: true,
        },
        cards: [
          {
            front_content: 'Front',
            back_content: 'Back',
            position: 0,
          },
        ],
      };

      const json = JSON.stringify(validData);
      const result = parseImportData(json);

      expect(result.deck.name).toBe('Imported Deck');
      expect(result.cards).toHaveLength(1);
    });

    it('should throw error when deck field is missing', () => {
      const invalidData = {
        cards: [],
      };

      expect(() => {
        parseImportData(JSON.stringify(invalidData));
      }).toThrow('Invalid deck format');
    });

    it('should throw error when cards field is missing', () => {
      const invalidData = {
        deck: {
          name: 'Test',
        },
      };

      expect(() => {
        parseImportData(JSON.stringify(invalidData));
      }).toThrow('Invalid deck format');
    });

    it('should throw error when deck.name is missing', () => {
      const invalidData = {
        deck: {
          description: 'Test',
        },
        cards: [],
      };

      expect(() => {
        parseImportData(JSON.stringify(invalidData));
      }).toThrow('Deck name is required');
    });

    it('should throw error when cards is not an array', () => {
      const invalidData = {
        deck: {
          name: 'Test',
        },
        cards: 'not an array',
      };

      expect(() => {
        parseImportData(JSON.stringify(invalidData));
      }).toThrow('Cards must be an array');
    });

    it('should throw error when JSON format is invalid', () => {
      expect(() => {
        parseImportData('invalid json');
      }).toThrow('Failed to parse import data');
    });
  });

  describe('downloadDeck', () => {
    beforeEach(() => {
      // Mock DOM APIs
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document.createElement
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    });

    it('should create download link and trigger download', () => {
      downloadDeck(mockDeck, mockCards);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});

