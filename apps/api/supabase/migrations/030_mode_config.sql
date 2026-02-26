-- F8: Exam Mode Config — per-subject settings for mains/prelims/post_prelims

CREATE TABLE mode_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode exam_mode NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  importance_modifier INT NOT NULL DEFAULT 0,
  revision_ratio FLOAT,  -- NULL means use profile default
  UNIQUE(mode, subject_id)
);

CREATE INDEX idx_mode_config_mode ON mode_config(mode);

-- RLS
ALTER TABLE mode_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read mode config"
  ON mode_config FOR SELECT
  USING (true);

-- ============================================================
-- SEED: Prelims mode config for existing GS-I/GS-II subjects
-- ============================================================

-- PAUSED in Prelims (Mains-only, low prelims relevance)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000003', false, 0),  -- World History
  ('prelims', 'a1000000-0000-0000-0000-000000000008', false, 0);  -- International Relations

-- BOOSTED in Prelims (high prelims relevance / have Prelims paper tag)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000001', true, 1, 0.70),  -- Indian Heritage & Culture (+1)
  ('prelims', 'a1000000-0000-0000-0000-000000000005', true, 1, 0.70),  -- Geography (+1, Prelims paper)
  ('prelims', 'a1000000-0000-0000-0000-000000000007', true, 1, 0.70);  -- Indian Polity (+1, Prelims paper)

-- ACTIVE but not boosted in Prelims
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000002', true, 0, 0.70),  -- Modern Indian History
  ('prelims', 'a1000000-0000-0000-0000-000000000004', true, 0, 0.70),  -- Indian Society
  ('prelims', 'a1000000-0000-0000-0000-000000000006', true, 0, 0.70),  -- Indian National Movement
  ('prelims', 'a1000000-0000-0000-0000-000000000009', true, 0, 0.70);  -- Social Justice

-- POST-PRELIMS: all active, answer writing focus (reactivate paused)
-- No rows needed — absence means default (all active, no modifiers)
-- Explicit entries only where we want overrides

-- MAINS: all active, no modifiers (default behavior)
-- No rows needed — absence means default
