// Marketplace type definitions

export interface MarketplaceCategory {
  id: string;
  name_en: string;
  name_zh: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface MarketplaceDeckBase {
  id: string;
  deck_id: string;
  author_id: string;
  title: string;
  description: string | null;
  price: number;
  download_count: number;
  rating: number;
  rating_count: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  category_id: string | null;
  card_count: number;
  cover_image: string | null;
}

export interface MarketplaceDeckWithRelations extends MarketplaceDeckBase {
  profiles?: {
    username: string | null;
  };
  category?: MarketplaceCategory | null;
}

export interface MarketplaceDeckWithDetails extends MarketplaceDeckWithRelations {
  is_purchased?: boolean;
  is_favorited?: boolean;
  is_author?: boolean;
}

export interface CardPreview {
  id: string;
  front_content: string;
  back_content: string;
  position: number;
}

export interface MarketplaceDeckDetail extends MarketplaceDeckWithDetails {
  preview_cards: CardPreview[];
}

export interface MarketplaceFavorite {
  id: string;
  user_id: string;
  marketplace_deck_id: string;
  created_at: string;
}

export interface MarketplaceRating {
  id: string;
  marketplace_deck_id: string;
  user_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceFilters {
  searchQuery?: string;
  categoryId?: string | null;
  minRating?: number;
  maxPrice?: number;
  onlyFree?: boolean;
  sortBy?: 'created_at' | 'rating' | 'download_count' | 'updated_at';
}

export interface PublishDeckForm {
  deckId: string;
  title: string;
  description?: string;
  price: number;
  categoryId?: string;
}

export interface MarketplaceDeckUserStatus {
  is_purchased: boolean;
  is_favorited: boolean;
}

export interface AuthorStats {
  totalDecks: number;
  totalDownloads: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
}
