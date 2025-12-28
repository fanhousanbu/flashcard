import { useEffect, useState } from 'react';
import { useMarketplace } from '../features/marketplace/hooks/useMarketplace';
import { useDecks } from '../features/decks/hooks/useDecks';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

export function MarketplacePage() {
  const { t } = useTranslation();
  const { 
    marketplaceDecks, 
    loading, 
    loadMarketplaceDecks, 
    publishDeck, 
    importDeck,
    rateDeck,
    getUserRating,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  } = useMarketplace();
  const { decks, loadDecks } = useDecks();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [userRatings, setUserRatings] = useState<Record<string, number | null>>({});

  useEffect(() => {
    loadMarketplaceDecks();
    loadDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on component mount

  useEffect(() => {
    loadMarketplaceDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters]);

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
      await publishDeck(selectedDeckId, title, description, price);
      toast.success(t('marketplace.publish.success'));
      setShowPublishModal(false);
      setTitle('');
      setDescription('');
      setPrice(0);
      loadMarketplaceDecks();
    } catch (error) {
      toast.error(t('marketplace.publish.failed'));
    }
  };

  const handleImport = async (marketplaceDeckId: string) => {
    try {
      await importDeck(marketplaceDeckId);
      toast.success(t('marketplace.deck.importSuccess'));
    } catch (error) {
      toast.error(t('marketplace.deck.importFailed'));
    }
  };

  const handleRate = async (marketplaceDeckId: string, rating: number) => {
    try {
      await rateDeck(marketplaceDeckId, rating);
      setUserRatings(prev => ({ ...prev, [marketplaceDeckId]: rating }));
      toast.success(t('marketplace.deck.rateSuccess'));
    } catch (error) {
      toast.error(t('marketplace.deck.rateFailed'));
    }
  };

  const renderStars = (deck: any, interactive = false) => {
    const rating = deck.rating || 0;
    const userRating = userRatings[deck.id] || null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (userRating || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => interactive && handleRate(deck.id, star)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            >
              <svg
                className={`w-5 h-5 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({deck.rating_count || 0})
        </span>
      </div>
    );
  };

  if (loading && marketplaceDecks.length === 0) {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="mb-8">
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
            <div className="flex gap-2 flex-shrink-0">
              <select
                value={filters.minRating || ''}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 whitespace-nowrap"
              >
                <option value="">{t('marketplace.filter.minRating')}</option>
                <option value="4">{t('marketplace.filter.4stars')}</option>
                <option value="3">{t('marketplace.filter.3stars')}</option>
                <option value="2">{t('marketplace.filter.2stars')}</option>
              </select>
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 whitespace-nowrap"
              >
                <option value="created_at">{t('marketplace.filter.sortByCreated')}</option>
                <option value="rating">{t('marketplace.filter.sortByRating')}</option>
                <option value="download_count">{t('marketplace.filter.sortByDownloads')}</option>
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
          {marketplaceDecks.map((deck: any) => (
            <div
              key={deck.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{deck.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {deck.description || t('marketplace.deck.noDescription')}
              </p>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(deck, true)}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                <p>{t('marketplace.deck.author')}: {deck.profiles?.username || t('marketplace.deck.unknownAuthor')}</p>
                <p>{t('marketplace.deck.downloads', { count: deck.download_count || 0 })}</p>
                {deck.price > 0 && <p className="text-green-600 dark:text-green-400 font-semibold">¥{deck.price}</p>}
                {deck.price === 0 && <p className="text-blue-600 dark:text-blue-400 font-semibold">{t('marketplace.deck.free')}</p>}
              </div>
              <button
                onClick={() => handleImport(deck.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                {deck.price > 0 ? t('marketplace.deck.buyAndImport') : t('marketplace.deck.import')}
              </button>
            </div>
          ))}
        </div>
      )}

      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('marketplace.publish.title')}</h2>
            <form onSubmit={handlePublish}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('marketplace.publishModal.selectDeck')}</label>
                <select
                  required
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
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
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('marketplace.publish.deckTitle')}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder={t('marketplace.publishModal.titlePlaceholder')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('marketplace.publish.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  rows={3}
                  placeholder={t('marketplace.publishModal.descriptionPlaceholder')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('marketplace.publish.priceInYuan')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  {t('marketplace.publish.publishButton')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
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

