-- Syllabus & PYQ intelligence schema
CREATE TYPE gs_paper AS ENUM ('GS-I','GS-II','GS-III','GS-IV','Prelims');
CREATE TYPE pyq_trend AS ENUM ('rising','stable','declining');

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  papers gs_paper[] NOT NULL,
  importance INT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  estimated_hours FLOAT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  importance INT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  estimated_hours FLOAT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  UNIQUE(subject_id, name)
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  importance INT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  estimated_hours FLOAT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  pyq_frequency INT NOT NULL DEFAULT 0,
  pyq_weight FLOAT NOT NULL DEFAULT 1.0 CHECK (pyq_weight BETWEEN 1.0 AND 5.0),
  pyq_trend pyq_trend NOT NULL DEFAULT 'stable',
  last_pyq_year INT,
  UNIQUE(chapter_id, name)
);

CREATE TABLE pyq_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year BETWEEN 2015 AND 2025),
  paper gs_paper NOT NULL,
  question_count INT NOT NULL DEFAULT 1,
  question_type TEXT,
  UNIQUE(topic_id, year, paper)
);

CREATE INDEX idx_chapters_subject ON chapters(subject_id);
CREATE INDEX idx_topics_chapter ON topics(chapter_id);
CREATE INDEX idx_topics_pyq_weight ON topics(pyq_weight DESC);
CREATE INDEX idx_pyq_data_topic ON pyq_data(topic_id);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read subjects" ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read chapters" ON chapters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read topics" ON topics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read pyq_data" ON pyq_data FOR SELECT USING (auth.role() = 'authenticated');
