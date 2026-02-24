-- Smart daily planner tables
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  available_hours FLOAT NOT NULL DEFAULT 0,
  is_regenerated BOOL NOT NULL DEFAULT FALSE,
  is_light_day BOOL NOT NULL DEFAULT FALSE,
  fatigue_score INT NOT NULL DEFAULT 0,
  energy_level TEXT NOT NULL DEFAULT 'full' CHECK (energy_level IN ('full','moderate','low','empty')),
  UNIQUE(user_id, plan_date)
);

CREATE INDEX idx_daily_plans_user ON daily_plans(user_id);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily plans" ON daily_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily plans" ON daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily plans" ON daily_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily plans" ON daily_plans FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE daily_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'new' CHECK (type IN ('new','revision','decay_revision','stretch')),
  estimated_hours FLOAT NOT NULL DEFAULT 0,
  priority_score FLOAT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','skipped','deferred')),
  completed_at TIMESTAMPTZ,
  actual_hours FLOAT
);

CREATE INDEX idx_daily_plan_items_plan ON daily_plan_items(plan_id);

ALTER TABLE daily_plan_items ENABLE ROW LEVEL SECURITY;

-- RLS via join to daily_plans
CREATE POLICY "Users can read own plan items" ON daily_plan_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM daily_plans WHERE daily_plans.id = daily_plan_items.plan_id AND daily_plans.user_id = auth.uid()));
CREATE POLICY "Users can insert own plan items" ON daily_plan_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM daily_plans WHERE daily_plans.id = daily_plan_items.plan_id AND daily_plans.user_id = auth.uid()));
CREATE POLICY "Users can update own plan items" ON daily_plan_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM daily_plans WHERE daily_plans.id = daily_plan_items.plan_id AND daily_plans.user_id = auth.uid()));
CREATE POLICY "Users can delete own plan items" ON daily_plan_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM daily_plans WHERE daily_plans.id = daily_plan_items.plan_id AND daily_plans.user_id = auth.uid()));
