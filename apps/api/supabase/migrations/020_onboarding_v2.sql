-- Migration 020: Onboarding V2 schema additions
-- Adds V2 columns to user_profiles and creates user_targets + user_promises tables

-- Add V2 columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_exam_year INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS attempt_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS challenges TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_version INT DEFAULT 1;

-- User targets: personalized daily/weekly goals
CREATE TABLE IF NOT EXISTS user_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_hours FLOAT NOT NULL DEFAULT 6,
  daily_new_topics INT NOT NULL DEFAULT 2,
  weekly_revisions INT NOT NULL DEFAULT 3,
  weekly_tests INT NOT NULL DEFAULT 1,
  weekly_answer_writing INT NOT NULL DEFAULT 2,
  weekly_ca_hours FLOAT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- User promises: commitment card text
CREATE TABLE IF NOT EXISTS user_promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promise_text TEXT NOT NULL,
  committed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_promises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own targets" ON user_targets
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own promises" ON user_promises
  FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_promises_user ON user_promises(user_id);
