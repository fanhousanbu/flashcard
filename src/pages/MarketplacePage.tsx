import { useEffect, useState, useCallback } from 'react';
import { useMarketplace } from '../features/marketplace/hooks/useMarketplace';
import { useDecks } from '../features/decks/hooks/useDecks';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';
import { CategorySelector } from '../features/marketplace/components/CategorySelector';
import { DeckDetailModal } from '../features/marketplace/components/DeckDetailModal';
import { FavoriteButton } from '../features/marketplace/components/FavoriteButton';
import type { MarketplaceDeckWithDetails } from '@/lib/types/marketplace';

export function MarketplacePage() {
  const { t } = useTranslation();
  const {
    marketplaceDecks,
    categories,
    deckDetail,
    loading,
    loadMarketplaceDecks,
    loadDeckDetail,
    setDeckDetail,
    publishDeck,
    importDeck,
    mockPurchase,
    rateDeck,
    getUserRating,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
  } = useMarketplace();
  const { decks, loadDecks } = useDecks();

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [userRatings, setUserRatings] = useState<Record<string, number | null>>({});
  const [selectedDeck, setSelectedDeck] = useState<MarketplaceDeckWithDetails | null>(null);

  useEffect(() => {
    loadMarketplaceDecks();
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadMarketplaceDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters]);

  // Update filter when category changes
  useEffect(() => {
    updateFilter('categoryId', selectedCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  // Load user ratings
  useEffect(() => {
    const loadRatings = async () => {
      const ratings: Record<string, number | null> = {};
      for (const deck of marketplaceDecks) {
        const rating = await getUserRating(deck.id);
        ratings[deck.id] = rating;
      }
      setUserRatings(ratings);
    };
    if (marketplaceDecks.length > 0) {
      loadRatings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketplaceDecks]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publishDeck(selectedDeckId, title, description, price, selectedCategoryId || undefined);
      toast.success(t('marketplace.publish.success'));
      setShowPublishModal(false);
      setTitle('');
      setDescription('');
      setPrice(0);
      setSelectedDeckId('');
      loadMarketplaceDecks();
    } catch (error) {
      toast.error(t('marketplace.publish.failed'));
    }
  };

  const handleImport = async (marketplaceDeckId: string) => {
    try {
      await importDeck(marketplaceDeckId);
      toast.success(t('marketplace.deck.importSuccess'));
      await loadMarketplaceDecks();
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage === 'PURCHASE_REQUIRED') {
        toast.error(t('marketplace.detail.purchaseRequired'));
      } else {
        toast.error(t('marketplace.deck.importFailed'));
      }
    }
  };

  const handlePurchase = async (deckId: string, price: number) => {
    try {
      const success = await mockPurchase(deckId, price);
      if (success) {
        toast.success(t('marketplace.detail.purchaseSuccess'));
        await loadMarketplaceDecks();
        return true;
      }
      return false;
    } catch {
      toast.error(t('marketplace.detail.purchaseFailed'));
      return false;
    }
  };

  const handleRate = async (marketplaceDeckId: string, rating: number) => {
    try {
      await rateDeck(marketplaceDeckId, rating);
      setUserRatings(prev => ({ ...prev, [marketplaceDeckId]: rating }));
      toast.success(t('marketplace.deck.rateSuccess'));
    } catch {
      toast.error(t('marketplace.deck.rateFailed'));
    }
  };

  const handleToggleFavorite = async (deckId: string) => {
    try {
      await toggleFavorite(deckId);
    } catch {
      toast.error(t('marketplace.detail.favoriteFailed'));
    }
  };

  const openDeckDetail = useCallback(async (deck: MarketplaceDeckWithDetails) => {
    setSelectedDeck(deck);
    await loadDeckDetail(deck.id);
  }, [loadDeckDetail]);

  const renderStars = (deckId: string, rating: number, userRating: number | null, interactive = false) => {
    const displayRating = userRating || rating;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => interactive && handleRate(deckId, star)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
              aria-label={`${star} stars`}
            >
              <svg
                className={`w-4 h-4 ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)} ({marketplaceDecks.find(d => d.id === deckId)?.rating_count || 0})
        </span>
      </div>
    );
  };

  if (loading && marketplaceDecks.length === 0) {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('marketplace.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('marketplace.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowPublishModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {t('marketplace.publish.title')}
          </button>
        </div>

        {/* Category Selector */}
        {categories.length > 0 && (
          <div className="mb-4">
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        )}

        {/* Search and filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('marketplace.searchPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <select
                value={filters.minRating || ''}
                onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 whitespace-nowrap"
              >
                <option value="">{t('marketplace.filter.minRating')}</option>
                <option value="4">{t('marketplace.filter.4stars')}</option>
                <option value="3">{t('marketplace.filter.3stars')}</option>
                <option value="2">{t('marketplace.filter.2stars')}</option>
              </select>
              <select
                value={filters.onlyFree ? 'true' : ''}
                onChange={(e) => updateFilter('onlyFree', e.target.value === 'true' ? true : undefined)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 whitespace-nowrap"
              >
                <option value="">{t('marketplace.filter.allPrices')}</option>
                <option value="true">{t('marketplace.filter.freeOnly')}</option>
              </select>
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 whitespace-nowrap"
              >
                <option value="created_at">{t('marketplace.filter.sortByCreated')}</option>
                <option value="rating">{t('marketplace.filter.sortByRating')}</option>
                <option value="download_count">{t('marketplace.filter.sortByDownloads')}</option>
                <option value="updated_at">{t('marketplace.filter.sortByUpdated')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {marketplaceDecks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('marketplace.noDecks')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceDecks.map((deck) => (
            <div
              key={deck.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => openDeckDetail(deck)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
                  {deck.title}
                </h3>
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton
                    isFavorited={deck.is_favorited || false}
                    onToggle={() => handleToggleFavorite(deck.id)}
                    disabled={false}
                  />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 text-sm min-h-[40px]">
                {deck.description || t('marketplace.deck.noDescription')}
              </p>

              {/* Category tag */}
              {deck.category && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    <span>{deck.category.icon}</span>
                    <span>{deck.category.name_zh}</span>
                  </span>
                </div>
              )}

              {/* Rating */}
              <div className="mb-2">
                {renderStars(deck.id, deck.rating, userRatings[deck.id] || null, true)}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                <p>{t('marketplace.deck.author')}: {deck.profiles?.username || t('marketplace.deck.unknownAuthor')}</p>
                <div className="flex justify-between">
                  <p>{t('marketplace.deck.downloads', { count: deck.download_count || 0 })}</p>
                  {deck.card_count > 0 && (
                    <p>{deck.card_count} {t('marketplace.detail.cards')}</p>
                  )}
                </div>
              </div>

              {/* Price and status */}
              <div className="flex items-center justify-between">
                {deck.price > 0 ? (
                  deck.is_purchased ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                      {t('marketplace.deck.purchased')}
                    </span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 font-semibold">¥{deck.price}</span>
                  )
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{t('marketplace.deck.free')}</span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deck.price > 0 && !deck.is_purchased) {
                      // Will open detail modal for purchase
                      openDeckDetail(deck);
                    } else {
                      handleImport(deck.id);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {deck.price > 0 && !deck.is_purchased
                    ? t('marketplace.deck.buy')
                    : t('marketplace.deck.import')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('marketplace.publish.title')}</h2>
            <form onSubmit={handlePublish}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  {t('marketplace.publishModal.selectDeck')}
                </label>
                <select
                  required
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                >
                  <option value="">{t('marketplace.publishModal.pleaseSelect')}</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  {t('marketplace.publish.deckTitle')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                  placeholder={t('marketplace.publishModal.titlePlaceholder')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  {t('marketplace.publish.description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                  rows={3}
                  placeholder={t('marketplace.publishModal.descriptionPlaceholder')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  {t('marketplace.publish.category')}
                </label>
                <select
                  value={selectedCategoryId || ''}
                  onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                >
                  <option value="">{t('marketplace.publish.noCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name_zh}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  {t('marketplace.publish.priceInYuan')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {t('marketplace.publish.publishButton')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPublishModal(false);
                    setTitle('');
                    setDescription('');
                    setPrice(0);
                    setSelectedDeckId('');
                    setSelectedCategoryId(null);
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

      {/* Deck Detail Modal */}
      {deckDetail && selectedDeck && (
        <DeckDetailModal
          isOpen={!!deckDetail}
          onClose={() => {
            setDeckDetail(null);
            setSelectedDeck(null);
          }}
          deck={deckDetail}
          onImport={handleImport}
          onPurchase={handlePurchase}
          onRate={handleRate}
          userRating={userRatings[deckDetail.id] || null}
          isPurchased={deckDetail.is_purchased || false}
        />
      )}
    </AppLayout>
  );
}
