import { useState, useCallback } from 'react';
import type { Card, CardType, ClozeData } from '../../../lib/types/deck';
import * as db from '../../../lib/supabase/database';

interface CreateCardOptions {
  front_content: string;
  back_content: string;
  position: number;
  card_type?: CardType;
  cloze_data?: ClozeData | null;
}

export function useCards(deckId?: string) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCards = useCallback(async (id?: string) => {
    const targetId = id || deckId;
    if (!targetId) return;

    setLoading(true);
    try {
      const data = await db.getCardsByDeckId(targetId);
      setCards(data);
      return data;
    } catch (error) {
      console.error('Failed to load cards:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  const createCard = async (options: CreateCardOptions, targetDeckId?: string) => {
    const id = targetDeckId || deckId;
    if (!id) throw new Error('Deck ID is required');

    setLoading(true);
    try {
      const newCard = await db.createCard({
        deck_id: id,
        front_content: options.front_content,
        back_content: options.back_content,
        position: options.position,
        card_type: options.card_type || 'basic',
        cloze_data: options.cloze_data,
      });
      setCards((prev) => [...prev, newCard]);
      return newCard;
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    setLoading(true);
    try {
      const updated = await db.updateCard(cardId, updates);
      setCards((prev) => prev.map((card) => (card.id === cardId ? updated : card)));
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    setLoading(true);
    try {
      await db.softDeleteCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } finally {
      setLoading(false);
    }
  };

  const reorderCards = async (reorderedCards: Card[]) => {
    setLoading(true);
    try {
      const updates = reorderedCards.map((card, index) =>
        db.updateCard(card.id, { position: index })
      );
      await Promise.all(updates);
      setCards(reorderedCards);
    } finally {
      setLoading(false);
    }
  };

  return {
    cards,
    loading,
    loadCards,
    createCard,
    updateCard,
    deleteCard,
    reorderCards,
  };
}

