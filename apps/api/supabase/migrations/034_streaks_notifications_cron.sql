-- Migration 034: Add revision/plan_completion streaks, notification_queue, extra badges, cron spec

-- 1. Seed revision and plan_completion streak types for existing users
-- The streaks table already supports arbitrary streak_type via TEXT column.
-- We just need to ensure code creates rows for these types.

-- 2. Notification Queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status) WHERE status = 'pending';

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notification_queue FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Add push_token to user_profiles (for Expo Push)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- 4. Seed additional badge definitions (already have 15, adding 5 more for revision/plan_completion streaks)
INSERT INTO badge_definitions (slug, name, description, icon_name, category, unlock_condition, xp_reward) VALUES
  ('revision_streak_7',  'Revision Regular',  'Maintain a 7-day revision streak',    'refresh-cw',  'streak', '{"revision_streak_gte": 7}',        200),
  ('revision_streak_30', 'Revision Master',   'Maintain a 30-day revision streak',   'refresh-cw',  'streak', '{"revision_streak_gte": 30}',       800),
  ('plan_streak_7',      'Plan Perfectionist', 'Complete your plan 7 days in a row', 'check-square', 'streak', '{"plan_completion_streak_gte": 7}',  200),
  ('plan_streak_30',     'Plan Machine',      'Complete your plan 30 days in a row', 'check-square', 'streak', '{"plan_completion_streak_gte": 30}', 800),
  ('mock_warrior',       'Mock Warrior',      'Complete 5 mock tests',               'target',      'study',  '{"mocks_completed_gte": 5}',        300)
ON CONFLICT (slug) DO NOTHING;

-- 5. Cron job specification (documented here, implemented via Supabase Edge Function or pg_cron)
-- Schedule: daily-maintenance at 2:00 AM UTC
--
-- Step 1 (2:00): decayTrigger.recalculateAllConfidence(userId)
--   - FSRS retrievability for all topics
--   - Threshold crossing detection
--   - Auto-downgrade decayed topics
--   - Schedule decay revisions
--   - Update subject confidence cache
--
-- Step 2 (2:05): weakness.recalculateAllHealth(userId)
--   - Recalculate health_score for all topics
--   - Update zone distribution
--   - Refresh false_security / blind_spots / over_revised
--
-- Step 3 (2:10): velocity.createDailySnapshot(userId)
--   - Calculate today's velocity metrics
--   - Create velocity_snapshot row
--
-- Step 4 (2:15): buffer.processDailyTransaction(userId)
--   - Compare gravity_completed vs required_velocity
--   - Create deposit/withdrawal/zero_day transaction
--
-- Step 5 (2:20): burnout.createDailySnapshot(userId)
--   - Calculate fatigue score + BRI
--   - Check recovery trigger conditions
--
-- Step 6 (2:25): benchmark.createDailySnapshot(userId)
--   - Calculate readiness score
--
-- Step 7 (Sundays 7:00 PM): weeklyReview.generateIfNotExists(userId)
--   - Generate weekly review
--   - Queue push notification "Your Weekly Review is ready"
--
-- Requirements:
--   - Each step is idempotent (UPSERT with user_id, snapshot_date)
--   - If a step fails, log error but continue to next step
--   - Track execution time for monitoring
--   - Batch processing for 1000+ users

-- Create cron execution log table
CREATE TABLE IF NOT EXISTS cron_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  users_processed INT DEFAULT 0,
  errors JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);
