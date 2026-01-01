-- =====================================================
-- Diagnose and fix marketplace_ratings table
-- =====================================================

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'marketplace_ratings'
) AS table_exists;

-- 2. If table doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'marketplace_ratings'
  ) THEN
    CREATE TABLE public.marketplace_ratings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      marketplace_deck_id uuid REFERENCES public.marketplace_decks(id) ON DELETE CASCADE NOT NULL,
      user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now(),
      CONSTRAINT unique_user_rating UNIQUE (marketplace_deck_id, user_id)
    );
  END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.marketplace_ratings ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view all ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.marketplace_ratings;

-- 5. Create new policies (allow all authenticated users to read)
CREATE POLICY "Allow authenticated to read ratings"
  ON public.marketplace_ratings FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated to insert ratings"
  ON public.marketplace_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated to update own ratings"
  ON public.marketplace_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated to delete own ratings"
  ON public.marketplace_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.marketplace_ratings TO authenticated;

-- 7. Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_marketplace_ratings_deck ON public.marketplace_ratings(marketplace_deck_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_ratings_user ON public.marketplace_ratings(user_id);

-- 8. Result
SELECT 'marketplace_ratings table setup complete' AS status;
