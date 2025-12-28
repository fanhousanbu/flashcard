import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import * as db from '../../../lib/supabase/database';
import type { SearchResults, DeckSearchResult, CardSearchResult } from '../../../lib/types/search';

const SEARCH_HISTORY_KEY = 'flashcard_search_history';
const MAX_HISTORY_ITEMS = 10;

function getSearchHistory(): string[] {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(query: string) {
  if (!query.trim()) return;
  
  try {
    const history = getSearchHistory();
    // Remove duplicates
    const filtered = history.filter((item: string) => item.toLowerCase() !== query.toLowerCase());
    // Add to the beginning
    filtered.unshift(query);
    // Limit the number of items
    const limited = filtered.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
  } catch {
    // Ignore storage errors
  }
}

export function useSearch() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ decks: [], cards: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load search history
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Perform search
  useEffect(() => {
    if (!userId || !debouncedQuery.trim()) {
      setResults({ decks: [], cards: [], total: 0 });
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const [decks, cards] = await Promise.all([
          db.searchDecks(userId, debouncedQuery),
          db.searchCards(userId, debouncedQuery),
        ]);

        // Convert to SearchResult format
        const deckResults: DeckSearchResult[] = decks.map((deck: { id: string; name: string; description: string | null; cardCount: number }) => ({
          type: 'deck' as const,
          id: deck.id,
          name: deck.name,
          description: deck.description,
          cardCount: deck.cardCount,
          match: deck.name, // The matching text snippet
        }));

        const cardResults: CardSearchResult[] = cards.map((card: { id: string; deck_id: string; deck_name: string; front_content: string; back_content: string }) => {
          const matchInFront = card.front_content.toLowerCase().includes(debouncedQuery.toLowerCase());
          return {
            type: 'card' as const,
            id: card.id,
            deckId: card.deck_id,
            deckName: card.deck_name,
            frontContent: card.front_content,
            backContent: card.back_content,
            match: matchInFront ? card.front_content : card.back_content,
          };
        });

        setResults({
          decks: deckResults,
          cards: cardResults,
          total: deckResults.length + cardResults.length,
        });
        
        // Save search history
        if (debouncedQuery.trim()) {
          saveSearchHistory(debouncedQuery);
          setSearchHistory(getSearchHistory());
        }
      } catch (error) {
        console.error('Search failed:', error);
        setResults({ decks: [], cards: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults({ decks: [], cards: [], total: 0 });
    setShowSuggestions(false);
  }, []);

  const getSuggestions = useCallback((input: string): string[] => {
    if (!input.trim()) return searchHistory.slice(0, 5);
    
    const lowerInput = input.toLowerCase();
    return searchHistory
      .filter(item => item.toLowerCase().includes(lowerInput))
      .slice(0, 5);
  }, [searchHistory]);

  const selectSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    clearSearch,
    searchHistory,
    showSuggestions,
    setShowSuggestions,
    getSuggestions,
    selectSuggestion,
  };
}

