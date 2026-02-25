-- PYQ subject-level aggregation table + missing index on pyq_data(year)

CREATE TABLE pyq_subject_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE UNIQUE,
  avg_questions_per_year FLOAT NOT NULL DEFAULT 0,
  total_questions_10yr INT NOT NULL DEFAULT 0,
  trend pyq_trend NOT NULL DEFAULT 'stable',
  highest_year INT,
  highest_count INT NOT NULL DEFAULT 0
);

-- Index for year-based queries on pyq_data
CREATE INDEX idx_pyq_data_year ON pyq_data(year);

-- RLS
ALTER TABLE pyq_subject_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read pyq_subject_stats"
  ON pyq_subject_stats FOR SELECT
  USING (auth.role() = 'authenticated');
