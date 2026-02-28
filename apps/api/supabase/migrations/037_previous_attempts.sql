-- Store previous attempt data for repeaters
CREATE TABLE IF NOT EXISTS previous_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('prelims', 'mains', 'interview', 'did_not_appear')),
  prelims_score numeric,
  mains_score numeric,
  weak_subjects text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE previous_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attempts" ON previous_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON previous_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON previous_attempts
  FOR UPDATE USING (auth.uid() = user_id);
