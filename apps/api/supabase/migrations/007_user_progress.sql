-- User progress tracking for living syllabus map
CREATE TYPE topic_status AS ENUM ('untouched','in_progress','first_pass','revised','exam_ready','deferred_scope');
CREATE TYPE confidence_status AS ENUM ('fresh','fading','stale','decayed');

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status topic_status NOT NULL DEFAULT 'untouched',
  actual_hours_spent FLOAT NOT NULL DEFAULT 0,
  last_touched TIMESTAMPTZ,
  revision_count INT NOT NULL DEFAULT 0,
  confidence_score INT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  confidence_status confidence_status NOT NULL DEFAULT 'fresh',
  health_score INT NOT NULL DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  notes TEXT,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(user_id, status);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Append-only status change log
CREATE TABLE status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  old_status topic_status,
  new_status topic_status NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_changes_user ON status_changes(user_id);
CREATE INDEX idx_status_changes_topic ON status_changes(user_id, topic_id);

ALTER TABLE status_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own status changes" ON status_changes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own status changes" ON status_changes FOR INSERT WITH CHECK (auth.uid() = user_id);
