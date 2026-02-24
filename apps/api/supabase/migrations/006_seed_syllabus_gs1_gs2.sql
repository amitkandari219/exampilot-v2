-- Seed syllabus data: GS-I and GS-II subjects, chapters, topics, PYQ data
-- PYQ weight formula: recency-weighted frequency normalized to 1.0-5.0
-- Weights: 2024-25 x1.5, 2022-23 x1.2, 2020-21 x1.0, 2018-19 x0.8, 2015-17 x0.6

-- ============================================================
-- GS-I SUBJECTS
-- ============================================================

-- 1. Indian Heritage & Culture
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Indian Heritage & Culture', ARRAY['GS-I']::gs_paper[], 4, 3, 80, 1);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Indian Art Forms', 4, 3, 20, 1),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Architecture & Sculpture', 4, 3, 20, 2),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Literature & Philosophy', 3, 3, 20, 3),
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Religion & Reform Movements', 4, 3, 20, 4);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Classical Dance Forms', 4, 2, 5, 1, 8, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Indian Music Traditions', 3, 3, 5, 2, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Folk Art & Tribal Art', 4, 2, 5, 3, 7, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Painting Traditions', 3, 3, 5, 4, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Temple Architecture', 5, 3, 6, 1, 10, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Buddhist & Jain Architecture', 4, 3, 5, 2, 7, 3.4, 'stable', 2024),
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000002', 'Indo-Islamic Architecture', 4, 3, 5, 3, 6, 2.8, 'declining', 2021),
('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Ancient Indian Literature', 3, 3, 5, 1, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 'Philosophical Schools', 4, 4, 6, 2, 6, 3.0, 'rising', 2024),
('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 'Bhakti & Sufi Movements', 5, 3, 6, 1, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000004', 'Social Reform Movements', 4, 3, 5, 2, 7, 3.2, 'stable', 2024);

-- 2. Modern Indian History
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000002', 'Modern Indian History', ARRAY['GS-I']::gs_paper[], 5, 4, 100, 2);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Freedom Struggle', 5, 4, 30, 1),
('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Post-Independence India', 4, 3, 25, 2),
('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'British Economic Impact', 4, 3, 20, 3);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000005', 'Gandhian Movements', 5, 3, 8, 1, 12, 4.8, 'stable', 2025),
('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000005', 'Revolutionary Movements', 4, 3, 6, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000005', 'Tribal & Peasant Movements', 4, 3, 6, 3, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000005', 'Role of Women in Freedom Struggle', 4, 3, 5, 4, 6, 3.0, 'rising', 2024),
('c1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000006', 'Integration of Princely States', 4, 3, 5, 1, 5, 2.6, 'stable', 2023),
('c1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000006', 'Five Year Plans & Economic Development', 4, 3, 6, 2, 7, 3.4, 'stable', 2024),
('c1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000007', 'Drain of Wealth Theory', 3, 3, 4, 1, 5, 2.2, 'declining', 2021),
('c1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000007', 'Land Revenue Systems', 4, 3, 5, 2, 6, 2.8, 'stable', 2023);

-- 3. World History
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000003', 'World History', ARRAY['GS-I']::gs_paper[], 4, 4, 70, 3);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'World Wars & Aftermath', 4, 4, 20, 1),
('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'Revolutions & Ideologies', 4, 4, 20, 2);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000008', 'Causes & Impact of World Wars', 4, 4, 6, 1, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000021', 'b1000000-0000-0000-0000-000000000008', 'Cold War & Decolonization', 4, 4, 7, 2, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000022', 'b1000000-0000-0000-0000-000000000009', 'French Revolution', 3, 3, 5, 1, 4, 2.0, 'declining', 2020),
('c1000000-0000-0000-0000-000000000023', 'b1000000-0000-0000-0000-000000000009', 'Industrial Revolution', 4, 3, 5, 2, 5, 2.6, 'stable', 2022);

-- 4. Indian Society
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000004', 'Indian Society', ARRAY['GS-I']::gs_paper[], 5, 3, 60, 4);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'Social Structure', 5, 3, 20, 1),
('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'Social Issues', 5, 3, 20, 2);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000010', 'Caste System & Its Evolution', 5, 3, 6, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000025', 'b1000000-0000-0000-0000-000000000010', 'Urbanization & Its Effects', 4, 3, 5, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000026', 'b1000000-0000-0000-0000-000000000011', 'Women & Gender Issues', 5, 3, 6, 1, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000027', 'b1000000-0000-0000-0000-000000000011', 'Population & Associated Issues', 4, 3, 5, 2, 6, 2.8, 'stable', 2023);

-- 5. Geography
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000005', 'Geography', ARRAY['GS-I','Prelims']::gs_paper[], 5, 4, 90, 5);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000005', 'Physical Geography', 4, 4, 25, 1),
('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000005', 'Indian Geography', 5, 3, 30, 2);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000028', 'b1000000-0000-0000-0000-000000000012', 'Geomorphology', 4, 4, 6, 1, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000029', 'b1000000-0000-0000-0000-000000000012', 'Climatology', 4, 4, 7, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000030', 'b1000000-0000-0000-0000-000000000012', 'Oceanography', 3, 4, 5, 3, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000031', 'b1000000-0000-0000-0000-000000000013', 'Indian Monsoon System', 5, 3, 6, 1, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000032', 'b1000000-0000-0000-0000-000000000013', 'Major River Systems', 4, 3, 5, 2, 7, 3.0, 'stable', 2024);

-- 6. Art & Culture (Additional)
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000006', 'Indian National Movement', ARRAY['GS-I']::gs_paper[], 4, 3, 50, 6);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000006', 'Constitutional Development', 4, 3, 15, 1),
('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000006', 'Important Personalities', 3, 2, 15, 2);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000033', 'b1000000-0000-0000-0000-000000000014', 'Government of India Acts', 4, 3, 5, 1, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000034', 'b1000000-0000-0000-0000-000000000014', 'Constituent Assembly Debates', 4, 3, 5, 2, 6, 3.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000035', 'b1000000-0000-0000-0000-000000000015', 'Key Freedom Fighters', 3, 2, 5, 1, 5, 2.4, 'stable', 2023);

-- ============================================================
-- GS-II SUBJECTS
-- ============================================================

-- 7. Indian Polity & Governance
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000007', 'Indian Polity & Governance', ARRAY['GS-II','Prelims']::gs_paper[], 5, 4, 100, 7);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000007', 'Constitutional Framework', 5, 4, 25, 1),
('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000007', 'Governance & Public Policy', 5, 4, 25, 2),
('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000007', 'Federalism & Local Governance', 4, 3, 20, 3);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000036', 'b1000000-0000-0000-0000-000000000016', 'Fundamental Rights & DPSP', 5, 4, 8, 1, 14, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000037', 'b1000000-0000-0000-0000-000000000016', 'Parliament & State Legislatures', 5, 4, 7, 2, 10, 4.2, 'stable', 2025),
('c1000000-0000-0000-0000-000000000038', 'b1000000-0000-0000-0000-000000000016', 'Judiciary & Judicial Review', 5, 4, 7, 3, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000039', 'b1000000-0000-0000-0000-000000000017', 'E-Governance & Digital India', 4, 3, 5, 1, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000040', 'b1000000-0000-0000-0000-000000000017', 'Transparency & Accountability', 5, 3, 6, 2, 9, 4.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000041', 'b1000000-0000-0000-0000-000000000018', 'Centre-State Relations', 5, 4, 6, 1, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000042', 'b1000000-0000-0000-0000-000000000018', 'Panchayati Raj & Urban Local Bodies', 4, 3, 5, 2, 7, 3.2, 'stable', 2024);

-- 8. International Relations
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000008', 'International Relations', ARRAY['GS-II']::gs_paper[], 4, 4, 70, 8);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000008', 'India & Its Neighbours', 5, 4, 20, 1),
('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000008', 'International Organizations', 4, 3, 15, 2);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000043', 'b1000000-0000-0000-0000-000000000019', 'India-China Relations', 5, 4, 6, 1, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000044', 'b1000000-0000-0000-0000-000000000019', 'India-Pakistan Relations', 4, 4, 5, 2, 7, 3.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000045', 'b1000000-0000-0000-0000-000000000019', 'India-USA Relations', 4, 3, 5, 3, 6, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000046', 'b1000000-0000-0000-0000-000000000020', 'United Nations & Reforms', 4, 3, 5, 1, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000047', 'b1000000-0000-0000-0000-000000000020', 'WTO & Trade Agreements', 4, 4, 5, 2, 5, 2.6, 'stable', 2022);

-- 9. Social Justice
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000009', 'Social Justice', ARRAY['GS-II']::gs_paper[], 4, 3, 50, 9);

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000009', 'Welfare Schemes & Policies', 5, 3, 15, 1),
('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000009', 'Health & Education', 4, 3, 15, 2);

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000048', 'b1000000-0000-0000-0000-000000000021', 'Vulnerable Sections & Welfare', 5, 3, 5, 1, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000049', 'b1000000-0000-0000-0000-000000000021', 'Poverty Alleviation Programs', 4, 3, 5, 2, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000050', 'b1000000-0000-0000-0000-000000000022', 'Right to Education & NEP', 4, 3, 5, 1, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000051', 'b1000000-0000-0000-0000-000000000022', 'Health Sector Reforms', 4, 3, 5, 2, 6, 3.0, 'rising', 2024);

-- ============================================================
-- PYQ DATA (Sample entries for high-frequency topics)
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
('c1000000-0000-0000-0000-000000000005', 2015, 'GS-I', 1, 'short_answer');

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
('c1000000-0000-0000-0000-000000000012', 2015, 'GS-I', 1, 'short_answer');

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
('c1000000-0000-0000-0000-000000000036', 2015, 'GS-II', 1, 'descriptive');

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
('c1000000-0000-0000-0000-000000000026', 2015, 'GS-I', 1, 'descriptive');

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
('c1000000-0000-0000-0000-000000000024', 2015, 'GS-I', 1, 'descriptive');

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
('c1000000-0000-0000-0000-000000000038', 2015, 'GS-II', 1, 'descriptive');

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
('c1000000-0000-0000-0000-000000000043', 2016, 'GS-II', 1, 'descriptive');
