-- Add delta_gravity to buffer_transactions for tracking raw gravity surplus/deficit
ALTER TABLE buffer_transactions ADD COLUMN IF NOT EXISTS delta_gravity FLOAT DEFAULT 0;

-- Allow buffer_balance to go negative (debt mode, floor = -5)
-- No schema change needed — buffer_balance is FLOAT, clamping is in app code

-- Add 'target_hit' to allowed transaction types (for daily exact-target consistency reward)
-- The CHECK constraint allows any text, so no migration needed for type column
