import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import type { ClozeData } from '@/lib/types/deck';
import './ClozeCard.css';

interface ClozeCardProps {
  clozeData: ClozeData;
  fieldId: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ClozeCard({ clozeData, fieldId, isFlipped, onFlip }: ClozeCardProps) {
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
              <div className="cloze-card-text text-gray-900 dark:!text-gray-100">
                <ReactMarkdown>{`[...]`}</ReactMarkdown>
              </div>
              <div className="cloze-card-full-text">
                <ReactMarkdown>{clozeData.original.replace(/\{\{c\d+::([^}\|]+?)(?:::(.+?))?\}\}/g, '[...]')}</ReactMarkdown>
              </div>
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
              <div className="cloze-card-text text-gray-900 dark:!text-gray-100">
                <ReactMarkdown>
                  {`**${clozeData.fields[fieldIndex]?.answer || ''}**`}
                </ReactMarkdown>
              </div>
              <div className="cloze-card-full-text">
                <ReactMarkdown>
                  {renderClozeContent(clozeData, fieldId, false)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Render cloze content with the specified field highlighted
 */
function renderClozeContent(data: ClozeData, fieldId: string, isFront: boolean): string {
  const fieldIndex = data.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    return data.original;
  }

  let result = data.original;

  // Replace all cloze patterns
  data.fields.forEach((field, index) => {
    const regex = new RegExp(
      `\\{\\{${field.id}::([^}\|]+?)(?:::(.+?))?\\}\\}`,
      'g'
    );

    if (index === fieldIndex) {
      // This is the current field - highlight it
      result = result.replace(regex, `**${field.answer}**`);
    } else {
      // Other fields - show answer normally
      result = result.replace(regex, field.answer);
    }
  });

  return result;
}

/**
 * Render cloze content for the front (with blank)
 */
export function renderClozeFront(data: ClozeData, fieldId: string): string {
  const fieldIndex = data.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    return data.original.replace(/\{\{c\d+::([^}\|]+?)(?:::(.+?))?\}\}/g, '[...]');
  }

  let result = data.original;

  data.fields.forEach((field, index) => {
    const regex = new RegExp(
      `\\{\\{${field.id}::([^}\|]+?)(?:::(.+?))?\\}\\}`,
      'g'
    );

    if (index === fieldIndex) {
      // This is the current field - show blank
      result = result.replace(regex, '[...]');
    } else {
      // Other fields - show answer
      result = result.replace(regex, field.answer);
    }
  });

  return result;
}

/**
 * Render cloze content for the back (with answer)
 */
export function renderClozeBack(data: ClozeData, fieldId: string): string {
  const fieldIndex = data.fields.findIndex((f) => f.id === fieldId);

  if (fieldIndex === -1) {
    return data.original.replace(/\{\{c\d+::([^}\|]+?)(?:::(.+?))?\}\}/g, '$1');
  }

  let result = data.original;

  data.fields.forEach((field, index) => {
    const regex = new RegExp(
      `\\{\\{${field.id}::([^}\|]+?)(?:::(.+?))?\\}\\}`,
      'g'
    );

    if (index === fieldIndex) {
      // This is the current field - highlight it
      result = result.replace(regex, `**${field.answer}**`);
    } else {
      // Other fields - show answer
      result = result.replace(regex, field.answer);
    }
  });

  return result;
}
