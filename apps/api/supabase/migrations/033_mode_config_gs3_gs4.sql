-- Add mode_config entries for GS-III and GS-IV subjects

-- PAUSED in Prelims (Mains-only subjects)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000015', false, 0),  -- Ethics (GS-IV, Mains only)
  ('prelims', 'a1000000-0000-0000-0000-000000000013', false, 0),  -- Internal Security (GS-III, Mains only)
  ('prelims', 'a1000000-0000-0000-0000-000000000016', false, 0)   -- Essay (Mains only)
ON CONFLICT (mode, subject_id) DO NOTHING;

-- BOOSTED in Prelims (GS-III subjects with Prelims paper)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000011', true, 1, 0.70),  -- Environment & Ecology (+1, Prelims)
  ('prelims', 'a1000000-0000-0000-0000-000000000012', true, 1, 0.70),  -- Science & Technology (+1, Prelims)
  ('prelims', 'a1000000-0000-0000-0000-000000000010', true, 1, 0.70)   -- Indian Economy (+1, Prelims)
ON CONFLICT (mode, subject_id) DO NOTHING;

-- ACTIVE in Prelims (no boost)
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('prelims', 'a1000000-0000-0000-0000-000000000014', true, 0, 0.70)   -- Disaster Management
ON CONFLICT (mode, subject_id) DO NOTHING;

-- POST-PRELIMS: catch-up subjects get importance boost
INSERT INTO mode_config (mode, subject_id, is_active, importance_modifier, revision_ratio) VALUES
  ('post_prelims', 'a1000000-0000-0000-0000-000000000015', true, 1, 0.40),  -- Ethics (catch up)
  ('post_prelims', 'a1000000-0000-0000-0000-000000000013', true, 1, 0.40),  -- Internal Security (catch up)
  ('post_prelims', 'a1000000-0000-0000-0000-000000000003', true, 1, 0.40),  -- World History (catch up)
  ('post_prelims', 'a1000000-0000-0000-0000-000000000008', true, 1, 0.40)   -- International Relations (catch up)
ON CONFLICT (mode, subject_id) DO NOTHING;
