-- Velocity engine & buffer bank
CREATE TYPE velocity_status AS ENUM ('ahead','on_track','behind','at_risk');

-- Append-only velocity snapshots
CREATE TABLE velocity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  gravity_completed_today FLOAT NOT NULL DEFAULT 0,
  cumulative_gravity FLOAT NOT NULL DEFAULT 0,
  required_velocity FLOAT NOT NULL DEFAULT 0,
  actual_velocity_7d FLOAT NOT NULL DEFAULT 0,
  actual_velocity_14d FLOAT NOT NULL DEFAULT 0,
  velocity_ratio FLOAT NOT NULL DEFAULT 0,
  status velocity_status NOT NULL DEFAULT 'on_track',
  weighted_completion_pct FLOAT NOT NULL DEFAULT 0,
  trend TEXT,
  projected_completion_date DATE,
  stress_score FLOAT NOT NULL DEFAULT 70,
  stress_status TEXT NOT NULL DEFAULT 'optimal',
  signal_velocity FLOAT NOT NULL DEFAULT 70,
  signal_buffer FLOAT NOT NULL DEFAULT 70,
  signal_time FLOAT NOT NULL DEFAULT 70,
  signal_confidence FLOAT NOT NULL DEFAULT 70,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_velocity_snapshots_user ON velocity_snapshots(user_id);

ALTER TABLE velocity_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own velocity snapshots" ON velocity_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own velocity snapshots" ON velocity_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own velocity snapshots" ON velocity_snapshots FOR UPDATE USING (auth.uid() = user_id);

-- Daily study logs
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  topics_completed INT NOT NULL DEFAULT 0,
  gravity_completed FLOAT NOT NULL DEFAULT 0,
  hours_studied FLOAT NOT NULL DEFAULT 0,
  subjects_touched INT NOT NULL DEFAULT 0,
  avg_difficulty FLOAT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX idx_daily_logs_user ON daily_logs(user_id);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);

-- Append-only buffer transactions
CREATE TABLE buffer_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdrawal','zero_day_penalty','initial','consistency_reward')),
  amount FLOAT NOT NULL,
  balance_after FLOAT NOT NULL,
  notes TEXT,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buffer_transactions_user ON buffer_transactions(user_id);

ALTER TABLE buffer_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own buffer transactions" ON buffer_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own buffer transactions" ON buffer_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_count INT NOT NULL DEFAULT 0,
  best_count INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  UNIQUE(user_id, streak_type)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);
