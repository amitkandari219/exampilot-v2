-- 01: Test users for local development
-- Creates 4 test users (one per strategy mode) with pre-configured profiles
-- Only for local dev — NEVER run in production
-- Idempotent: uses ON CONFLICT DO NOTHING

-- ============================================================
-- AUTH USERS (required for FK on user_profiles)
-- ============================================================
-- Password for all test users: password123

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  raw_app_meta_data, raw_user_meta_data
) VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'test-balanced@exampilot.dev',
   crypt('password123', gen_salt('bf')),
   now(), now(), now(), '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{"name": "Test Balanced"}'),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'test-aggressive@exampilot.dev',
   crypt('password123', gen_salt('bf')),
   now(), now(), now(), '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{"name": "Test Aggressive"}'),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'test-conservative@exampilot.dev',
   crypt('password123', gen_salt('bf')),
   now(), now(), now(), '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{"name": "Test Conservative"}'),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'test-wp@exampilot.dev',
   crypt('password123', gen_salt('bf')),
   now(), now(), now(), '', '', '',
   '{"provider": "email", "providers": ["email"]}', '{"name": "Test Working Professional"}')
ON CONFLICT (id) DO NOTHING;

-- Auth identities (required for email login)
INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'test-balanced@exampilot.dev',
   'email', '{"sub": "d0000000-0000-0000-0000-000000000001", "email": "test-balanced@exampilot.dev"}', now(), now(), now()),
  (gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'test-aggressive@exampilot.dev',
   'email', '{"sub": "d0000000-0000-0000-0000-000000000002", "email": "test-aggressive@exampilot.dev"}', now(), now(), now()),
  (gen_random_uuid(), 'd0000000-0000-0000-0000-000000000003', 'test-conservative@exampilot.dev',
   'email', '{"sub": "d0000000-0000-0000-0000-000000000003", "email": "test-conservative@exampilot.dev"}', now(), now(), now()),
  (gen_random_uuid(), 'd0000000-0000-0000-0000-000000000004', 'test-wp@exampilot.dev',
   'email', '{"sub": "d0000000-0000-0000-0000-000000000004", "email": "test-wp@exampilot.dev"}', now(), now(), now())
ON CONFLICT DO NOTHING;

-- ============================================================
-- USER PROFILES
-- ============================================================

-- Balanced user: 2nd attempt, 8 hrs/day
INSERT INTO user_profiles (id, strategy_mode, exam_date, daily_hours, attempt_number, onboarding_completed)
VALUES ('d0000000-0000-0000-0000-000000000001', 'balanced', '2026-08-28', 8, '2', true)
ON CONFLICT (id) DO NOTHING;

-- Aggressive user: 1st attempt, 10 hrs/day
INSERT INTO user_profiles (id, strategy_mode, exam_date, daily_hours, attempt_number, onboarding_completed)
VALUES ('d0000000-0000-0000-0000-000000000002', 'aggressive', '2026-06-28', 10, '1', true)
ON CONFLICT (id) DO NOTHING;

-- Conservative user: 3rd attempt, 6 hrs/day
INSERT INTO user_profiles (id, strategy_mode, exam_date, daily_hours, attempt_number, onboarding_completed)
VALUES ('d0000000-0000-0000-0000-000000000003', 'conservative', '2026-10-28', 6, '3', true)
ON CONFLICT (id) DO NOTHING;

-- Working Professional: 1st attempt, 3 hrs/day
INSERT INTO user_profiles (id, strategy_mode, exam_date, daily_hours, attempt_number, user_type, onboarding_completed)
VALUES ('d0000000-0000-0000-0000-000000000004', 'working_professional', '2026-12-28', 3, '1', 'working_professional', true)
ON CONFLICT (id) DO NOTHING;
