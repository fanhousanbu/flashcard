import type { Card, ClozeData } from '@/lib/types/deck';

/**
 * Represents a virtual study card that can be either a basic card
 * or a single field from a cloze card
 */
export interface StudyCard {
  id: string; // Unique ID for this study card
  originalCardId: string; // Original card ID from database
  type: 'basic' | 'cloze';
  front: string;
  back: string;
  clozeData?: ClozeData;
  clozeFieldId?: string; // For cloze cards, which field this is (e.g., "c1")
  clozeFieldIndex?: number; // For display (0-indexed)
  clozeTotalFields?: number; // Total number of cloze fields
}

/**
 * Convert a database card to a study card
 * Basic cards become a single study card
 * Cloze cards become multiple study cards (one per field)
 */
export function cardToStudyCards(card: Card): StudyCard[] {
  if (card.card_type === 'cloze' && card.cloze_data) {
    // Expand cloze card into multiple study cards
    return card.cloze_data.fields.map((field, index) => ({
      id: `${card.id}-${field.id}`,
      originalCardId: card.id,
      type: 'cloze' as const,
      front: '', // Will be rendered dynamically
      back: '', // Will be rendered dynamically
      clozeData: card.cloze_data || undefined,
      clozeFieldId: field.id,
      clozeFieldIndex: index,
      clozeTotalFields: card.cloze_data?.fields.length || 0,
    }));
  }

  // Basic card
  return [{
    id: card.id,
    originalCardId: card.id,
    type: 'basic' as const,
    front: card.front_content,
    back: card.back_content,
  }];
}

/**
 * Convert an array of database cards to study cards
 */
export function cardsToStudyCards(cards: Card[]): StudyCard[] {
  const studyCards: StudyCard[] = [];

  for (const card of cards) {
    studyCards.push(...cardToStudyCards(card));
  }

  return studyCards;
}

/**
 * Get the display label for a cloze field
 */
export function getClozeFieldLabel(studyCard: StudyCard): string {
  if (studyCard.type !== 'cloze') return '';

  const fieldNum = (studyCard.clozeFieldIndex || 0) + 1;
  const total = studyCard.clozeTotalFields || 1;
  return `Cloze ${fieldNum}/${total}`;
}
