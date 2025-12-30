export type Deck = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  deleted_at: string | null;
};

export type DeckWithCards = Deck & {
  cards: Card[];
};

export type CardType = 'basic' | 'cloze';

export type ClozeField = {
  id: string;
  answer: string;
  hint?: string;
};

export type ClozeData = {
  original: string;
  fields: ClozeField[];
};

export type Card = {
  id: string;
  deck_id: string;
  front_content: string;
  back_content: string;
  position: number;
  created_at: string;
  deleted_at: string | null;
  card_type: CardType;
  cloze_data: ClozeData | null;
};

