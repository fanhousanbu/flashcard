import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useTags } from '../features/tags/hooks/useTags';
import { TAG_COLORS } from '../lib/types/tag';
import type { Tag } from '../lib/types/tag';
import { toast } from '../hooks/useToast';
import { Loading } from '../components/common/Loading';
import { useTranslation } from 'react-i18next';

export function TagsPage() {
  const { t } = useTranslation();
  const { tags, loading, createTag, updateTag, deleteTag } = useTags();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0].value);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      toast.error(t('tags.enterTagName'));
      return;
    }

    try {
      await createTag(tagName.trim(), tagColor);
      toast.success(t('tags.createSuccess'));
      setShowCreateModal(false);
      setTagName('');
      setTagColor(TAG_COLORS[0].value);
    } catch (error) {
      toast.error(t('errors.updateFailed'));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    if (!tagName.trim()) {
      toast.error(t('tags.enterTagName'));
      return;
    }

    try {
      await updateTag(editingTag.id, { name: tagName.trim(), color: tagColor });
      toast.success(t('tags.updateSuccess'));
      setShowEditModal(false);
      setEditingTag(null);
      setTagName('');
      setTagColor(TAG_COLORS[0].value);
    } catch (error) {
      toast.error(t('errors.updateFailed'));
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(t('tags.deleteConfirm', { name: tag.name }))) return;

    try {
      await deleteTag(tag.id);
      toast.success(t('tags.deleteSuccess'));
    } catch (error) {
      toast.error(t('errors.deleteFailed'));
    }
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setShowEditModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('tags.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('tags.description')}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {t('tags.create')}
            </button>
          </div>
        </div>

        {tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('tags.noTags')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              {t('tags.create')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tag.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('tags.createdAt', { date: new Date(tag.created_at).toLocaleDateString() })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(tag)}
                    className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700 transition-colors"
                  >
                    {t('tags.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(tag)}
                    className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700 transition-colors"
                  >
                    {t('tags.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create tag modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('tags.create')}</h2>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('tags.tagName')}</label>
                  <input
                    type="text"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., JavaScript"
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('tags.selectColor')}</label>
                  <div className="grid grid-cols-4 gap-3">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setTagColor(color.value)}
                        className={`w-full aspect-square rounded-lg transition-transform hover:scale-105 ${
                          tagColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {t('common.create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setTagName('');
                      setTagColor(TAG_COLORS[0].value);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit tag modal */}
        {showEditModal && editingTag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('tags.edit')}</h2>
              <form onSubmit={handleEdit}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('tags.tagName')}</label>
                  <input
                    type="text"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('tags.selectColor')}</label>
                  <div className="grid grid-cols-4 gap-3">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setTagColor(color.value)}
                        className={`w-full aspect-square rounded-lg transition-transform hover:scale-105 ${
                          tagColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTag(null);
                      setTagName('');
                      setTagColor(TAG_COLORS[0].value);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

