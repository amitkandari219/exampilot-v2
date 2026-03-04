CREATE TABLE cohort_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric TEXT NOT NULL,
  percentile_10 REAL,
  percentile_25 REAL,
  percentile_50 REAL,
  percentile_75 REAL,
  percentile_90 REAL,
  sample_size INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date, metric)
);

ALTER TABLE cohort_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cohort data" ON cohort_snapshots FOR SELECT USING (true);
