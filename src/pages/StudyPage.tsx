import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStudySession } from '../features/study/hooks/useStudySession';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';
import type { StudyCard as StudyCardType } from '../features/study/utils/studyCards';

// New Components
import { StudyHeader } from '../features/study/components/StudyHeader';
import { StudyControls } from '../features/study/components/StudyControls';
import { StudyCard } from '../features/study/components/StudyCard';
import { SwipeableStudyCard } from '../features/study/components/SwipeableStudyCard';

export function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    currentCard,
    currentIndex,
    totalCards,
    studyMode,
    isFlipped,
    isSessionComplete,
    startSession,
    flipCard,
    rateCard,
    reset,
  } = useStudySession();

  // State for mode selection before starting session
  const [selectedMode, setSelectedMode] = useState<'spaced-repetition' | 'simple-review' | 'fsrs'>('fsrs');
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [showNoDueCards, setShowNoDueCards] = useState(false);

  // Reset study state when component unmounts
  useEffect(() => {
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartSession = async () => {
    if (!deckId) return;
    setIsStarting(true);
    setShowNoDueCards(false);
    try {
      await startSession(deckId, selectedMode);
      setShowModeSelection(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Loading failed';

      // If SM-2 mode has no due cards, show friendly hint inline
      if ((message.includes('No cards due for review') || message.includes('No cards to review')) && selectedMode === 'spaced-repetition') {
        setShowNoDueCards(true);
        setShowModeSelection(false);
      } else if (message.includes('No cards found')) {
        toast.error(t('study.noCardsInDeck'));
        setTimeout(() => navigate(`/decks/${deckId}`), 2000);
      } else {
        toast.error(message);
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectMode = (mode: 'spaced-repetition' | 'simple-review' | 'fsrs') => {
    setSelectedMode(mode);
  };

  const handleRate = async (quality: number) => {
    try {
      await rateCard(quality);
    } catch {
      toast.error(t('study.rateFailed'));
    }
  };

  // Show loading while starting session
  if (isStarting) {
    return <Loading />;
  }

  // Show "no due cards" message for SM-2 mode
  if (showNoDueCards) {
    return (
      <AppLayout>
        <div className="max-w-2xl px-4 mx-auto">
          <Link
            to={`/decks/${deckId}`}
            className="inline-block mb-6 font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← {t('study.backToDeck')}
          </Link>
          <div className="p-8 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-6xl">📭</div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{t('study.noCardsToStudy')}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t('study.noCardsMessage')}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to={`/decks/${deckId}`}
                className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t('study.backToDeck')}
              </Link>
              <button
                onClick={() => {
                  setShowNoDueCards(false);
                  setShowModeSelection(true);
                }}
                className="px-6 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                {t('study.selectMode')}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show session complete page after finishing all cards
  if (isSessionComplete) {
    return (
      <AppLayout>
        <div className="max-w-2xl px-4 mx-auto">
          <div className="p-8 text-center bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-6xl">🎉</div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">{t('study.sessionComplete')}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t('study.sessionCompleteMessage', { count: totalCards })}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to={`/decks/${deckId}`}
                className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t('study.backToDeck')}
              </Link>
              <button
                onClick={() => {
                  reset();
                  setShowModeSelection(true);
                }}
                className="px-6 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                {t('study.studyAgain')}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show mode selection page before starting
  if (showModeSelection) {
    return (
      <AppLayout>
        <div className="max-w-2xl px-4 mx-auto">
          <Link
            to={`/decks/${deckId}`}
            className="inline-block mb-6 font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← {t('study.backToDeck')}
          </Link>
          <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{t('study.selectMode')}</h1>
            <p className="mb-8 text-gray-600 dark:text-gray-400">{t('study.modeDescription')}</p>

            <div className="space-y-3">
              {/* Spaced Repetition Mode */}
              <button
                onClick={() => handleSelectMode('spaced-repetition')}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedMode === 'spaced-repetition'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedMode === 'spaced-repetition'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMode === 'spaced-repetition' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl shrink-0">🧠</span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {t('study.modeSpacedTitle')}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {t('study.modeSpacedDesc')}
                    </p>
                  </div>
                </div>
              </button>

              {/* Simple Review Mode */}
              <button
                onClick={() => handleSelectMode('simple-review')}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedMode === 'simple-review'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedMode === 'simple-review'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMode === 'simple-review' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl shrink-0">📚</span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {t('study.modeSimpleTitle')}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {t('study.modeSimpleDesc')}
                    </p>
                  </div>
                </div>
              </button>

              {/* FSRS Mode */}
              <button
                onClick={() => handleSelectMode('fsrs')}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedMode === 'fsrs'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedMode === 'fsrs'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedMode === 'fsrs' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl shrink-0">⚡</span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        FSRS
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full">
                        New
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {t('study.modeFsrsDesc') || 'Next-generation spaced repetition with optimized memory retention'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8">
              <button
                onClick={handleStartSession}
                disabled={isStarting}
                className="w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isStarting ? t('common.loading') : t('study.startLearning')}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active Study Session
  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 h-[calc(100vh-140px)] flex flex-col">
        <StudyHeader
          deckId={deckId || ''}
          currentIndex={currentIndex}
          totalCards={totalCards}
          isFlipped={isFlipped}
          isCloze={(currentCard as unknown as StudyCardType)?.type === 'cloze'}
          clozeStep={
            (currentCard as unknown as StudyCardType)?.clozeFieldIndex !== undefined
              ? `${(currentCard as unknown as StudyCardType).clozeFieldIndex! + 1}/${(currentCard as unknown as StudyCardType).clozeTotalFields}`
              : undefined
          }
        />

        <div className="flex-1 flex flex-col justify-center">
          <SwipeableStudyCard
            onSwipeLeft={() => handleRate(0)} // Forgot / Again
            onSwipeRight={() => handleRate(4)} // Good
            onFlip={flipCard}
          >
            <StudyCard
              card={currentCard as unknown as StudyCardType}
              isFlipped={isFlipped}
              onFlip={flipCard}
            />
          </SwipeableStudyCard>
        </div>

        <StudyControls
          isFlipped={isFlipped}
          studyMode={studyMode}
          onFlip={flipCard}
          onRate={handleRate}
        />
      </div>
    </AppLayout>
  );
}
