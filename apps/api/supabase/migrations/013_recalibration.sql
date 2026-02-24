-- F10: Recalibration Engine — Auto-adjust persona params based on performance

ALTER TABLE user_profiles
  ADD COLUMN auto_recalibrate BOOL DEFAULT TRUE,
  ADD COLUMN last_recalibrated_at TIMESTAMPTZ;

CREATE TABLE recalibration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recalibrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('auto_daily', 'manual')),
  window_days INT NOT NULL DEFAULT 7,
  -- Old param values
  old_fatigue_threshold INT,
  old_buffer_capacity FLOAT,
  old_fsrs_target_retention FLOAT,
  old_burnout_threshold INT,
  -- New param values
  new_fatigue_threshold INT,
  new_buffer_capacity FLOAT,
  new_fsrs_target_retention FLOAT,
  new_burnout_threshold INT,
  -- Input signals
  input_velocity_ratio FLOAT,
  input_velocity_trend TEXT,
  input_bri_score INT,
  input_fatigue_avg FLOAT,
  input_stress_avg FLOAT,
  input_confidence_avg FLOAT,
  input_weakness_critical_pct FLOAT,
  -- Per-param reasons
  reason_fatigue TEXT,
  reason_buffer TEXT,
  reason_retention TEXT,
  reason_burnout TEXT,
  params_changed BOOL NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_recalibration_user ON recalibration_log(user_id);
CREATE INDEX idx_recalibration_user_date ON recalibration_log(user_id, recalibrated_at);

-- RLS
ALTER TABLE recalibration_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recalibration logs"
  ON recalibration_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recalibration logs"
  ON recalibration_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
