-- Add study approach preference to user profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS study_approach TEXT DEFAULT 'mixed'
  CHECK (study_approach IN ('sequential', 'mixed'));
