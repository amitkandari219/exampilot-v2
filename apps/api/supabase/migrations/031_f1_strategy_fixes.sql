-- F1 Fixes: Seed strategy_mode_defaults, add missing persona params

-- 1. Seed strategy_mode_defaults (was empty)
INSERT INTO strategy_mode_defaults (mode, param_name, param_value, description) VALUES
  -- Conservative
  ('conservative', 'revision_frequency', '5', 'Revise every N days'),
  ('conservative', 'daily_new_topics', '1', 'New topics per day'),
  ('conservative', 'pyq_weight', '35', 'PYQ emphasis percentage'),
  ('conservative', 'answer_writing_sessions', '3', 'Answer writing sessions per week'),
  ('conservative', 'current_affairs_time', '45', 'CA time in minutes'),
  ('conservative', 'optional_ratio', '20', 'Optional subject ratio'),
  ('conservative', 'test_frequency', '3', 'Mock tests per month'),
  ('conservative', 'break_days', '4', 'Break days per month'),
  ('conservative', 'deep_study_hours', '3', 'Deep study hours per day'),
  ('conservative', 'revision_backlog_limit', '10', 'Max revision backlog'),
  ('conservative', 'csat_time', '20', 'CSAT prep time in minutes'),
  ('conservative', 'essay_practice', '2', 'Essay practice sessions per week'),
  -- Aggressive
  ('aggressive', 'revision_frequency', '3', 'Revise every N days'),
  ('aggressive', 'daily_new_topics', '3', 'New topics per day'),
  ('aggressive', 'pyq_weight', '50', 'PYQ emphasis percentage'),
  ('aggressive', 'answer_writing_sessions', '6', 'Answer writing sessions per week'),
  ('aggressive', 'current_affairs_time', '60', 'CA time in minutes'),
  ('aggressive', 'optional_ratio', '25', 'Optional subject ratio'),
  ('aggressive', 'test_frequency', '6', 'Mock tests per month'),
  ('aggressive', 'break_days', '2', 'Break days per month'),
  ('aggressive', 'deep_study_hours', '5', 'Deep study hours per day'),
  ('aggressive', 'revision_backlog_limit', '15', 'Max revision backlog'),
  ('aggressive', 'csat_time', '30', 'CSAT prep time in minutes'),
  ('aggressive', 'essay_practice', '4', 'Essay practice sessions per week'),
  -- Balanced
  ('balanced', 'revision_frequency', '4', 'Revise every N days'),
  ('balanced', 'daily_new_topics', '2', 'New topics per day'),
  ('balanced', 'pyq_weight', '40', 'PYQ emphasis percentage'),
  ('balanced', 'answer_writing_sessions', '4', 'Answer writing sessions per week'),
  ('balanced', 'current_affairs_time', '50', 'CA time in minutes'),
  ('balanced', 'optional_ratio', '22', 'Optional subject ratio'),
  ('balanced', 'test_frequency', '4', 'Mock tests per month'),
  ('balanced', 'break_days', '3', 'Break days per month'),
  ('balanced', 'deep_study_hours', '4', 'Deep study hours per day'),
  ('balanced', 'revision_backlog_limit', '12', 'Max revision backlog'),
  ('balanced', 'csat_time', '25', 'CSAT prep time in minutes'),
  ('balanced', 'essay_practice', '3', 'Essay practice sessions per week'),
  -- Working Professional
  ('working_professional', 'revision_frequency', '7', 'Revise every N days'),
  ('working_professional', 'daily_new_topics', '1', 'New topics per day'),
  ('working_professional', 'pyq_weight', '45', 'PYQ emphasis percentage'),
  ('working_professional', 'answer_writing_sessions', '3', 'Answer writing sessions per week'),
  ('working_professional', 'current_affairs_time', '30', 'CA time in minutes'),
  ('working_professional', 'optional_ratio', '20', 'Optional subject ratio'),
  ('working_professional', 'test_frequency', '2', 'Mock tests per month'),
  ('working_professional', 'break_days', '4', 'Break days per month'),
  ('working_professional', 'deep_study_hours', '2', 'Deep study hours per day'),
  ('working_professional', 'revision_backlog_limit', '8', 'Max revision backlog'),
  ('working_professional', 'csat_time', '15', 'CSAT prep time in minutes'),
  ('working_professional', 'essay_practice', '2', 'Essay practice sessions per week')
ON CONFLICT (mode, param_name) DO NOTHING;

-- 2. Add missing persona param columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revision_ratio_in_plan FLOAT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fatigue_sensitivity FLOAT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS recalibration_order TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS scope_reduction_threshold FLOAT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pyq_weight_minimum INT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weekend_boost BOOLEAN DEFAULT false;

-- 3. Add pyq_years array column to topics (F2 fix)
ALTER TABLE topics ADD COLUMN IF NOT EXISTS pyq_years INT[] DEFAULT '{}';
