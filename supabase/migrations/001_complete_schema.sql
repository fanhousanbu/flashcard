-- ============================================
-- EverRecall (久记闪卡) Complete Database Schema
-- ============================================
-- This is the complete database schema for EverRecall.
-- Run this in Supabase SQL Editor to set up the database.
-- 
-- This migration consolidates all previous migrations into a single file:
-- - Initial schema with all core tables
-- - FSRS algorithm fields
-- - Marketplace enhancements (categories, favorites)
-- - Marketplace ratings RLS fixes
-- - Cloze card support
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========TABLES=========

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
COMMENT ON TABLE public.profiles IS 'User profile information, extending auth.users.';

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_study_mode TEXT NOT NULL DEFAULT 'spaced' CHECK (default_study_mode IN ('spaced', 'simple')),
  daily_goal_cards INTEGER NOT NULL DEFAULT 20 CHECK (daily_goal_cards > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.user_preferences IS 'User-specific learning preferences.';

-- Create decks table
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
COMMENT ON TABLE public.decks IS 'Container for a set of flashcards.';

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  front_content TEXT NOT NULL,
  back_content TEXT NOT NULL,
  position INTEGER NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'basic' CHECK (card_type IN ('basic', 'cloze')),
  cloze_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
COMMENT ON TABLE public.cards IS 'Individual flashcards with a front and back.';
COMMENT ON COLUMN public.cards.card_type IS 'Card type: basic (front/back) or cloze (fill-in-the-blank)';
COMMENT ON COLUMN public.cards.cloze_data IS 'Cloze card data structure with original text and fields';

-- Create study_records table (with FSRS fields)
CREATE TABLE IF NOT EXISTS public.study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  easiness_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  last_quality INTEGER,
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  answer_time_ms INTEGER DEFAULT 0,
  stability DOUBLE PRECISION DEFAULT 0,
  difficulty DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);
COMMENT ON TABLE public.study_records IS 'Tracks user learning progress for each card using SM-2 and FSRS algorithms.';
COMMENT ON COLUMN public.study_records.last_quality IS 'The quality rating (0-5) from the most recent review';
COMMENT ON COLUMN public.study_records.total_reviews IS 'Total number of times this card has been reviewed by the user';
COMMENT ON COLUMN public.study_records.correct_reviews IS 'Number of times this card was answered correctly (quality >= 3)';
COMMENT ON COLUMN public.study_records.answer_time_ms IS 'Time taken to answer in milliseconds (FSRS)';
COMMENT ON COLUMN public.study_records.stability IS 'Memory stability parameter (FSRS)';
COMMENT ON COLUMN public.study_records.difficulty IS 'Card difficulty parameter (FSRS)';

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  study_mode TEXT NOT NULL CHECK (study_mode IN ('spaced-repetition', 'simple-review')),
  cards_studied INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE public.study_sessions IS 'Tracks individual study sessions including mode, duration, and cards studied';

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
COMMENT ON TABLE public.tags IS 'User-created custom tags for cards.';
COMMENT ON COLUMN public.tags.color IS 'Tag color in hex format.';

-- Create card_tags table
CREATE TABLE IF NOT EXISTS public.card_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT card_tags_unique UNIQUE (card_id, tag_id)
);
COMMENT ON TABLE public.card_tags IS 'Many-to-many relationship between cards and tags.';

-- Create marketplace_categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.marketplace_categories IS 'Categories for organizing marketplace decks.';

-- Add unique constraint on English name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_categories_name_en_key'
  ) THEN
    ALTER TABLE public.marketplace_categories
      ADD CONSTRAINT marketplace_categories_name_en_key UNIQUE (name_en);
  END IF;
END $$;

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

-- Create marketplace_decks table
CREATE TABLE IF NOT EXISTS public.marketplace_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating FLOAT DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  category_id UUID REFERENCES public.marketplace_categories(id),
  card_count INTEGER DEFAULT 0,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
COMMENT ON TABLE public.marketplace_decks IS 'Decks published by users for others to download.';

-- Create marketplace_ratings table
CREATE TABLE IF NOT EXISTS public.marketplace_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_deck_id UUID REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_rating UNIQUE (marketplace_deck_id, user_id)
);
COMMENT ON TABLE public.marketplace_ratings IS 'User ratings for marketplace decks.';

-- Create marketplace_favorites table
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace_deck_id UUID REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_favorite UNIQUE (user_id, marketplace_deck_id)
);
COMMENT ON TABLE public.marketplace_favorites IS 'User favorites for marketplace decks.';

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace_deck_id UUID REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.purchases IS 'Records of marketplace deck purchases.';

-- =========ROW LEVEL SECURITY (RLS)=========

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS for decks
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own or public decks" ON public.decks;
DROP POLICY IF EXISTS "Users can create own decks" ON public.decks;
DROP POLICY IF EXISTS "Users can update own decks" ON public.decks;
CREATE POLICY "Users can view own or public decks" ON public.decks FOR SELECT USING ((auth.uid() = user_id OR is_public = TRUE) AND deleted_at IS NULL);
CREATE POLICY "Users can create own decks" ON public.decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON public.decks FOR UPDATE USING (auth.uid() = user_id);

-- RLS for cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own deck cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert cards in own decks" ON public.cards;
DROP POLICY IF EXISTS "Users can update cards in own decks" ON public.cards;
CREATE POLICY "Users can view own deck cards" ON public.cards FOR SELECT USING (EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid() AND decks.deleted_at IS NULL) AND cards.deleted_at IS NULL);
CREATE POLICY "Users can insert cards in own decks" ON public.cards FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()));
CREATE POLICY "Users can update cards in own decks" ON public.cards FOR UPDATE USING (EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()));

-- RLS for study_records
ALTER TABLE public.study_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own study records" ON public.study_records;
DROP POLICY IF EXISTS "Users can insert own study records" ON public.study_records;
DROP POLICY IF EXISTS "Users can update own study records" ON public.study_records;
CREATE POLICY "Users can view own study records" ON public.study_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study records" ON public.study_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study records" ON public.study_records FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS for study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update own study sessions" ON public.study_sessions;
CREATE POLICY "Users can view own study sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can create own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
CREATE POLICY "Users can view own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.tags FOR UPDATE USING (auth.uid() = user_id);

-- RLS for card_tags
ALTER TABLE public.card_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view card tags" ON public.card_tags;
DROP POLICY IF EXISTS "Users can add card tags" ON public.card_tags;
DROP POLICY IF EXISTS "Users can delete card tags" ON public.card_tags;
CREATE POLICY "Users can view card tags" ON public.card_tags FOR SELECT USING (EXISTS (SELECT 1 FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = card_tags.card_id AND d.user_id = auth.uid() AND c.deleted_at IS NULL AND d.deleted_at IS NULL));
CREATE POLICY "Users can add card tags" ON public.card_tags FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = card_tags.card_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can delete card tags" ON public.card_tags FOR DELETE USING (EXISTS (SELECT 1 FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = card_tags.card_id AND d.user_id = auth.uid()));

-- RLS for marketplace_decks
ALTER TABLE public.marketplace_decks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published marketplace decks" ON public.marketplace_decks;
DROP POLICY IF EXISTS "Authors can insert their marketplace decks" ON public.marketplace_decks;
DROP POLICY IF EXISTS "Authors can update own marketplace decks" ON public.marketplace_decks;
CREATE POLICY "Anyone can view published marketplace decks" ON public.marketplace_decks FOR SELECT USING (is_published = TRUE AND deleted_at IS NULL);
CREATE POLICY "Authors can insert their marketplace decks" ON public.marketplace_decks FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own marketplace decks" ON public.marketplace_decks FOR UPDATE USING (auth.uid() = author_id);

-- RLS for marketplace_ratings (fixed policies)
ALTER TABLE public.marketplace_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Authenticated users can view all ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Allow authenticated to read ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Allow authenticated to insert ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Allow authenticated to update own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Allow authenticated to delete own ratings" ON public.marketplace_ratings;
CREATE POLICY "Allow authenticated to read ratings" ON public.marketplace_ratings FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated to insert ratings" ON public.marketplace_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated to update own ratings" ON public.marketplace_ratings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated to delete own ratings" ON public.marketplace_ratings FOR DELETE USING (auth.uid() = user_id);

-- RLS for marketplace_favorites
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.marketplace_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.marketplace_favorites;
DROP POLICY IF EXISTS "Users can delete favorites" ON public.marketplace_favorites;
CREATE POLICY "Users can view own favorites" ON public.marketplace_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.marketplace_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete favorites" ON public.marketplace_favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS for purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can create own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.decks TO authenticated;
GRANT ALL ON public.cards TO authenticated;
GRANT ALL ON public.study_records TO authenticated;
GRANT ALL ON public.study_sessions TO authenticated;
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.card_tags TO authenticated;
GRANT SELECT ON public.marketplace_categories TO authenticated;
GRANT ALL ON public.marketplace_decks TO authenticated;
GRANT ALL ON public.marketplace_ratings TO authenticated;
GRANT ALL ON public.marketplace_favorites TO authenticated;
GRANT ALL ON public.purchases TO authenticated;

-- =========INDEXES=========
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_deleted_at ON public.decks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at ON public.cards(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cards_card_type ON public.cards(card_type);
CREATE INDEX IF NOT EXISTS idx_study_records_user_card ON public.study_records(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_study_records_next_review ON public.study_records(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_marketplace_decks_published ON public.marketplace_decks(is_published, deleted_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_decks(category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_deck ON public.study_sessions(user_id, deck_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_completed ON public.study_sessions(user_id, completed_at);
CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS tags_user_name_unique_idx ON public.tags(user_id, name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS tags_deleted_at_idx ON public.tags(deleted_at);
CREATE INDEX IF NOT EXISTS card_tags_card_id_idx ON public.card_tags(card_id);
CREATE INDEX IF NOT EXISTS card_tags_tag_id_idx ON public.card_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_ratings_deck ON public.marketplace_ratings(marketplace_deck_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_ratings_user ON public.marketplace_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_deck ON public.marketplace_favorites(marketplace_deck_id);

-- =========FUNCTIONS & TRIGGERS=========

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', SPLIT_PART(new.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to handle soft deleting cards
CREATE OR REPLACE FUNCTION public.soft_delete_card(card_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deck_owner UUID;
  card_deck_id UUID;
BEGIN
  SELECT c.deck_id, d.user_id
  INTO card_deck_id, deck_owner
  FROM public.cards c
  JOIN public.decks d ON d.id = c.deck_id
  WHERE c.id = card_id
  AND c.deleted_at IS NULL
  AND d.deleted_at IS NULL;

  IF card_deck_id IS NULL THEN
    RAISE EXCEPTION 'Card not found or already deleted';
  END IF;

  IF deck_owner != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.cards
  SET deleted_at = NOW()
  WHERE id = card_id;
END;
$$;
COMMENT ON FUNCTION public.soft_delete_card(UUID) IS 'Soft delete a card. Bypasses RLS.';
GRANT EXECUTE ON FUNCTION public.soft_delete_card(UUID) TO authenticated;

-- Function to handle soft deleting decks (and their cards)
CREATE OR REPLACE FUNCTION public.soft_delete_deck(deck_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deck_owner UUID;
BEGIN
  SELECT user_id
  INTO deck_owner
  FROM public.decks
  WHERE id = deck_id
  AND deleted_at IS NULL;

  IF deck_owner IS NULL THEN
    RAISE EXCEPTION 'Deck not found or already deleted';
  END IF;

  IF deck_owner != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.cards
  SET deleted_at = NOW()
  WHERE cards.deck_id = soft_delete_deck.deck_id
  AND deleted_at IS NULL;

  UPDATE public.decks
  SET deleted_at = NOW()
  WHERE id = deck_id;
END;
$$;
COMMENT ON FUNCTION public.soft_delete_deck(UUID) IS 'Soft delete a deck and all its cards. Bypasses RLS.';
GRANT EXECUTE ON FUNCTION public.soft_delete_deck(UUID) TO authenticated;

-- Function to auto-update updated_at timestamp on study_records
CREATE OR REPLACE FUNCTION public.update_study_record_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for study_records updated_at
DROP TRIGGER IF EXISTS study_records_updated_at ON public.study_records;
CREATE TRIGGER study_records_updated_at
  BEFORE UPDATE ON public.study_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_study_record_updated_at();

-- Function to auto-update updated_at timestamp on user_preferences
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_preferences updated_at
DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences_updated_at();

-- Function to update marketplace_deck rating
CREATE OR REPLACE FUNCTION public.update_marketplace_deck_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.marketplace_decks
  SET
    rating = (
      SELECT AVG(rating)::FLOAT
      FROM public.marketplace_ratings
      WHERE marketplace_deck_id = COALESCE(NEW.marketplace_deck_id, OLD.marketplace_deck_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.marketplace_ratings
      WHERE marketplace_deck_id = COALESCE(NEW.marketplace_deck_id, OLD.marketplace_deck_id)
    )
  WHERE id = COALESCE(NEW.marketplace_deck_id, OLD.marketplace_deck_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for marketplace_ratings
DROP TRIGGER IF EXISTS marketplace_ratings_update_rating ON public.marketplace_ratings;
CREATE TRIGGER marketplace_ratings_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_deck_rating();

-- Function to update marketplace_deck updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_marketplace_deck_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for marketplace_decks updated_at
DROP TRIGGER IF EXISTS marketplace_decks_updated_at ON public.marketplace_decks;
CREATE TRIGGER marketplace_decks_updated_at
  BEFORE UPDATE ON public.marketplace_decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_deck_updated_at();
