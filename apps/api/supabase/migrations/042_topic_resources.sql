-- Topic resources: recommended study materials for each topic
-- Seeded for ~30 high-PYQ-weight topics across all major subjects

CREATE TABLE topic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('book', 'video', 'notes', 'website')),
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_topic_resources_topic ON topic_resources(topic_id, display_order);
ALTER TABLE topic_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read resources" ON topic_resources FOR SELECT USING (true);

-- ============================================================
-- SEED DATA: Resources for high-PYQ-weight topics (pyq_weight >= 3.0)
-- ============================================================

-- Fundamental Rights & DPSP (c1...0036, pyq_weight 5.0) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000036', 'book', 'Indian Polity — Ch. 7-9: Fundamental Rights, DPSP, Duties', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000036', 'notes', 'Fundamental Rights & DPSP — One-liner Notes', 'Vision IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000036', 'video', 'Fundamental Rights vs DPSP — Complete Lecture', 'Unacademy (Sidharth Arora)', NULL, 3);

-- Gandhian Movements (c1...0012, pyq_weight 4.8) — Modern History
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000012', 'book', 'India''s Struggle for Independence — Ch. 12-20', 'Bipan Chandra', NULL, 1),
('c1000000-0000-0000-0000-000000000012', 'book', 'Spectrum Modern India — Gandhian Era', 'Rajiv Ahir', NULL, 2),
('c1000000-0000-0000-0000-000000000012', 'notes', 'Gandhian Movements Timeline & PYQ Analysis', 'Drishti IAS', NULL, 3);

-- Women & Gender Issues (c1...0026, pyq_weight 4.6) — Indian Society
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000026', 'book', 'Indian Society — Gender Issues Chapter', 'Ram Ahuja', NULL, 1),
('c1000000-0000-0000-0000-000000000026', 'notes', 'Women Empowerment & Gender Issues Notes', 'Drishti IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000026', 'website', 'National Commission for Women — Reports', 'NCW', NULL, 3);

-- Judiciary & Judicial Review (c1...0038, pyq_weight 4.6) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000038', 'book', 'Indian Polity — Ch. 26-28: Supreme Court, Judicial Review', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000038', 'notes', 'Judicial Review & Activism — Key Cases', 'Vajiram & Ravi', NULL, 2),
('c1000000-0000-0000-0000-000000000038', 'video', 'Judiciary — Complete Revision', 'StudyIQ', NULL, 3);

-- Caste System & Its Evolution (c1...0024, pyq_weight 4.4) — Indian Society
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000024', 'book', 'Indian Society — Caste & Social Stratification', 'Ram Ahuja', NULL, 1),
('c1000000-0000-0000-0000-000000000024', 'book', 'NCERT Sociology Class 12 — Social Institutions', 'NCERT', NULL, 2),
('c1000000-0000-0000-0000-000000000024', 'notes', 'Caste System — UPSC Mains PYQ Analysis', 'Forum IAS', NULL, 3);

-- Temple Architecture (c1...0005, pyq_weight 4.2) — Heritage & Culture
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000005', 'book', 'CCRT — Indian Temple Architecture', 'CCRT / Nitin Singhania', NULL, 1),
('c1000000-0000-0000-0000-000000000005', 'book', 'Indian Art & Culture — Temple Architecture', 'Nitin Singhania', NULL, 2),
('c1000000-0000-0000-0000-000000000005', 'video', 'Temple Architecture — Nagara, Dravida, Vesara', 'Unacademy', NULL, 3);

-- Parliament & State Legislatures (c1...0037, pyq_weight 4.2) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000037', 'book', 'Indian Polity — Ch. 22-25: Parliament', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000037', 'notes', 'Parliamentary Procedures — Quick Revision', 'Vision IAS', NULL, 2);

-- India-China Relations (c1...0043, pyq_weight 4.2) — International Relations
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000043', 'book', 'International Relations — India-China Chapter', 'Rajesh Nayak', NULL, 1),
('c1000000-0000-0000-0000-000000000043', 'notes', 'India-China Relations Timeline & Analysis', 'Drishti IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000043', 'website', 'MEA — India-China Bilateral Documents', 'MEA India', NULL, 3);

-- Indian Monsoon System (c1...0031, pyq_weight 4.2) — Geography
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000031', 'book', 'NCERT Geography Class 11 — Climate', 'NCERT', NULL, 1),
('c1000000-0000-0000-0000-000000000031', 'book', 'Certificate Physical & Human Geography — Monsoon', 'G.C. Leong', NULL, 2),
('c1000000-0000-0000-0000-000000000031', 'notes', 'Indian Monsoon — Mechanisms & PYQ Analysis', 'Shankar IAS', NULL, 3);

-- Bhakti & Sufi Movements (c1...0010, pyq_weight 4.0) — Heritage & Culture
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000010', 'book', 'Medieval India — Bhakti & Sufi Chapters', 'Satish Chandra', NULL, 1),
('c1000000-0000-0000-0000-000000000010', 'book', 'Indian Art & Culture — Religious Movements', 'Nitin Singhania', NULL, 2),
('c1000000-0000-0000-0000-000000000010', 'notes', 'Bhakti & Sufi — Comparative Chart', 'Drishti IAS', NULL, 3);

-- Transparency & Accountability (c1...0040, pyq_weight 4.0) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000040', 'book', 'Indian Polity — RTI, Lokpal, CVC', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000040', 'notes', 'Accountability Mechanisms — Notes', 'Vision IAS', NULL, 2);

-- Key Constitutional Amendments (c1...0071, pyq_weight 4.8) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000071', 'book', 'Indian Polity — Appendix: Constitutional Amendments', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000071', 'notes', 'Important Amendments — 42nd to 105th', 'Vajiram & Ravi', NULL, 2);

-- Basic Structure Doctrine (c1...0072, pyq_weight 4.2) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000072', 'book', 'Indian Polity — Ch. 11: Basic Structure', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000072', 'notes', 'Kesavananda Bharati & Basic Structure — Case Analysis', 'Forum IAS', NULL, 2);

-- Dalit Reform Movements (c1...0087, pyq_weight 4.2) — Modern History
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000087', 'book', 'India''s Struggle for Independence — Social Movements', 'Bipan Chandra', NULL, 1),
('c1000000-0000-0000-0000-000000000087', 'book', 'Annihilation of Caste', 'B.R. Ambedkar', NULL, 2),
('c1000000-0000-0000-0000-000000000087', 'notes', 'Phule, Ambedkar & Dalit Movements — UPSC Notes', 'Drishti IAS', NULL, 3);

-- Economic Survey & Budget (c1...0098, pyq_weight 5.0) — Economy
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000098', 'book', 'Indian Economy — Budget & Planning', 'Ramesh Singh', NULL, 1),
('c1000000-0000-0000-0000-000000000098', 'notes', 'Economic Survey Summary — Current Year', 'Drishti IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000098', 'website', 'Union Budget Documents', 'Ministry of Finance', NULL, 3);

-- Inflation (c1...0095, pyq_weight 4.6) — Economy
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000095', 'book', 'Indian Economy — Ch. 12: Inflation', 'Ramesh Singh', NULL, 1),
('c1000000-0000-0000-0000-000000000095', 'notes', 'Inflation — Types, Measures & RBI Tools', 'Vision IAS', NULL, 2);

-- MSP & Agricultural Pricing (c1...0101, pyq_weight 4.6) — Economy
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000101', 'book', 'Indian Economy — Agricultural Pricing Chapter', 'Ramesh Singh', NULL, 1),
('c1000000-0000-0000-0000-000000000101', 'notes', 'MSP, CACP & Farm Laws — Comprehensive Notes', 'Drishti IAS', NULL, 2);

-- RBI & Monetary Policy (c1...0114, pyq_weight 5.0) — Economy
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000114', 'book', 'Indian Economy — Ch. 9: Banking & RBI', 'Ramesh Singh', NULL, 1),
('c1000000-0000-0000-0000-000000000114', 'notes', 'RBI Monetary Policy Framework — Quick Notes', 'Vision IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000114', 'website', 'RBI Monetary Policy Statements', 'RBI', NULL, 3);

-- Union Budget (c1...0127, pyq_weight 5.0) — Economy
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000127', 'book', 'Indian Economy — Fiscal Policy & Budgeting', 'Ramesh Singh', NULL, 1),
('c1000000-0000-0000-0000-000000000127', 'notes', 'Union Budget Analysis — Key Highlights', 'PRS Legislative Research', NULL, 2);

-- GST (c1...0129, pyq_weight 4.8) — Economy
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000129', 'book', 'Indian Economy — GST Chapter', 'Ramesh Singh', NULL, 1),
('c1000000-0000-0000-0000-000000000129', 'notes', 'GST — Structure, Council & Recent Changes', 'Vajiram & Ravi', NULL, 2);

-- Biodiversity Hotspots (c1...0147, pyq_weight 4.6) — Environment
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000147', 'book', 'Environment — Biodiversity Chapter', 'Shankar IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000147', 'notes', 'Biodiversity Hotspots — India & Global Map', 'Drishti IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000147', 'video', 'Biodiversity Hotspots — Explained', 'Mrunal Patel', NULL, 3);

-- UNFCCC & COP (c1...0154, pyq_weight 5.0) — Environment
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000154', 'book', 'Environment — Climate Change & International Agreements', 'Shankar IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000154', 'notes', 'UNFCCC, Kyoto, Paris — Timeline & Key Points', 'Vision IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000154', 'website', 'UNFCCC Official — COP Decisions', 'UNFCCC', NULL, 3);

-- Paris Agreement & NDCs (c1...0155, pyq_weight 4.8) — Environment
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000155', 'book', 'Environment — Paris Agreement Chapter', 'Shankar IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000155', 'notes', 'India''s NDCs & Climate Commitments', 'Drishti IAS', NULL, 2);

-- Renewable Energy (c1...0159, pyq_weight 4.6) — Environment
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000159', 'book', 'Environment — Renewable Energy Sources', 'Shankar IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000159', 'notes', 'Solar, Wind & Green Hydrogen — India Targets', 'Drishti IAS', NULL, 2),
('c1000000-0000-0000-0000-000000000159', 'website', 'MNRE — Renewable Energy Dashboard', 'MNRE India', NULL, 3);

-- ISRO Missions (c1...0178, pyq_weight 5.0) — Science & Technology
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000178', 'notes', 'ISRO Missions — Chandrayaan, Gaganyaan, Aditya L1', 'Drishti IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000178', 'website', 'ISRO Official — Mission Updates', 'ISRO', NULL, 2),
('c1000000-0000-0000-0000-000000000178', 'video', 'India''s Space Programme — Complete Revision', 'StudyIQ', NULL, 3);

-- AI & Machine Learning (c1...0196, pyq_weight 5.0) — Science & Technology
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000196', 'notes', 'AI, ML & Ethics — UPSC Perspective', 'Vision IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000196', 'website', 'NITI Aayog — National Strategy for AI', 'NITI Aayog', NULL, 2),
('c1000000-0000-0000-0000-000000000196', 'video', 'AI for UPSC — Simplified', 'Unacademy', NULL, 3);

-- Data Protection & Privacy Laws (c1...0199, pyq_weight 4.6) — Science & Technology
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000199', 'notes', 'Digital Personal Data Protection Act 2023 — Summary', 'PRS Legislative Research', NULL, 1),
('c1000000-0000-0000-0000-000000000199', 'book', 'Science & Technology for UPSC — Data Privacy Chapter', 'Ravi P. Agrahari', NULL, 2);

-- Tribal & Peasant Movements (c1...0014, pyq_weight 3.8) — Modern History
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000014', 'book', 'India''s Struggle for Independence — Peasant Movements', 'Bipan Chandra', NULL, 1),
('c1000000-0000-0000-0000-000000000014', 'book', 'Spectrum Modern India — Tribal Uprisings', 'Rajiv Ahir', NULL, 2);

-- Vulnerable Sections & Welfare (c1...0048, pyq_weight 3.8) — Social Justice
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000048', 'notes', 'Vulnerable Sections — Schemes & Constitutional Provisions', 'Drishti IAS', NULL, 1),
('c1000000-0000-0000-0000-000000000048', 'book', 'Social Problems in India — Welfare Chapter', 'Ram Ahuja', NULL, 2);

-- Centre-State Relations (c1...0041, pyq_weight 3.8) — Polity
INSERT INTO topic_resources (topic_id, resource_type, title, source_name, url, display_order) VALUES
('c1000000-0000-0000-0000-000000000041', 'book', 'Indian Polity — Ch. 14-15: Centre-State Relations', 'M. Laxmikanth', NULL, 1),
('c1000000-0000-0000-0000-000000000041', 'notes', 'Sarkaria & Punchhi Commission Recommendations', 'Vision IAS', NULL, 2);
