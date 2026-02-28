-- Add streak freeze column: allows 1 free miss per 7-day window
ALTER TABLE streaks ADD COLUMN IF NOT EXISTS freeze_used_this_week boolean NOT NULL DEFAULT false;
