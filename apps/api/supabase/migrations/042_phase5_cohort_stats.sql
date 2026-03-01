-- Phase 5: INFRA-6 Cohort aggregation pipeline + T2-8 Peer benchmarking

-- Anonymized cohort statistics — updated periodically by cron
CREATE TABLE IF NOT EXISTS cohort_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_key TEXT NOT NULL, -- e.g. 'prelims_2026', 'mains_2026', 'all'
  metric TEXT NOT NULL, -- e.g. 'completion_pct', 'velocity_ratio', 'benchmark_score', 'streak_days'
  percentile_25 NUMERIC,
  percentile_50 NUMERIC,
  percentile_75 NUMERIC,
  percentile_90 NUMERIC,
  mean_value NUMERIC,
  sample_size INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cohort_key, metric)
);

CREATE INDEX IF NOT EXISTS idx_cohort_stats_key ON cohort_stats(cohort_key);

-- User's percentile cache — updated when benchmark is calculated
ALTER TABLE benchmark_snapshots ADD COLUMN IF NOT EXISTS percentile_rank NUMERIC;

-- RLS
ALTER TABLE cohort_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read cohort_stats" ON cohort_stats FOR SELECT USING (auth.role() = 'authenticated');
