-- Phase 3: INFRA-3 Resource/Book DB + INFRA-4 Answer Writing + T4-2 Reading Progress

-- INFRA-3: Resource/book database
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  resource_type TEXT NOT NULL DEFAULT 'book', -- 'book', 'website', 'pdf', 'video'
  url TEXT,
  is_standard BOOLEAN DEFAULT false, -- standard UPSC reference
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_topic_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_range TEXT, -- e.g. "Ch 1-5" for partial book coverage
  relevance INTEGER DEFAULT 3 CHECK (relevance BETWEEN 1 AND 5),
  notes TEXT,
  UNIQUE(resource_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_topic_map_topic ON resource_topic_map(topic_id);
CREATE INDEX IF NOT EXISTS idx_resource_topic_map_resource ON resource_topic_map(resource_id);

-- T4-2: Reading progress tracking per user per resource
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  total_pages INTEGER,
  pages_read INTEGER DEFAULT 0,
  completion_pct NUMERIC DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);

-- INFRA-4: Answer writing data model
CREATE TABLE IF NOT EXISTS answer_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  word_limit INTEGER DEFAULT 250,
  question_type TEXT DEFAULT 'analytical', -- 'analytical', 'descriptive', 'opinion', 'case_study'
  structure_hints TEXT[], -- e.g. ['intro', 'body_1', 'body_2', 'conclusion']
  key_points TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS answer_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES answer_templates(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  word_count INTEGER,
  time_taken_minutes INTEGER,
  -- Self-assessment rubric scores (1-5 each)
  score_structure INTEGER CHECK (score_structure BETWEEN 1 AND 5),
  score_intro INTEGER CHECK (score_intro BETWEEN 1 AND 5),
  score_examples INTEGER CHECK (score_examples BETWEEN 1 AND 5),
  score_analysis INTEGER CHECK (score_analysis BETWEEN 1 AND 5),
  score_conclusion INTEGER CHECK (score_conclusion BETWEEN 1 AND 5),
  total_score NUMERIC, -- computed average
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answer_templates_topic ON answer_templates(topic_id);
CREATE INDEX IF NOT EXISTS idx_answer_submissions_user ON answer_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_submissions_topic ON answer_submissions(user_id, topic_id);

-- Seed some standard UPSC resources
INSERT INTO resources (id, title, author, resource_type, is_standard, display_order) VALUES
('d1000000-0000-0000-0000-000000000001', 'Indian Polity', 'M. Laxmikanth', 'book', true, 1),
('d1000000-0000-0000-0000-000000000002', 'India''s Struggle for Independence', 'Bipan Chandra', 'book', true, 2),
('d1000000-0000-0000-0000-000000000003', 'Indian Economy', 'Ramesh Singh', 'book', true, 3),
('d1000000-0000-0000-0000-000000000004', 'Certificate Physical and Human Geography', 'G.C. Leong', 'book', true, 4),
('d1000000-0000-0000-0000-000000000005', 'Indian Art and Culture', 'Nitin Singhania', 'book', true, 5),
('d1000000-0000-0000-0000-000000000006', 'Environment & Ecology', 'Shankar IAS', 'book', true, 6),
('d1000000-0000-0000-0000-000000000007', 'Ethics, Integrity and Aptitude', 'Lexicon', 'book', true, 7),
('d1000000-0000-0000-0000-000000000008', 'India Year Book', 'Government of India', 'book', true, 8),
('d1000000-0000-0000-0000-000000000009', 'Science & Technology', 'TMH', 'book', true, 9),
('d1000000-0000-0000-0000-000000000010', 'International Relations', 'Pavneet Singh', 'book', true, 10)
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_topic_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read resources" ON resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can read resource_topic_map" ON resource_topic_map FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own reading_progress" ON reading_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can read answer_templates" ON answer_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own answer_submissions" ON answer_submissions FOR ALL USING (auth.uid() = user_id);
