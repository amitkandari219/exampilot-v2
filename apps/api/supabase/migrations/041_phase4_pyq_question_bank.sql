-- Phase 4: INFRA-1 PYQ Question Bank + T2-4 Deep Mock Analysis

-- INFRA-1: PYQ question bank — actual question text, options, explanations
CREATE TABLE IF NOT EXISTS pyq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2030),
  paper TEXT NOT NULL, -- 'GS-I', 'GS-II', 'GS-III', 'GS-IV', 'Prelims', 'CSAT'
  question_number INTEGER,
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option CHAR(1) CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type TEXT DEFAULT 'factual', -- 'factual', 'analytical', 'application', 'conceptual'
  is_negative_marking BOOLEAN DEFAULT true,
  marks NUMERIC DEFAULT 2,
  negative_marks NUMERIC DEFAULT 0.67,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pyq_questions_topic ON pyq_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_pyq_questions_subject ON pyq_questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_pyq_questions_year ON pyq_questions(year);
CREATE INDEX IF NOT EXISTS idx_pyq_questions_paper ON pyq_questions(paper);

-- T2-4: Enhanced mock analysis — add question_type to mock_questions if not present
ALTER TABLE mock_questions ADD COLUMN IF NOT EXISTS question_type TEXT;
ALTER TABLE mock_questions ADD COLUMN IF NOT EXISTS marks NUMERIC DEFAULT 2;
ALTER TABLE mock_questions ADD COLUMN IF NOT EXISTS negative_marks NUMERIC DEFAULT 0.67;
ALTER TABLE mock_questions ADD COLUMN IF NOT EXISTS paper TEXT; -- 'Paper-1' or 'Paper-2' for prelims

-- User quiz results for micro-mocks and active recall (T4-3, T4-12)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL DEFAULT 'micro_mock', -- 'micro_mock', 'active_recall'
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  total_questions INTEGER NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC,
  time_taken_seconds INTEGER,
  questions JSONB, -- Array of { question_id, selected_option, is_correct }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON quiz_attempts(user_id, topic_id);

-- RLS
ALTER TABLE pyq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read pyq_questions" ON pyq_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own quiz_attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
