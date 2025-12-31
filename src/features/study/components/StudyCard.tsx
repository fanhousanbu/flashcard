import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { FlipCard } from '../../../components/common/FlipCard';
import { renderClozeFront, renderClozeBack } from '../../cards/utils/clozeParser';
import type { StudyCard as StudyCardType } from '../utils/studyCards';

interface StudyCardProps {
  card: StudyCardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export function StudyCard({ card, isFlipped, onFlip }: StudyCardProps) {
  const { t } = useTranslation();

  if (card.type === 'cloze') {
    return (
      <div 
        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[350px] flex flex-col justify-center shadow-sm cursor-pointer"
        onClick={onFlip}
      >
        <div className="text-center mb-4">
          <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('study.front')}</span>
        </div>
        <div className="text-center text-lg text-gray-900 dark:text-gray-100 mb-6 prose dark:prose-invert max-w-none">
          <ReactMarkdown>
            {renderClozeFront(card.clozeData!, card.clozeFieldId!)}
          </ReactMarkdown>
        </div>
        {isFlipped && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-2">
              <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('study.back')}</span>
            </div>
            <div className="text-center text-lg prose dark:prose-invert max-w-none">
              <ReactMarkdown>
                {renderClozeBack(card.clozeData!, card.clozeFieldId!)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <FlipCard
      frontContent={
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{card.front || ''}</ReactMarkdown>
        </div>
      }
      backContent={
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{card.back || ''}</ReactMarkdown>
        </div>
      }
      isFlipped={isFlipped}
      onFlip={onFlip}
    />
  );
}
