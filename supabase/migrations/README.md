# Database Migrations

This directory contains all database migrations for EverRecall (久记闪卡).

## Files

### Main Migration
- **`001_complete_schema.sql`** - Complete database schema including:
  - Core tables (profiles, decks, cards, study_records, etc.)
  - FSRS algorithm fields for spaced repetition
  - Marketplace features (categories, ratings, favorites)
  - Cloze card support
  - All RLS policies, indexes, functions, and triggers

### Utility Scripts
- **`clear_all_data.sql`** - Deletes ALL data from the database (for testing)
- **`clear_user_data.sql`** - Deletes data for a specific user

## Usage

### Initial Setup
Run `001_complete_schema.sql` in your Supabase SQL Editor to set up the complete database schema.

### Cleanup Scripts
The utility scripts are for development/testing purposes only:
- Use `clear_all_data.sql` to reset the entire database
- Use `clear_user_data.sql` to remove a specific user's data (update the email/ID in the script first)

## Migration History

This consolidated migration combines all previous migrations:
- Initial schema (profiles, decks, cards, study records)
- User preferences table
- FSRS algorithm fields (stability, difficulty, answer_time_ms)
- Marketplace enhancements (categories, favorites, card_count, cover_image)
- Marketplace ratings RLS fixes
- Cloze card support (card_type, cloze_data)

## Notes

- All tables use soft deletion (deleted_at timestamp) where applicable
- Row Level Security (RLS) is enabled on all tables
- Indexes are created for optimal query performance
- Triggers automatically update timestamps and aggregate ratings
