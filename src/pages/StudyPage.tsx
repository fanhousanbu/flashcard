import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStudySession } from '../features/study/hooks/useStudySession';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { FlipCard } from '../components/common/FlipCard';
import { qualityColors } from '../features/study/algorithms/sm2';
import ReactMarkdown from 'react-markdown';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

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
  const [selectedMode, setSelectedMode] = useState<'spaced-repetition' | 'simple-review'>('spaced-repetition');
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

  const handleSelectMode = (mode: 'spaced-repetition' | 'simple-review') => {
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
                  {/* Radio button on the left */}
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

                  {/* Content */}
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
                  {/* Radio button on the left */}
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

                  {/* Content */}
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
            </div>

            {/* Start Learning Button - always visible */}
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

  return (
    <AppLayout>
      <div className="max-w-4xl px-4 mx-auto">
        {/* Top navigation area */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/decks/${deckId}`}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← {t('study.backToDeck')}
          </Link>
        </div>

        {/* Progress and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Progress display */}
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentIndex + 1} of {totalCards}
            </span>
            {/* Front/Back label */}
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              isFlipped
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {isFlipped ? t('study.back') : t('study.front')}
            </span>
          </div>

          {/* Helper function icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info(t('study.likeButton'))}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={t('study.likeButton')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              onClick={() => toast.info(t('study.dislikeButton'))}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={t('study.dislikeButton')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
            <button
              onClick={() => toast.info(t('study.reportButton'))}
              className="p-2 text-gray-600 transition-colors rounded-lg hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={t('study.reportButton')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Core interaction area - flip card */}
        <div className="mb-4">
          <FlipCard
          frontContent={
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{currentCard?.front_content || ''}</ReactMarkdown>
            </div>
          }
          backContent={
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{currentCard?.back_content || ''}</ReactMarkdown>
            </div>
          }
          isFlipped={isFlipped}
          onFlip={flipCard}
        />
        </div>

        {/* Bottom review feedback area */}
        <div className="mt-6 relative z-10">
          {!isFlipped ? (
            // Show front: display still learning, show answer, and mastered buttons
            <div className="space-y-2">
              {/* Mobile: compact horizontal, Desktop: full width horizontal */}
              <div className="flex justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleRate(0)}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:rounded-xl sm:flex-1"
                >
                  <span>😕</span>
                  <span>{t('study.stillLearning')}</span>
                </button>
                <button
                  onClick={flipCard}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:rounded-xl sm:flex-1"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('study.showAnswerShort')}</span>
                </button>
                <button
                  onClick={() => handleRate(5)}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:rounded-xl sm:flex-1"
                >
                  <span>😊</span>
                  <span>{t('study.mastered')}</span>
                </button>
              </div>

              {/* More quality options for spaced repetition mode */}
              {studyMode === 'spaced-repetition' && (
                <details className="group">
                  <summary className="py-1 text-xs text-center text-gray-600 cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                    {t('study.moreOptions')} ▼
                  </summary>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[1, 2, 3, 4].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => handleRate(quality)}
                        className={`${qualityColors[quality as keyof typeof qualityColors]} hover:opacity-90 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all`}
                      >
                        {t(`study.quality.${quality}`)}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            // Show back: display flip to front button
            <div className="flex justify-center">
              <button
                onClick={flipCard}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 transition-colors dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t('study.flipToFront')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom hint */}
        <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
          {studyMode === 'spaced-repetition' ? t('study.modeSpacedHint') : t('study.modeSimpleHint')}
        </div>
      </div>
    </AppLayout>
  );
}

