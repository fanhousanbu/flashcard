-- Add card_type and cloze_data columns to cards table
-- This migration adds support for cloze deletion cards

-- Add card_type column (default to 'basic' for existing cards)
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS card_type TEXT NOT NULL DEFAULT 'basic'
CHECK (card_type IN ('basic', 'cloze'));

-- Add cloze_data column (nullable JSONB for storing cloze structure)
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS cloze_data JSONB;

-- Add comment
COMMENT ON COLUMN public.cards.card_type IS 'Card type: basic (front/back) or cloze (fill-in-the-blank)';
COMMENT ON COLUMN public.cards.cloze_data IS 'Cloze card data structure with original text and fields';

-- Create index on card_type for better query performance
CREATE INDEX IF NOT EXISTS idx_cards_card_type ON public.cards(card_type);
