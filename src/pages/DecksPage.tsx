import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDecks } from '../features/decks/hooks/useDecks';
import { useCards } from '../features/cards/hooks/useCards';
import { AppLayout } from '../components/layout/AppLayout';
import { Loading } from '../components/common/Loading';
import { SwipeableCard } from '../components/common/SwipeableCard';
import { FlipCard } from '../components/common/FlipCard';
import { TagSelector } from '../components/common/TagSelector';
import { TagBadge } from '../components/common/TagBadge';
import { TagFilter } from '../components/common/TagFilter';
import { toast } from '../hooks/useToast';
import ReactMarkdown from 'react-markdown';
import * as db from '../lib/supabase/database';
import type { Tag } from '../lib/types/tag';
import type { CardType } from '../lib/types/deck';
import {
  parseCloze,
  validateCloze,
  renderClozeFront,
  renderClozeBack,
} from '../features/cards/utils/clozeParser';
import React from 'react';

const CARDS_PER_PAGE = 12;

export function DecksPage() {
  const { t } = useTranslation();
  const { deckId } = useParams<{ deckId: string }>();
  const { currentDeck, loadDeck, loading: deckLoading } = useDecks();
  const { cards, loadCards, createCard, deleteCard, loading: cardsLoading } = useCards(deckId);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardType, setCardType] = useState<CardType>('basic');
  const [frontContent, setFrontContent] = useState('');
  const [backContent, setBackContent] = useState('');
  const [clozeContent, setClozeContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'front' | 'back'>('front');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [cardTags, setCardTags] = useState<Record<string, Tag[]>>({});
  const [filterTagIds, setFilterTagIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Parse cloze content for validation and preview
  const parsedCloze = useMemo(() => {
    if (cardType !== 'cloze' || !clozeContent) return null;
    return parseCloze(clozeContent);
  }, [cardType, clozeContent]);

  const clozeValidation = useMemo(() => {
    if (cardType !== 'cloze' || !clozeContent) return { valid: true, errors: [] };
    return validateCloze(clozeContent);
  }, [cardType, clozeContent]);

  const clozeFieldCount = parsedCloze?.fields.length || 0;

  useEffect(() => {
    if (deckId) {
      loadDeck(deckId);
      loadCards(deckId);
      loadCardTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]); // Only run when deckId changes

  const loadCardTags = async () => {
    if (!deckId) return;
    try {
      const cardsWithTags = await db.getCardsWithTags(deckId);
      const tagsMap: Record<string, Tag[]> = {};
      cardsWithTags.forEach((card: any) => {
        tagsMap[card.id] = (card.card_tags || [])
          .map((ct: any) => ct.tags)
          .filter((tag: any) => tag != null);
      });
      setCardTags(tagsMap);
    } catch (error) {
      console.error('Failed to load card tags:', error);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) return;

    // Validate cloze syntax for cloze cards
    if (cardType === 'cloze') {
      if (!clozeContent.trim()) {
        toast.error(t('deck.clozeContentRequired') || 'Cloze content is required');
        return;
      }
      const validation = validateCloze(clozeContent);
      if (!validation.valid) {
        toast.error(validation.errors.join(', '));
        return;
      }
    } else {
      // Validate basic cards
      if (!frontContent.trim() || !backContent.trim()) {
        toast.error(t('deck.contentRequired') || 'Front and back content are required');
        return;
      }
    }

    try {
      const newCard = await createCard(
        {
          front_content: cardType === 'cloze' ? clozeContent : frontContent,
          back_content: cardType === 'cloze' ? '' : backContent,
          position: cards.length,
          card_type: cardType,
          cloze_data: cardType === 'cloze' ? parsedCloze : null,
        },
        deckId
      );

      // Add tags to the new card
      if (newCard && selectedTags.length > 0) {
        await Promise.all(
          selectedTags.map(tag => db.addTagToCard(newCard.id, tag.id))
        );
        // Reload tags
        await loadCardTags();
      }

      toast.success(t('toasts.success'));
      setShowCardModal(false);
      setCardType('basic');
      setFrontContent('');
      setBackContent('');
      setClozeContent('');
      setSelectedTags([]);
    } catch (error) {
      toast.error(t('errors.updateFailed'));
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard(cardId);
      toast.success(t('toasts.deleted'));
    } catch (error) {
      toast.error(t('errors.deleteFailed'));
    }
  };

  // Get all used tags and their counts
  const getAllUsedTags = () => {
    const tagMap = new Map<string, { tag: Tag; count: number }>();
    Object.values(cardTags).forEach(tags => {
      tags.forEach(tag => {
        const existing = tagMap.get(tag.id);
        if (existing) {
          existing.count++;
        } else {
          tagMap.set(tag.id, { tag, count: 1 });
        }
      });
    });
    return Array.from(tagMap.values());
  };

  const usedTags = getAllUsedTags();
  const availableTags = usedTags.map(t => t.tag);
  const tagCounts = Object.fromEntries(usedTags.map(t => [t.tag.id, t.count]));

  // Filter and search cards
  const filteredCards = useMemo(() => {
    let result = cards;

    // Filter by tags
    if (filterTagIds.size > 0) {
      result = result.filter(card => {
        const tags = cardTags[card.id] || [];
        return tags.some(tag => filterTagIds.has(tag.id));
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card =>
        card.front_content.toLowerCase().includes(query) ||
        card.back_content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [cards, cardTags, filterTagIds, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    return filteredCards.slice(startIndex, endIndex);
  }, [filteredCards, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTagIds]);

  const toggleTagFilter = (tagId: string) => {
    setFilterTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  if (deckLoading || cardsLoading) {
    return <Loading />;
  }

  if (!currentDeck) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{t('deck.notFound')}</p>
          <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
            {t('deck.backToList')}
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
          {t('deck.backToList')}
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentDeck.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{currentDeck.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('deck.totalCards', { count: cards.length })}</p>
          </div>
          {cards.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCardModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {t('deck.addCard')}
              </button>
              <Link
                to={`/decks/${deckId}/study`}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {t('deck.study')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t('deck.noCards')}</p>
          <button
            onClick={() => setShowCardModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            {t('deck.addCard')}
          </button>
        </div>
      ) : (
        <>
          {/* Search box */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('deck.searchCards')}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t('deck.foundResults', { count: filteredCards.length, total: cards.length })}
              </p>
            )}
          </div>

          {/* Tag filter */}
          <TagFilter
            availableTags={availableTags}
            selectedTagIds={filterTagIds}
            onToggleTag={toggleTagFilter}
            onClearFilter={() => setFilterTagIds(new Set())}
            tagCounts={tagCounts}
          />

          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t('deck.noMatchingCards')}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTagIds(new Set());
                }}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('deck.clearFilter')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCards.map((card) => (
                  <SwipeableCard
                    key={card.id}
                    frontContent={
                      <>
                        <div className="prose prose-sm dark:prose-invert max-w-none max-h-48 overflow-y-auto break-words">
                          <ReactMarkdown>{card.front_content}</ReactMarkdown>
                        </div>
                        {/* Tag display */}
                        {cardTags[card.id] && cardTags[card.id].length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {cardTags[card.id].map(tag => (
                              <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                          </div>
                        )}
                      </>
                    }
                    backContent={
                      <>
                        <div className="prose prose-sm dark:prose-invert max-w-none max-h-48 overflow-y-auto break-words">
                          <ReactMarkdown>{card.back_content}</ReactMarkdown>
                        </div>
                        {/* Tag display (back) */}
                        {cardTags[card.id] && cardTags[card.id].length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {cardTags[card.id].map(tag => (
                              <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                          </div>
                        )}
                      </>
                    }
                    onDelete={() => handleDeleteCard(card.id)}
                  />
                ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.previous')}
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Only show page numbers near current page
                      return page === 1 || page === totalPages ||
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, arr) => {
                      const prevPage = arr[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 py-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
          )}
        </>
      )}

      {showCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('deck.modalTitle')}</h2>
            <form onSubmit={handleCreateCard}>
              {/* Card type selector */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('deck.cardType') || 'Card Type'}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCardType('basic')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      cardType === 'basic'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('deck.basicCard') || 'Basic'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('cloze')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      cardType === 'cloze'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('deck.clozeCard') || 'Cloze'}
                  </button>
                </div>
              </div>

              {cardType === 'basic' ? (
                // Basic card inputs
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('deck.frontContent')}</label>
                    <textarea
                      required
                      value={frontContent}
                      onChange={(e) => setFrontContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={10}
                      placeholder={t('deck.frontExample')}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('deck.backContent')}</label>
                    <textarea
                      required
                      value={backContent}
                      onChange={(e) => setBackContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={10}
                      placeholder={t('deck.backExample')}
                    />
                  </div>
                </div>
              ) : (
                // Cloze card input
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    {t('deck.clozeContent') || 'Cloze Content'}
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                      ({t('deck.clozeHint') || 'Use {{c1::answer}} format'})
                    </span>
                  </label>
                  <textarea
                    required
                    value={clozeContent}
                    onChange={(e) => setClozeContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={10}
                    placeholder="{{c1::Paris}} is the capital of {{c2::France}}."
                  />
                  {/* Cloze help */}
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">{t('deck.clozeSyntaxHelp') || 'Cloze Syntax:'}</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="bg-white dark:bg-gray-800 px-1 rounded">{"{{c1::answer}}"}</code> - {t('deck.clozeBasic') || 'Basic cloze'}</li>
                      <li><code className="bg-white dark:bg-gray-800 px-1 rounded">{"{{c2::answer::hint}}"}</code> - {t('deck.clozeWithHint') || 'Cloze with hint'}</li>
                    </ul>
                  </div>
                  {/* Cloze field count */}
                  {clozeFieldCount > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {t('deck.clozeFieldCount') || 'This will create'} {clozeFieldCount} {clozeFieldCount === 1 ? t('deck.card') || 'card' : t('deck.cards') || 'cards'}
                    </div>
                  )}
                  {/* Validation errors */}
                  {!clozeValidation.valid && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {clozeValidation.errors.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Tag selection */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('tag.label')}</label>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagSelect={(tag) => setSelectedTags(prev => [...prev, tag])}
                  onTagRemove={(tag) => setSelectedTags(prev => prev.filter(t => t.id !== tag.id))}
                />
              </div>

              {/* Live preview */}
              {cardType === 'basic' && (frontContent || backContent) && (
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('deck.previewLabel')}</label>
                  <FlipCard
                    frontContent={
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{frontContent || t('deck.front')}</ReactMarkdown>
                      </div>
                    }
                    backContent={
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{backContent || t('deck.back')}</ReactMarkdown>
                      </div>
                    }
                    isFlipped={previewMode === 'back'}
                    onFlip={() => setPreviewMode(previewMode === 'front' ? 'back' : 'front')}
                    showBothSides={true}
                  />
                </div>
              )}

              {/* Cloze preview */}
              {cardType === 'cloze' && parsedCloze && clozeFieldCount > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    {t('deck.previewLabel')} ({t('deck.clozePreviewOf') || 'Preview of'} Cloze 1/{clozeFieldCount})
                  </label>
                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('study.front')}</span>
                    </div>
                    <div className="text-center text-lg text-gray-900 dark:text-gray-100 mb-4">
                      <ReactMarkdown>{renderClozeFront(parsedCloze, 'c1')}</ReactMarkdown>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="text-center mb-2">
                        <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('study.back')}</span>
                      </div>
                      <div className="text-center text-lg">
                        <ReactMarkdown>{renderClozeBack(parsedCloze, 'c1')}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {cardType === 'basic' && (
                  <button
                    type="button"
                    onClick={() => setPreviewMode(previewMode === 'front' ? 'back' : 'front')}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg"
                  >
                    {t('deck.togglePreview')}
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCardModal(false);
                    setCardType('basic');
                    setFrontContent('');
                    setBackContent('');
                    setClozeContent('');
                    setSelectedTags([]);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg"
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

