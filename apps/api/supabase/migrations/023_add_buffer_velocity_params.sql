ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS buffer_deposit_rate FLOAT,
  ADD COLUMN IF NOT EXISTS buffer_withdrawal_rate FLOAT,
  ADD COLUMN IF NOT EXISTS velocity_target_multiplier FLOAT;

ALTER TABLE persona_snapshots
  ADD COLUMN IF NOT EXISTS buffer_deposit_rate FLOAT,
  ADD COLUMN IF NOT EXISTS buffer_withdrawal_rate FLOAT,
  ADD COLUMN IF NOT EXISTS velocity_target_multiplier FLOAT;
