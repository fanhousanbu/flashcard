import { useCallback } from 'react';
import { useDeckStore } from '../store/deckStore';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';
import type { Deck } from '../../../lib/types/deck';

export function useDecks() {
  const { decks, currentDeck, loading, setDecks, setCurrentDeck, setLoading, addDeck, updateDeck: updateDeckInStore, removeDeck } = useDeckStore();
  const { user } = useAuthStore();

  const loadDecks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await db.getActiveDecks(user.id);
      setDecks(data);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setDecks, setLoading]);

  // Removed the useEffect here to let the caller decide when to load
  // useEffect(() => {
  //   loadDecks();
  // }, [loadDecks]);

  const createDeck = async (name: string, description?: string, isPublic?: boolean) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const deck = await db.createDeck({
        user_id: user.id,
        name,
        description,
        is_public: isPublic,
      });
      addDeck(deck);
      return deck;
    } finally {
      setLoading(false);
    }
  };

  const updateDeck = async (deckId: string, updates: Partial<Deck>) => {
    setLoading(true);
    try {
      const updated = await db.updateDeck(deckId, updates);
      updateDeckInStore(deckId, updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const deleteDeck = async (deckId: string) => {
    setLoading(true);
    try {
      await db.softDeleteDeckWithCards(deckId);
      removeDeck(deckId);
    } finally {
      setLoading(false);
    }
  };

  const loadDeck = async (deckId: string) => {
    setLoading(true);
    try {
      const deck = await db.getDeckById(deckId);
      setCurrentDeck(deck);
      return deck;
    } finally {
      setLoading(false);
    }
  };

  return {
    decks,
    currentDeck,
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    loadDeck,
    loadDecks,
    setCurrentDeck,
  };
}

