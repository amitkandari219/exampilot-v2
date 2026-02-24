-- F13: Mock Test Integration
-- Tables for recording mock test results and tracking accuracy per topic/subject

-- ==========================================
-- Table 1: mock_tests (parent record per mock)
-- ==========================================
CREATE TABLE mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_questions INT NOT NULL CHECK (total_questions > 0),
  attempted INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  incorrect INT NOT NULL DEFAULT 0,
  unattempted INT NOT NULL DEFAULT 0,
  score FLOAT NOT NULL DEFAULT 0,
  max_score FLOAT NOT NULL DEFAULT 0,
  percentile FLOAT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv_import')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mock_tests_user_date ON mock_tests (user_id, test_date DESC);

ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_tests_select ON mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mock_tests_insert ON mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- Table 2: mock_questions (per-question detail)
-- ==========================================
CREATE TABLE mock_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  is_attempted BOOLEAN NOT NULL DEFAULT true,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard'))
);

CREATE INDEX idx_mock_questions_test ON mock_questions (mock_test_id);
CREATE INDEX idx_mock_questions_topic ON mock_questions (topic_id);
CREATE INDEX idx_mock_questions_subject ON mock_questions (subject_id);

ALTER TABLE mock_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_questions_select ON mock_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM mock_tests WHERE mock_tests.id = mock_questions.mock_test_id AND mock_tests.user_id = auth.uid()));
CREATE POLICY mock_questions_insert ON mock_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM mock_tests WHERE mock_tests.id = mock_questions.mock_test_id AND mock_tests.user_id = auth.uid()));

-- ==========================================
-- Table 3: mock_topic_accuracy (aggregated per user+topic)
-- ==========================================
CREATE TABLE mock_topic_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  total_questions INT NOT NULL DEFAULT 0,
  correct_questions INT NOT NULL DEFAULT 0,
  accuracy FLOAT NOT NULL DEFAULT 0 CHECK (accuracy BETWEEN 0 AND 1),
  last_mock_date DATE,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving','stable','declining')),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE mock_topic_accuracy ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_topic_accuracy_select ON mock_topic_accuracy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mock_topic_accuracy_insert ON mock_topic_accuracy FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY mock_topic_accuracy_update ON mock_topic_accuracy FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- Table 4: mock_subject_accuracy (aggregated per user+subject)
-- ==========================================
CREATE TABLE mock_subject_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  total_questions INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  accuracy FLOAT NOT NULL DEFAULT 0 CHECK (accuracy BETWEEN 0 AND 1),
  tests_count INT NOT NULL DEFAULT 0,
  avg_score_pct FLOAT NOT NULL DEFAULT 0,
  best_score_pct FLOAT NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving','stable','declining')),
  UNIQUE(user_id, subject_id)
);

ALTER TABLE mock_subject_accuracy ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_subject_accuracy_select ON mock_subject_accuracy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mock_subject_accuracy_insert ON mock_subject_accuracy FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY mock_subject_accuracy_update ON mock_subject_accuracy FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- ALTERs to existing tables
-- ==========================================

-- Add mock_accuracy column to user_progress
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS mock_accuracy FLOAT
    CHECK (mock_accuracy IS NULL OR (mock_accuracy BETWEEN 0 AND 1));

-- Extend xp_transactions trigger_type to include mock_completion
ALTER TABLE xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_trigger_type_check;
ALTER TABLE xp_transactions ADD CONSTRAINT xp_transactions_trigger_type_check
  CHECK (trigger_type IN (
    'plan_item_new','plan_item_revision','plan_item_decay_revision','plan_item_stretch',
    'fsrs_review_correct','fsrs_review_incorrect',
    'streak_milestone','recovery_completion','badge_unlock','mock_completion'
  ));
