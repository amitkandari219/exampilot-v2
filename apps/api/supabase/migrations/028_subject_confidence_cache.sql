-- Subject-level confidence cache for decay trigger service
CREATE TABLE subject_confidence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  avg_confidence FLOAT NOT NULL DEFAULT 0,
  pyq_weighted_confidence FLOAT NOT NULL DEFAULT 0,
  topics_fresh INT NOT NULL DEFAULT 0,
  topics_fading INT NOT NULL DEFAULT 0,
  topics_stale INT NOT NULL DEFAULT 0,
  topics_decayed INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

CREATE INDEX idx_subject_confidence_cache_user ON subject_confidence_cache(user_id);

ALTER TABLE subject_confidence_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subject confidence" ON subject_confidence_cache
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subject confidence" ON subject_confidence_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subject confidence" ON subject_confidence_cache
  FOR UPDATE USING (auth.uid() = user_id);
