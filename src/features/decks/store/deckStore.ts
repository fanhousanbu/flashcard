import { create } from 'zustand';
import type { Deck } from '../../../lib/types/deck';

interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  loading: boolean;
  setDecks: (decks: Deck[]) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  setLoading: (loading: boolean) => void;
  addDeck: (deck: Deck) => void;
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  removeDeck: (deckId: string) => void;
  reset: () => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  decks: [],
  currentDeck: null,
  loading: false,
  
  setDecks: (decks) => set({ decks }),
  setCurrentDeck: (deck) => set({ currentDeck: deck }),
  setLoading: (loading) => set({ loading }),
  
  addDeck: (deck) => set((state) => ({ decks: [deck, ...state.decks] })),
  
  updateDeck: (deckId, updates) => set((state) => ({
    decks: state.decks.map((deck) =>
      deck.id === deckId ? { ...deck, ...updates } : deck
    ),
    currentDeck:
      state.currentDeck?.id === deckId
        ? { ...state.currentDeck, ...updates }
        : state.currentDeck,
  })),
  
  removeDeck: (deckId) => set((state) => ({
    decks: state.decks.filter((deck) => deck.id !== deckId),
    currentDeck: state.currentDeck?.id === deckId ? null : state.currentDeck,
  })),
  
  reset: () => set({ decks: [], currentDeck: null, loading: false }),
}));

