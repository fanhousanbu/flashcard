import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTags } from '../../features/tags/hooks/useTags';
import { TAG_COLORS, type TagColor } from '../../lib/types/tag';
import type { Tag } from '../../lib/types/tag';
import { toast } from '../../hooks/useToast';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  onTagRemove: (tag: Tag) => void;
}

export function TagSelector({ selectedTags, onTagSelect, onTagRemove }: TagSelectorProps) {
  const { t } = useTranslation();
  const { tags, createTag } = useTags();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>(TAG_COLORS[0].value);

  const selectedTagIds = new Set(selectedTags.map(t => t.id));
  const availableTags = tags.filter(t => !selectedTagIds.has(t.id));

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error(t('tags.enterTagName'));
      return;
    }

    try {
      const newTag = await createTag(newTagName.trim(), newTagColor);
      if (newTag) {
        onTagSelect(newTag);
        setNewTagName('');
        setNewTagColor(TAG_COLORS[0].value);
        setShowCreateForm(false);
        toast.success(t('tags.createSuccess'));
      }
    } catch (error) {
      toast.error(t('errors.createFailed'));
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-sm"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => onTagRemove(tag)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available tags - inline chips */}
      {!showCreateForm && availableTags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('tags.noAvailableTags') === 'No available tags' ? 'Available tags:' : '可用标签：'}</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                type="button"
                key={tag.id}
                onClick={() => onTagSelect(tag)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-sm hover:opacity-80 transition-opacity"
                style={{ backgroundColor: tag.color }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create new tag section */}
      {!showCreateForm ? (
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('tags.createNewTag')}
        </button>
      ) : (
        /* Create tag form - simplified for mobile */
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('tags.createNewTag')}</h4>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTagName('');
                setNewTagColor(TAG_COLORS[0].value);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder={t('tags.tagName')}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <div className="flex flex-wrap gap-1.5">
            {TAG_COLORS.map((color) => (
              <button
                type="button"
                key={color.value}
                onClick={() => setNewTagColor(color.value)}
                className={`w-7 h-7 rounded-md transition-all ${
                  newTagColor === color.value ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleCreateTag}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('common.create')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTagName('');
                setNewTagColor(TAG_COLORS[0].value);
              }}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
