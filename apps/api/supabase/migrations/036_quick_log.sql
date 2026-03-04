-- Quick log table for ad-hoc study time logging
CREATE TABLE quick_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  hours FLOAT NOT NULL CHECK (hours > 0 AND hours <= 24),
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE quick_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quick_logs"
  ON quick_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for date queries
CREATE INDEX idx_quick_logs_user_date ON quick_logs(user_id, logged_at);
