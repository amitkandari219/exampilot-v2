-- 00c: PYQ (Previous Year Questions) data
-- Part 1: Hand-curated PYQ entries for high-frequency GS-I/II topics (from migration 006)
-- Part 2: Hand-curated PYQ entries for high-frequency GS-III/IV topics (from migration 032)
-- Part 3: Procedural generation for remaining topics (from migration 025)
-- Part 4: Derived stats — topic-level pyq fields + pyq_subject_stats
-- Idempotent: all inserts use ON CONFLICT DO NOTHING

-- ============================================================
-- PART 1: GS-I & GS-II hand-curated PYQ entries
-- ============================================================

-- Temple Architecture PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000005', 2025, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000005', 2024, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000005', 2023, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000005', 2022, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000005', 2021, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000005', 2020, 'Prelims', 1, 'mcq'),
('c1000000-0000-0000-0000-000000000005', 2019, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000005', 2018, 'Prelims', 1, 'mcq'),
('c1000000-0000-0000-0000-000000000005', 2016, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000005', 2015, 'GS-I', 1, 'short_answer')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Gandhian Movements PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000012', 2025, 'GS-I', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2024, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2023, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000012', 2022, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2021, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2020, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000012', 2019, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2018, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2017, 'Prelims', 1, 'mcq'),
('c1000000-0000-0000-0000-000000000012', 2016, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000012', 2015, 'GS-I', 1, 'short_answer')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Fundamental Rights & DPSP PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000036', 2025, 'GS-II', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2024, 'GS-II', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2023, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000036', 2022, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2021, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2020, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000036', 2019, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2019, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000036', 2018, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2017, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000036', 2016, 'Prelims', 1, 'mcq'),
('c1000000-0000-0000-0000-000000000036', 2015, 'GS-II', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Women & Gender Issues PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000026', 2025, 'GS-I', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2024, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2023, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000026', 2022, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2021, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2020, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000026', 2019, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2018, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2017, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000026', 2016, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000026', 2015, 'GS-I', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Caste System PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000024', 2025, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000024', 2024, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000024', 2023, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000024', 2022, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000024', 2021, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000024', 2020, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000024', 2019, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000024', 2018, 'GS-I', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000024', 2017, 'GS-I', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000024', 2015, 'GS-I', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Judiciary & Judicial Review PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000038', 2025, 'GS-II', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2024, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2023, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000038', 2022, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2021, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2020, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2019, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000038', 2018, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2017, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000038', 2016, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000038', 2015, 'GS-II', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- India-China Relations PYQ history
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000043', 2025, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000043', 2024, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000043', 2023, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000043', 2022, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000043', 2021, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000043', 2020, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000043', 2019, 'GS-II', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000043', 2018, 'GS-II', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000043', 2016, 'GS-II', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- ============================================================
-- PART 2: GS-III & GS-IV hand-curated PYQ entries
-- ============================================================

-- RBI & Monetary Policy
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000114', 2025, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000114', 2024, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000114', 2023, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000114', 2022, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000114', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000114', 2020, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000114', 2019, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000114', 2018, 'Prelims', 1, 'mcq'),
('c1000000-0000-0000-0000-000000000114', 2017, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000114', 2016, 'GS-III', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- GST Structure & Impact
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000129', 2025, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000129', 2024, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000129', 2023, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000129', 2022, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000129', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000129', 2020, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000129', 2019, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000129', 2018, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000129', 2017, 'GS-III', 2, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- UNFCCC & COP
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000154', 2025, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2024, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2023, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000154', 2022, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2020, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000154', 2019, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2018, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2016, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000154', 2015, 'GS-III', 1, 'short_answer')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- ISRO Missions
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000178', 2025, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2024, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2023, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2022, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000178', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2020, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000178', 2019, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2018, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000178', 2017, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2016, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000178', 2015, 'Prelims', 2, 'mcq')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- AI & Machine Learning
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000196', 2025, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000196', 2024, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000196', 2023, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000196', 2022, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000196', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000196', 2020, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000196', 2019, 'GS-III', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Ethical Dilemmas & Conflict Resolution (GS-IV)
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000262', 2025, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2024, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2023, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2022, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2021, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2020, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2019, 'GS-IV', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000262', 2018, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2017, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2016, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000262', 2015, 'GS-IV', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Case Study - Administrative Dilemmas
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000285', 2025, 'GS-IV', 3, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2024, 'GS-IV', 3, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2023, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2022, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2021, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2020, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2019, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2018, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2017, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2016, 'GS-IV', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000285', 2015, 'GS-IV', 2, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- RTI & Transparency
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000279', 2025, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000279', 2024, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000279', 2023, 'GS-IV', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000279', 2022, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000279', 2021, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000279', 2020, 'GS-IV', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000279', 2019, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000279', 2018, 'GS-IV', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000279', 2016, 'GS-IV', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000279', 2015, 'GS-IV', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Left Wing Extremism
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000217', 2025, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000217', 2024, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000217', 2023, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000217', 2022, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000217', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000217', 2020, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000217', 2019, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000217', 2018, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000217', 2016, 'GS-III', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- NDMA Framework
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000251', 2025, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000251', 2024, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000251', 2023, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000251', 2022, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000251', 2021, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000251', 2020, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000251', 2019, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000251', 2017, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000251', 2015, 'GS-III', 1, 'short_answer')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- Biodiversity Hotspots
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000147', 2025, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000147', 2025, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000147', 2024, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000147', 2023, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000147', 2022, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000147', 2021, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000147', 2020, 'Prelims', 1, 'mcq'),
('c1000000-0000-0000-0000-000000000147', 2019, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000147', 2018, 'Prelims', 2, 'mcq'),
('c1000000-0000-0000-0000-000000000147', 2016, 'GS-III', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- MSP & Agricultural Pricing
INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type) VALUES
('c1000000-0000-0000-0000-000000000101', 2025, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000101', 2024, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000101', 2023, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000101', 2022, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000101', 2021, 'GS-III', 2, 'descriptive'),
('c1000000-0000-0000-0000-000000000101', 2020, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000101', 2019, 'GS-III', 1, 'short_answer'),
('c1000000-0000-0000-0000-000000000101', 2018, 'GS-III', 1, 'descriptive'),
('c1000000-0000-0000-0000-000000000101', 2017, 'GS-III', 1, 'descriptive')
ON CONFLICT (topic_id, year, paper) DO NOTHING;

-- ============================================================
-- PART 3: Procedural PYQ generation for remaining topics
-- ============================================================

DO $$
DECLARE
  rec RECORD;
  yr INT;
  hash_val INT;
  q_count INT;
  q_type TEXT;
  paper_val gs_paper;
  subject_papers gs_paper[];
  existing_count INT;
  target_rows INT;
  rows_added INT;
  year_prob FLOAT;
BEGIN
  FOR rec IN
    SELECT t.id AS topic_id, t.name AS topic_name, t.importance,
           c.subject_id, s.papers
    FROM topics t
    JOIN chapters c ON c.id = t.chapter_id
    JOIN subjects s ON s.id = c.subject_id
  LOOP
    SELECT count(*) INTO existing_count FROM pyq_data WHERE topic_id = rec.topic_id;
    IF existing_count > 0 THEN
      CONTINUE;
    END IF;

    subject_papers := rec.papers;

    CASE rec.importance
      WHEN 5 THEN target_rows := 8 + abs(hashtext(rec.topic_id::text || 'target')) % 3;
      WHEN 4 THEN target_rows := 5 + abs(hashtext(rec.topic_id::text || 'target')) % 3;
      WHEN 3 THEN target_rows := 3 + abs(hashtext(rec.topic_id::text || 'target')) % 3;
      WHEN 2 THEN target_rows := 2 + abs(hashtext(rec.topic_id::text || 'target')) % 2;
      ELSE target_rows := 1 + abs(hashtext(rec.topic_id::text || 'target')) % 2;
    END CASE;

    rows_added := 0;

    FOR yr IN REVERSE 2025..2015 LOOP
      EXIT WHEN rows_added >= target_rows;
      hash_val := abs(hashtext(rec.topic_id::text || yr::text));

      CASE
        WHEN yr >= 2024 THEN year_prob := 0.85;
        WHEN yr >= 2022 THEN year_prob := 0.70;
        WHEN yr >= 2020 THEN year_prob := 0.55;
        WHEN yr >= 2018 THEN year_prob := 0.45;
        ELSE year_prob := 0.35;
      END CASE;

      IF (hash_val % 100)::float / 100.0 < year_prob THEN
        paper_val := subject_papers[1 + (hash_val % array_length(subject_papers, 1))];
        IF rec.importance >= 4 AND yr >= 2023 AND (hash_val % 5 = 0) THEN
          q_count := 2;
        ELSE
          q_count := 1;
        END IF;

        CASE
          WHEN paper_val = 'Prelims' THEN q_type := 'mcq';
          WHEN hash_val % 3 = 0 THEN q_type := 'short_answer';
          ELSE q_type := 'descriptive';
        END CASE;

        INSERT INTO pyq_data (topic_id, year, paper, question_count, question_type)
        VALUES (rec.topic_id, yr, paper_val, q_count, q_type)
        ON CONFLICT (topic_id, year, paper) DO NOTHING;

        rows_added := rows_added + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- PART 4: Derived stats
-- ============================================================

-- Update topic-level pyq fields from pyq_data
UPDATE topics t SET
  pyq_frequency = sub.total_q,
  last_pyq_year = sub.max_year,
  pyq_trend = CASE
    WHEN sub.recent_avg > sub.older_avg * 1.3 THEN 'rising'::pyq_trend
    WHEN sub.recent_avg < sub.older_avg * 0.7 THEN 'declining'::pyq_trend
    ELSE 'stable'::pyq_trend
  END
FROM (
  SELECT
    topic_id,
    sum(question_count) AS total_q,
    max(year) AS max_year,
    coalesce(avg(CASE WHEN year >= 2022 THEN question_count::float END), 0) AS recent_avg,
    coalesce(avg(CASE WHEN year <= 2021 THEN question_count::float END), 0.1) AS older_avg
  FROM pyq_data
  GROUP BY topic_id
) sub
WHERE t.id = sub.topic_id;

-- Populate pyq_subject_stats
INSERT INTO pyq_subject_stats (subject_id, avg_questions_per_year, total_questions_10yr, trend, highest_year, highest_count)
SELECT
  s.id,
  coalesce(round(sum(p.question_count)::numeric / 11.0, 2), 0),
  coalesce(sum(p.question_count), 0),
  CASE
    WHEN coalesce(avg(CASE WHEN p.year >= 2022 THEN p.question_count::float END), 0)
       > coalesce(avg(CASE WHEN p.year <= 2021 THEN p.question_count::float END), 0.1) * 1.3
    THEN 'rising'::pyq_trend
    WHEN coalesce(avg(CASE WHEN p.year >= 2022 THEN p.question_count::float END), 0)
       < coalesce(avg(CASE WHEN p.year <= 2021 THEN p.question_count::float END), 0.1) * 0.7
    THEN 'declining'::pyq_trend
    ELSE 'stable'::pyq_trend
  END,
  (SELECT year FROM pyq_data p2
   JOIN topics t2 ON t2.id = p2.topic_id
   JOIN chapters c2 ON c2.id = t2.chapter_id
   WHERE c2.subject_id = s.id
   GROUP BY year ORDER BY sum(question_count) DESC LIMIT 1),
  (SELECT coalesce(sum(question_count), 0) FROM pyq_data p3
   JOIN topics t3 ON t3.id = p3.topic_id
   JOIN chapters c3 ON c3.id = t3.chapter_id
   WHERE c3.subject_id = s.id
   GROUP BY year ORDER BY sum(question_count) DESC LIMIT 1)
FROM subjects s
LEFT JOIN chapters c ON c.subject_id = s.id
LEFT JOIN topics t ON t.chapter_id = c.id
LEFT JOIN pyq_data p ON p.topic_id = t.id
GROUP BY s.id
ON CONFLICT (subject_id) DO UPDATE SET
  avg_questions_per_year = EXCLUDED.avg_questions_per_year,
  total_questions_10yr = EXCLUDED.total_questions_10yr,
  trend = EXCLUDED.trend,
  highest_year = EXCLUDED.highest_year,
  highest_count = EXCLUDED.highest_count;

-- Percentile-bucket pyq_weight to integer 1-5
DO $$
DECLARE
  rec RECORD;
  idx INT := 0;
  total INT;
  pct FLOAT;
  bucket INT;
BEGIN
  SELECT count(*) INTO total FROM (
    SELECT t.id,
      coalesce(sum(p.question_count * CASE
        WHEN p.year >= 2024 THEN 1.5
        WHEN p.year >= 2022 THEN 1.2
        WHEN p.year >= 2020 THEN 1.0
        WHEN p.year >= 2018 THEN 0.8
        ELSE 0.6 END), 0) AS score
    FROM topics t LEFT JOIN pyq_data p ON p.topic_id = t.id
    GROUP BY t.id
  ) x;

  FOR rec IN
    SELECT t.id,
      coalesce(sum(p.question_count * CASE
        WHEN p.year >= 2024 THEN 1.5
        WHEN p.year >= 2022 THEN 1.2
        WHEN p.year >= 2020 THEN 1.0
        WHEN p.year >= 2018 THEN 0.8
        ELSE 0.6 END), 0) AS score
    FROM topics t LEFT JOIN pyq_data p ON p.topic_id = t.id
    GROUP BY t.id
    ORDER BY score ASC
  LOOP
    pct := CASE WHEN total > 1 THEN idx::float / (total - 1) ELSE 0.5 END;
    bucket := CASE
      WHEN pct >= 0.9 THEN 5
      WHEN pct >= 0.7 THEN 4
      WHEN pct >= 0.4 THEN 3
      WHEN pct >= 0.1 THEN 2
      ELSE 1
    END;
    UPDATE topics SET pyq_weight = bucket WHERE id = rec.id;
    idx := idx + 1;
  END LOOP;
END $$;
