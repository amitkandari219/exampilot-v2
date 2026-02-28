-- 00a: Strategy mode defaults + badge definitions + mode config
-- 4 modes × 12 parameters = 48 rows
-- 15 badge definitions
-- Exam mode config for all subjects
-- Idempotent: uses ON CONFLICT DO NOTHING

-- ============================================================
-- STRATEGY MODE DEFAULTS
-- ============================================================

INSERT INTO strategy_mode_defaults (mode, param_name, param_value, description) VALUES
  -- Conservative
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
  ('conservative', 'essay_practice', '2', 'Essay practice sessions per month'),
  -- Aggressive
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
  ('aggressive', 'essay_practice', '4', 'Essay practice sessions per month'),
  -- Balanced
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
  ('balanced', 'essay_practice', '3', 'Essay practice sessions per month'),
  -- Working Professional
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
  ('working_professional', 'essay_practice', '2', 'Essay practice sessions per month')
ON CONFLICT (mode, param_name) DO NOTHING;

-- ============================================================
-- BADGE DEFINITIONS
-- ============================================================

INSERT INTO badge_definitions (slug, name, description, icon_name, category, unlock_condition, xp_reward) VALUES
  ('first_week',     'First Week',      'Maintain a 7-day study streak',                    'flame',      'streak',    '{"streak_gte": 7}',               200),
  ('two_weeks',      'Two Weeks',       'Maintain a 14-day study streak',                   'flame',      'streak',    '{"streak_gte": 14}',              400),
  ('monthly',        'Monthly Grind',   'Maintain a 30-day study streak',                   'fire',       'streak',    '{"streak_gte": 30}',             1000),
  ('century',        'Century Club',    'Maintain a 100-day study streak',                  'crown',      'streak',    '{"streak_gte": 100}',            2500),
  ('first_topic',    'First Step',      'Complete your first topic',                        'footprints', 'study',     '{"topics_completed_gte": 1}',      50),
  ('ten_topics',     'Getting Serious', 'Complete 10 topics',                               'books',      'study',     '{"topics_completed_gte": 10}',    200),
  ('fifty_topics',   'Half Century',    'Complete 50 topics',                               'trophy',     'study',     '{"topics_completed_gte": 50}',    500),
  ('hundred_topics', 'Centurion',       'Complete 100 topics',                              'medal',      'study',     '{"topics_completed_gte": 100}',  1000),
  ('xp_1000',        'XP Starter',      'Earn 1,000 total XP',                             'star',       'milestone', '{"xp_total_gte": 1000}',            0),
  ('xp_5000',        'XP Veteran',      'Earn 5,000 total XP',                             'stars',      'milestone', '{"xp_total_gte": 5000}',            0),
  ('xp_10000',       'XP Master',       'Earn 10,000 total XP',                            'sparkles',   'milestone', '{"xp_total_gte": 10000}',           0),
  ('resilient',      'Resilient',       'Complete a recovery period',                       'shield',     'recovery',  '{"recovery_completed_gte": 1}',   150),
  ('early_bird',     'Early Bird',      'Complete your first study session',                'sunrise',    'special',   '{"first_session": true}',         100),
  ('night_owl',      'Night Owl',       'Study 7+ hours in a single day',                  'moon',       'special',   '{"daily_hours_gte": 7}',          150),
  ('perfect_week',   'Perfect Week',    'Complete 100% of plan items for 7 consecutive days', 'check-circle', 'special', '{"perfect_week": true}',        500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- EXAM MODE CONFIG
-- ============================================================

-- Prelims: PAUSED (Mains-only, low prelims relevance)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000003', false, 0),  -- World History
  ('prelims', 'a1000000-0000-0000-0000-000000000008', false, 0),  -- International Relations
  ('prelims', 'a1000000-0000-0000-0000-000000000015', false, 0),  -- Ethics (GS-IV)
  ('prelims', 'a1000000-0000-0000-0000-000000000013', false, 0),  -- Internal Security
  ('prelims', 'a1000000-0000-0000-0000-000000000016', false, 0)   -- Essay
ON CONFLICT (mode, subject_id) DO NOTHING;

-- Prelims: BOOSTED (high prelims relevance)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000001', true, 1, 0.70),  -- Indian Heritage & Culture
  ('prelims', 'a1000000-0000-0000-0000-000000000005', true, 1, 0.70),  -- Geography
  ('prelims', 'a1000000-0000-0000-0000-000000000007', true, 1, 0.70),  -- Indian Polity
  ('prelims', 'a1000000-0000-0000-0000-000000000011', true, 1, 0.70),  -- Environment & Ecology
  ('prelims', 'a1000000-0000-0000-0000-000000000012', true, 1, 0.70),  -- Science & Technology
  ('prelims', 'a1000000-0000-0000-0000-000000000010', true, 1, 0.70)   -- Indian Economy
ON CONFLICT (mode, subject_id) DO NOTHING;

-- Prelims: ACTIVE (no boost)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000002', true, 0, 0.70),  -- Modern Indian History
  ('prelims', 'a1000000-0000-0000-0000-000000000004', true, 0, 0.70),  -- Indian Society
  ('prelims', 'a1000000-0000-0000-0000-000000000006', true, 0, 0.70),  -- Indian National Movement
  ('prelims', 'a1000000-0000-0000-0000-000000000009', true, 0, 0.70),  -- Social Justice
  ('prelims', 'a1000000-0000-0000-0000-000000000014', true, 0, 0.70)   -- Disaster Management
ON CONFLICT (mode, subject_id) DO NOTHING;

-- Post-Prelims: catch-up subjects get importance boost
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('post_prelims', 'a1000000-0000-0000-0000-000000000015', true, 1, 0.40),  -- Ethics
  ('post_prelims', 'a1000000-0000-0000-0000-000000000013', true, 1, 0.40),  -- Internal Security
  ('post_prelims', 'a1000000-0000-0000-0000-000000000003', true, 1, 0.40),  -- World History
  ('post_prelims', 'a1000000-0000-0000-0000-000000000008', true, 1, 0.40)   -- International Relations
ON CONFLICT (mode, subject_id) DO NOTHING;
