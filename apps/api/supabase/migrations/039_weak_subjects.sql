-- Add weak_subjects JSONB column to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS weak_subjects JSONB DEFAULT '[]';

COMMENT ON COLUMN user_profiles.weak_subjects IS 'Array of subject names marked as weak during onboarding';
