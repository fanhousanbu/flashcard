import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '../../../hooks/useToast';

interface StudyHeaderProps {
  deckId: string;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  isCloze: boolean;
  clozeStep?: string;
}

export function StudyHeader({ 
  deckId, 
  currentIndex, 
  totalCards, 
  isFlipped, 
  isCloze,
  clozeStep 
}: StudyHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Top navigation area */}
      <div className="flex items-center justify-between">
        <Link
          to={`/decks/${deckId}`}
          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← {t('study.backToDeck')}
        </Link>
        
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

      {/* Progress and status */}
      <div className="flex items-center gap-3">
        {/* Progress display */}
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {currentIndex + 1} of {totalCards}
        </span>
        
        {/* Card type indicator (for cloze cards) */}
        {isCloze && (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
            {clozeStep || 'Cloze'}
          </span>
        )}
        
        {/* Front/Back label */}
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          isFlipped
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {isFlipped ? t('study.back') : t('study.front')}
        </span>
      </div>
    </div>
  );
}
