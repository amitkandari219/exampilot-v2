-- 00b: Syllabus data — subjects, chapters, topics for GS-I through GS-IV + Essay
-- 16 subjects, 69 chapters, 306 topics
-- Idempotent: uses ON CONFLICT DO NOTHING on all inserts
-- Source: migrations 006_seed_syllabus_gs1_gs2.sql + 032_seed_syllabus_gs3_gs4.sql

-- ============================================================
-- GS-I SUBJECTS
-- ============================================================

-- 1. Indian Heritage & Culture
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Indian Heritage & Culture', ARRAY['GS-I']::gs_paper[], 4, 3, 80, 1)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Indian Art Forms', 4, 3, 20, 1),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Architecture & Sculpture', 4, 3, 20, 2),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Literature & Philosophy', 3, 3, 20, 3),
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Religion & Reform Movements', 4, 3, 20, 4)
ON CONFLICT DO NOTHING;

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
('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000004', 'Social Reform Movements', 4, 3, 5, 2, 7, 3.2, 'stable', 2024)
ON CONFLICT DO NOTHING;

-- 2. Modern Indian History
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000002', 'Modern Indian History', ARRAY['GS-I']::gs_paper[], 5, 4, 100, 2)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Freedom Struggle', 5, 4, 30, 1),
('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Post-Independence India', 4, 3, 25, 2),
('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'British Economic Impact', 4, 3, 20, 3),
('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000002', 'Socio-Religious Reform Movements', 5, 3, 20, 4),
('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000002', 'Renaissance & Intellectual Awakening', 4, 3, 15, 5)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000005', 'Gandhian Movements', 5, 3, 8, 1, 12, 4.8, 'stable', 2025),
('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000005', 'Revolutionary Movements', 4, 3, 6, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000005', 'Tribal & Peasant Movements', 4, 3, 6, 3, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000005', 'Role of Women in Freedom Struggle', 4, 3, 5, 4, 6, 3.0, 'rising', 2024),
('c1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000006', 'Integration of Princely States', 4, 3, 5, 1, 5, 2.6, 'stable', 2023),
('c1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000006', 'Five Year Plans & Economic Development', 4, 3, 6, 2, 7, 3.4, 'stable', 2024),
('c1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000007', 'Drain of Wealth Theory', 3, 3, 4, 1, 5, 2.2, 'declining', 2021),
('c1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000007', 'Land Revenue Systems', 4, 3, 5, 2, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000084', 'b1000000-0000-0000-0000-000000000029', 'Brahmo Samaj & Arya Samaj', 4, 3, 5, 1, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000085', 'b1000000-0000-0000-0000-000000000029', 'Ramakrishna Mission & Vivekananda', 4, 3, 5, 2, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000086', 'b1000000-0000-0000-0000-000000000029', 'Aligarh & Deoband Movements', 3, 3, 4, 3, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000087', 'b1000000-0000-0000-0000-000000000029', 'Dalit Reform Movements (Phule, Ambedkar)', 5, 3, 6, 4, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000088', 'b1000000-0000-0000-0000-000000000029', 'Women Reformers & Social Legislation', 4, 3, 5, 5, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000089', 'b1000000-0000-0000-0000-000000000030', 'Bengal Renaissance & Tagore', 4, 3, 5, 1, 6, 3.0, 'stable', 2023),
('c1000000-0000-0000-0000-000000000090', 'b1000000-0000-0000-0000-000000000030', 'Press & Journalism in Colonial India', 3, 3, 4, 2, 5, 2.2, 'stable', 2022),
('c1000000-0000-0000-0000-000000000091', 'b1000000-0000-0000-0000-000000000030', 'Education & English Influence', 3, 3, 4, 3, 4, 2.0, 'declining', 2021),
('c1000000-0000-0000-0000-000000000092', 'b1000000-0000-0000-0000-000000000030', 'Nationalist Literature & Theatre', 3, 3, 4, 4, 4, 2.0, 'stable', 2022)
ON CONFLICT DO NOTHING;

-- 3. World History
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000003', 'World History', ARRAY['GS-I']::gs_paper[], 4, 4, 70, 3)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'World Wars & Aftermath', 4, 4, 20, 1),
('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'Revolutions & Ideologies', 4, 4, 20, 2)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000008', 'Causes & Impact of World Wars', 4, 4, 6, 1, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000021', 'b1000000-0000-0000-0000-000000000008', 'Cold War & Decolonization', 4, 4, 7, 2, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000022', 'b1000000-0000-0000-0000-000000000009', 'French Revolution', 3, 3, 5, 1, 4, 2.0, 'declining', 2020),
('c1000000-0000-0000-0000-000000000023', 'b1000000-0000-0000-0000-000000000009', 'Industrial Revolution', 4, 3, 5, 2, 5, 2.6, 'stable', 2022)
ON CONFLICT DO NOTHING;

-- 4. Indian Society
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000004', 'Indian Society', ARRAY['GS-I']::gs_paper[], 5, 3, 60, 4)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'Social Structure', 5, 3, 20, 1),
('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'Social Issues', 5, 3, 20, 2)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000010', 'Caste System & Its Evolution', 5, 3, 6, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000025', 'b1000000-0000-0000-0000-000000000010', 'Urbanization & Its Effects', 4, 3, 5, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000026', 'b1000000-0000-0000-0000-000000000011', 'Women & Gender Issues', 5, 3, 6, 1, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000027', 'b1000000-0000-0000-0000-000000000011', 'Population & Associated Issues', 4, 3, 5, 2, 6, 2.8, 'stable', 2023)
ON CONFLICT DO NOTHING;

-- 5. Geography
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000005', 'Geography', ARRAY['GS-I','Prelims']::gs_paper[], 5, 4, 90, 5)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000005', 'Physical Geography', 4, 4, 25, 1),
('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000005', 'Indian Geography', 5, 3, 30, 2),
('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000005', 'Human Geography', 4, 3, 20, 3),
('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000005', 'Economic Geography', 4, 3, 20, 4),
('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000005', 'World Geography', 4, 4, 20, 5)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000028', 'b1000000-0000-0000-0000-000000000012', 'Geomorphology', 4, 4, 6, 1, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000029', 'b1000000-0000-0000-0000-000000000012', 'Climatology', 4, 4, 7, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000030', 'b1000000-0000-0000-0000-000000000012', 'Oceanography', 3, 4, 5, 3, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000031', 'b1000000-0000-0000-0000-000000000013', 'Indian Monsoon System', 5, 3, 6, 1, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000032', 'b1000000-0000-0000-0000-000000000013', 'Major River Systems', 4, 3, 5, 2, 7, 3.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000052', 'b1000000-0000-0000-0000-000000000023', 'Population Distribution & Density', 4, 3, 5, 1, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000053', 'b1000000-0000-0000-0000-000000000023', 'Migration & Urbanization Patterns', 4, 3, 5, 2, 6, 2.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000054', 'b1000000-0000-0000-0000-000000000023', 'Demographic Transition', 3, 3, 4, 3, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000055', 'b1000000-0000-0000-0000-000000000023', 'Human Development Index', 4, 3, 5, 4, 6, 3.0, 'rising', 2024),
('c1000000-0000-0000-0000-000000000056', 'b1000000-0000-0000-0000-000000000023', 'Settlement Patterns & Types', 3, 3, 4, 5, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000057', 'b1000000-0000-0000-0000-000000000023', 'Regional Disparities in India', 4, 3, 5, 6, 6, 2.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000058', 'b1000000-0000-0000-0000-000000000024', 'Agriculture Geography of India', 5, 3, 6, 1, 8, 3.8, 'stable', 2024),
('c1000000-0000-0000-0000-000000000059', 'b1000000-0000-0000-0000-000000000024', 'Mineral Resources & Distribution', 4, 4, 6, 2, 7, 3.2, 'stable', 2023),
('c1000000-0000-0000-0000-000000000060', 'b1000000-0000-0000-0000-000000000024', 'Industries & Industrial Regions', 4, 3, 5, 3, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000061', 'b1000000-0000-0000-0000-000000000024', 'Transport & Communication Networks', 3, 3, 4, 4, 5, 2.2, 'stable', 2022),
('c1000000-0000-0000-0000-000000000062', 'b1000000-0000-0000-0000-000000000024', 'Energy Resources & Power Plants', 4, 3, 5, 5, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000063', 'b1000000-0000-0000-0000-000000000024', 'Water Resources & Management', 5, 3, 6, 6, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000064', 'b1000000-0000-0000-0000-000000000025', 'Continents & Oceans', 3, 3, 4, 1, 4, 1.8, 'stable', 2021),
('c1000000-0000-0000-0000-000000000065', 'b1000000-0000-0000-0000-000000000025', 'Major Mountain Ranges & Plateaus', 4, 4, 5, 2, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000066', 'b1000000-0000-0000-0000-000000000025', 'World Climate Zones & Biomes', 4, 4, 6, 3, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000067', 'b1000000-0000-0000-0000-000000000025', 'International Boundaries & Disputes', 4, 3, 5, 4, 6, 2.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000068', 'b1000000-0000-0000-0000-000000000025', 'Strategic Waterways & Straits', 4, 3, 5, 5, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000069', 'b1000000-0000-0000-0000-000000000025', 'Natural Resources of World Regions', 3, 3, 4, 6, 4, 2.0, 'stable', 2022)
ON CONFLICT DO NOTHING;

-- 6. Indian National Movement
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000006', 'Indian National Movement', ARRAY['GS-I']::gs_paper[], 4, 3, 50, 6)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000006', 'Constitutional Development', 4, 3, 15, 1),
('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000006', 'Important Personalities', 3, 2, 15, 2)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000033', 'b1000000-0000-0000-0000-000000000014', 'Government of India Acts', 4, 3, 5, 1, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000034', 'b1000000-0000-0000-0000-000000000014', 'Constituent Assembly Debates', 4, 3, 5, 2, 6, 3.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000035', 'b1000000-0000-0000-0000-000000000015', 'Key Freedom Fighters', 3, 2, 5, 1, 5, 2.4, 'stable', 2023)
ON CONFLICT DO NOTHING;

-- ============================================================
-- GS-II SUBJECTS
-- ============================================================

-- 7. Indian Polity & Governance
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000007', 'Indian Polity & Governance', ARRAY['GS-II','Prelims']::gs_paper[], 5, 4, 100, 7)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000007', 'Constitutional Framework', 5, 4, 25, 1),
('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000007', 'Governance & Public Policy', 5, 4, 25, 2),
('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000007', 'Federalism & Local Governance', 4, 3, 20, 3),
('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000007', 'Amendment Process & Key Amendments', 5, 4, 20, 4),
('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000007', 'Elections & Electoral Reforms', 5, 3, 20, 5),
('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000007', 'Constitutional & Statutory Bodies', 5, 3, 20, 6)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000036', 'b1000000-0000-0000-0000-000000000016', 'Fundamental Rights & DPSP', 5, 4, 8, 1, 14, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000037', 'b1000000-0000-0000-0000-000000000016', 'Parliament & State Legislatures', 5, 4, 7, 2, 10, 4.2, 'stable', 2025),
('c1000000-0000-0000-0000-000000000038', 'b1000000-0000-0000-0000-000000000016', 'Judiciary & Judicial Review', 5, 4, 7, 3, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000039', 'b1000000-0000-0000-0000-000000000017', 'E-Governance & Digital India', 4, 3, 5, 1, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000040', 'b1000000-0000-0000-0000-000000000017', 'Transparency & Accountability', 5, 3, 6, 2, 9, 4.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000041', 'b1000000-0000-0000-0000-000000000018', 'Centre-State Relations', 5, 4, 6, 1, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000042', 'b1000000-0000-0000-0000-000000000018', 'Panchayati Raj & Urban Local Bodies', 4, 3, 5, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000070', 'b1000000-0000-0000-0000-000000000026', 'Constitutional Amendment Procedure', 5, 4, 6, 1, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000071', 'b1000000-0000-0000-0000-000000000026', 'Key Constitutional Amendments (42nd, 44th, 73rd, 74th)', 5, 4, 7, 2, 12, 4.8, 'stable', 2025),
('c1000000-0000-0000-0000-000000000072', 'b1000000-0000-0000-0000-000000000026', 'Basic Structure Doctrine', 5, 4, 6, 3, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000073', 'b1000000-0000-0000-0000-000000000026', '101st Amendment - GST', 4, 3, 5, 4, 7, 3.4, 'stable', 2024),
('c1000000-0000-0000-0000-000000000074', 'b1000000-0000-0000-0000-000000000027', 'Election Commission & Its Role', 5, 3, 5, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000075', 'b1000000-0000-0000-0000-000000000027', 'Electoral Bonds & Political Funding', 5, 3, 5, 2, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000076', 'b1000000-0000-0000-0000-000000000027', 'Model Code of Conduct', 4, 3, 4, 3, 7, 3.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000077', 'b1000000-0000-0000-0000-000000000027', 'One Nation One Election Debate', 4, 3, 5, 4, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000078', 'b1000000-0000-0000-0000-000000000027', 'Anti-Defection Law', 4, 3, 4, 5, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000079', 'b1000000-0000-0000-0000-000000000028', 'UPSC & State PSCs', 4, 3, 4, 1, 7, 3.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000080', 'b1000000-0000-0000-0000-000000000028', 'CAG & Financial Oversight', 4, 3, 5, 2, 8, 3.6, 'stable', 2023),
('c1000000-0000-0000-0000-000000000081', 'b1000000-0000-0000-0000-000000000028', 'NHRC & State Human Rights Commissions', 4, 3, 4, 3, 6, 2.8, 'rising', 2024),
('c1000000-0000-0000-0000-000000000082', 'b1000000-0000-0000-0000-000000000028', 'National Commission for SC, ST, OBC', 4, 3, 4, 4, 6, 2.8, 'stable', 2024),
('c1000000-0000-0000-0000-000000000083', 'b1000000-0000-0000-0000-000000000028', 'Finance Commission & NITI Aayog', 5, 3, 5, 5, 9, 4.0, 'rising', 2025)
ON CONFLICT DO NOTHING;

-- 8. International Relations
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000008', 'International Relations', ARRAY['GS-II']::gs_paper[], 4, 4, 70, 8)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000008', 'India & Its Neighbours', 5, 4, 20, 1),
('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000008', 'International Organizations', 4, 3, 15, 2)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000043', 'b1000000-0000-0000-0000-000000000019', 'India-China Relations', 5, 4, 6, 1, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000044', 'b1000000-0000-0000-0000-000000000019', 'India-Pakistan Relations', 4, 4, 5, 2, 7, 3.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000045', 'b1000000-0000-0000-0000-000000000019', 'India-USA Relations', 4, 3, 5, 3, 6, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000046', 'b1000000-0000-0000-0000-000000000020', 'United Nations & Reforms', 4, 3, 5, 1, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000047', 'b1000000-0000-0000-0000-000000000020', 'WTO & Trade Agreements', 4, 4, 5, 2, 5, 2.6, 'stable', 2022)
ON CONFLICT DO NOTHING;

-- 9. Social Justice
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000009', 'Social Justice', ARRAY['GS-II']::gs_paper[], 4, 3, 50, 9)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000009', 'Welfare Schemes & Policies', 5, 3, 15, 1),
('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000009', 'Health & Education', 4, 3, 15, 2)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000048', 'b1000000-0000-0000-0000-000000000021', 'Vulnerable Sections & Welfare', 5, 3, 5, 1, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000049', 'b1000000-0000-0000-0000-000000000021', 'Poverty Alleviation Programs', 4, 3, 5, 2, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000050', 'b1000000-0000-0000-0000-000000000022', 'Right to Education & NEP', 4, 3, 5, 1, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000051', 'b1000000-0000-0000-0000-000000000022', 'Health Sector Reforms', 4, 3, 5, 2, 6, 3.0, 'rising', 2024)
ON CONFLICT DO NOTHING;

-- ============================================================
-- GS-III SUBJECTS
-- ============================================================

-- 10. Indian Economy
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000010', 'Indian Economy', ARRAY['GS-III','Prelims']::gs_paper[], 5, 4, 110, 10)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000010', 'National Income & Growth', 5, 4, 18, 1),
('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000010', 'Agriculture', 5, 3, 18, 2),
('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000010', 'Industry & Infrastructure', 4, 3, 15, 3),
('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000010', 'Banking & Finance', 5, 4, 18, 4),
('b1000000-0000-0000-0000-000000000035', 'a1000000-0000-0000-0000-000000000010', 'External Trade & Balance of Payments', 4, 4, 15, 5),
('b1000000-0000-0000-0000-000000000036', 'a1000000-0000-0000-0000-000000000010', 'Government Budgeting & Fiscal Policy', 5, 4, 18, 6),
('b1000000-0000-0000-0000-000000000037', 'a1000000-0000-0000-0000-000000000010', 'Inclusive Growth & Poverty', 5, 3, 18, 7)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000093', 'b1000000-0000-0000-0000-000000000031', 'GDP, GNP & National Income Concepts', 5, 4, 6, 1, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000094', 'b1000000-0000-0000-0000-000000000031', 'Economic Growth vs Development', 4, 3, 5, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000095', 'b1000000-0000-0000-0000-000000000031', 'Inflation - Types, Causes & Control', 5, 4, 6, 3, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000096', 'b1000000-0000-0000-0000-000000000031', 'Employment & Unemployment Types', 4, 3, 5, 4, 8, 3.6, 'rising', 2024),
('c1000000-0000-0000-0000-000000000097', 'b1000000-0000-0000-0000-000000000031', 'Index Numbers - CPI, WPI, IIP', 4, 4, 5, 5, 7, 3.4, 'stable', 2024),
('c1000000-0000-0000-0000-000000000098', 'b1000000-0000-0000-0000-000000000031', 'Economic Survey & Budget Key Indicators', 5, 4, 6, 6, 12, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000099', 'b1000000-0000-0000-0000-000000000031', 'Demographic Dividend', 4, 3, 5, 7, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000100', 'b1000000-0000-0000-0000-000000000032', 'Green Revolution & Its Impact', 4, 3, 5, 1, 6, 2.8, 'declining', 2021),
('c1000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000032', 'MSP & Agricultural Pricing Policy', 5, 3, 6, 2, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000102', 'b1000000-0000-0000-0000-000000000032', 'Agricultural Credit & Kisan Credit Card', 4, 3, 5, 3, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000103', 'b1000000-0000-0000-0000-000000000032', 'Land Reforms & Land Acquisition', 4, 3, 5, 4, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000104', 'b1000000-0000-0000-0000-000000000032', 'Food Security & PDS', 5, 3, 6, 5, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000105', 'b1000000-0000-0000-0000-000000000032', 'Agricultural Subsidies & Reforms', 4, 3, 5, 6, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000106', 'b1000000-0000-0000-0000-000000000032', 'Horticulture, Allied Sectors & APMC', 3, 3, 4, 7, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000107', 'b1000000-0000-0000-0000-000000000032', 'Food Processing Industry', 3, 3, 4, 8, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000108', 'b1000000-0000-0000-0000-000000000033', 'Make in India & Industrial Policy', 5, 3, 5, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000109', 'b1000000-0000-0000-0000-000000000033', 'MSMEs & Startup India', 5, 3, 5, 2, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000110', 'b1000000-0000-0000-0000-000000000033', 'Infrastructure Development - Roads, Railways, Ports', 4, 3, 5, 3, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000111', 'b1000000-0000-0000-0000-000000000033', 'Special Economic Zones', 3, 3, 4, 4, 5, 2.2, 'declining', 2021),
('c1000000-0000-0000-0000-000000000112', 'b1000000-0000-0000-0000-000000000033', 'PLI Scheme & Industrial Corridors', 4, 3, 5, 5, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000113', 'b1000000-0000-0000-0000-000000000033', 'Logistics & Supply Chain', 3, 3, 4, 6, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000114', 'b1000000-0000-0000-0000-000000000034', 'RBI & Monetary Policy', 5, 4, 7, 1, 12, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000115', 'b1000000-0000-0000-0000-000000000034', 'Banking Reforms & NPAs', 5, 4, 6, 2, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000116', 'b1000000-0000-0000-0000-000000000034', 'Financial Inclusion - Jan Dhan, UPI', 5, 3, 5, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000117', 'b1000000-0000-0000-0000-000000000034', 'NBFCs & Shadow Banking', 4, 4, 5, 4, 7, 3.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000118', 'b1000000-0000-0000-0000-000000000034', 'Capital Markets & SEBI', 4, 4, 5, 5, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000119', 'b1000000-0000-0000-0000-000000000034', 'Insurance Sector Reforms', 3, 3, 4, 6, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000120', 'b1000000-0000-0000-0000-000000000034', 'Cryptocurrency & Digital Rupee', 4, 4, 5, 7, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000121', 'b1000000-0000-0000-0000-000000000035', 'Balance of Payments & Current Account', 4, 4, 6, 1, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000122', 'b1000000-0000-0000-0000-000000000035', 'FDI & FII - Policy & Trends', 5, 4, 6, 2, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000123', 'b1000000-0000-0000-0000-000000000035', 'WTO & Trade Disputes', 4, 4, 5, 3, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000124', 'b1000000-0000-0000-0000-000000000035', 'Trade Agreements & FTAs', 4, 3, 5, 4, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000125', 'b1000000-0000-0000-0000-000000000035', 'Foreign Exchange & Rupee Dynamics', 4, 4, 5, 5, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000126', 'b1000000-0000-0000-0000-000000000035', 'Export Promotion & SEZ Reforms', 3, 3, 4, 6, 5, 2.2, 'stable', 2022),
('c1000000-0000-0000-0000-000000000127', 'b1000000-0000-0000-0000-000000000036', 'Union Budget - Structure & Components', 5, 4, 7, 1, 13, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000128', 'b1000000-0000-0000-0000-000000000036', 'Fiscal Deficit & FRBM Act', 5, 4, 6, 2, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000129', 'b1000000-0000-0000-0000-000000000036', 'GST - Structure, Reforms & Impact', 5, 4, 6, 3, 12, 4.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000130', 'b1000000-0000-0000-0000-000000000036', 'Direct & Indirect Taxes', 4, 4, 5, 4, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000131', 'b1000000-0000-0000-0000-000000000036', 'Public Debt Management', 4, 4, 5, 5, 7, 3.2, 'stable', 2023),
('c1000000-0000-0000-0000-000000000132', 'b1000000-0000-0000-0000-000000000036', 'Disinvestment & Privatisation Policy', 4, 3, 5, 6, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000133', 'b1000000-0000-0000-0000-000000000037', 'Poverty Measurement - SECC, Tendulkar', 4, 3, 5, 1, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000134', 'b1000000-0000-0000-0000-000000000037', 'MGNREGS & Employment Guarantee', 5, 3, 5, 2, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000135', 'b1000000-0000-0000-0000-000000000037', 'DBT & Aadhaar-Linked Benefits', 4, 3, 5, 3, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000136', 'b1000000-0000-0000-0000-000000000037', 'PM-KISAN, PM-Awas & Flagship Schemes', 4, 3, 5, 4, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000137', 'b1000000-0000-0000-0000-000000000037', 'Skill India & Human Capital Development', 4, 3, 5, 5, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000138', 'b1000000-0000-0000-0000-000000000037', 'SDGs & India''s Progress', 4, 3, 5, 6, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000139', 'b1000000-0000-0000-0000-000000000037', 'Urban Poverty & Slum Development', 3, 3, 4, 7, 5, 2.4, 'stable', 2023)
ON CONFLICT DO NOTHING;

-- 11. Environment & Ecology
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000011', 'Environment & Ecology', ARRAY['GS-III','Prelims']::gs_paper[], 5, 4, 100, 11)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000038', 'a1000000-0000-0000-0000-000000000011', 'Ecology Basics', 5, 4, 18, 1),
('b1000000-0000-0000-0000-000000000039', 'a1000000-0000-0000-0000-000000000011', 'Biodiversity', 5, 3, 18, 2),
('b1000000-0000-0000-0000-000000000040', 'a1000000-0000-0000-0000-000000000011', 'Climate Change', 5, 4, 20, 3),
('b1000000-0000-0000-0000-000000000041', 'a1000000-0000-0000-0000-000000000011', 'Environmental Pollution', 4, 3, 15, 4),
('b1000000-0000-0000-0000-000000000042', 'a1000000-0000-0000-0000-000000000011', 'Conservation & Protected Areas', 4, 3, 15, 5),
('b1000000-0000-0000-0000-000000000043', 'a1000000-0000-0000-0000-000000000011', 'Environmental Laws & Bodies', 5, 3, 14, 6)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000140', 'b1000000-0000-0000-0000-000000000038', 'Ecosystem Structure & Functions', 5, 4, 6, 1, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000141', 'b1000000-0000-0000-0000-000000000038', 'Food Chains, Webs & Energy Flow', 4, 3, 5, 2, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000142', 'b1000000-0000-0000-0000-000000000038', 'Biogeochemical Cycles', 4, 4, 5, 3, 7, 3.2, 'stable', 2023),
('c1000000-0000-0000-0000-000000000143', 'b1000000-0000-0000-0000-000000000038', 'Biomes & Ecological Zones', 4, 4, 5, 4, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000144', 'b1000000-0000-0000-0000-000000000038', 'Ecological Succession', 3, 4, 4, 5, 5, 2.4, 'stable', 2022),
('c1000000-0000-0000-0000-000000000145', 'b1000000-0000-0000-0000-000000000038', 'Invasive Species & Ecological Balance', 4, 3, 5, 6, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000146', 'b1000000-0000-0000-0000-000000000038', 'Ecosystem Services & Valuation', 4, 3, 5, 7, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000147', 'b1000000-0000-0000-0000-000000000039', 'Biodiversity Hotspots of India & World', 5, 3, 5, 1, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000148', 'b1000000-0000-0000-0000-000000000039', 'Endangered Species & Red Data List', 4, 3, 5, 2, 8, 3.6, 'rising', 2024),
('c1000000-0000-0000-0000-000000000149', 'b1000000-0000-0000-0000-000000000039', 'Wildlife Sanctuaries & National Parks', 4, 3, 5, 3, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000150', 'b1000000-0000-0000-0000-000000000039', 'CBD & Nagoya Protocol', 4, 4, 5, 4, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000151', 'b1000000-0000-0000-0000-000000000039', 'Biosphere Reserves & Ramsar Sites', 4, 3, 5, 5, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000152', 'b1000000-0000-0000-0000-000000000039', 'Project Tiger & Project Elephant', 4, 3, 5, 6, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000153', 'b1000000-0000-0000-0000-000000000039', 'Marine Biodiversity & Coral Reefs', 4, 4, 5, 7, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000154', 'b1000000-0000-0000-0000-000000000040', 'UNFCCC & Conference of Parties (COP)', 5, 4, 6, 1, 12, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000155', 'b1000000-0000-0000-0000-000000000040', 'Paris Agreement & NDCs', 5, 4, 6, 2, 12, 4.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000156', 'b1000000-0000-0000-0000-000000000040', 'Carbon Markets & Carbon Credits', 4, 4, 5, 3, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000157', 'b1000000-0000-0000-0000-000000000040', 'Greenhouse Gases & Global Warming', 5, 3, 6, 4, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000158', 'b1000000-0000-0000-0000-000000000040', 'India''s Climate Action - NAPCC, ISA', 5, 3, 6, 5, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000159', 'b1000000-0000-0000-0000-000000000040', 'Renewable Energy - Solar, Wind, Hydro', 5, 3, 6, 6, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000160', 'b1000000-0000-0000-0000-000000000040', 'Glacial Retreat & Sea Level Rise', 4, 3, 5, 7, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000161', 'b1000000-0000-0000-0000-000000000040', 'Climate Finance & Green Climate Fund', 4, 4, 5, 8, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000162', 'b1000000-0000-0000-0000-000000000041', 'Air Pollution - Sources & Standards', 5, 3, 5, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000163', 'b1000000-0000-0000-0000-000000000041', 'Water Pollution & River Rejuvenation', 5, 3, 5, 2, 10, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000164', 'b1000000-0000-0000-0000-000000000041', 'Solid Waste Management', 4, 3, 5, 3, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000165', 'b1000000-0000-0000-0000-000000000041', 'Plastic Pollution & E-Waste', 5, 3, 5, 4, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000166', 'b1000000-0000-0000-0000-000000000041', 'Noise & Light Pollution', 2, 2, 3, 5, 3, 1.4, 'stable', 2021),
('c1000000-0000-0000-0000-000000000167', 'b1000000-0000-0000-0000-000000000041', 'EIA & Environmental Clearances', 5, 4, 6, 6, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000168', 'b1000000-0000-0000-0000-000000000042', 'Forest Conservation & Deforestation', 5, 3, 5, 1, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000169', 'b1000000-0000-0000-0000-000000000042', 'Wetlands & Mangroves Conservation', 4, 3, 5, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000170', 'b1000000-0000-0000-0000-000000000042', 'Community-Based Conservation', 3, 3, 4, 3, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000171', 'b1000000-0000-0000-0000-000000000042', 'Desertification & Land Degradation', 4, 3, 5, 4, 6, 2.8, 'rising', 2024),
('c1000000-0000-0000-0000-000000000172', 'b1000000-0000-0000-0000-000000000042', 'Peatlands, Grasslands & Mountain Ecosystems', 3, 3, 4, 5, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000173', 'b1000000-0000-0000-0000-000000000043', 'Environment Protection Act 1986', 4, 3, 5, 1, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000174', 'b1000000-0000-0000-0000-000000000043', 'Wildlife Protection Act & Forest Rights Act', 5, 3, 6, 2, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000175', 'b1000000-0000-0000-0000-000000000043', 'National Green Tribunal (NGT)', 5, 3, 5, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000176', 'b1000000-0000-0000-0000-000000000043', 'CPCB, SPCB & Pollution Control Norms', 4, 3, 5, 4, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000177', 'b1000000-0000-0000-0000-000000000043', 'International Environmental Agreements', 5, 4, 6, 5, 10, 4.4, 'rising', 2025)
ON CONFLICT DO NOTHING;

-- 12. Science & Technology
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000012', 'Science & Technology', ARRAY['GS-III','Prelims']::gs_paper[], 5, 4, 100, 12)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000044', 'a1000000-0000-0000-0000-000000000012', 'Space Technology', 5, 3, 16, 1),
('b1000000-0000-0000-0000-000000000045', 'a1000000-0000-0000-0000-000000000012', 'Defence Technology', 4, 3, 14, 2),
('b1000000-0000-0000-0000-000000000046', 'a1000000-0000-0000-0000-000000000012', 'Biotechnology', 5, 4, 16, 3),
('b1000000-0000-0000-0000-000000000047', 'a1000000-0000-0000-0000-000000000012', 'IT, AI & Cyber Security', 5, 4, 16, 4),
('b1000000-0000-0000-0000-000000000048', 'a1000000-0000-0000-0000-000000000012', 'Nuclear Technology', 4, 4, 14, 5),
('b1000000-0000-0000-0000-000000000049', 'a1000000-0000-0000-0000-000000000012', 'Health & Medical Technology', 4, 3, 12, 6),
('b1000000-0000-0000-0000-000000000050', 'a1000000-0000-0000-0000-000000000012', 'Emerging Technologies', 5, 4, 12, 7)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000178', 'b1000000-0000-0000-0000-000000000044', 'ISRO Missions - Chandrayaan, Mangalyaan, Gaganyaan', 5, 3, 6, 1, 14, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000179', 'b1000000-0000-0000-0000-000000000044', 'Satellite Applications - IRNSS, GSAT', 4, 3, 5, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000180', 'b1000000-0000-0000-0000-000000000044', 'Remote Sensing & GIS Applications', 4, 3, 5, 3, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000181', 'b1000000-0000-0000-0000-000000000044', 'Commercial Space & New Space Policy', 4, 3, 5, 4, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000182', 'b1000000-0000-0000-0000-000000000044', 'Space Debris & Outer Space Treaty', 3, 3, 4, 5, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000183', 'b1000000-0000-0000-0000-000000000044', 'International Space Cooperation', 3, 3, 4, 6, 4, 2.0, 'stable', 2023),
('c1000000-0000-0000-0000-000000000184', 'b1000000-0000-0000-0000-000000000045', 'Missile Systems - Agni, Prithvi, BrahMos', 5, 3, 5, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000185', 'b1000000-0000-0000-0000-000000000045', 'DRDO & Defence R&D', 4, 3, 5, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000186', 'b1000000-0000-0000-0000-000000000045', 'Defence Indigenisation & Atmanirbhar Bharat', 5, 3, 5, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000187', 'b1000000-0000-0000-0000-000000000045', 'Hypersonic & Stealth Technology', 3, 4, 4, 4, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000188', 'b1000000-0000-0000-0000-000000000045', 'Unmanned Systems - Drones & UAVs', 4, 3, 5, 5, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000189', 'b1000000-0000-0000-0000-000000000046', 'Genetic Engineering & GMOs', 5, 4, 6, 1, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000190', 'b1000000-0000-0000-0000-000000000046', 'CRISPR-Cas9 & Gene Editing', 5, 5, 6, 2, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000191', 'b1000000-0000-0000-0000-000000000046', 'Stem Cell Research & Therapy', 4, 4, 5, 3, 7, 3.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000192', 'b1000000-0000-0000-0000-000000000046', 'Vaccines & mRNA Technology', 5, 4, 6, 4, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000193', 'b1000000-0000-0000-0000-000000000046', 'Bioinformatics & Genomics', 3, 4, 4, 5, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000194', 'b1000000-0000-0000-0000-000000000046', 'Agricultural Biotechnology & Bt Crops', 4, 3, 5, 6, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000195', 'b1000000-0000-0000-0000-000000000046', 'Biofuels & Industrial Biotechnology', 3, 3, 4, 7, 5, 2.2, 'stable', 2022),
('c1000000-0000-0000-0000-000000000196', 'b1000000-0000-0000-0000-000000000047', 'Artificial Intelligence & Machine Learning', 5, 4, 6, 1, 12, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000197', 'b1000000-0000-0000-0000-000000000047', 'Blockchain Technology & Applications', 4, 4, 5, 2, 8, 3.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000198', 'b1000000-0000-0000-0000-000000000047', 'Cybersecurity - Threats & Frameworks', 5, 4, 6, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000199', 'b1000000-0000-0000-0000-000000000047', 'Data Protection & Privacy Laws', 5, 4, 6, 4, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000200', 'b1000000-0000-0000-0000-000000000047', 'Internet of Things (IoT) & Smart Cities', 4, 3, 5, 5, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000201', 'b1000000-0000-0000-0000-000000000047', '5G Technology & Telecom Policy', 4, 3, 5, 6, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000202', 'b1000000-0000-0000-0000-000000000047', 'Social Media Regulation & Deep Fakes', 4, 3, 5, 7, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000203', 'b1000000-0000-0000-0000-000000000048', 'Nuclear Energy - Reactors & Policy', 4, 4, 6, 1, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000204', 'b1000000-0000-0000-0000-000000000048', 'Nuclear Non-Proliferation & Treaties', 4, 4, 5, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000205', 'b1000000-0000-0000-0000-000000000048', 'India''s Three-Stage Nuclear Programme', 4, 4, 5, 3, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000206', 'b1000000-0000-0000-0000-000000000048', 'Fusion Energy & ITER Project', 3, 4, 4, 4, 4, 2.0, 'rising', 2024),
('c1000000-0000-0000-0000-000000000207', 'b1000000-0000-0000-0000-000000000048', 'Nuclear Safety & Radiation Protection', 3, 3, 4, 5, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000208', 'b1000000-0000-0000-0000-000000000049', 'Telemedicine & Digital Health', 4, 3, 5, 1, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000209', 'b1000000-0000-0000-0000-000000000049', 'Drug Regulation & Pharmaceutical Policy', 4, 3, 5, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000210', 'b1000000-0000-0000-0000-000000000049', 'Antimicrobial Resistance & Superbugs', 4, 4, 5, 3, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000211', 'b1000000-0000-0000-0000-000000000049', 'Rare Diseases & Orphan Drugs', 3, 3, 4, 4, 4, 2.0, 'rising', 2023),
('c1000000-0000-0000-0000-000000000212', 'b1000000-0000-0000-0000-000000000050', 'Quantum Computing & Quantum Communication', 5, 5, 6, 1, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000213', 'b1000000-0000-0000-0000-000000000050', 'Nanotechnology & Its Applications', 4, 4, 5, 2, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000214', 'b1000000-0000-0000-0000-000000000050', 'Robotics & Automation', 4, 3, 5, 3, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000215', 'b1000000-0000-0000-0000-000000000050', '3D Printing & Advanced Manufacturing', 3, 3, 4, 4, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000216', 'b1000000-0000-0000-0000-000000000050', 'Augmented Reality & Virtual Reality', 3, 3, 4, 5, 4, 2.0, 'rising', 2024)
ON CONFLICT DO NOTHING;

-- 13. Internal Security
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000013', 'Internal Security', ARRAY['GS-III']::gs_paper[], 4, 4, 70, 13)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000051', 'a1000000-0000-0000-0000-000000000013', 'Terrorism & Extremism', 5, 4, 18, 1),
('b1000000-0000-0000-0000-000000000052', 'a1000000-0000-0000-0000-000000000013', 'Border Management & Security', 4, 3, 14, 2),
('b1000000-0000-0000-0000-000000000053', 'a1000000-0000-0000-0000-000000000013', 'Cyber Security & Critical Infrastructure', 5, 4, 14, 3),
('b1000000-0000-0000-0000-000000000054', 'a1000000-0000-0000-0000-000000000013', 'Role of Media & External Actors', 4, 3, 12, 4),
('b1000000-0000-0000-0000-000000000055', 'a1000000-0000-0000-0000-000000000013', 'Money Laundering & Organised Crime', 4, 3, 12, 5)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000217', 'b1000000-0000-0000-0000-000000000051', 'Left Wing Extremism (Naxalism)', 5, 4, 6, 1, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000218', 'b1000000-0000-0000-0000-000000000051', 'Insurgency in North-East India', 4, 4, 5, 2, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000219', 'b1000000-0000-0000-0000-000000000051', 'J&K Situation & Cross-Border Terrorism', 5, 4, 6, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000220', 'b1000000-0000-0000-0000-000000000051', 'Counter-Terrorism Strategies & UAPA', 5, 4, 5, 4, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000221', 'b1000000-0000-0000-0000-000000000051', 'NIA & Anti-Terror Mechanisms', 4, 3, 5, 5, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000222', 'b1000000-0000-0000-0000-000000000051', 'Radicalisation & De-Radicalisation', 4, 4, 5, 6, 6, 3.0, 'rising', 2024),
('c1000000-0000-0000-0000-000000000223', 'b1000000-0000-0000-0000-000000000051', 'Organised Crime & Drug Trafficking', 3, 3, 4, 7, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000224', 'b1000000-0000-0000-0000-000000000052', 'Maritime Security & Indian Ocean Region', 5, 3, 5, 1, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000225', 'b1000000-0000-0000-0000-000000000052', 'Border Infrastructure & Development', 4, 3, 5, 2, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000226', 'b1000000-0000-0000-0000-000000000052', 'NATGRID & Intelligence Networks', 4, 4, 5, 3, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000227', 'b1000000-0000-0000-0000-000000000052', 'Coastal Security Post 26/11', 4, 3, 4, 4, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000228', 'b1000000-0000-0000-0000-000000000053', 'Cyber Warfare & State-Sponsored Attacks', 5, 4, 6, 1, 9, 4.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000229', 'b1000000-0000-0000-0000-000000000053', 'Critical Infrastructure Protection', 4, 4, 5, 2, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000230', 'b1000000-0000-0000-0000-000000000053', 'CERT-In & National Cyber Policy', 4, 3, 5, 3, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000231', 'b1000000-0000-0000-0000-000000000054', 'Social Media & Internal Security', 4, 3, 5, 1, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000232', 'b1000000-0000-0000-0000-000000000054', 'Disinformation & Fake News', 4, 3, 4, 2, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000233', 'b1000000-0000-0000-0000-000000000054', 'Foreign Funding & Anti-National Activities', 4, 4, 5, 3, 6, 2.8, 'stable', 2024),
('c1000000-0000-0000-0000-000000000234', 'b1000000-0000-0000-0000-000000000055', 'PMLA & Enforcement Directorate', 5, 4, 6, 1, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000235', 'b1000000-0000-0000-0000-000000000055', 'Hawala Transactions & Benami Properties', 4, 3, 5, 2, 6, 2.8, 'stable', 2024),
('c1000000-0000-0000-0000-000000000236', 'b1000000-0000-0000-0000-000000000055', 'FATF & Global Anti-Money Laundering', 4, 4, 5, 3, 6, 2.8, 'rising', 2025)
ON CONFLICT DO NOTHING;

-- 14. Disaster Management
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000014', 'Disaster Management', ARRAY['GS-III']::gs_paper[], 4, 3, 55, 14)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000056', 'a1000000-0000-0000-0000-000000000014', 'Natural Disasters', 5, 3, 16, 1),
('b1000000-0000-0000-0000-000000000057', 'a1000000-0000-0000-0000-000000000014', 'Man-Made Disasters', 3, 3, 10, 2),
('b1000000-0000-0000-0000-000000000058', 'a1000000-0000-0000-0000-000000000014', 'Disaster Preparedness & Response', 5, 3, 16, 3),
('b1000000-0000-0000-0000-000000000059', 'a1000000-0000-0000-0000-000000000014', 'Institutional Framework', 5, 3, 13, 4)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000237', 'b1000000-0000-0000-0000-000000000056', 'Earthquakes - Causes & Vulnerability Zones', 4, 3, 5, 1, 7, 3.2, 'stable', 2023),
('c1000000-0000-0000-0000-000000000238', 'b1000000-0000-0000-0000-000000000056', 'Floods & Flash Floods Management', 5, 3, 5, 2, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000239', 'b1000000-0000-0000-0000-000000000056', 'Cyclone & Tropical Storm Preparedness', 4, 3, 5, 3, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000240', 'b1000000-0000-0000-0000-000000000056', 'Drought Management & Food Security', 4, 3, 5, 4, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000241', 'b1000000-0000-0000-0000-000000000056', 'Landslides & Urban Flooding', 3, 3, 4, 5, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000242', 'b1000000-0000-0000-0000-000000000056', 'Tsunami & Coastal Hazards', 3, 3, 4, 6, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000243', 'b1000000-0000-0000-0000-000000000057', 'Industrial & Chemical Disasters', 3, 3, 4, 1, 4, 2.0, 'stable', 2021),
('c1000000-0000-0000-0000-000000000244', 'b1000000-0000-0000-0000-000000000057', 'Nuclear & Radiological Emergencies', 3, 4, 4, 2, 3, 1.8, 'stable', 2020),
('c1000000-0000-0000-0000-000000000245', 'b1000000-0000-0000-0000-000000000057', 'Oil Spills & Environmental Disasters', 3, 3, 3, 3, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000246', 'b1000000-0000-0000-0000-000000000058', 'Early Warning Systems & Forecasting', 4, 3, 5, 1, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000247', 'b1000000-0000-0000-0000-000000000058', 'Search & Rescue Operations', 4, 3, 4, 2, 6, 2.8, 'stable', 2023),
('c1000000-0000-0000-0000-000000000248', 'b1000000-0000-0000-0000-000000000058', 'Community Resilience & Capacity Building', 4, 3, 5, 3, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000249', 'b1000000-0000-0000-0000-000000000058', 'Disaster Risk Reduction - Sendai Framework', 4, 3, 5, 4, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000250', 'b1000000-0000-0000-0000-000000000058', 'Reconstruction & Post-Disaster Recovery', 3, 3, 4, 5, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000251', 'b1000000-0000-0000-0000-000000000059', 'NDMA - Structure & Functions', 5, 3, 5, 1, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000252', 'b1000000-0000-0000-0000-000000000059', 'SDRF & NDRF - Roles & Funding', 4, 3, 4, 2, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000253', 'b1000000-0000-0000-0000-000000000059', 'Disaster Management Act 2005', 4, 3, 4, 3, 7, 3.2, 'stable', 2023),
('c1000000-0000-0000-0000-000000000254', 'b1000000-0000-0000-0000-000000000059', 'International Cooperation - UN OCHA, ISDR', 3, 3, 4, 4, 5, 2.4, 'stable', 2022)
ON CONFLICT DO NOTHING;

-- ============================================================
-- GS-IV SUBJECTS
-- ============================================================

-- 15. Ethics, Integrity & Aptitude
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000015', 'Ethics, Integrity & Aptitude', ARRAY['GS-IV']::gs_paper[], 5, 4, 100, 15)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000060', 'a1000000-0000-0000-0000-000000000015', 'Ethics & Human Interface', 5, 4, 20, 1),
('b1000000-0000-0000-0000-000000000061', 'a1000000-0000-0000-0000-000000000015', 'Attitude, Aptitude & Values', 4, 3, 16, 2),
('b1000000-0000-0000-0000-000000000062', 'a1000000-0000-0000-0000-000000000015', 'Emotional Intelligence', 4, 3, 12, 3),
('b1000000-0000-0000-0000-000000000063', 'a1000000-0000-0000-0000-000000000015', 'Public Service Values & Ethics', 5, 3, 18, 4),
('b1000000-0000-0000-0000-000000000064', 'a1000000-0000-0000-0000-000000000015', 'Probity in Governance', 5, 3, 18, 5),
('b1000000-0000-0000-0000-000000000065', 'a1000000-0000-0000-0000-000000000015', 'Case Studies', 5, 4, 16, 6)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000255', 'b1000000-0000-0000-0000-000000000060', 'Ethics - Definition, Determinants & Consequences', 5, 4, 6, 1, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000256', 'b1000000-0000-0000-0000-000000000060', 'Human Values - Lessons from Texts & Great Leaders', 5, 3, 5, 2, 9, 4.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000257', 'b1000000-0000-0000-0000-000000000060', 'Indian Ethical Thinkers - Gandhi, Vivekananda, Tagore', 5, 3, 6, 3, 10, 4.4, 'stable', 2025),
('c1000000-0000-0000-0000-000000000258', 'b1000000-0000-0000-0000-000000000060', 'Western Moral Philosophers - Kant, Aristotle, Bentham', 4, 4, 6, 4, 8, 3.8, 'stable', 2024),
('c1000000-0000-0000-0000-000000000259', 'b1000000-0000-0000-0000-000000000060', 'Role of Family, Society in Moral Development', 4, 3, 5, 5, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000260', 'b1000000-0000-0000-0000-000000000060', 'Ethics in Private & Public Relationships', 4, 3, 5, 6, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000261', 'b1000000-0000-0000-0000-000000000060', 'Conscience as Moral Guide', 4, 4, 5, 7, 7, 3.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000262', 'b1000000-0000-0000-0000-000000000060', 'Ethical Dilemmas & Conflict Resolution', 5, 4, 6, 8, 11, 4.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000263', 'b1000000-0000-0000-0000-000000000061', 'Attitude - Content, Structure & Function', 4, 3, 4, 1, 7, 3.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000264', 'b1000000-0000-0000-0000-000000000061', 'Attitude Formation & Behaviour Change', 4, 3, 5, 2, 7, 3.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000265', 'b1000000-0000-0000-0000-000000000061', 'Moral & Political Attitudes', 4, 4, 5, 3, 7, 3.4, 'stable', 2024),
('c1000000-0000-0000-0000-000000000266', 'b1000000-0000-0000-0000-000000000061', 'Social Influence & Persuasion', 3, 3, 4, 4, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000267', 'b1000000-0000-0000-0000-000000000061', 'Aptitude for Civil Service - Commitment, Dedication', 5, 3, 5, 5, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000268', 'b1000000-0000-0000-0000-000000000061', 'Foundational Values - Integrity, Impartiality', 5, 3, 5, 6, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000269', 'b1000000-0000-0000-0000-000000000062', 'Emotional Intelligence - Concepts & Dimensions', 4, 3, 5, 1, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000270', 'b1000000-0000-0000-0000-000000000062', 'EI in Administration & Governance', 4, 3, 5, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000271', 'b1000000-0000-0000-0000-000000000062', 'Empathy & Compassion in Public Service', 5, 3, 5, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000272', 'b1000000-0000-0000-0000-000000000062', 'Stress Management & Resilience', 3, 3, 4, 4, 5, 2.4, 'rising', 2024),
('c1000000-0000-0000-0000-000000000273', 'b1000000-0000-0000-0000-000000000063', 'Civil Service Values - Dedication, Commitment', 5, 3, 5, 1, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000274', 'b1000000-0000-0000-0000-000000000063', 'Code of Conduct & Discipline Rules', 4, 3, 5, 2, 8, 3.6, 'stable', 2024),
('c1000000-0000-0000-0000-000000000275', 'b1000000-0000-0000-0000-000000000063', 'Ethics in Public Policy & Administration', 5, 4, 6, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000276', 'b1000000-0000-0000-0000-000000000063', 'Ethical Issues in Contemporary India', 5, 4, 6, 4, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000277', 'b1000000-0000-0000-0000-000000000063', 'Corporate Governance & CSR', 4, 3, 5, 5, 7, 3.2, 'rising', 2024),
('c1000000-0000-0000-0000-000000000278', 'b1000000-0000-0000-0000-000000000063', 'International Relations Ethics - Human Rights', 3, 3, 4, 6, 5, 2.4, 'stable', 2023),
('c1000000-0000-0000-0000-000000000279', 'b1000000-0000-0000-0000-000000000064', 'RTI & Transparency in Governance', 5, 3, 5, 1, 11, 4.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000280', 'b1000000-0000-0000-0000-000000000064', 'Whistleblowing & Protection of Whistleblowers', 4, 3, 5, 2, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000281', 'b1000000-0000-0000-0000-000000000064', 'Anti-Corruption Mechanisms - Lokpal, CBI', 5, 3, 6, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000282', 'b1000000-0000-0000-0000-000000000064', 'Work Culture & Quality of Service', 4, 3, 4, 4, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000283', 'b1000000-0000-0000-0000-000000000064', 'Citizen Charters & Service Delivery', 4, 3, 5, 5, 7, 3.2, 'stable', 2024),
('c1000000-0000-0000-0000-000000000284', 'b1000000-0000-0000-0000-000000000064', 'E-Governance & Accountability', 4, 3, 5, 6, 8, 3.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000285', 'b1000000-0000-0000-0000-000000000065', 'Case Study - Administrative Dilemmas', 5, 4, 6, 1, 12, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000286', 'b1000000-0000-0000-0000-000000000065', 'Case Study - Corruption & Integrity Issues', 5, 4, 6, 2, 12, 5.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000287', 'b1000000-0000-0000-0000-000000000065', 'Case Study - Conflict of Interest', 4, 4, 5, 3, 10, 4.4, 'rising', 2025),
('c1000000-0000-0000-0000-000000000288', 'b1000000-0000-0000-0000-000000000065', 'Case Study - Disaster & Emergency Response Ethics', 4, 4, 5, 4, 9, 4.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000289', 'b1000000-0000-0000-0000-000000000065', 'Case Study - Social Justice & Equity', 4, 4, 5, 5, 9, 4.2, 'rising', 2025)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ESSAY SUBJECT
-- ============================================================

-- 16. Essay
INSERT INTO subjects (id, name, papers, importance, difficulty, estimated_hours, display_order)
VALUES ('a1000000-0000-0000-0000-000000000016', 'Essay', ARRAY[]::gs_paper[], 4, 4, 60, 16)
ON CONFLICT DO NOTHING;

INSERT INTO chapters (id, subject_id, name, importance, difficulty, estimated_hours, display_order) VALUES
('b1000000-0000-0000-0000-000000000066', 'a1000000-0000-0000-0000-000000000016', 'Philosophical & Abstract Essays', 5, 5, 16, 1),
('b1000000-0000-0000-0000-000000000067', 'a1000000-0000-0000-0000-000000000016', 'Social Issues Essays', 4, 4, 15, 2),
('b1000000-0000-0000-0000-000000000068', 'a1000000-0000-0000-0000-000000000016', 'Economic Essays', 4, 4, 15, 3),
('b1000000-0000-0000-0000-000000000069', 'a1000000-0000-0000-0000-000000000016', 'Science, Technology & Ethics Essays', 4, 4, 14, 4)
ON CONFLICT DO NOTHING;

INSERT INTO topics (id, chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year) VALUES
('c1000000-0000-0000-0000-000000000290', 'b1000000-0000-0000-0000-000000000066', 'Truth, Morality & Justice in Governance', 5, 5, 5, 1, 4, 2.0, 'stable', 2024),
('c1000000-0000-0000-0000-000000000291', 'b1000000-0000-0000-0000-000000000066', 'Man, Machine & Modernity', 4, 5, 5, 2, 3, 1.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000292', 'b1000000-0000-0000-0000-000000000066', 'Tradition vs Change in Modern India', 4, 4, 5, 3, 3, 1.6, 'stable', 2023),
('c1000000-0000-0000-0000-000000000293', 'b1000000-0000-0000-0000-000000000066', 'Liberty, Equality & Fraternity in Practice', 5, 5, 5, 4, 4, 2.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000294', 'b1000000-0000-0000-0000-000000000066', 'Education as an Instrument of Social Change', 4, 4, 4, 5, 3, 1.6, 'stable', 2022),
('c1000000-0000-0000-0000-000000000295', 'b1000000-0000-0000-0000-000000000067', 'Women Empowerment & Gender Equality', 5, 4, 5, 1, 5, 2.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000296', 'b1000000-0000-0000-0000-000000000067', 'Caste, Religion & Communalism', 4, 4, 5, 2, 4, 2.0, 'stable', 2023),
('c1000000-0000-0000-0000-000000000297', 'b1000000-0000-0000-0000-000000000067', 'Migration & Urbanisation Challenges', 3, 4, 4, 3, 3, 1.6, 'rising', 2024),
('c1000000-0000-0000-0000-000000000298', 'b1000000-0000-0000-0000-000000000067', 'Mental Health as Public Health Priority', 4, 4, 4, 4, 4, 2.0, 'rising', 2025),
('c1000000-0000-0000-0000-000000000299', 'b1000000-0000-0000-0000-000000000068', 'India at 100 - Economic Aspirations', 5, 5, 5, 1, 4, 2.2, 'rising', 2025),
('c1000000-0000-0000-0000-000000000300', 'b1000000-0000-0000-0000-000000000068', 'Inequality in Growth & Development', 5, 4, 5, 2, 5, 2.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000301', 'b1000000-0000-0000-0000-000000000068', 'Agrarian Crisis & Farmer Suicides', 4, 4, 5, 3, 4, 2.0, 'stable', 2023),
('c1000000-0000-0000-0000-000000000302', 'b1000000-0000-0000-0000-000000000068', 'Globalisation - Boon or Bane for India', 4, 4, 4, 4, 3, 1.8, 'declining', 2021),
('c1000000-0000-0000-0000-000000000303', 'b1000000-0000-0000-0000-000000000069', 'AI & Ethics - Is Technology Neutral', 5, 5, 5, 1, 5, 2.8, 'rising', 2025),
('c1000000-0000-0000-0000-000000000304', 'b1000000-0000-0000-0000-000000000069', 'Climate Change & Intergenerational Equity', 5, 4, 5, 2, 5, 2.6, 'rising', 2025),
('c1000000-0000-0000-0000-000000000305', 'b1000000-0000-0000-0000-000000000069', 'Science Without Conscience is Destruction', 4, 5, 5, 3, 4, 2.0, 'stable', 2022),
('c1000000-0000-0000-0000-000000000306', 'b1000000-0000-0000-0000-000000000069', 'Digital Divide & Inclusive Development', 4, 4, 4, 4, 4, 2.0, 'rising', 2024)
ON CONFLICT DO NOTHING;
