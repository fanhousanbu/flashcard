-- =====================================================
-- Fix marketplace_ratings RLS policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.marketplace_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.marketplace_ratings;

-- Recreate policies with explicit handling
CREATE POLICY "Authenticated users can view all ratings"
  ON public.marketplace_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON public.marketplace_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON public.marketplace_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON public.marketplace_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON TABLE public.marketplace_ratings TO authenticated;
GRANT INSERT ON TABLE public.marketplace_ratings TO authenticated;
GRANT UPDATE ON TABLE public.marketplace_ratings TO authenticated;
GRANT DELETE ON TABLE public.marketplace_ratings TO authenticated;
