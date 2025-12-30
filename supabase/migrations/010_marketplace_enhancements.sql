-- =====================================================
-- Marketplace Enhancements Migration
-- Adds categories, favorites, and improves marketplace functionality
-- =====================================================

-- 1. Create marketplace_categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_zh text NOT NULL,
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint on English name
ALTER TABLE public.marketplace_categories
  DROP CONSTRAINT IF EXISTS marketplace_categories_name_en_key;
ALTER TABLE public.marketplace_categories
  ADD CONSTRAINT marketplace_categories_name_en_key UNIQUE (name_en);

COMMENT ON TABLE public.marketplace_categories IS 'Categories for organizing marketplace decks.';

-- Insert initial categories
INSERT INTO public.marketplace_categories (name_en, name_zh, icon, sort_order) VALUES
  ('language', '语言学习', '🗣️', 1),
  ('programming', '编程开发', '💻', 2),
  ('science', '科学知识', '🔬', 3),
  ('history', '历史文化', '📚', 4),
  ('math', '数学', '📐', 5),
  ('exam', '考试备考', '📝', 6),
  ('other', '其他', '📁', 99)
ON CONFLICT (name_en) DO NOTHING;

-- 2. Create marketplace_favorites table
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace_deck_id uuid REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_favorite UNIQUE (user_id, marketplace_deck_id)
);

COMMENT ON TABLE public.marketplace_favorites IS 'User favorites for marketplace decks.';

-- Create indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_deck ON public.marketplace_favorites(marketplace_deck_id);

-- 3. Add new columns to marketplace_decks table
-- Check if columns exist before adding
DO $$
BEGIN
  ALTER TABLE public.marketplace_decks
    ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.marketplace_categories(id);

  ALTER TABLE public.marketplace_decks
    ADD COLUMN IF NOT EXISTS card_count integer DEFAULT 0;

  ALTER TABLE public.marketplace_decks
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

  ALTER TABLE public.marketplace_decks
    ADD COLUMN IF NOT EXISTS cover_image text;
END $$;

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_decks(category_id);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_marketplace_deck_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS marketplace_decks_updated_at ON public.marketplace_decks;
CREATE TRIGGER marketplace_decks_updated_at
  BEFORE UPDATE ON public.marketplace_decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_deck_updated_at();

-- 5. Enable RLS for marketplace_favorites
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own favorites" ON public.marketplace_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.marketplace_favorites;
DROP POLICY IF EXISTS "Users can delete favorites" ON public.marketplace_favorites;

-- Create RLS policies for favorites
CREATE POLICY "Users can view own favorites"
  ON public.marketplace_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.marketplace_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete favorites"
  ON public.marketplace_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Grant necessary permissions
GRANT SELECT ON TABLE public.marketplace_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.marketplace_decks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.marketplace_ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.marketplace_favorites TO authenticated;
GRANT SELECT, INSERT ON TABLE public.purchases TO authenticated;
