CREATE TABLE answer_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  question_text TEXT,
  word_count INT,
  time_taken_minutes INT,
  self_score INT CHECK (self_score BETWEEN 1 AND 10),
  practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_answer_practice_user_date ON answer_practice(user_id, practice_date DESC);

ALTER TABLE answer_practice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own answers" ON answer_practice
  FOR ALL USING (auth.uid() = user_id);
