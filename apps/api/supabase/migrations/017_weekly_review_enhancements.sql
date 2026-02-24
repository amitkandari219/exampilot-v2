-- F12b: Enhanced Weekly Review — add gamification + benchmark columns
ALTER TABLE weekly_reviews
  ADD COLUMN IF NOT EXISTS xp_earned INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badges_unlocked JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS level_start INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS level_end INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS benchmark_score_start INT,
  ADD COLUMN IF NOT EXISTS benchmark_score_end INT,
  ADD COLUMN IF NOT EXISTS benchmark_status TEXT,
  ADD COLUMN IF NOT EXISTS benchmark_trend TEXT;
