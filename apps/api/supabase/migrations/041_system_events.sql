CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_system_events_user_created ON system_events(user_id, created_at DESC);

ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own events" ON system_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service insert events" ON system_events FOR INSERT WITH CHECK (true);
