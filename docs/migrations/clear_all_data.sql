-- ============================================
-- FlashCard Database Cleanup Script
-- ============================================
-- This script deletes ALL data from the FlashCard database.
-- Use this to reset the database for testing purposes.
--
-- WARNING: This will permanently delete all user data!
--
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS temporarily to allow cleanup
ALTER TABLE public.card_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Delete all data (order matters due to foreign keys)
DELETE FROM public.card_tags;
DELETE FROM public.marketplace_ratings;
DELETE FROM public.purchases;
DELETE FROM public.marketplace_decks;
DELETE FROM public.study_sessions;
DELETE FROM public.study_records;
DELETE FROM public.tags;
DELETE FROM public.cards;
DELETE FROM public.decks;
DELETE FROM public.user_preferences;
DELETE FROM public.profiles;

-- Re-enable RLS
ALTER TABLE public.card_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT 'Cleanup complete!' AS status;
SELECT
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM public.decks) as decks,
  (SELECT COUNT(*) FROM public.cards) as cards,
  (SELECT COUNT(*) FROM public.study_records) as study_records,
  (SELECT COUNT(*) FROM public.tags) as tags;
