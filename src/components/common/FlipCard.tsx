import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './FlipCard.css';

interface FlipCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  showBothSides?: boolean; // Show both front and back at the same time
}

export function FlipCard({ frontContent, backContent, isFlipped, onFlip, showBothSides = false }: FlipCardProps) {
  const { t } = useTranslation();

  if (showBothSides) {
    // Show both sides mode
    return (
      <div className="flip-card-container">
        <div
          className="flip-card-both-sides bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
          onClick={onFlip}
        >
          {/* Front side */}
          <div className="flip-card-side-display front-side">
            <h3 className="side-label text-indigo-500 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400">{t('deck.front')}</h3>
            <div className="side-content text-gray-700 dark:text-gray-300">
              {frontContent}
            </div>
          </div>

          {/* Divider */}
          <div className="flip-card-divider bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent">
            <span className="bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-sm">⇄</span>
          </div>

          {/* Back side */}
          <div className="flip-card-side-display back-side">
            <h3 className="side-label text-rose-500 dark:text-rose-400 border-b-2 border-rose-500 dark:border-rose-400">{t('deck.back')}</h3>
            <div className="side-content text-gray-700 dark:text-gray-300">
              {backContent}
            </div>
          </div>
        </div>

        <p className="flip-hint text-gray-600 dark:text-gray-400">Click card to see flip effect</p>
      </div>
    );
  }

  // Flip animation mode
  return (
    <div className="flip-card-container">
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        {/* Card inner container */}
        <div className="flip-card-inner">
          {/* Front side */}
          <div className="flip-card-face flip-card-front bg-white dark:!bg-gray-800 border-2 border-gray-200 dark:!border-gray-600">
            <div className="flip-card-content">
              <div className="flip-card-label text-gray-600 dark:!text-gray-300">{t('study.front')}</div>
              <div className="flip-card-text text-gray-900 dark:!text-gray-100">
                {frontContent}
              </div>
            </div>
          </div>

          {/* Back side */}
          <div className="flip-card-face flip-card-back bg-white dark:!bg-gray-800 border-2 border-gray-200 dark:!border-gray-600">
            <div className="flip-card-content">
              <div className="flip-card-label text-gray-600 dark:!text-gray-300">{t('study.back')}</div>
              <div className="flip-card-text text-gray-900 dark:!text-gray-100">
                {backContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

