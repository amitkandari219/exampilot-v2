-- Seed strategy_mode_defaults: 4 modes × 12 parameters = 48 rows

-- Conservative mode
INSERT INTO strategy_mode_defaults (mode, param_name, param_value, description) VALUES
  ('conservative', 'revision_frequency', '5', 'Days between revisions'),
  ('conservative', 'daily_new_topics', '1', 'New topics per day'),
  ('conservative', 'pyq_weight', '35', 'PYQ emphasis percentage'),
  ('conservative', 'answer_writing_sessions', '3', 'Answer writing sessions per week'),
  ('conservative', 'current_affairs_time', '45', 'Current affairs minutes per day'),
  ('conservative', 'optional_ratio', '20', 'Percentage time on optional subject'),
  ('conservative', 'test_frequency', '3', 'Mock tests per month'),
  ('conservative', 'break_days', '4', 'Rest days per month'),
  ('conservative', 'deep_study_hours', '3', 'Hours of deep focus per day'),
  ('conservative', 'revision_backlog_limit', '10', 'Max pending revisions before pause'),
  ('conservative', 'csat_time', '20', 'CSAT practice minutes per day'),
  ('conservative', 'essay_practice', '2', 'Essay practice sessions per month');

-- Aggressive mode
INSERT INTO strategy_mode_defaults (mode, param_name, param_value, description) VALUES
  ('aggressive', 'revision_frequency', '3', 'Days between revisions'),
  ('aggressive', 'daily_new_topics', '3', 'New topics per day'),
  ('aggressive', 'pyq_weight', '50', 'PYQ emphasis percentage'),
  ('aggressive', 'answer_writing_sessions', '6', 'Answer writing sessions per week'),
  ('aggressive', 'current_affairs_time', '60', 'Current affairs minutes per day'),
  ('aggressive', 'optional_ratio', '25', 'Percentage time on optional subject'),
  ('aggressive', 'test_frequency', '6', 'Mock tests per month'),
  ('aggressive', 'break_days', '2', 'Rest days per month'),
  ('aggressive', 'deep_study_hours', '5', 'Hours of deep focus per day'),
  ('aggressive', 'revision_backlog_limit', '15', 'Max pending revisions before pause'),
  ('aggressive', 'csat_time', '30', 'CSAT practice minutes per day'),
  ('aggressive', 'essay_practice', '4', 'Essay practice sessions per month');

-- Balanced mode
INSERT INTO strategy_mode_defaults (mode, param_name, param_value, description) VALUES
  ('balanced', 'revision_frequency', '4', 'Days between revisions'),
  ('balanced', 'daily_new_topics', '2', 'New topics per day'),
  ('balanced', 'pyq_weight', '40', 'PYQ emphasis percentage'),
  ('balanced', 'answer_writing_sessions', '4', 'Answer writing sessions per week'),
  ('balanced', 'current_affairs_time', '50', 'Current affairs minutes per day'),
  ('balanced', 'optional_ratio', '22', 'Percentage time on optional subject'),
  ('balanced', 'test_frequency', '4', 'Mock tests per month'),
  ('balanced', 'break_days', '3', 'Rest days per month'),
  ('balanced', 'deep_study_hours', '4', 'Hours of deep focus per day'),
  ('balanced', 'revision_backlog_limit', '12', 'Max pending revisions before pause'),
  ('balanced', 'csat_time', '25', 'CSAT practice minutes per day'),
  ('balanced', 'essay_practice', '3', 'Essay practice sessions per month');

-- Working Professional mode
INSERT INTO strategy_mode_defaults (mode, param_name, param_value, description) VALUES
  ('working_professional', 'revision_frequency', '7', 'Days between revisions'),
  ('working_professional', 'daily_new_topics', '1', 'New topics per day'),
  ('working_professional', 'pyq_weight', '45', 'PYQ emphasis percentage'),
  ('working_professional', 'answer_writing_sessions', '3', 'Answer writing sessions per week'),
  ('working_professional', 'current_affairs_time', '30', 'Current affairs minutes per day'),
  ('working_professional', 'optional_ratio', '20', 'Percentage time on optional subject'),
  ('working_professional', 'test_frequency', '2', 'Mock tests per month'),
  ('working_professional', 'break_days', '4', 'Rest days per month'),
  ('working_professional', 'deep_study_hours', '2', 'Hours of deep focus per day'),
  ('working_professional', 'revision_backlog_limit', '8', 'Max pending revisions before pause'),
  ('working_professional', 'csat_time', '15', 'CSAT practice minutes per day'),
  ('working_professional', 'essay_practice', '2', 'Essay practice sessions per month');
