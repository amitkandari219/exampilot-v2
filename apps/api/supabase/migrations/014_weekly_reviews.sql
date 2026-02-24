-- F12a: Weekly Review — aggregate weekly metrics from temporal tables

CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_end_date DATE NOT NULL,
  week_start_date DATE NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Study metrics
  total_hours FLOAT DEFAULT 0,
  topics_completed INT DEFAULT 0,
  gravity_completed FLOAT DEFAULT 0,
  avg_hours_per_day FLOAT DEFAULT 0,
  subjects_touched INT DEFAULT 0,
  -- Velocity
  avg_velocity_ratio FLOAT DEFAULT 0,
  velocity_trend TEXT,
  completion_pct_start FLOAT DEFAULT 0,
  completion_pct_end FLOAT DEFAULT 0,
  -- Confidence
  confidence_distribution JSONB DEFAULT '{}',
  topics_improved INT DEFAULT 0,
  topics_decayed INT DEFAULT 0,
  -- Stress & Burnout
  avg_stress FLOAT DEFAULT 0,
  avg_bri FLOAT DEFAULT 0,
  fatigue_trend TEXT,
  recovery_days INT DEFAULT 0,
  -- Planner
  plan_completion_rate FLOAT DEFAULT 0,
  plan_total_items INT DEFAULT 0,
  plan_completed_items INT DEFAULT 0,
  plan_new_count INT DEFAULT 0,
  plan_revision_count INT DEFAULT 0,
  -- Weakness
  weakness_distribution JSONB DEFAULT '{}',
  critical_count_change INT DEFAULT 0,
  weak_count_change INT DEFAULT 0,
  -- Buffer
  buffer_balance_start FLOAT DEFAULT 0,
  buffer_balance_end FLOAT DEFAULT 0,
  zero_day_count INT DEFAULT 0,
  -- Streak
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  -- Highlights
  highlights JSONB DEFAULT '[]',
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_end_date)
);

CREATE INDEX idx_weekly_reviews_user ON weekly_reviews(user_id);
CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_end_date);

-- RLS
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weekly reviews"
  ON weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews"
  ON weekly_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
  ON weekly_reviews FOR UPDATE
  USING (auth.uid() = user_id);
