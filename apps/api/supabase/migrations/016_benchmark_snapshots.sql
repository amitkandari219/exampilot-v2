-- F18: Strategic Benchmark — Exam Readiness Score

CREATE TABLE IF NOT EXISTS benchmark_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  composite_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'at_risk' CHECK (status IN ('exam_ready', 'on_track', 'needs_work', 'at_risk')),
  coverage_score FLOAT NOT NULL DEFAULT 0,
  confidence_score FLOAT NOT NULL DEFAULT 0,
  weakness_score FLOAT NOT NULL DEFAULT 0,
  consistency_score FLOAT NOT NULL DEFAULT 0,
  velocity_score FLOAT NOT NULL DEFAULT 0,
  trend TEXT,
  trend_delta INT NOT NULL DEFAULT 0,
  recommendations JSONB NOT NULL DEFAULT '[]',
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_benchmark_snapshots_user_date
  ON benchmark_snapshots(user_id, snapshot_date DESC);

-- RLS
ALTER TABLE benchmark_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own benchmark_snapshots"
  ON benchmark_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own benchmark_snapshots"
  ON benchmark_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own benchmark_snapshots"
  ON benchmark_snapshots FOR UPDATE
  USING (auth.uid() = user_id);
