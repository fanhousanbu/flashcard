import { useState, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';

export function useMarketplace() {
  const [marketplaceDecks, setMarketplaceDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    minRating?: number;
    maxPrice?: number;
    sortBy?: 'rating' | 'download_count' | 'created_at';
  }>({});

  const loadMarketplaceDecks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.searchMarketplaceDecks(searchQuery, filters);
      setMarketplaceDecks(data);
      return data;
    } catch (error) {
      console.error('Failed to load marketplace decks:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const publishDeck = async (
    deckId: string,
    title: string,
    description?: string,
    price?: number
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

  return {
    marketplaceDecks,
    loading,
    loadMarketplaceDecks,
    publishDeck,
    importDeck,
    checkPurchase,
    rateDeck,
    getUserRating,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  };
}

