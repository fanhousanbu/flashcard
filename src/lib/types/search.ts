export type SearchResultType = 'deck' | 'card';

export interface DeckSearchResult {
  type: 'deck';
  id: string;
  name: string;
  description: string | null;
  cardCount: number;
  match: string; // The matching text snippet
}

export interface CardSearchResult {
  type: 'card';
  id: string;
  deckId: string;
  deckName: string;
  frontContent: string;
  backContent: string;
  match: string; // The matching text snippet
}

export type SearchResult = DeckSearchResult | CardSearchResult;

export interface SearchResults {
  decks: DeckSearchResult[];
  cards: CardSearchResult[];
  total: number;
}

