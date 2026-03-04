ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS daily_hours_breakdown JSONB DEFAULT '[]'::jsonb;
