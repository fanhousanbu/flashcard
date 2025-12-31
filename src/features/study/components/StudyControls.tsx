import { useTranslation } from 'react-i18next';
import { qualityColors } from '../algorithms/sm2';

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
    <div className="mt-6 relative z-10 w-full max-w-md mx-auto">
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

          {/* More quality options for spaced repetition mode */}
          {studyMode === 'spaced-repetition' && (
            <details className="group">
              <summary className="py-2 text-xs text-center text-gray-600 cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                {t('study.moreOptions')} ▼
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[1, 2, 3, 4].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => onRate(quality)}
                    className={`${qualityColors[quality as keyof typeof qualityColors]} hover:opacity-90 text-white py-3 px-3 rounded-xl text-sm font-medium transition-all shadow-sm`}
                  >
                    {t(`study.quality.${quality}`)}
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        // Show back: display rating buttons and flip to front button
        <div className="space-y-4">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-2">
            {t('study.swipeHint') || 'Swipe card left/right or use buttons'}
          </div>
          
          {/* Rating buttons */}
          <div className="flex justify-between gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4, 5].map((quality) => (
              <button
                key={quality}
                onClick={() => onRate(quality)}
                className={`${qualityColors[quality as keyof typeof qualityColors]} hover:opacity-90 text-white py-3 px-1 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm flex-1`}
                title={t(`study.quality.${quality}`)}
              >
                {quality}
              </button>
            ))}
          </div>

          {/* Flip to front button */}
          <div className="flex justify-center">
            <button
              onClick={onFlip}
              className="flex items-center gap-2 px-6 py-3 text-sm text-gray-600 transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t('study.flipToFront')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
        {studyMode === 'spaced-repetition' ? t('study.modeSpacedHint') : t('study.modeSimpleHint')}
      </div>
    </div>
  );
}
