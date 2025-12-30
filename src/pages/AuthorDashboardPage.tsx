import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';
import * as db from '../lib/supabase/database';
import type { MarketplaceDeckWithDetails, AuthorStats } from '@/lib/types/marketplace';

export function AuthorDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [publishedDecks, setPublishedDecks] = useState<MarketplaceDeckWithDetails[]>([]);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDeck, setEditingDeck] = useState<MarketplaceDeckWithDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [decks, authorStats] = await Promise.all([
        db.getUserPublishedMarketplaceDecks(user.id),
        db.getAuthorStats(user.id),
      ]);
      setPublishedDecks(decks);
      setStats(authorStats);
    } catch (error) {
      console.error('Failed to load author data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deck: MarketplaceDeckWithDetails) => {
    setEditingDeck(deck);
    setEditForm({
      title: deck.title,
      description: deck.description || '',
      price: deck.price,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck || !user) return;

    try {
      await db.updateMarketplaceDeck(editingDeck.id, user.id, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
      });
      toast.success(t('marketplace.author.updateSuccess'));
      setShowEditModal(false);
      setEditingDeck(null);
      loadData();
    } catch {
      toast.error(t('marketplace.author.updateFailed'));
    }
  };

  const handleUnpublish = async (deckId: string) => {
    if (!confirm(t('marketplace.author.unpublishConfirm'))) return;
    if (!user) return;

    try {
      await db.unpublishMarketplaceDeck(deckId, user.id);
      toast.success(t('marketplace.author.unpublishSuccess'));
      loadData();
    } catch {
      toast.error(t('marketplace.author.unpublishFailed'));
    }
  };

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)} ({count} {t('marketplace.detail.ratings')})
        </span>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back button - visible on mobile only */}
        <button
          onClick={() => navigate(-1)}
          className="md:hidden mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{t('common.back')}</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('marketplace.author.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('marketplace.author.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('marketplace.author.totalDecks')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDecks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('marketplace.author.totalDownloads')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalDownloads}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('marketplace.author.totalSales')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalSales}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('marketplace.author.totalRevenue')}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">¥{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Published Decks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('marketplace.author.myDecks')}
            </h2>
          </div>

          {publishedDecks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>{t('marketplace.author.noDecks')}</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('marketplace.author.publishFirst')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {publishedDecks.map((deck) => (
                <div key={deck.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {deck.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {deck.description || t('marketplace.deck.noDescription')}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {renderStars(deck.rating, deck.rating_count)}
                        <span className="text-gray-500 dark:text-gray-400">
                          {deck.download_count} {t('marketplace.detail.downloads')}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {deck.card_count} {t('marketplace.detail.cards')}
                        </span>
                        <span className={deck.price > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-blue-600 dark:text-blue-400 font-semibold'}>
                          {deck.price > 0 ? `¥${deck.price}` : t('marketplace.deck.free')}
                        </span>
                      </div>
                      {deck.category && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            <span>{deck.category.icon}</span>
                            <span>{deck.category.name_zh}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(deck)}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleUnpublish(deck.id)}
                        className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg transition-colors"
                      >
                        {t('marketplace.author.unpublish')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingDeck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                {t('marketplace.author.editDeck')}
              </h2>
              <form onSubmit={handleSaveEdit}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                    {t('marketplace.publish.deckTitle')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                    {t('marketplace.publish.description')}
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                    {t('marketplace.publish.priceInYuan')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDeck(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
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
