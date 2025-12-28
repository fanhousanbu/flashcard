import { useTranslation } from 'react-i18next';
import type { Tag } from '../../lib/types/tag';

interface TagFilterProps {
  availableTags: Tag[];
  selectedTagIds: Set<string>;
  onToggleTag: (tagId: string) => void;
  onClearFilter: () => void;
  tagCounts?: Record<string, number>;
}

export function TagFilter({ availableTags, selectedTagIds, onToggleTag, onClearFilter, tagCounts = {} }: TagFilterProps) {
  const { t } = useTranslation();
  const hasSelectedTags = selectedTagIds.size > 0;

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('deck.filterByTagLabel')}</h3>
        {hasSelectedTags && (
          <button
            onClick={onClearFilter}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('deck.clearFilter')}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => {
          const isSelected = selectedTagIds.has(tag.id);
          const count = tagCounts[tag.id] || 0;

          return (
            <button
              key={tag.id}
              onClick={() => onToggleTag(tag.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                  : 'text-white opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: tag.color,
                ...(isSelected ? { ringColor: tag.color } : {})
              }}
            >
              <span>{tag.name}</span>
              {count > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

