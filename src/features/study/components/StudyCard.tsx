import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { FlipCard } from '../../../components/common/FlipCard';
import { ClozeCard } from '../../../components/common/ClozeCard';
import type { StudyCard as StudyCardType } from '../utils/studyCards';

interface StudyCardProps {
  card: StudyCardType;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (quality: number) => void;
  studyMode: 'simple' | 'simple-review' | 'spaced-repetition' | 'fsrs';
}

export function StudyCard({ card, isFlipped, onFlip, onRate, studyMode }: StudyCardProps) {
  const { t } = useTranslation();

  // Helper to render front controls (Still Learning / Show Answer / Mastered)
  const FrontControls = (
    <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 w-full px-4 mb-4 flex-shrink-0">
      <div className="text-center text-gray-400 dark:text-gray-500 text-xs mb-3 animate-pulse">
        {t('study.tapToFlip') || 'Tap card to flip'}
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onRate(0); }}
          className="flex items-center justify-center gap-2 px-3 py-4 text-xs sm:text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95 flex-1 whitespace-nowrap"
        >
          <span className="text-lg">😕</span>
          <span>{t('study.stillLearning')}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
          className="flex items-center justify-center gap-2 px-3 py-4 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 flex-1 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{t('study.showAnswerShort')}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRate(5); }}
          className="flex items-center justify-center gap-2 px-3 py-4 text-xs sm:text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 flex-1 whitespace-nowrap"
        >
          <span className="text-lg">😊</span>
          <span>{t('study.mastered')}</span>
        </button>
      </div>
    </div>
  );

  // Helper to render back controls (Rating Emoji Buttons)
  const BackControls = (
    <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 w-full px-4 mb-4 flex-shrink-0">
      <div className="text-center text-gray-400 dark:text-gray-500 text-xs mb-3">
        {t('study.swipeHint') || 'Swipe card left/right or use buttons'}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { score: studyMode === 'fsrs' ? 1 : 0, emoji: '😫', label: t('study.fsrs.again'), color: 'red' },
          { score: studyMode === 'fsrs' ? 2 : 3, emoji: '😐', label: t('study.fsrs.hard'), color: 'orange' },
          { score: studyMode === 'fsrs' ? 3 : 4, emoji: '🙂', label: t('study.fsrs.good'), color: 'green' },
          { score: studyMode === 'fsrs' ? 4 : 5, emoji: '🤩', label: t('study.fsrs.easy'), color: 'blue' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={(e) => { e.stopPropagation(); onRate(btn.score); }}
            className={`flex flex-col items-center justify-center p-3 rounded-xl bg-${btn.color}-50 hover:bg-${btn.color}-100 dark:bg-${btn.color}-900/30 dark:hover:bg-${btn.color}-900/50 transition-all active:scale-95 group shadow-sm`}
          >
            <span className="text-2xl mb-1 transition-transform group-hover:scale-110">{btn.emoji}</span>
            <span className={`text-[10px] sm:text-xs font-bold text-${btn.color}-600 dark:text-${btn.color}-400 uppercase tracking-wide`}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  if (card.type === 'cloze') {
    return (
      <ClozeCard
        clozeData={card.clozeData!}
        fieldId={card.clozeFieldId!}
        isFlipped={isFlipped}
        onFlip={onFlip}
        frontBottomContent={FrontControls}
        backBottomContent={BackControls}
      />
    );
  }

  return (
    <FlipCard
      frontContent={
        <>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 text-center flex-shrink-0">
            {t('study.front')}
          </div>
          <div className="flex-1 overflow-y-auto mb-4 min-h-0">
            <div className="min-h-full flex items-center justify-center">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{card.front || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
          {FrontControls}
        </>
      }
      backContent={
        <>
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 text-center flex-shrink-0">
            {t('study.back')}
          </div>
          <div className="flex-1 overflow-y-auto mb-4 min-h-0">
            <div className="min-h-full flex items-center justify-center">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{card.back || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
          {BackControls}
        </>
      }
      isFlipped={isFlipped}
      onFlip={onFlip}
    />
  );
}
