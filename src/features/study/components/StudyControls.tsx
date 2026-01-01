import { useTranslation } from 'react-i18next';


interface StudyControlsProps {
  isFlipped: boolean;
  studyMode: string;
  onFlip: () => void;
  onRate: (quality: number) => void;
}

export function StudyControls({ 
  isFlipped, 
  studyMode, 
  onFlip, 
  onRate 
}: StudyControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 sm:mt-6 relative z-10 w-full max-w-md mx-auto">

      <div className="min-h-[200px] flex flex-col">
        {!isFlipped ? (
          // Show front: display still learning, show answer, and mastered buttons
          <div className="space-y-4">
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-2 animate-pulse">
              {t('study.tapToFlip') || 'Tap card to flip'}
            </div>
            
            {/* Mobile: compact horizontal, Desktop: full width horizontal */}
            <div className="flex justify-center gap-2 sm:gap-3">
              <button
                onClick={() => onRate(0)}
                className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-sm flex-1"
              >
                <span>😕</span>
                <span>{t('study.stillLearning')}</span>
              </button>
              <button
                onClick={onFlip}
                className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t('study.showAnswerShort')}</span>
              </button>
              <button
                onClick={() => onRate(5)}
                className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all shadow-sm flex-1"
              >
                <span>😊</span>
                <span>{t('study.mastered')}</span>
              </button>
            </div>


          </div>
        ) : (
          // Show back: display rating buttons and flip to front button
          <div className="space-y-4">
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-2">
              {t('study.swipeHint') || 'Swipe card left/right or use buttons'}
            </div>
            
            {/* Rating buttons */}
            
            {/* Rating buttons */}
            {studyMode === 'fsrs' || studyMode === 'spaced-repetition' ? (
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onRate(studyMode === 'fsrs' ? 1 : 0)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors group"
                >
                  <span className="text-2xl mb-1 transition-transform group-hover:scale-110">😫</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                    {t('study.fsrs.again')}
                  </span>
                </button>

                <button
                  onClick={() => onRate(studyMode === 'fsrs' ? 2 : 3)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 transition-colors group"
                >
                  <span className="text-2xl mb-1 transition-transform group-hover:scale-110">😐</span>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    {t('study.fsrs.hard')}
                  </span>
                </button>

                <button
                  onClick={() => onRate(studyMode === 'fsrs' ? 3 : 4)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors group"
                >
                  <span className="text-2xl mb-1 transition-transform group-hover:scale-110">🙂</span>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                    {t('study.fsrs.good')}
                  </span>
                </button>

                <button
                  onClick={() => onRate(studyMode === 'fsrs' ? 4 : 5)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors group"
                >
                  <span className="text-2xl mb-1 transition-transform group-hover:scale-110">🤩</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {t('study.fsrs.easy')}
                  </span>
                </button>
              </div>
            ) : (
              // Fallback for simple review or other modes (if any)
              // Fallback for simple review or other modes (if any)
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { score: 0, emoji: '😭', label: t('study.quality.0') },
                  { score: 1, emoji: '😖', label: t('study.quality.1') },
                  { score: 2, emoji: '😫', label: t('study.quality.2') },
                  { score: 3, emoji: '😐', label: t('study.quality.3') },
                  { score: 4, emoji: '🙂', label: t('study.quality.4') },
                  { score: 5, emoji: '🤩', label: t('study.quality.5') },
                ].map((item) => (
                  <button
                    key={item.score}
                    onClick={() => onRate(item.score)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all active:scale-95"
                    title={item.label}
                  >
                    <span className="text-xl mb-0.5">{item.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Flip to front button removed as per user request */}
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
        {studyMode === 'spaced-repetition' ? t('study.modeSpacedHint') : t('study.modeSimpleHint')}
      </div>
    </div>
  );
}
