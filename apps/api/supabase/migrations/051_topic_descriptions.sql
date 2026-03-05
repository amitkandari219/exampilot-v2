-- 051: Add description column to topics + seed ~30 high-importance topic descriptions

ALTER TABLE topics ADD COLUMN description TEXT;

-- Seed descriptions for high-PYQ-weight topics
-- Polity & Governance
UPDATE topics SET description = 'Fundamental Rights (Articles 12-35) guarantee civil liberties to all citizens; includes right to equality, freedom, and constitutional remedies.' WHERE name = 'Fundamental Rights';
UPDATE topics SET description = 'Directive Principles (Articles 36-51) are non-justiciable guidelines for the state to establish social and economic democracy.' WHERE name = 'Directive Principles of State Policy';
UPDATE topics SET description = 'Constitutional amendments process under Article 368, landmark amendments (42nd, 44th, 73rd, 74th), and basic structure doctrine.' WHERE name = 'Constitutional Amendments';
UPDATE topics SET description = 'Structure, jurisdiction, and role of the Supreme Court and High Courts; judicial review, PIL, and judicial activism.' WHERE name = 'Judiciary';
UPDATE topics SET description = 'Functions, privileges, and procedures of Parliament; anti-defection law, parliamentary committees, and legislative process.' WHERE name = 'Parliament';
UPDATE topics SET description = 'Federal structure, centre-state relations, Inter-State Council, and cooperative federalism in India.' WHERE name = 'Federalism';
UPDATE topics SET description = 'Structure and functions of local self-government institutions; 73rd and 74th Constitutional Amendments.' WHERE name = 'Panchayati Raj & Local Governance';
UPDATE topics SET description = 'Constitutional and statutory bodies like Election Commission, CAG, UPSC, and Finance Commission — composition, powers, and role.' WHERE name = 'Statutory & Constitutional Bodies';

-- Modern Indian History
UPDATE topics SET description = 'Major uprisings from 1857 to independence — Non-Cooperation, Civil Disobedience, Quit India, and the role of Congress and revolutionary movements.' WHERE name = 'Indian National Movement';
UPDATE topics SET description = 'Gandhi''s philosophy of non-violence, Satyagraha, and key movements — Champaran, Kheda, Salt March, and their impact on the freedom struggle.' WHERE name = 'Gandhian Movements';
UPDATE topics SET description = 'Contribution of Bhagat Singh, Subhas Chandra Bose, and other revolutionaries to the independence movement.' WHERE name = 'Revolutionary Movements';

-- Society
UPDATE topics SET description = 'Caste-based discrimination, reservation policy, inter-caste dynamics, and social reform movements from colonial to modern India.' WHERE name = 'Caste System';
UPDATE topics SET description = 'Gender inequality, women''s empowerment schemes, legal safeguards, and feminist movements in India.' WHERE name = 'Women & Gender Issues';
UPDATE topics SET description = 'Population trends, demographic dividend, aging population, and migration patterns in India.' WHERE name = 'Population & Demographics';
UPDATE topics SET description = 'Poverty measurement, inequality indices, government anti-poverty programs, and their effectiveness.' WHERE name = 'Poverty & Inequality';
UPDATE topics SET description = 'Communalism, regionalism, secularism, and challenges to national integration in a diverse society.' WHERE name = 'Communalism & Secularism';

-- Economy
UPDATE topics SET description = 'Planning Commission to NITI Aayog, Five Year Plans, and India''s shift from mixed economy to liberalization.' WHERE name = 'Indian Economy Overview';
UPDATE topics SET description = 'Functions and monetary policy tools of the RBI; inflation targeting, repo rate, CRR, SLR, and their impact on the economy.' WHERE name = 'Monetary Policy & RBI';
UPDATE topics SET description = 'Union Budget, fiscal deficit, FRBM Act, GST, and government revenue and expenditure management.' WHERE name = 'Fiscal Policy & Budgeting';
UPDATE topics SET description = 'Agriculture''s role in GDP, Green Revolution, MSP, farm subsidies, land reforms, and food security.' WHERE name = 'Agriculture & Food Security';

-- Geography
UPDATE topics SET description = 'India''s physiographic divisions — Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains, and Islands.' WHERE name = 'Indian Physical Geography';
UPDATE topics SET description = 'Southwest and Northeast monsoons, climate zones, El Niño/La Niña effects, and their impact on Indian agriculture.' WHERE name = 'Indian Climate & Monsoon';

-- Environment
UPDATE topics SET description = 'National parks, wildlife sanctuaries, biosphere reserves, Project Tiger, and India''s conservation strategies.' WHERE name = 'Biodiversity & Conservation';
UPDATE topics SET description = 'Climate change mitigation and adaptation, Paris Agreement, India''s NDCs, and renewable energy targets.' WHERE name = 'Climate Change';
UPDATE topics SET description = 'Air, water, and soil pollution; waste management, environmental regulations, and sustainable development.' WHERE name = 'Environmental Pollution';

-- International Relations
UPDATE topics SET description = 'India''s foreign policy principles, NAM, Look East/Act East policy, neighbourhood first, and strategic partnerships.' WHERE name = 'India''s Foreign Policy';
UPDATE topics SET description = 'Structure and role of the UN, WHO, WTO, IMF, World Bank; India''s engagement and reform demands.' WHERE name = 'International Organizations';

-- Ethics (GS-IV)
UPDATE topics SET description = 'Key thinkers — Aristotle, Kant, Bentham, Gandhi, Ambedkar — and their ethical frameworks relevant to civil services.' WHERE name = 'Ethics & Human Interface';
UPDATE topics SET description = 'Aptitude and foundational values for civil service: integrity, impartiality, non-partisanship, objectivity, and dedication to public service.' WHERE name = 'Aptitude & Foundational Values';

-- Science & Technology
UPDATE topics SET description = 'India''s space program — ISRO milestones, satellite launches, Mars and Moon missions, and commercial space policy.' WHERE name = 'Space Technology';
