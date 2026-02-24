-- Persona extensions for behavioral guardian
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS fatigue_threshold INT DEFAULT 85,
  ADD COLUMN IF NOT EXISTS buffer_capacity FLOAT DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS fsrs_target_retention FLOAT DEFAULT 0.9,
  ADD COLUMN IF NOT EXISTS burnout_threshold INT DEFAULT 75,
  ADD COLUMN IF NOT EXISTS buffer_balance FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recovery_mode_active BOOL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recovery_mode_start DATE,
  ADD COLUMN IF NOT EXISTS recovery_mode_end DATE;

-- Append-only temporal table for persona changes
CREATE TABLE persona_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_mode strategy_mode NOT NULL,
  strategy_params JSONB NOT NULL DEFAULT '{}',
  fatigue_threshold INT NOT NULL DEFAULT 85,
  buffer_capacity FLOAT NOT NULL DEFAULT 0.15,
  fsrs_target_retention FLOAT NOT NULL DEFAULT 0.9,
  burnout_threshold INT NOT NULL DEFAULT 75,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
  change_reason TEXT
);

CREATE INDEX idx_persona_snapshots_user ON persona_snapshots(user_id);
CREATE INDEX idx_persona_snapshots_valid ON persona_snapshots(user_id, valid_from, valid_to);

ALTER TABLE persona_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own persona snapshots"
  ON persona_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own persona snapshots"
  ON persona_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);
