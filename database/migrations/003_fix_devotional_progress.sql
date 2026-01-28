-- Make devotional_id optional in devotional_progress table
-- This allows us to save devotional completions without referencing a devotional in the devotionals table

ALTER TABLE devotional_progress 
ALTER COLUMN devotional_id DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user_completed 
ON devotional_progress(user_id, completed_at DESC);
