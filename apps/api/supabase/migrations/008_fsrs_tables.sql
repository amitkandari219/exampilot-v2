-- FSRS-6 spaced repetition tables
CREATE TABLE fsrs_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  due TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stability FLOAT NOT NULL DEFAULT 0,
  difficulty FLOAT NOT NULL DEFAULT 0,
  elapsed_days INT NOT NULL DEFAULT 0,
  scheduled_days INT NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  lapses INT NOT NULL DEFAULT 0,
  state INT NOT NULL DEFAULT 0 CHECK (state BETWEEN 0 AND 3),
  last_review TIMESTAMPTZ,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_fsrs_cards_user ON fsrs_cards(user_id);
CREATE INDEX idx_fsrs_cards_due ON fsrs_cards(user_id, due);

ALTER TABLE fsrs_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own fsrs cards" ON fsrs_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fsrs cards" ON fsrs_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fsrs cards" ON fsrs_cards FOR UPDATE USING (auth.uid() = user_id);

-- Append-only review log
CREATE TABLE fsrs_review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES fsrs_cards(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 4),
  state INT NOT NULL,
  due TIMESTAMPTZ NOT NULL,
  stability FLOAT NOT NULL,
  difficulty FLOAT NOT NULL,
  elapsed_days INT NOT NULL,
  scheduled_days INT NOT NULL,
  review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fsrs_review_logs_user ON fsrs_review_logs(user_id);

ALTER TABLE fsrs_review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own review logs" ON fsrs_review_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own review logs" ON fsrs_review_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Append-only confidence snapshots
CREATE TABLE confidence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  confidence_score INT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  raw_retention FLOAT NOT NULL,
  stability FLOAT NOT NULL,
  difficulty FLOAT NOT NULL,
  accuracy_factor FLOAT NOT NULL DEFAULT 1.0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_confidence_snapshots_user ON confidence_snapshots(user_id);

ALTER TABLE confidence_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own confidence snapshots" ON confidence_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own confidence snapshots" ON confidence_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Revision schedule
CREATE TABLE revision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  type TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_revision_schedule_user ON revision_schedule(user_id);
CREATE INDEX idx_revision_schedule_date ON revision_schedule(user_id, scheduled_date);

ALTER TABLE revision_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own revision schedule" ON revision_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revision schedule" ON revision_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revision schedule" ON revision_schedule FOR UPDATE USING (auth.uid() = user_id);
