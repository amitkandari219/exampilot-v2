-- F9: Weakness Radar — Historical health score tracking

CREATE TYPE health_category AS ENUM ('critical', 'weak', 'moderate', 'strong', 'exam_ready');

CREATE TABLE weakness_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  health_score INT NOT NULL CHECK (health_score BETWEEN 0 AND 100),
  category health_category NOT NULL,
  confidence_component FLOAT NOT NULL,
  revision_component FLOAT NOT NULL,
  effort_component FLOAT NOT NULL,
  stability_component FLOAT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id, snapshot_date)
);

CREATE INDEX idx_weakness_user ON weakness_snapshots(user_id);
CREATE INDEX idx_weakness_user_date ON weakness_snapshots(user_id, snapshot_date);

-- RLS
ALTER TABLE weakness_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own weakness snapshots"
  ON weakness_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weakness snapshots"
  ON weakness_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weakness snapshots"
  ON weakness_snapshots FOR UPDATE
  USING (auth.uid() = user_id);
