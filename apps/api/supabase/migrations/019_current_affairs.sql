-- F16: Current Affairs Tracker

-- ca_daily_logs: one row per user per day
CREATE TABLE ca_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT true,
  hours_spent FLOAT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- ca_tags: subject tags per log
CREATE TABLE ca_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_log_id UUID NOT NULL REFERENCES ca_daily_logs(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  tag_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ca_streaks: one row per user, tracks current + best streak
CREATE TABLE ca_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ca_daily_logs_user_date ON ca_daily_logs(user_id, log_date);
CREATE INDEX idx_ca_tags_log ON ca_tags(ca_log_id);
CREATE INDEX idx_ca_tags_subject ON ca_tags(subject_id);

-- RLS
ALTER TABLE ca_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ca_daily_logs" ON ca_daily_logs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own ca_tags" ON ca_tags
  FOR ALL USING (ca_log_id IN (SELECT id FROM ca_daily_logs WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own ca_streaks" ON ca_streaks
  FOR ALL USING (auth.uid() = user_id);
