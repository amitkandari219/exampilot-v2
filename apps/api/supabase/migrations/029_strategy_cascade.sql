-- F9: 4-Strategy Cascade — fallback strategies when falling behind

-- Fix trigger_type CHECK on recalibration_log to include 'buffer_debt'
ALTER TABLE recalibration_log DROP CONSTRAINT IF EXISTS recalibration_log_trigger_type_check;
ALTER TABLE recalibration_log ADD CONSTRAINT recalibration_log_trigger_type_check
  CHECK (trigger_type IN ('auto_daily', 'manual', 'buffer_debt'));

-- Strategy cascade log
CREATE TABLE strategy_cascade_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_by TEXT NOT NULL,
  strategy_chosen TEXT NOT NULL,
  gap FLOAT NOT NULL DEFAULT 0,
  stress_before FLOAT,
  stress_after FLOAT,
  buffer_before FLOAT,
  buffer_after FLOAT,
  details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_cascade_user ON strategy_cascade_log(user_id);
CREATE INDEX idx_cascade_user_date ON strategy_cascade_log(user_id, triggered_at);

-- RLS
ALTER TABLE strategy_cascade_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cascade logs"
  ON strategy_cascade_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cascade logs"
  ON strategy_cascade_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
