-- Add missing fields for FSRS algorithm
ALTER TABLE study_records 
ADD COLUMN IF NOT EXISTS answer_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stability DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty DOUBLE PRECISION DEFAULT 0;

-- Optional: Create index for performance
CREATE INDEX IF NOT EXISTS idx_study_records_user_card ON study_records(user_id, card_id);
