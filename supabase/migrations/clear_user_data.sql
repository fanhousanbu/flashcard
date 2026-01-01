-- ============================================
-- EverRecall - Clear Data for Specific User
-- ============================================
-- This script deletes all data for a specific user.
-- Replace 'USER_EMAIL_OR_ID' with the actual email or user ID.
--
-- Run this in Supabase SQL Editor
-- ============================================

-- Option 1: Delete by Email (recommended)
-- Replace the email below with the target user's email
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'user@example.com';  -- Replace with target email

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with this email';
  END IF;

  -- Delete user's data (order matters due to foreign keys)
  DELETE FROM public.card_tags
  WHERE card_id IN (
    SELECT id FROM public.cards
    WHERE deck_id IN (SELECT id FROM public.decks WHERE user_id = target_user_id)
  );

  DELETE FROM public.marketplace_favorites WHERE user_id = target_user_id;
  DELETE FROM public.study_records WHERE user_id = target_user_id;
  DELETE FROM public.study_sessions WHERE user_id = target_user_id;

  DELETE FROM public.tags WHERE user_id = target_user_id;

  DELETE FROM public.cards
  WHERE deck_id IN (SELECT id FROM public.decks WHERE user_id = target_user_id);

  DELETE FROM public.marketplace_decks WHERE author_id = target_user_id;

  DELETE FROM public.purchases WHERE user_id = target_user_id;

  DELETE FROM public.marketplace_ratings WHERE user_id = target_user_id;

  DELETE FROM public.decks WHERE user_id = target_user_id;

  DELETE FROM public.user_preferences WHERE user_id = target_user_id;

  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Optionally: Delete the auth user (requires service role key)
  -- DELETE FROM auth.users WHERE id = target_user_id;

  RAISE NOTICE 'Data deleted for user ID: %', target_user_id;
END $$;

-- Option 2: Delete by User ID directly
-- If you know the user ID, use this instead:
/*
DO $$
DECLARE
  target_user_id UUID := 'YOUR_USER_ID_HERE';  -- Replace with target user ID
BEGIN
  -- Delete user's data
  DELETE FROM public.card_tags
  WHERE card_id IN (
    SELECT id FROM public.cards
    WHERE deck_id IN (SELECT id FROM public.decks WHERE user_id = target_user_id)
  );

  DELETE FROM public.marketplace_favorites WHERE user_id = target_user_id;
  DELETE FROM public.study_records WHERE user_id = target_user_id;
  DELETE FROM public.study_sessions WHERE user_id = target_user_id;
  DELETE FROM public.tags WHERE user_id = target_user_id;
  DELETE FROM public.cards WHERE deck_id IN (SELECT id FROM public.decks WHERE user_id = target_user_id);
  DELETE FROM public.marketplace_decks WHERE author_id = target_user_id;
  DELETE FROM public.purchases WHERE user_id = target_user_id;
  DELETE FROM public.marketplace_ratings WHERE user_id = target_user_id;
  DELETE FROM public.decks WHERE user_id = target_user_id;
  DELETE FROM public.user_preferences WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;

  RAISE NOTICE 'Data deleted for user ID: %', target_user_id;
END $$;
*/

-- Verification query (replace email with your target)
SELECT
  (SELECT COUNT(*) FROM public.decks WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'user@example.com'
  )) as decks_count,
  (SELECT COUNT(*) FROM public.cards WHERE deck_id IN (
    SELECT id FROM public.decks WHERE user_id = (
      SELECT id FROM auth.users WHERE email = 'user@example.com'
    )
  )) as cards_count,
  (SELECT COUNT(*) FROM public.study_records WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'user@example.com'
  )) as study_records_count;
