-- Add unweighted (topic-count-based) completion percentage to velocity snapshots
-- Enables "topics completed vs gravity completed" divergence on weekly review chart
ALTER TABLE velocity_snapshots
ADD COLUMN IF NOT EXISTS unweighted_completion_pct FLOAT DEFAULT 0;
