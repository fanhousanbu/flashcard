import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';

import { toast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';
import * as db from '../lib/supabase/database';
import type { CardWithStats } from '../lib/supabase/database';
import type { Deck } from '../lib/types/deck';
import type { Tag } from '../lib/types/tag';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

const CARDS_PER_PAGE = 50;

export function CardBrowserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Data state
  const [cards, setCards] = useState<CardWithStats[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter state
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [selectedCardType, setSelectedCardType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  // Preview state
  const [previewCard, setPreviewCard] = useState<CardWithStats | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Batch operation state
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTargetDeckId, setMoveTargetDeckId] = useState('');

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeckId, selectedTagId, selectedCardType, currentPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load decks for filter
      const userDecks = await db.getActiveDecks(user.id);
      setDecks(userDecks);

      // Load tags for filter
      const { data: tagData } = await db.supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);
      setTags(tagData || []);

      // Load cards with current filters
      const offset = (currentPage - 1) * CARDS_PER_PAGE;
      const result = await db.getCardsForBrowser({
        userId: user.id,
        deckId: selectedDeckId || undefined,
        tagId: selectedTagId || undefined,
        cardType: (selectedCardType as 'basic' | 'cloze') || undefined,
        search: searchQuery || undefined,
        limit: CARDS_PER_PAGE,
        offset,
      });

      setCards(result.cards);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load cards:', error);
      toast.error(t('errors.loadFailed') || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCardIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCardIds.size === cards.length) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(cards.map(c => c.id)));
    }
  };

  const handleDeleteCards = async (cardIds: string[]) => {
    try {
      await db.batchDeleteCards(cardIds);
      toast.success(t('toasts.deleted'));
      setSelectedCardIds(new Set());
      loadData();
    } catch (error) {
      toast.error(t('errors.deleteFailed') || 'Failed to delete cards');
    }
  };

  const handleMoveCards = async () => {
    if (!moveTargetDeckId || selectedCardIds.size === 0) return;

    try {
      await db.batchMoveCards(Array.from(selectedCardIds), moveTargetDeckId);
      toast.success(t('toasts.moved') || 'Cards moved successfully');
      setShowMoveDialog(false);
      setMoveTargetDeckId('');
      setSelectedCardIds(new Set());
      loadData();
    } catch (error) {
      toast.error(t('errors.updateFailed') || 'Failed to move cards');
    }
  };

  const handleBatchAddTag = async (tagId: string) => {
    if (selectedCardIds.size === 0) return;

    try {
      await db.batchAddTagToCards(Array.from(selectedCardIds), tagId);
      toast.success(t('toasts.tagAdded') || 'Tags added successfully');
      loadData();
    } catch (error) {
      toast.error(t('errors.updateFailed') || 'Failed to add tags');
    }
  };

  const handleSearch = useCallback(() => {
    loadData();
  }, [loadData]);

  const getCardTypeLabel = (cardType: string) => {
    if (cardType === 'cloze') return t('deck.clozeCard') || 'Cloze';
    return t('deck.basicCard') || 'Basic';
  };

  const getCardTypeColor = (cardType: string) => {
    if (cardType === 'cloze') return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const locale = t('common.locale') === 'zh' ? zhCN : enUS;
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale });
  };

  const totalPages = Math.ceil(total / CARDS_PER_PAGE);

  if (loading && cards.length === 0) {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('browser.title') || 'Card Browser'}
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('browser.totalCards', { count: total }) || `${total} cards`}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Deck filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('browser.deck') || 'Deck'}
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('browser.allDecks') || 'All Decks'}</option>
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
            </div>

            {/* Tag filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tag.label')}
              </label>
              <select
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('browser.allTags') || 'All Tags'}</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>

            {/* Card type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('browser.cardType') || 'Card Type'}
              </label>
              <select
                value={selectedCardType}
                onChange={(e) => setSelectedCardType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('browser.allTypes') || 'All Types'}</option>
                <option value="basic">{t('deck.basicCard') || 'Basic'}</option>
                <option value="cloze">{t('deck.clozeCard') || 'Cloze'}</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('browser.search') || 'Search'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('browser.searchPlaceholder') || 'Search cards...'}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Batch actions */}
        {selectedCardIds.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              {selectedCardIds.size} {t('browser.selected') || 'selected'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBatchMenu(!showBatchMenu)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {t('browser.batchActions') || 'Batch Actions'} ▼
              </button>
              <button
                onClick={() => handleDeleteCards(Array.from(selectedCardIds))}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                {t('browser.delete') || 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Batch menu */}
        {showBatchMenu && selectedCardIds.size > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setShowMoveDialog(true); setShowBatchMenu(false); }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                {t('browser.moveToDeck') || 'Move to Deck'}
              </button>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => { handleBatchAddTag(tag.id); setShowBatchMenu(false); }}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  + {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Move dialog */}
        {showMoveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">{t('browser.moveToDeck') || 'Move to Deck'}</h3>
              <select
                value={moveTargetDeckId}
                onChange={(e) => setMoveTargetDeckId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              >
                <option value="">{t('browser.selectDeck') || 'Select a deck'}</option>
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowMoveDialog(false); setMoveTargetDeckId(''); }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleMoveCards}
                  disabled={!moveTargetDeckId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card list */}
          <div className="lg:col-span-2 space-y-3">
            {/* Select all checkbox */}
            {cards.length > 0 && (
              <label className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCardIds.size === cards.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('browser.selectAll') || 'Select All'}
                </span>
              </label>
            )}

            {cards.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('browser.noCards') || 'No cards found'}
                </p>
              </div>
            ) : (
              cards.map(card => (
                <div
                  key={card.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                    selectedCardIds.has(card.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${previewCard?.id === card.id ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setPreviewCard(card)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCardIds.has(card.id)}
                      onChange={() => handleSelectCard(card.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCardTypeColor(card.card_type)}`}>
                          {getCardTypeLabel(card.card_type)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {card.deck_name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                        {card.front_content}
                      </p>
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.tags.map(tag => (
                            <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tag.color + '30', color: tag.color }}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {card.study_stats && (
                        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{card.study_stats.total_reviews} {t('browser.reviews') || 'reviews'}</span>
                          <span>{formatDate(card.study_stats.last_reviewed_at)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/decks/${card.deck_id}`);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {t('browser.edit') || 'Edit'}
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('browser.page') || 'Page'} {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {t('browser.preview') || 'Preview'}
                  </h3>
                </div>
                {previewCard ? (
                  <div className="p-4">
                    <div className="mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getCardTypeColor(previewCard.card_type)}`}>
                        {getCardTypeLabel(previewCard.card_type)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">{previewCard.deck_name}</span>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        {t('study.front')}
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                        <ReactMarkdown>{previewCard.front_content}</ReactMarkdown>
                      </div>
                    </div>
                    {previewCard.back_content && (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          {t('study.back')}
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                          <ReactMarkdown>{previewCard.back_content}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {previewCard.tags && previewCard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {previewCard.tags.map(tag => (
                          <span key={tag.id} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: tag.color + '30', color: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {previewCard.study_stats && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{previewCard.study_stats.total_reviews} {t('browser.totalReviews') || 'total reviews'}</div>
                        <div>{previewCard.study_stats.correct_reviews} {t('browser.correct') || 'correct'}</div>
                        <div>{t('browser.lastReviewed') || 'Last reviewed'}: {formatDate(previewCard.study_stats.last_reviewed_at)}</div>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/decks/${previewCard.deck_id}`)}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      {t('browser.editCard') || 'Edit Card'}
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {t('browser.selectPreview') || 'Select a card to preview'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
