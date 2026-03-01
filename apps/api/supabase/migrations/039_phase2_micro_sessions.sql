-- Phase 2: INFRA-8 Topic Duration Tagging + T2-10 Micro-session support

-- INFRA-8: Add estimated_micro_minutes — minimum useful study session length per topic
ALTER TABLE topics ADD COLUMN IF NOT EXISTS estimated_micro_minutes INTEGER DEFAULT 30;

-- Classify topics by difficulty + total estimated hours:
--   5 min  = low difficulty, small scope (quick review/recall)
--   15 min = medium difficulty, moderate scope (focused reading)
--   30 min = higher difficulty or larger scope (standard session)
--   60 min = complex topics requiring deep concentration
UPDATE topics SET estimated_micro_minutes = CASE
  WHEN difficulty <= 2 AND estimated_hours <= 3 THEN 5
  WHEN difficulty <= 3 AND estimated_hours <= 5 THEN 15
  WHEN difficulty <= 4 AND estimated_hours <= 8 THEN 30
  ELSE 60
END;

-- Index for micro-session filtering
CREATE INDEX IF NOT EXISTS idx_topics_micro_minutes ON topics(estimated_micro_minutes);
