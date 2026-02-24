-- Burnout guardian tables

-- Append-only burnout snapshots
CREATE TABLE burnout_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  bri_score INT NOT NULL DEFAULT 100 CHECK (bri_score BETWEEN 0 AND 100),
  fatigue_score INT NOT NULL DEFAULT 0 CHECK (fatigue_score BETWEEN 0 AND 100),
  signal_stress FLOAT NOT NULL DEFAULT 0,
  signal_buffer FLOAT NOT NULL DEFAULT 0,
  signal_velocity FLOAT NOT NULL DEFAULT 0,
  signal_engagement FLOAT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'low' CHECK (status IN ('low','moderate','high','critical')),
  in_recovery BOOL NOT NULL DEFAULT FALSE,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_burnout_snapshots_user ON burnout_snapshots(user_id);

ALTER TABLE burnout_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own burnout snapshots" ON burnout_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own burnout snapshots" ON burnout_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own burnout snapshots" ON burnout_snapshots FOR UPDATE USING (auth.uid() = user_id);

-- Recovery log
CREATE TABLE recovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  trigger_bri INT NOT NULL,
  exit_reason TEXT CHECK (exit_reason IN ('auto_5day','auto_7day','manual','bri_recovered')),
  bri_at_exit INT,
  ramp_up_day INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_recovery_log_user ON recovery_log(user_id);

ALTER TABLE recovery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recovery log" ON recovery_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recovery log" ON recovery_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recovery log" ON recovery_log FOR UPDATE USING (auth.uid() = user_id);
