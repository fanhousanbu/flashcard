import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTags } from '../../features/tags/hooks/useTags';
import { TAG_COLORS } from '../../lib/types/tag';
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
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="relative" ref={dropdownRef}>
      {/* Selected tags display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-sm"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => onTagRemove(tag)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Add tag button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {t('tags.addTag')}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          {!showCreateForm ? (
            <>
              {/* Available tags list */}
              <div className="p-2">
                {availableTags.length > 0 ? (
                  availableTags.map(tag => (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => {
                        onTagSelect(tag);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-gray-900 dark:text-gray-100">{tag.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{t('tags.noAvailableTags')}</p>
                )}
              </div>

              {/* Create new tag button */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('tags.createNewTag')}
                </button>
              </div>
            </>
          ) : (
            /* Create tag form */
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('tags.createNewTag')}</h3>

              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={t('tags.tagName')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                autoFocus
              />

              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t('tags.selectColor')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => setNewTagColor(color.value)}
                      className={`w-full aspect-square rounded-lg transition-transform ${
                        newTagColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

