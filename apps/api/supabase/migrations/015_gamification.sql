-- F17: Gamification Layer — XP, Levels, Badges

-- 1. Badge definitions (seed lookup table)
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'milestone', 'study', 'recovery', 'special')),
  unlock_condition JSONB NOT NULL DEFAULT '{}',
  xp_reward INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. XP transactions (append-only XP log)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  xp_amount INT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'plan_item_new', 'plan_item_revision', 'plan_item_decay_revision', 'plan_item_stretch',
    'fsrs_review_correct', 'fsrs_review_incorrect',
    'streak_milestone', 'recovery_completion', 'badge_unlock'
  )),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User badges (junction table)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_slug TEXT NOT NULL REFERENCES badge_definitions(slug) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_slug)
);

-- 4. Add XP columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS xp_total INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_level INT NOT NULL DEFAULT 1;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- 6. RLS policies
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own xp_transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own user_badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read badge_definitions"
  ON badge_definitions FOR SELECT
  USING (true);

-- 7. Seed 15 badge definitions
INSERT INTO badge_definitions (slug, name, description, icon_name, category, unlock_condition, xp_reward) VALUES
  ('first_week',     'First Week',      'Maintain a 7-day study streak',                    'flame',      'streak',    '{"streak_gte": 7}',               200),
  ('two_weeks',      'Two Weeks',       'Maintain a 14-day study streak',                   'flame',      'streak',    '{"streak_gte": 14}',              400),
  ('monthly',        'Monthly Grind',   'Maintain a 30-day study streak',                   'fire',       'streak',    '{"streak_gte": 30}',             1000),
  ('century',        'Century Club',    'Maintain a 100-day study streak',                  'crown',      'streak',    '{"streak_gte": 100}',            2500),
  ('first_topic',    'First Step',      'Complete your first topic',                        'footprints', 'study',     '{"topics_completed_gte": 1}',      50),
  ('ten_topics',     'Getting Serious', 'Complete 10 topics',                               'books',      'study',     '{"topics_completed_gte": 10}',    200),
  ('fifty_topics',   'Half Century',    'Complete 50 topics',                               'trophy',     'study',     '{"topics_completed_gte": 50}',    500),
  ('hundred_topics', 'Centurion',       'Complete 100 topics',                              'medal',      'study',     '{"topics_completed_gte": 100}',  1000),
  ('xp_1000',        'XP Starter',      'Earn 1,000 total XP',                             'star',       'milestone', '{"xp_total_gte": 1000}',            0),
  ('xp_5000',        'XP Veteran',      'Earn 5,000 total XP',                             'stars',      'milestone', '{"xp_total_gte": 5000}',            0),
  ('xp_10000',       'XP Master',       'Earn 10,000 total XP',                            'sparkles',   'milestone', '{"xp_total_gte": 10000}',           0),
  ('resilient',      'Resilient',       'Complete a recovery period',                       'shield',     'recovery',  '{"recovery_completed_gte": 1}',   150),
  ('early_bird',     'Early Bird',      'Complete your first study session',                'sunrise',    'special',   '{"first_session": true}',         100),
  ('night_owl',      'Night Owl',       'Study 7+ hours in a single day',                  'moon',       'special',   '{"daily_hours_gte": 7}',          150),
  ('perfect_week',   'Perfect Week',    'Complete 100% of plan items for 7 consecutive days', 'check-circle', 'special', '{"perfect_week": true}',        500)
ON CONFLICT (slug) DO NOTHING;
