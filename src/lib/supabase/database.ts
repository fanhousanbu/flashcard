// @ts-nocheck - Supabase type inference issues with manual type definitions
import { supabase } from './client';
import type { Deck, Card } from '../types/deck';

export { supabase };

// ==================== Deck Operations ====================

export async function getActiveDecks(userId: string) {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Deck[];
}

export async function getDeckById(deckId: string) {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data as Deck;
}

export async function createDeck(deck: { user_id: string; name: string; description?: string; is_public?: boolean }) {
  const { data, error } = await supabase
    .from('decks')
    .insert(deck)
    .select()
    .single();

  if (error) throw error;
  return data as Deck;
}

export async function updateDeck(deckId: string, updates: Partial<Deck>) {
  const { data, error } = await supabase
    .from('decks')
    .update(updates)
    .eq('id', deckId)
    .select()
    .single();

  if (error) throw error;
  return data as Deck;
}

export async function softDeleteDeck(deckId: string) {
  // Use PostgreSQL function to bypass RLS issues
  const { error } = await supabase.rpc('soft_delete_deck', {
    deck_id: deckId
  });

  if (error) throw error;
}

export async function restoreDeck(deckId: string) {
  const { data, error } = await supabase
    .from('decks')
    .update({ deleted_at: null })
    .eq('id', deckId)
    .select();

  if (error) throw error;
  return data;
}

export async function softDeleteDeckWithCards(deckId: string) {
  // Use PostgreSQL function to handle both deck and cards deletion
  const { error } = await supabase.rpc('soft_delete_deck', {
    deck_id: deckId
  });

  if (error) throw error;
}

// ==================== Card Operations ====================

export async function getCardsByDeckId(deckId: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (error) throw error;
  return data as Card[];
}

export async function getCardById(cardId: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data as Card;
}

export async function createCard(card: {
  deck_id: string;
  front_content: string;
  back_content: string;
  position: number;
  card_type?: 'basic' | 'cloze';
  cloze_data?: Record<string, unknown> | null;
}) {
  const { data, error } = await supabase
    .from('cards')
    .insert(card)
    .select()
    .single();

  if (error) throw error;
  return data as Card;
}

export async function createClozeCard(card: {
  deck_id: string;
  front_content: string;
  back_content: string;
  position: number;
  cloze_data: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      ...card,
      card_type: 'cloze',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Card;
}

export async function updateCard(cardId: string, updates: Partial<Card>) {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) throw error;
  return data as Card;
}

export async function softDeleteCard(cardId: string) {
  // Use PostgreSQL function to bypass RLS issues
  const { error } = await supabase.rpc('soft_delete_card', {
    card_id: cardId
  });

  if (error) throw error;
}

// ==================== Card Browser Operations ====================

export interface CardWithStats extends Card {
  deck_name?: string;
  study_stats?: {
    total_reviews: number;
    correct_reviews: number;
    last_reviewed_at: string | null;
    next_review_date: string | null;
  };
  tags?: Array<{ id: string; name: string; color: string }>;
}

export interface GetCardsForBrowserOptions {
  userId: string;
  deckId?: string;
  cardType?: 'basic' | 'cloze';
  tagId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get cards for the card browser with optional filters
 * Returns cards with deck name, study stats, and tags
 */
export async function getCardsForBrowser(options: GetCardsForBrowserOptions): Promise<{
  cards: CardWithStats[];
  total: number;
}> {
  const { userId, deckId, cardType, tagId, search, limit = 50, offset = 0 } = options;

  // Build the query with joins to get related data
  let query = supabase
    .from('cards')
    .select(`
      id,
      deck_id,
      front_content,
      back_content,
      position,
      card_type,
      cloze_data,
      created_at,
      decks!inner (
        id,
        name,
        user_id
      ),
      study_records (
        total_reviews,
        correct_reviews,
        last_reviewed_at,
        next_review_date
      )
    `, { count: 'exact' })
    .eq('decks.user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (deckId) {
    query = query.eq('deck_id', deckId);
  }
  if (cardType) {
    query = query.eq('card_type', cardType);
  }
  if (search) {
    query = query.or(`front_content.ilike.%${search}%,back_content.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  // Filter by tag if specified (needs to be done after fetching tags separately)
  let cards = data as unknown as CardWithStats[];

  // Fetch tags for all cards
  if (cards.length > 0) {
    const cardIds = cards.map(c => c.id);
    const { data: tagData } = await supabase
      .from('card_tags')
      .select('card_id, tags(id, name, color)')
      .in('card_id', cardIds);

    if (tagData) {
      const cardTagsMap = new Map<string, Array<{ id: string; name: string; color: string }>>();
      for (const ct of tagData) {
        const cardId = (ct as any).card_id;
        const tag = (ct as any).tags;
        if (tag) {
          if (!cardTagsMap.has(cardId)) {
            cardTagsMap.set(cardId, []);
          }
          cardTagsMap.get(cardId)!.push(tag);
        }
      }
      cards.forEach(card => {
        card.tags = cardTagsMap.get(card.id) || [];
      });
    }
  }

  // Filter by tag if specified
  if (tagId) {
    cards = cards.filter(card => card.tags?.some(tag => tag.id === tagId));
  }

  // Transform study_records to a single stats object per card
  cards = cards.map(card => {
    const records = (card as any).study_records;
    const stats = records && records.length > 0 ? records[0] : null;
    return {
      ...card,
      deck_name: (card as any).decks?.name,
      study_stats: stats ? {
        total_reviews: stats.total_reviews || 0,
        correct_reviews: stats.correct_reviews || 0,
        last_reviewed_at: stats.last_reviewed_at,
        next_review_date: stats.next_review_date,
      } : undefined,
    };
  });

  // Remove the nested properties that we don't need
  cards = cards.map(({ decks, study_records: _, ...rest }) => rest) as CardWithStats[];

  return {
    cards,
    total: tagId ? cards.length : (count || 0),
  };
}

/**
 * Batch update cards
 */
export async function batchUpdateCards(
  cardIds: string[],
  updates: Partial<Pick<Card, 'front_content' | 'back_content' | 'card_type' | 'cloze_data'>>
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update(updates)
    .in('id', cardIds);

  if (error) throw error;
}

/**
 * Batch move cards to a different deck
 */
export async function batchMoveCards(cardIds: string[], targetDeckId: string): Promise<void> {
  // First, get the max position in the target deck
  const { data: maxPosData } = await supabase
    .from('cards')
    .select('position')
    .eq('deck_id', targetDeckId)
    .is('deleted_at', null)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = (maxPosData && maxPosData.length > 0 ? (maxPosData[0].position || 0) + 1 : 0);

  // Update all cards with their new positions
  const updates = cardIds.map((cardId, index) =>
    supabase
      .from('cards')
      .update({ deck_id: targetDeckId, position: nextPosition + index })
      .eq('id', cardId)
  );

  await Promise.all(updates);
}

/**
 * Batch delete cards (soft delete)
 */
export async function batchDeleteCards(cardIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', cardIds);

  if (error) throw error;
}

/**
 * Add tag to multiple cards
 */
export async function batchAddTagToCards(cardIds: string[], tagId: string): Promise<void> {
  const inserts = cardIds.map(cardId =>
    supabase
      .from('card_tags')
      .insert({ card_id: cardId, tag_id: tagId })
      .onConflict('card_id,tag_id')
      .ignore()
  );

  await Promise.all(inserts);
}

/**
 * Remove tag from multiple cards
 */
export async function batchRemoveTagFromCards(cardIds: string[], tagId: string): Promise<void> {
  const { error } = await supabase
    .from('card_tags')
    .delete()
    .in('card_id', cardIds)
    .eq('tag_id', tagId);

  if (error) throw error;
}

// ==================== Study Record Operations ====================

export async function getStudyRecord(userId: string, cardId: string) {
  const { data, error } = await supabase
    .from('study_records')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 on not found

  if (error) {
    console.error('getStudyRecord error:', error);
    throw error;
  }
  return data;
}

export async function upsertStudyRecord(record: {
  user_id: string;
  card_id: string;
  easiness_factor?: number;
  interval?: number;
  repetitions?: number;
  next_review_date?: string;
  last_reviewed_at: string;
  last_quality: number;
  increment_total?: boolean;
  increment_correct?: boolean;
  stability?: number;
  difficulty?: number;
  answer_time_ms?: number;
}) {
  // First, get the existing record to calculate cumulative statistics
  const existing = await getStudyRecord(record.user_id, record.card_id);

  // Build the update data
  const updateData: Record<string, unknown> = {
    user_id: record.user_id,
    card_id: record.card_id,
    last_reviewed_at: record.last_reviewed_at,
    last_quality: record.last_quality,
    total_reviews: (existing?.total_reviews || 0) + (record.increment_total ? 1 : 0),
    correct_reviews: (existing?.correct_reviews || 0) + (record.increment_correct ? 1 : 0),
  };

  // Only update SM-2 related fields if they are provided
  if (record.easiness_factor !== undefined) {
    updateData.easiness_factor = record.easiness_factor;
  } else if (existing) {
    updateData.easiness_factor = existing.easiness_factor;
  } else {
    updateData.easiness_factor = 2.5; // Default value
  }

  if (record.interval !== undefined) {
    updateData.interval = record.interval;
  } else if (existing) {
    updateData.interval = existing.interval;
  } else {
    updateData.interval = 1; // Default value
  }

  if (record.repetitions !== undefined) {
    updateData.repetitions = record.repetitions;
  } else if (existing) {
    updateData.repetitions = existing.repetitions;
  } else {
    updateData.repetitions = 0; // Default value
  }

  if (record.next_review_date !== undefined) {
    updateData.next_review_date = record.next_review_date;
  } else if (existing) {
    updateData.next_review_date = existing.next_review_date;
  } else {
    updateData.next_review_date = new Date().toISOString(); // Default value
  }

  // FSRS fields
  if (record.stability !== undefined) {
    updateData.stability = record.stability;
  } else if (existing && existing.stability !== undefined) {
    updateData.stability = existing.stability;
  } else {
    updateData.stability = 0; // Default value
  }

  if (record.difficulty !== undefined) {
    updateData.difficulty = record.difficulty;
  } else if (existing && existing.difficulty !== undefined) {
    updateData.difficulty = existing.difficulty;
  } else {
    updateData.difficulty = 5; // Default value
  }

  if (record.answer_time_ms !== undefined) {
    updateData.answer_time_ms = record.answer_time_ms;
  } else if (existing && existing.answer_time_ms !== undefined) {
    updateData.answer_time_ms = existing.answer_time_ms;
  } else {
    updateData.answer_time_ms = 0; // Default value
  }

  const { data, error } = await supabase
    .from('study_records')
    .upsert(updateData, { onConflict: 'user_id,card_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDueCards(userId: string, deckId: string) {
  const now = new Date().toISOString();
  
  // 1. Get due cards with study records
  const { data: dueRecords, error: dueError } = await supabase
    .from('study_records')
    .select('*, cards!inner(*)')
    .eq('user_id', userId)
    .eq('cards.deck_id', deckId)
    .lte('next_review_date', now)
    .is('cards.deleted_at', null);

  if (dueError) throw dueError;

  // 2. Get all cards in this deck
  const { data: allCards, error: allCardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .is('deleted_at', null);

  if (allCardsError) throw allCardsError;
  
  // 3. Get all studied card IDs in this deck
  const { data: allStudiedRecords, error: allStudiedError } = await supabase
    .from('study_records')
    .select('card_id, cards!inner(id)')
    .eq('user_id', userId)
    .eq('cards.deck_id', deckId);

  if (allStudiedError) throw allStudiedError;

  // 4. Find new cards (those with no study record)
  const studiedCardIds = new Set((allStudiedRecords || []).map((r: any) => r.card_id));
  const newCards = (allCards || []).filter((card: any) => !studiedCardIds.has(card.id));

  // 5. Convert new cards to the same format as due records
  const newCardsWithRecords = newCards.map((card: any) => ({
    card_id: card.id,
    cards: card,
    user_id: userId,
  }));

  // 6. Merge due cards and new cards
  return [...(dueRecords || []), ...newCardsWithRecords];
}

// ==================== Study Session Operations ====================

export async function createStudySession(session: {
  user_id: string;
  deck_id: string;
  study_mode: string;
}) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeStudySession(
  sessionId: string,
  cardsStudied: number,
  durationSeconds: number
) {
  const { data, error } = await supabase
    .from('study_sessions')
    .update({
      cards_studied: cardsStudied,
      duration_seconds: durationSeconds,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== Marketplace Operations ====================

export async function getPublishedMarketplaceDecks() {
  const { data, error } = await supabase
    .from('marketplace_decks')
    .select('*, decks(*), profiles(username)')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMarketplaceDeckById(id: string) {
  const { data, error } = await supabase
    .from('marketplace_decks')
    .select('*, decks(*), profiles(username)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function publishDeckToMarketplace(marketplaceDeck: {
  deck_id: string;
  author_id: string;
  title: string;
  description?: string;
  price?: number;
}) {
  const { data, error } = await supabase
    .from('marketplace_decks')
    .insert({
      ...marketplaceDeck,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function importDeckFromMarketplace(userId: string, marketplaceDeckId: string) {
  // Get marketplace deck with cards
  const { data: marketplaceDeck, error: marketError } = await supabase
    .from('marketplace_decks')
    .select('*, decks(*, cards(*))')
    .eq('id', marketplaceDeckId)
    .single();

  if (marketError) throw marketError;
  if (!marketplaceDeck) throw new Error('Marketplace deck not found');

  // Check if purchase is required for paid decks
  if (marketplaceDeck.price > 0) {
    const purchase = await checkPurchase(userId, marketplaceDeckId);
    if (!purchase) {
      throw new Error('PURCHASE_REQUIRED');
    }
  }

  const originalDeck = marketplaceDeck.decks as any;

  // Create new deck for user
  const { data: newDeck, error: deckError } = await supabase
    .from('decks')
    .insert({
      user_id: userId,
      name: marketplaceDeck.title,
      description: marketplaceDeck.description,
      is_public: false,
    })
    .select()
    .single();

  if (deckError) throw deckError;

  // Copy cards
  const cards = originalDeck.cards || [];
  if (cards.length > 0) {
    const newCards = cards.map((card: any) => ({
      deck_id: newDeck.id,
      front_content: card.front_content,
      back_content: card.back_content,
      position: card.position,
    }));

    const { error: cardsError } = await supabase
      .from('cards')
      .insert(newCards);

    if (cardsError) throw cardsError;
  }

  // Increment download count
  await supabase
    .from('marketplace_decks')
    .update({ download_count: (marketplaceDeck.download_count || 0) + 1 })
    .eq('id', marketplaceDeckId);

  return newDeck;
}

export async function checkPurchase(userId: string, marketplaceDeckId: string) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('marketplace_deck_id', marketplaceDeckId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createPurchase(purchase: {
  user_id: string;
  marketplace_deck_id: string;
  amount: number;
}) {
  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add or update marketplace deck rating
 */
export async function rateMarketplaceDeck(
  marketplaceDeckId: string,
  userId: string,
  rating: number
) {
  const { data, error } = await supabase
    .from('marketplace_ratings')
    .upsert({
      marketplace_deck_id: marketplaceDeckId,
      user_id: userId,
      rating,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's rating for marketplace deck
 */
export async function getUserRating(marketplaceDeckId: string, userId: string) {
  const { data, error } = await supabase
    .from('marketplace_ratings')
    .select('rating')
    .eq('marketplace_deck_id', marketplaceDeckId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.rating || null;
}

/**
 * Search marketplace decks
 */
export async function searchMarketplaceDecks(query: string, filters?: {
  minRating?: number;
  maxPrice?: number;
  sortBy?: 'rating' | 'download_count' | 'created_at' | 'updated_at';
  categoryId?: string | null;
  onlyFree?: boolean;
}) {
  let queryBuilder = supabase
    .from('marketplace_decks')
    .select('*, profiles(username), marketplace_categories(*)')
    .eq('is_published', true)
    .is('deleted_at', null);

  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  if (filters?.minRating) {
    queryBuilder = queryBuilder.gte('rating', filters.minRating);
  }

  if (filters?.maxPrice !== undefined) {
    queryBuilder = queryBuilder.lte('price', filters.maxPrice);
  }

  if (filters?.categoryId) {
    queryBuilder = queryBuilder.eq('category_id', filters.categoryId);
  }

  if (filters?.onlyFree) {
    queryBuilder = queryBuilder.eq('price', 0);
  }

  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = sortBy === 'rating' || sortBy === 'download_count' ? 'desc' : 'desc';
  queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

  const { data, error } = await queryBuilder;

  if (error) throw error;
  return data || [];
}

/**
 * Get marketplace categories
 */
export async function getMarketplaceCategories() {
  const { data, error } = await supabase
    .from('marketplace_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get marketplace deck detail with preview cards
 */
export async function getMarketplaceDeckDetail(marketplaceDeckId: string, previewCount = 3) {
  // Get marketplace deck with author and category info
  const { data: marketplaceDeck, error: deckError } = await supabase
    .from('marketplace_decks')
    .select('*, profiles(username), marketplace_categories(*)')
    .eq('id', marketplaceDeckId)
    .is('deleted_at', null)
    .single();

  if (deckError) throw deckError;
  if (!marketplaceDeck) throw new Error('Marketplace deck not found');

  // Get preview cards from original deck
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('id, front_content, back_content, position')
    .eq('deck_id', marketplaceDeck.deck_id)
    .is('deleted_at', null)
    .order('position')
    .limit(previewCount);

  if (cardsError) throw cardsError;

  return {
    ...marketplaceDeck,
    preview_cards: cards || [],
  };
}

/**
 * Batch check user status (purchase, favorite) for multiple decks
 */
export async function getMarketplaceDecksUserStatus(
  userId: string,
  marketplaceDeckIds: string[]
) {
  if (marketplaceDeckIds.length === 0) {
    return {};
  }

  // Get purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select('marketplace_deck_id')
    .eq('user_id', userId)
    .in('marketplace_deck_id', marketplaceDeckIds);

  // Get favorites
  const { data: favorites } = await supabase
    .from('marketplace_favorites')
    .select('marketplace_deck_id')
    .eq('user_id', userId)
    .in('marketplace_deck_id', marketplaceDeckIds);

  const purchasedIds = new Set(purchases?.map(p => p.marketplace_deck_id) || []);
  const favoriteIds = new Set(favorites?.map(f => f.marketplace_deck_id) || []);

  return marketplaceDeckIds.reduce((acc, id) => {
    acc[id] = {
      is_purchased: purchasedIds.has(id),
      is_favorited: favoriteIds.has(id),
    };
    return acc;
  }, {} as Record<string, { is_purchased: boolean; is_favorited: boolean }>);
}

/**
 * Add deck to favorites
 */
export async function addFavorite(userId: string, marketplaceDeckId: string) {
  const { data, error } = await supabase
    .from('marketplace_favorites')
    .insert({ user_id: userId, marketplace_deck_id: marketplaceDeckId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove deck from favorites
 */
export async function removeFavorite(userId: string, marketplaceDeckId: string) {
  const { error } = await supabase
    .from('marketplace_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('marketplace_deck_id', marketplaceDeckId);

  if (error) throw error;
}

/**
 * Check if deck is in user's favorites
 */
export async function checkFavorite(userId: string, marketplaceDeckId: string) {
  const { data, error } = await supabase
    .from('marketplace_favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('marketplace_deck_id', marketplaceDeckId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Get user's favorite decks
 */
export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('marketplace_favorites')
    .select('*, marketplace_decks(*, profiles(username), marketplace_categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get marketplace decks published by user
 */
export async function getUserPublishedMarketplaceDecks(authorId: string) {
  const { data, error } = await supabase
    .from('marketplace_decks')
    .select('*, decks(*), marketplace_categories(*)')
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Unpublish a marketplace deck (soft unpublish)
 */
export async function unpublishMarketplaceDeck(marketplaceDeckId: string, authorId: string) {
  // Verify ownership
  const { data: deck } = await supabase
    .from('marketplace_decks')
    .select('author_id')
    .eq('id', marketplaceDeckId)
    .single();

  if (!deck) throw new Error('Deck not found');
  if (deck.author_id !== authorId) throw new Error('Not authorized');

  // Soft unpublish
  const { data, error } = await supabase
    .from('marketplace_decks')
    .update({ is_published: false })
    .eq('id', marketplaceDeckId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update marketplace deck info
 */
export async function updateMarketplaceDeck(
  marketplaceDeckId: string,
  authorId: string,
  updates: {
    title?: string;
    description?: string;
    price?: number;
    category_id?: string;
  }
) {
  // Verify ownership
  const { data: deck } = await supabase
    .from('marketplace_decks')
    .select('author_id')
    .eq('id', marketplaceDeckId)
    .single();

  if (!deck) throw new Error('Deck not found');
  if (deck.author_id !== authorId) throw new Error('Not authorized');

  const { data, error } = await supabase
    .from('marketplace_decks')
    .update(updates)
    .eq('id', marketplaceDeckId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get author statistics
 */
export async function getAuthorStats(authorId: string) {
  // Get all published decks by author
  const { data: decks, error } = await supabase
    .from('marketplace_decks')
    .select('id, download_count, rating, rating_count, price, is_published')
    .eq('author_id', authorId)
    .is('deleted_at', null);

  if (error) throw error;

  const publishedDecks = decks?.filter(d => d.is_published) || [];
  const totalDecks = publishedDecks.length;
  const totalDownloads = publishedDecks.reduce((sum, d) => sum + (d.download_count || 0), 0);

  // Get total sales and revenue from purchases
  const deckIds = publishedDecks.map(d => d.id);
  let totalSales = 0;
  let totalRevenue = 0;

  if (deckIds.length > 0) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('amount, marketplace_decks(*)')
      .in('marketplace_deck_id', deckIds);

    totalSales = purchases?.length || 0;
    totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  }

  // Calculate average rating
  const ratingsWithCount = publishedDecks.filter(d => d.rating_count > 0);
  const averageRating = ratingsWithCount.length > 0
    ? ratingsWithCount.reduce((sum, d) => sum + d.rating, 0) / ratingsWithCount.length
    : 0;

  return {
    totalDecks,
    totalDownloads,
    totalSales,
    totalRevenue,
    averageRating,
  };
}

// ==================== Study Statistics Operations ====================

/**
 * Get deck study statistics
 * @param userId User ID
 * @param deckId Deck ID
 * @returns Deck study statistics
 */
export async function getDeckStudyStats(userId: string, deckId: string) {
  // First get all cards in the deck
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('id')
    .eq('deck_id', deckId)
    .is('deleted_at', null);

  if (cardsError) throw cardsError;
  
  const totalCards = cards?.length || 0;
  
  if (totalCards === 0) {
    return {
      totalCards: 0,
      studiedCards: 0,
      totalReviews: 0,
      correctReviews: 0,
      averageEasiness: 2.5,
      successRate: 0,
    };
  }

  // Get study records
  const { data: records, error: recordsError } = await supabase
    .from('study_records')
    .select('*')
    .eq('user_id', userId)
    .in('card_id', cards.map(c => c.id));

  if (recordsError) throw recordsError;

  // Calculate statistics
  const stats = {
    totalCards,
    studiedCards: records?.filter(r => r.total_reviews > 0).length || 0,
    totalReviews: records?.reduce((sum, r) => sum + (r.total_reviews || 0), 0) || 0,
    correctReviews: records?.reduce((sum, r) => sum + (r.correct_reviews || 0), 0) || 0,
    averageEasiness: records && records.length > 0 
      ? records.reduce((sum, r) => sum + r.easiness_factor, 0) / records.length 
      : 2.5,
    successRate: 0,
  };
  
  if (stats.totalReviews > 0) {
    stats.successRate = (stats.correctReviews / stats.totalReviews) * 100;
  }
  
  return stats;
}

/**
 * Get overall user study statistics
 * Only counts active (non-deleted) cards and decks
 * @param userId User ID
 * @returns Overall user study statistics
 */
export async function getUserStudyStats(userId: string) {
  // First get the user's active deck IDs
  const { data: decksData, error: decksError } = await supabase
    .from('decks')
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (decksError) throw decksError;

  const deckIds = decksData?.map(d => d.id) || [];

  // If no decks, return zeros
  if (deckIds.length === 0) {
    return {
      totalCards: 0,
      studiedCards: 0,
      totalReviews: 0,
      correctReviews: 0,
      successRate: 0,
    };
  }

  // Count active cards in user's decks
  const { data: cardsData, error: cardsError } = await supabase
    .from('cards')
    .select('id')
    .in('deck_id', deckIds)
    .is('deleted_at', null);

  if (cardsError) throw cardsError;

  const totalCards = cardsData?.length || 0;
  const cardIds = cardsData?.map(c => c.id) || [];

  // Get study records only for active cards
  const { data: studyData, error: studyError } = await supabase
    .from('study_records')
    .select('total_reviews, correct_reviews')
    .eq('user_id', userId)
    .in('card_id', cardIds.length > 0 ? cardIds : ['00000000-0000-0000-0000-000000000000']);

  if (studyError) throw studyError;

  const studiedCards = studyData?.filter(r => r.total_reviews > 0).length || 0;
  const totalReviews = studyData?.reduce((sum, r) => sum + (r.total_reviews || 0), 0) || 0;
  const correctReviews = studyData?.reduce((sum, r) => sum + (r.correct_reviews || 0), 0) || 0;

  return {
    totalCards,
    studiedCards,
    totalReviews,
    correctReviews,
    successRate: totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0,
  };
}

/**
 * Get user's recent study sessions
 * @param userId User ID
 * @param limit The maximum number of records to return
 * @returns A list of study sessions
 */
export async function getRecentStudySessions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*, decks(name)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get study trend data within time range
 * @param userId User ID
 * @param startDate Start date
 * @param endDate End date
 * @returns Study statistics grouped by date
 */
export async function getStudyTrendData(userId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, cards_studied')
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString())
    .order('started_at', { ascending: true });

  if (error) throw error;

  // Group stats by date
  const dailyData = new Map<string, { date: string; cards: number; sessions: number }>();
  
  (data || []).forEach(session => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    const existing = dailyData.get(date) || { date, cards: 0, sessions: 0 };
    existing.cards += session.cards_studied || 0;
    existing.sessions += 1;
    dailyData.set(date, existing);
  });

  return Array.from(dailyData.values());
}

/**
 * Get success rate trend data within time range
 * @param userId User ID
 * @param startDate Start date
 * @param endDate End date
 * @returns Success rate data grouped by date
 */
export async function getSuccessRateTrendData(userId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('study_records')
    .select('updated_at, total_reviews, correct_reviews')
    .eq('user_id', userId)
    .gte('updated_at', startDate.toISOString())
    .lte('updated_at', endDate.toISOString())
    .order('updated_at', { ascending: true });

  if (error) throw error;

  // Group stats by date
  const dailyData = new Map<string, { date: string; total: number; correct: number }>();
  
  (data || []).forEach(record => {
    const date = new Date(record.updated_at).toISOString().split('T')[0];
    const existing = dailyData.get(date) || { date, total: 0, correct: 0 };
    existing.total += record.total_reviews || 0;
    existing.correct += record.correct_reviews || 0;
    dailyData.set(date, existing);
  });

  return Array.from(dailyData.values()).map(item => ({
    date: item.date,
    successRate: item.total > 0 ? (item.correct / item.total) * 100 : 0,
  }));
}

/**
 * Get study activity data (for heatmap)
 * @param userId User ID
 * @param startDate Start date
 * @param endDate End date
 * @returns Study activity grouped by date and week
 */
export async function getStudyActivityData(userId: string, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, cards_studied')
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (error) throw error;

  // Group by date and count cards studied per day
  const activityMap = new Map<string, number>();
  
  (data || []).forEach(session => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    const existing = activityMap.get(date) || 0;
    activityMap.set(date, existing + (session.cards_studied || 0));
  });

  return Array.from(activityMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

// ==================== Search Operations ====================

/**
 * Search decks
 * @param userId User ID
 * @param query Search query
 * @returns A list of matching decks
 */
export async function searchDecks(userId: string, query: string) {
  const { data, error } = await supabase
    .from('decks')
    .select('id, name, description, created_at')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10);
  
  if (error) throw error;
  
  // Get card count for each deck
  const decksWithCount = await Promise.all(
    (data || []).map(async (deck) => {
      const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deck.id)
        .is('deleted_at', null);
      
      return {
        ...deck,
        cardCount: count || 0,
      };
    })
  );
  
  return decksWithCount;
}

/**
 * Search cards
 * @param userId User ID
 * @param query Search query
 * @returns A list of matching cards
 */
export async function searchCards(userId: string, query: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, decks!inner(id, name, user_id)')
    .eq('decks.user_id', userId)
    .is('deleted_at', null)
    .is('decks.deleted_at', null)
    .or(`front_content.ilike.%${query}%,back_content.ilike.%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data || [];
}

// ==================== Tag Operations ====================

/**
 * Create tag
 */
export async function createTag(tag: { user_id: string; name: string; color: string }) {
  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get all user tags
 */
export async function getUserTags(userId: string) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('name');
  
  if (error) throw error;
  return data;
}

/**
 * Update tag
 */
export async function updateTag(tagId: string, updates: { name?: string; color?: string }) {
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', tagId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Soft delete tag
 */
export async function softDeleteTag(tagId: string) {
  const { error } = await supabase
    .from('tags')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', tagId);
  
  if (error) throw error;
}

// ==================== Card Tag Operations ====================

/**
 * Add tag to card
 */
export async function addTagToCard(cardId: string, tagId: string) {
  const { data, error } = await supabase
    .from('card_tags')
    .insert({ card_id: cardId, tag_id: tagId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Remove tag from card
 */
export async function removeTagFromCard(cardId: string, tagId: string) {
  const { error } = await supabase
    .from('card_tags')
    .delete()
    .eq('card_id', cardId)
    .eq('tag_id', tagId);
  
  if (error) throw error;
}

/**
 * Get all tags for a card
 */
export async function getCardTags(cardId: string) {
  const { data, error } = await supabase
    .from('card_tags')
    .select('*, tags(*)')
    .eq('card_id', cardId);
  
  if (error) throw error;
  return data;
}

/**
 * Get all cards with tags in a deck
 */
export async function getCardsWithTags(deckId: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, card_tags(*, tags(*))')
    .eq('deck_id', deckId)
    .is('deleted_at', null)
    .order('position');
  
  if (error) throw error;
  return data;
}

/**
 * Filter cards by tag
 */
export async function getCardsByTag(deckId: string, tagId: string) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, card_tags!inner(*)')
    .eq('deck_id', deckId)
    .eq('card_tags.tag_id', tagId)
    .is('deleted_at', null)
    .order('position');

  if (error) throw error;
  return data;
}

// ==================== User Preferences Operations ====================

/**
 * Get user preferences by user ID
 */
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

/**
 * Create or update user preferences (upsert)
 */
export async function upsertUserPreferences(
  userId: string,
  preferences: {
    default_study_mode?: 'spaced' | 'simple';
    daily_goal_cards?: number;
  }
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: {
    default_study_mode?: 'spaced' | 'simple';
    daily_goal_cards?: number;
  }
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

