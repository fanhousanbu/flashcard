import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { StudySessionWithDeck } from '../../lib/types/study';

interface SessionCardProps {
  session: StudySessionWithDeck;
}

export function SessionCard({ session }: SessionCardProps) {
  const { t } = useTranslation();
  const startTime = new Date(session.started_at);
  const formattedDate = startTime.toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const duration = session.duration_seconds
    ? t('stats.minutes', { count: Math.floor(session.duration_seconds / 60) })
    : null;

  const modeLabel = session.study_mode === 'spaced-repetition'
    ? t('study.mode.spaced')
    : t('study.mode.simple');

  return (
    <Link
      to={`/decks/${session.deck_id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {session.decks?.name || t('stats.unknownDeck')}
          </h4>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{t('stats.cardsCount', { count: session.cards_studied })}</span>
            {duration && (
              <>
                <span>•</span>
                <span>{duration}</span>
              </>
            )}
            <span>•</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {modeLabel}
            </span>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

