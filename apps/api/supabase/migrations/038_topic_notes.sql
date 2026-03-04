-- Topic notes: rich text and link notes per topic
CREATE TABLE topic_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('text', 'link')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_topic_notes_user_topic ON topic_notes(user_id, topic_id);

-- RLS
ALTER TABLE topic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" ON topic_notes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
