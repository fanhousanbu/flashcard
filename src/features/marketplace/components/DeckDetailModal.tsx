import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { FavoriteButton } from './FavoriteButton';
import type { MarketplaceDeckDetail } from '@/lib/types/marketplace';
import { toast } from '@/hooks/useToast';

interface DeckDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: MarketplaceDeckDetail | null;
  onImport: (deckId: string) => Promise<void>;
  onPurchase: (deckId: string, price: number) => Promise<boolean>;
  onRate: (deckId: string, rating: number) => Promise<void>;
  userRating: number | null;
  isPurchased: boolean;
}

export function DeckDetailModal({
  isOpen,
  onClose,
  deck,
  onImport,
  onPurchase,
  onRate,
  userRating,
  isPurchased,
}: DeckDetailModalProps) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(isPurchased);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setHasPurchased(isPurchased);
  }, [isPurchased]);

  if (!deck) return null;

  const handlePurchaseOrImport = async () => {
    setIsProcessing(true);
    try {
      if (deck.price > 0 && !hasPurchased) {
        // Mock payment - direct success
        const success = await onPurchase(deck.id, deck.price);
        if (success) {
          setHasPurchased(true);
          toast.success(t('marketplace.detail.purchaseSuccess'));
          // Auto import after purchase
          await onImport(deck.id);
        }
      } else {
        await onImport(deck.id);
      }
      onClose();
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage === 'PURCHASE_REQUIRED') {
        toast.error(t('marketplace.detail.purchaseRequired'));
      } else {
        toast.error(t('marketplace.deck.importFailed'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRate = async (rating: number) => {
    try {
      await onRate(deck.id, rating);
      toast.success(t('marketplace.deck.rateSuccess'));
    } catch {
      toast.error(t('marketplace.deck.rateFailed'));
    }
  };

  const renderStars = (interactive = false) => {
    const rating = userRating || deck.rating;
    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => interactive && handleRate(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              disabled={!interactive}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } transition-transform`}
              aria-label={`${star} stars`}
            >
              <svg
                className={`w-5 h-5 ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {deck.rating.toFixed(1)} ({deck.rating_count || 0} {t('marketplace.detail.ratings')})
        </span>
      </div>
    );
  };

  const buttonText = () => {
    if (isProcessing) return t('common.processing');
    if (deck.price > 0 && !hasPurchased) {
      return t('marketplace.detail.buyFor', { price: deck.price });
    }
    return t('marketplace.detail.importDeck');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {deck.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{t('marketplace.detail.author')}: {deck.profiles?.username || t('marketplace.deck.unknownAuthor')}</span>
              <span>{deck.download_count || 0} {t('marketplace.detail.downloads')}</span>
              {deck.card_count > 0 && (
                <span>{deck.card_count} {t('marketplace.detail.cards')}</span>
              )}
            </div>
          </div>
          <FavoriteButton
            isFavorited={deck.is_favorited || false}
            onToggle={async () => {
              // Toggle favorite - parent will handle refresh
              const event = new CustomEvent('toggleFavorite', { detail: { deckId: deck.id } });
              window.dispatchEvent(event);
            }}
          />
        </div>

        {/* Description */}
        {deck.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('marketplace.detail.description')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{deck.description}</p>
          </div>
        )}

        {/* Rating */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('marketplace.detail.yourRating')}
          </h3>
          {renderStars(true)}
        </div>

        {/* Preview Cards */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('marketplace.detail.previewCards')} ({deck.preview_cards.length}/{deck.card_count})
          </h3>
          <div className="space-y-3">
            {deck.preview_cards.map((card, index) => (
              <div
                key={card.id || index}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {t('marketplace.detail.front')}
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {card.front_content}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {t('marketplace.detail.back')}
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {card.back_content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {deck.card_count > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              +{deck.card_count - 3} {t('marketplace.detail.moreCards')}
            </p>
          )}
        </div>

        {/* Category */}
        {deck.category && (
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <span>{deck.category.icon}</span>
              <span>{deck.category.name_zh}</span>
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePurchaseOrImport}
            disabled={isProcessing}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              deck.price > 0 && !hasPurchased
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {buttonText()}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
