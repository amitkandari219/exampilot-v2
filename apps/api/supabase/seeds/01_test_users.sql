-- 01: Test users for local development
-- Creates 4 test users (one per strategy mode) with pre-configured profiles
-- Only for local dev — NEVER run in production
-- Idempotent: uses ON CONFLICT DO NOTHING

-- ============================================================
-- TEST USER PROFILES
-- ============================================================
-- Note: auth.users must be created via Supabase Auth (signup flow).
-- These profiles assume the user has already signed up locally.
-- Use these UUIDs when testing with the API directly:

-- Test user IDs (deterministic for easy reference):
--   user_balanced:            d0000000-0000-0000-0000-000000000001
--   user_aggressive:          d0000000-0000-0000-0000-000000000002
--   user_conservative:        d0000000-0000-0000-0000-000000000003
--   user_working_professional: d0000000-0000-0000-0000-000000000004

INSERT INTO user_profiles (
  id, strategy_mode, exam_date, daily_hours, is_working_professional,
  attempt_number, buffer_days, current_streak, longest_streak,
  burnout_score, stress_level, xp_total, current_level
) VALUES
  -- Balanced mode: 2nd attempt, 8 hrs/day, exam in ~6 months
  ('d0000000-0000-0000-0000-000000000001', 'balanced', '2026-08-28', 8, false,
   2, 15, 12, 30, 25, 60, 2400, 3),

  -- Aggressive mode: 1st attempt, 10 hrs/day, exam in ~4 months
  ('d0000000-0000-0000-0000-000000000002', 'aggressive', '2026-06-28', 10, false,
   1, 10, 45, 45, 15, 40, 5200, 5),

  -- Conservative mode: 3rd attempt, 6 hrs/day, exam in ~8 months
  ('d0000000-0000-0000-0000-000000000003', 'conservative', '2026-10-28', 6, false,
   3, 20, 5, 60, 40, 70, 8500, 7),

  -- Working Professional: 1st attempt, 3 hrs/day, exam in ~10 months
  ('d0000000-0000-0000-0000-000000000004', 'working_professional', '2026-12-28', 3, true,
   1, 25, 8, 14, 35, 55, 1100, 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TEST USER STRATEGY SNAPSHOTS
-- ============================================================

INSERT INTO strategy_snapshots (user_id, mode, daily_hours, exam_date, attempt_number, is_working_professional, trigger)
SELECT id, strategy_mode, daily_hours, exam_date, attempt_number, is_working_professional, 'seed'
FROM user_profiles
WHERE id IN (
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000004'
)
ON CONFLICT DO NOTHING;
