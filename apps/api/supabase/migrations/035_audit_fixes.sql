-- Migration 035: Fix all remaining audit failures

-- #2: Add 6 missing columns to persona_snapshots
ALTER TABLE persona_snapshots ADD COLUMN IF NOT EXISTS revision_ratio_in_plan FLOAT;
ALTER TABLE persona_snapshots ADD COLUMN IF NOT EXISTS fatigue_sensitivity FLOAT;
ALTER TABLE persona_snapshots ADD COLUMN IF NOT EXISTS recalibration_order TEXT[];
ALTER TABLE persona_snapshots ADD COLUMN IF NOT EXISTS scope_reduction_threshold FLOAT;
ALTER TABLE persona_snapshots ADD COLUMN IF NOT EXISTS pyq_weight_minimum INT;
ALTER TABLE persona_snapshots ADD COLUMN IF NOT EXISTS weekend_boost BOOLEAN;

-- #3: Populate pyq_subject_stats for GS3/GS4 subjects
-- Re-run aggregation for subjects that have no row yet
INSERT INTO pyq_subject_stats (subject_id, avg_questions_per_year, total_questions_10yr, trend)
SELECT
  s.id,
  COALESCE(
    (SELECT ROUND(AVG(yearly_total)::numeric, 1)
     FROM (SELECT year, SUM(question_count) as yearly_total
           FROM pyq_data pd
           JOIN topics t ON pd.topic_id = t.id
           JOIN chapters c ON t.chapter_id = c.id
           WHERE c.subject_id = s.id
           GROUP BY year) yearly),
    0
  ) as avg_questions_per_year,
  COALESCE(
    (SELECT SUM(question_count)
     FROM pyq_data pd
     JOIN topics t ON pd.topic_id = t.id
     JOIN chapters c ON t.chapter_id = c.id
     WHERE c.subject_id = s.id),
    0
  ) as total_questions_10yr,
  'stable' as trend
FROM subjects s
WHERE NOT EXISTS (
  SELECT 1 FROM pyq_subject_stats pss WHERE pss.subject_id = s.id
)
ON CONFLICT (subject_id) DO NOTHING;

-- #4: Populate pyq_years from pyq_data
UPDATE topics t
SET pyq_years = (
  SELECT COALESCE(ARRAY_AGG(DISTINCT pd.year ORDER BY pd.year), '{}')
  FROM pyq_data pd
  WHERE pd.topic_id = t.id
)
WHERE EXISTS (SELECT 1 FROM pyq_data pd WHERE pd.topic_id = t.id);

-- #5: Normalize GS3/GS4 pyq_weight to integer 1-5 buckets
-- Re-run the full percentile bucketing across ALL topics
DO $$
DECLARE
  p10 FLOAT; p40 FLOAT; p70 FLOAT; p90 FLOAT;
BEGIN
  SELECT
    PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY pyq_weight),
    PERCENTILE_CONT(0.40) WITHIN GROUP (ORDER BY pyq_weight),
    PERCENTILE_CONT(0.70) WITHIN GROUP (ORDER BY pyq_weight),
    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY pyq_weight)
  INTO p10, p40, p70, p90
  FROM topics;

  UPDATE topics SET pyq_weight = CASE
    WHEN pyq_weight >= p90 THEN 5
    WHEN pyq_weight >= p70 THEN 4
    WHEN pyq_weight >= p40 THEN 3
    WHEN pyq_weight >= p10 THEN 2
    ELSE 1
  END;
END $$;

-- #7: Fix buffer_transactions CHECK constraint to include recalibration_adjustment
ALTER TABLE buffer_transactions DROP CONSTRAINT IF EXISTS buffer_transactions_type_check;
ALTER TABLE buffer_transactions ADD CONSTRAINT buffer_transactions_type_check
  CHECK (type IN ('deposit', 'withdrawal', 'zero_day_penalty', 'initial', 'consistency_reward', 'recalibration_adjustment'));

-- #17: Add missing columns to weekly_reviews table
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS topics_target INT DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS gravity_target FLOAT DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS peak_bri INT DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS subject_coverage JSONB DEFAULT '{"touched":[],"untouched":[],"untouched_over_14d":[]}';
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS wins TEXT[] DEFAULT '{}';
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS areas_to_improve TEXT[] DEFAULT '{}';
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS next_week_recommendations TEXT[] DEFAULT '{}';
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS hours_target FLOAT DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS avg_confidence INT DEFAULT 0;

-- #19: Make buffer_transactions idempotent by adding unique constraint for daily main transaction
-- We add a partial unique index on (user_id, transaction_date, type) for the main daily types
-- This prevents duplicate daily transactions while allowing multiple consistency_reward entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_buffer_tx_daily_unique
  ON buffer_transactions (user_id, transaction_date, type)
  WHERE type IN ('deposit', 'withdrawal', 'zero_day_penalty');
