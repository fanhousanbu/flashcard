import { create } from 'zustand';
import type { Card } from '../../../lib/types/card';
import type { StudyMode } from '../../../lib/types/study';

interface StudyState {
  currentCard: Card | null;
  currentIndex: number;
  totalCards: number;
  studyMode: StudyMode;
  isFlipped: boolean;
  sessionCards: Card[];

  setCurrentCard: (card: Card) => void;
  setCurrentIndex: (index: number) => void;
  setTotalCards: (total: number) => void;
  setStudyMode: (mode: StudyMode) => void;
  setIsFlipped: (flipped: boolean) => void;
  setSessionCards: (cards: Card[]) => void;
  flipCard: () => void;
  nextCard: () => void;
  previousCard: () => void;
  reset: () => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  currentCard: null,
  currentIndex: 0,
  totalCards: 0,
  studyMode: 'spaced-repetition',
  isFlipped: false,
  sessionCards: [],
  
  setCurrentCard: (card) => set({ currentCard: card, isFlipped: false }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setTotalCards: (total) => set({ totalCards: total }),
  setStudyMode: (mode) => set({ studyMode: mode }),
  setIsFlipped: (flipped) => set({ isFlipped: flipped }),
  setSessionCards: (cards) => set({ sessionCards: cards, totalCards: cards.length }),
  flipCard: () => set((state) => ({ isFlipped: !state.isFlipped })),
  nextCard: () => {
    const { currentIndex, sessionCards } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex < sessionCards.length) {
      set({
        currentIndex: nextIndex,
        currentCard: sessionCards[nextIndex],
        isFlipped: false,
      });
    } else {
      set({ currentCard: null });
    }
  },
  previousCard: () => {
    const { currentIndex, sessionCards } = get();
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      set({
        currentIndex: prevIndex,
        currentCard: sessionCards[prevIndex],
        isFlipped: false,
      });
    }
  },
  reset: () => set({
    currentCard: null,
    currentIndex: 0,
    totalCards: 0,
    isFlipped: false,
    sessionCards: [],
  }),
}));

