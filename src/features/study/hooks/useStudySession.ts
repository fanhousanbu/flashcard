// @ts-nocheck - Type inference issues with database return types
import { useCallback } from 'react';
import { useStudyStore } from '../store/studyStore';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';
import { calculateSM2 } from '../algorithms/sm2';
import { calculateFSRS, sm2QualityToFSRSRating } from '../algorithms/fsrs';
import type { StudyMode } from '../../../lib/types/study';
import { cardsToStudyCards, type StudyCard } from '../utils/studyCards';

export function useStudySession() {
  const {
    currentCard,
    currentIndex,
    totalCards,
    studyMode,
    isFlipped,
    sessionCards,
    setCurrentCard,
    setStudyMode,
    setSessionCards,
    flipCard,
    nextCard,
    previousCard,
    reset,
  } = useStudyStore();

  const { user } = useAuthStore();

  const startSession = useCallback(
    async (deckId: string, mode: StudyMode = 'spaced-repetition') => {
      if (!user) throw new Error('Not authenticated');

      reset();
      setStudyMode(mode);

      let cards;
      if (mode === 'spaced-repetition' || mode === 'fsrs') {
        // Load due cards
        const dueRecords = await db.getDueCards(user.id, deckId);
        cards = dueRecords.map((record: any) => record.cards).filter(Boolean);
      } else {
        // Load all cards
        cards = await db.getCardsByDeckId(deckId);
      }

      if (cards.length === 0) {
        throw new Error('No cards to review');
      }

      // Convert cards to study cards (expands cloze cards)
      const studyCards = cardsToStudyCards(cards);

      setSessionCards(studyCards);
      setCurrentCard(studyCards[0]);
    },
    [user, reset, setStudyMode, setSessionCards, setCurrentCard]
  );

  const rateCard = useCallback(
    async (quality: number) => {
      if (!user || !currentCard) return;

      if (quality === 0) {
        nextCard();
        return;
      }

      try {
        const isCorrect = quality >= 3; // A rating >= 3 is considered correct

        // For cloze cards, use the original card ID for study records
        const cardId = (currentCard as StudyCard).originalCardId || currentCard.id;

        if (studyMode === 'fsrs') {
          // FSRS mode: use FSRS algorithm
          const existingRecord = await db.getStudyRecord(user.id, cardId);

          const fsrsRating = sm2QualityToFSRSRating(quality);
          const fsrsResult = calculateFSRS(
            {
              stability: existingRecord?.stability || 0,
              difficulty: existingRecord?.difficulty || 5,
            },
            {
              rating: fsrsRating,
              answer_time_ms: 0, // TODO: track actual answer time
            }
          );

          // Update study record with FSRS results
          await db.upsertStudyRecord({
            user_id: user.id,
            card_id: cardId,
            stability: fsrsResult.card.stability,
            difficulty: fsrsResult.card.difficulty,
            next_review_date: fsrsResult.card.due.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            last_quality: quality,
            increment_total: true,
            increment_correct: isCorrect,
          });
        } else if (studyMode === 'spaced-repetition') {
          // Spaced repetition mode: use SM-2 algorithm
          const existingRecord = await db.getStudyRecord(user.id, cardId);

          const result = calculateSM2(
            quality,
            (existingRecord?.repetitions ?? 0) as number,
            (existingRecord?.interval ?? 1) as number,
            (existingRecord?.easiness_factor ?? 2.5) as number
          );

          // Update study record (including SM-2 algorithm results and statistics)
          await db.upsertStudyRecord({
            user_id: user.id,
            card_id: cardId,
            easiness_factor: result.easeFactor,
            interval: result.interval,
            repetitions: result.repetitions,
            next_review_date: result.nextReviewDate.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            last_quality: quality,
            increment_total: true,
            increment_correct: isCorrect,
          });
        } else {
          // Simple review mode: only update statistics and last reviewed time
          await db.upsertStudyRecord({
            user_id: user.id,
            card_id: cardId,
            last_reviewed_at: new Date().toISOString(),
            last_quality: quality,
            increment_total: true,
            increment_correct: isCorrect,
            // Do not update SM-2 related fields, use existing or default values
          });
        }

        // Move to next card
        nextCard();
      } catch (error) {
        console.error('Failed to rate card:', error);
        throw error;
      }
    },
    [user, currentCard, studyMode, nextCard]
  );

  const isSessionComplete = currentCard === null && sessionCards.length > 0;

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < sessionCards.length - 1;

  return {
    currentCard,
    currentIndex,
    totalCards,
    studyMode,
    isFlipped,
    sessionCards,
    isSessionComplete,
    canGoBack,
    canGoForward,
    startSession,
    flipCard,
    rateCard,
    nextCard,
    previousCard,
    reset,
  };
}

