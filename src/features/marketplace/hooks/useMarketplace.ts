import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';
import type { MarketplaceDeckWithDetails, MarketplaceDeckDetail, MarketplaceCategory } from '@/lib/types/marketplace';

interface MarketplaceFilters {
  searchQuery?: string;
  categoryId?: string | null;
  minRating?: number;
  maxPrice?: number;
  onlyFree?: boolean;
  sortBy?: 'created_at' | 'rating' | 'download_count' | 'updated_at';
}

export function useMarketplace() {
  const [marketplaceDecks, setMarketplaceDecks] = useState<MarketplaceDeckWithDetails[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [deckDetail, setDeckDetail] = useState<MarketplaceDeckDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilters>({});

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await db.getMarketplaceCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const loadMarketplaceDecks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.searchMarketplaceDecks(searchQuery, filters);
      setMarketplaceDecks(data);

      // Load user status for all decks if authenticated
      if (user && data.length > 0) {
        const deckIds = data.map((d: any) => d.id);
        const statusMap = await db.getMarketplaceDecksUserStatus(user.id, deckIds);

        // Merge user status into decks
        const decksWithStatus = data.map((deck: any) => ({
          ...deck,
          is_purchased: statusMap[deck.id]?.is_purchased || false,
          is_favorited: statusMap[deck.id]?.is_favorited || false,
        }));
        setMarketplaceDecks(decksWithStatus);
      }

      return data;
    } catch (error) {
      console.error('Failed to load marketplace decks:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, user]);

  const loadDeckDetail = useCallback(async (deckId: string) => {
    setDetailLoading(true);
    try {
      let detail = await db.getMarketplaceDeckDetail(deckId, 3);

      // Load user status for this deck
      if (user) {
        const statusMap = await db.getMarketplaceDecksUserStatus(user.id, [deckId]);
        detail = {
          ...detail,
          is_purchased: statusMap[deckId]?.is_purchased || false,
          is_favorited: statusMap[deckId]?.is_favorited || false,
          is_author: detail.author_id === user.id,
        };
      }

      setDeckDetail(detail);
      return detail;
    } catch (error) {
      console.error('Failed to load deck detail:', error);
      throw error;
    } finally {
      setDetailLoading(false);
    }
  }, [user]);

  const publishDeck = async (
    deckId: string,
    title: string,
    description?: string,
    price?: number,
    categoryId?: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    try {
      const marketplaceDeck = await db.publishDeckToMarketplace({
        deck_id: deckId,
        author_id: user.id,
        title,
        description,
        price,
      });

      // Update category if provided
      if (categoryId) {
        await db.updateMarketplaceDeck(marketplaceDeck.id, user.id, { category_id: categoryId });
      }

      return marketplaceDeck;
    } finally {
      setLoading(false);
    }
  };

  const importDeck = async (marketplaceDeckId: string) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    try {
      const newDeck = await db.importDeckFromMarketplace(user.id, marketplaceDeckId);
      return newDeck;
    } finally {
      setLoading(false);
    }
  };

  const mockPurchase = async (marketplaceDeckId: string, price: number) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    try {
      // Mock payment - create a purchase record directly
      const purchase = await db.createPurchase({
        user_id: user.id,
        marketplace_deck_id: marketplaceDeckId,
        amount: price,
      });
      return !!purchase;
    } finally {
      setLoading(false);
    }
  };

  const checkPurchase = async (marketplaceDeckId: string) => {
    if (!user) return null;

    try {
      const purchase = await db.checkPurchase(user.id, marketplaceDeckId);
      return purchase;
    } catch (error) {
      console.error('Failed to check purchase:', error);
      return null;
    }
  };

  const rateDeck = async (marketplaceDeckId: string, rating: number) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    try {
      await db.rateMarketplaceDeck(marketplaceDeckId, user.id, rating);
      await loadMarketplaceDecks();
    } finally {
      setLoading(false);
    }
  };

  const getUserRating = async (marketplaceDeckId: string) => {
    if (!user) return null;

    try {
      return await db.getUserRating(marketplaceDeckId, user.id);
    } catch (error) {
      console.error('Failed to get user rating:', error);
      return null;
    }
  };

  const toggleFavorite = async (marketplaceDeckId: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const isFavorited = await db.checkFavorite(user.id, marketplaceDeckId);
      if (isFavorited) {
        await db.removeFavorite(user.id, marketplaceDeckId);
      } else {
        await db.addFavorite(user.id, marketplaceDeckId);
      }

      // Refresh deck list to update favorite status
      await loadMarketplaceDecks();

      return !isFavorited;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  const getUserFavorites = async () => {
    if (!user) return [];

    try {
      const favorites = await db.getUserFavorites(user.id);
      return favorites;
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  };

  const updateFilter = <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return {
    // State
    marketplaceDecks,
    categories,
    deckDetail,
    loading,
    detailLoading,
    searchQuery,
    filters,

    // Actions
    setSearchQuery,
    setFilters,
    updateFilter,
    resetFilters,
    loadMarketplaceDecks,
    loadDeckDetail,
    setDeckDetail,
    publishDeck,
    importDeck,
    mockPurchase,
    checkPurchase,
    rateDeck,
    getUserRating,
    toggleFavorite,
    getUserFavorites,
  };
}

