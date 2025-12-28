import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDecks } from '../features/decks/hooks/useDecks';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { decks, loading, loadDecks, createDeck, deleteDeck } = useDecks();
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  useEffect(() => {
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on component mount

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeck(deckName, deckDescription);
      toast.success(t('dashboard.createSuccess'));
      setShowCreateModal(false);
      setDeckName('');
      setDeckDescription('');
    } catch (error) {
      toast.error(t('dashboard.createFailed'));
    }
  };

  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    if (!confirm(t('dashboard.deleteConfirm', { name: deckName }))) return;
    try {
      await deleteDeck(deckId);
      toast.success(t('dashboard.deleteSuccess'));
    } catch (error) {
      toast.error(t('dashboard.deleteFailed'));
    }
  };

  if (loading && decks.length === 0) {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
          {decks.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {t('dashboard.createDeck')}
            </button>
          )}
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboard.noDecks')}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            {t('dashboard.createDeck')}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{deck.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {deck.description || t('dashboard.noDescription')}
              </p>
              <div className="flex space-x-2">
                <Link
                  to={`/decks/${deck.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center"
                >
                  {t('dashboard.view')}
                </Link>
                <Link
                  to={`/decks/${deck.id}/study`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
                >
                  {t('dashboard.study')}
                </Link>
                <button
                  onClick={() => handleDeleteDeck(deck.id, deck.name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  {t('dashboard.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('dashboard.modal.title')}</h2>
            <form onSubmit={handleCreateDeck}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('dashboard.modal.name')}</label>
                <input
                  type="text"
                  required
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('dashboard.modal.namePlaceholder')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('dashboard.modal.description')}</label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder={t('dashboard.modal.descriptionPlaceholder')}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

