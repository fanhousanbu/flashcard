import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../features/search/hooks/useSearch';
import type { SearchResult } from '../../lib/types/search';
import { useTranslation } from 'react-i18next';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t } = useTranslation();
  const { 
    query, 
    setQuery, 
    results, 
    loading, 
    clearSearch,
    showSuggestions,
    setShowSuggestions,
    getSuggestions,
    selectSuggestion,
  } = useSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);

  // Merge all results for keyboard navigation
  useEffect(() => {
    const all: SearchResult[] = [
      ...results.decks,
      ...results.cards,
    ];
    setAllResults(all);
  }, [results]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      // Handle arrow keys when showing suggestions
      if (showSuggestions && getSuggestions(query).length > 0) {
        const suggestions = getSuggestions(query);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
          setSelectedIndex(-1);
        }
        return;
      }

      // Search results navigation
      if (allResults.length > 0 && !showSuggestions) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          handleResultClick(allResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSuggestions, query, selectedIndex, allResults, getSuggestions, selectSuggestion]);

  const handleClose = () => {
    clearSearch();
    onClose();
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'deck') {
      navigate(`/decks/${result.id}`);
    } else {
      navigate(`/decks/${result.deckId}`);
    }
    setShowSuggestions(false);
    handleClose();
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-gray-100">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Search panel */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-[10vh]">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700">
          {/* Search input */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t('search.placeholder')}
              className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search suggestions */}
          {showSuggestions && !query && getSuggestions(query).length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {t('search.searchHistory')}
              </div>
              {getSuggestions(query).map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search suggestions (when typing) */}
          {showSuggestions && query && getSuggestions(query).length > 0 && results.total === 0 && !loading && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                {t('search.suggestions')}
              </div>
              {getSuggestions(query).map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : query && results.total === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">{t('search.noResults')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('search.tryDifferentKeywords')}</p>
              </div>
            ) : query && results.total > 0 ? (
              <div className="py-2">
                {/* Deck results */}
                {results.decks.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {t('search.decks')} ({results.decks.length})
                    </h3>
                    {results.decks.map((deck, index) => {
                      const resultIndex = index;
                      return (
                        <button
                          key={deck.id}
                          onClick={() => handleResultClick(deck)}
                          className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                            resultIndex === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {highlightMatch(deck.name, query)}
                            </p>
                            {deck.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {highlightMatch(deck.description, query)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {t('search.cardsCount', { count: deck.cardCount })}
                            </p>
                          </div>
                        </div>
                      </button>
                      );
                    })}
                  </div>
                )}

                {/* Card results */}
                {results.cards.length > 0 && (
                  <div>
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {t('search.cards')} ({results.cards.length})
                    </h3>
                    {results.cards.map((card, index) => {
                      const resultIndex = results.decks.length + index;
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleResultClick(card)}
                          className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                            resultIndex === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              {highlightMatch(card.frontContent.substring(0, 100), query)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {highlightMatch(card.backContent.substring(0, 100), query)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {t('search.inDeck', { deckName: card.deckName })}
                            </p>
                          </div>
                        </div>
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">{t('search.startSearching')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('search.searchContent')}</p>
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">ESC</kbd> {t('search.close')}
              </span>
            </div>
            {results.total > 0 && (
              <span>{t('search.foundResults', { count: results.total })}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

