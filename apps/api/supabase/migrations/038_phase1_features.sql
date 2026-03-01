-- Phase 1 features: work_pressure_level, mains_delta, scorecard data

-- T4-24: Work-pressure signal for WP users
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_pressure_level INTEGER DEFAULT 3;

-- T2-22: Mains Delta layer — topic enrichment for mains-specific data
CREATE TABLE IF NOT EXISTS mains_topic_enrichment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  is_answer_writing_topic BOOLEAN DEFAULT false,
  is_essay_relevant BOOLEAN DEFAULT false,
  mains_importance INTEGER DEFAULT 3 CHECK (mains_importance BETWEEN 1 AND 5),
  typical_question_type TEXT, -- 'analytical', 'descriptive', 'opinion', 'case_study'
  word_limit_typical INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(topic_id)
);

CREATE INDEX IF NOT EXISTS idx_mains_enrichment_topic ON mains_topic_enrichment(topic_id);

-- T2-17: Marks-based weak zone mapping — UPSC scorecard import
CREATE TABLE IF NOT EXISTS upsc_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_year INTEGER NOT NULL,
  stage TEXT NOT NULL, -- 'prelims', 'mains', 'interview'
  gs1_marks NUMERIC,
  gs2_marks NUMERIC,
  gs3_marks NUMERIC,
  gs4_marks NUMERIC,
  essay_marks NUMERIC,
  optional_marks NUMERIC,
  prelims_score NUMERIC,
  total_marks NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, attempt_year, stage)
);

CREATE INDEX IF NOT EXISTS idx_scorecards_user ON upsc_scorecards(user_id);
