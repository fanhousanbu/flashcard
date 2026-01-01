import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import type { ClozeData } from '@/lib/types/deck';
import { renderClozeFront, renderClozeBack } from '@/features/cards/utils/clozeParser';
import './ClozeCard.css';

interface ClozeCardProps {
  clozeData: ClozeData;
  fieldId: string;
  isFlipped: boolean;
  onFlip: () => void;
  frontBottomContent?: React.ReactNode;
  backBottomContent?: React.ReactNode;
}

export function ClozeCard({ clozeData, fieldId, isFlipped, onFlip, frontBottomContent, backBottomContent }: ClozeCardProps) {
  const { t } = useTranslation();

  // Get the current field label
  const fieldIndex = parseInt(fieldId.replace('c', ''), 10) - 1;
  const totalFields = clozeData.fields.length;
  const fieldLabel = `${fieldIndex + 1}/${totalFields}`;

  return (
    <div className="cloze-card-container">
      <div className={`cloze-card ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        {/* Card inner container */}
        <div className="cloze-card-inner">
          {/* Front side - with blank */}
          <div className="cloze-card-face cloze-card-front bg-white dark:!bg-gray-800 border-2 border-gray-200 dark:!border-gray-600">
            <div className="cloze-card-content">
              <div className="cloze-card-header">
                <span className="cloze-card-label text-gray-600 dark:!text-gray-300">
                  {t('study.front')}
                </span>
                <span className="cloze-field-indicator">Cloze {fieldLabel}</span>
              </div>
              
              <div className="cloze-card-full-text">
                <ReactMarkdown>{renderClozeFront(clozeData, fieldId)}</ReactMarkdown>
              </div>
              {frontBottomContent && (
                <div className="mt-auto">
                  {frontBottomContent}
                </div>
              )}
            </div>
          </div>

          {/* Back side - with answer revealed */}
          <div className="cloze-card-face cloze-card-back bg-white dark:!bg-gray-800 border-2 border-gray-200 dark:!border-gray-600">
            <div className="cloze-card-content">
              <div className="cloze-card-header">
                <span className="cloze-card-label text-gray-600 dark:!text-gray-300">
                  {t('study.back')}
                </span>
                <span className="cloze-field-indicator">Cloze {fieldLabel}</span>
              </div>
              
              <div className="cloze-card-full-text">
                <ReactMarkdown>
                  {renderClozeBack(clozeData, fieldId)}
                </ReactMarkdown>
              </div>
              {backBottomContent && (
                <div className="mt-auto">
                  {backBottomContent}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
