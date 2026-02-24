// Demo data generated from topic_weightage.json
// Used for UI preview when no Supabase/API is configured

export const demoStress = {
  score: 68,
  status: 'optimal' as const,
  label: 'Optimal',
  signals: { velocity: 72, buffer: 65, time: 60, confidence: 74 },
  recommendation: 'You are on track. Keep up the steady pace and maintain your revision schedule.',
  history: [
    { date: '2026-02-18', score: 55 },
    { date: '2026-02-19', score: 60 },
    { date: '2026-02-20', score: 58 },
    { date: '2026-02-21', score: 63 },
    { date: '2026-02-22', score: 65 },
    { date: '2026-02-23', score: 70 },
    { date: '2026-02-24', score: 68 },
  ],
};

export const demoVelocity = {
  velocity_ratio: 1.08,
  status: 'on_track' as const,
  trend: 'up' as const,
  projected_completion_date: '2026-05-15',
  streak: 5,
  actual_velocity_7d: 3.2,
  actual_velocity_14d: 2.9,
  required_velocity: 2.96,
  weighted_completion_pct: 0.32,
};

export const demoBuffer = {
  balance: 8.4,
  capacity: 15,
  transactions: [
    { id: '1', type: 'deposit' as const, amount: 0.5, balance_after: 8.4, notes: 'Surplus from today', transaction_date: '2026-02-24' },
    { id: '2', type: 'consistency_reward' as const, amount: 0.1, balance_after: 7.9, notes: '5-day streak bonus', transaction_date: '2026-02-23' },
  ],
};

export const demoBurnout = {
  bri_score: 28,
  fatigue_score: 35,
  status: 'low' as const,
  in_recovery: false,
  recovery_day: null as null | number,
  signals: { stress_persistence: 25, buffer_hemorrhage: 15, velocity_collapse: 10, engagement_decay: 20 },
  history: [
    { date: '2026-02-18', bri_score: 30 },
    { date: '2026-02-19', bri_score: 28 },
    { date: '2026-02-20', bri_score: 32 },
    { date: '2026-02-21', bri_score: 25 },
    { date: '2026-02-22', bri_score: 22 },
    { date: '2026-02-23', bri_score: 26 },
    { date: '2026-02-24', bri_score: 28 },
  ],
};

export const demoConfidence = {
  "distribution": {
    "fresh": 52,
    "fading": 68,
    "stale": 35,
    "decayed": 0
  },
  "fastest_decaying": [
    {
      "topic_id": "c1000000-0000-0000-0000-000000000102",
      "topic_name": "Elderly & PwD Welfare Schemes",
      "confidence_score": 30,
      "stability": 1.5
    },
    {
      "topic_id": "c1000000-0000-0000-0000-000000000186",
      "topic_name": "Submarine & Aircraft Carrier Programs",
      "confidence_score": 30,
      "stability": 1.5
    },
    {
      "topic_id": "c1000000-0000-0000-0000-000000000195",
      "topic_name": "Terrorism-Crime Nexus",
      "confidence_score": 30,
      "stability": 1.5
    },
    {
      "topic_id": "c1000000-0000-0000-0000-000000000009",
      "topic_name": "Painting Traditions (Miniature, Mughal, Rajput, Pahari)",
      "confidence_score": 32,
      "stability": 1.6
    },
    {
      "topic_id": "c1000000-0000-0000-0000-00000000003f",
      "topic_name": "Civil Disobedience Movement & Salt March",
      "confidence_score": 32,
      "stability": 1.6
    }
  ]
};

const today = new Date().toISOString().split('T')[0];

export const demoPlan = {
  id: 'demo-plan-1',
  user_id: 'demo-user',
  plan_date: today,
  generated_at: new Date().toISOString(),
  available_hours: 6,
  is_regenerated: false,
  is_light_day: false,
  fatigue_score: 35,
  energy_level: 'full' as const,
  items: [
  {
    id: 'item-1',
    plan_id: 'demo-plan-1',
    topic_id: 'c1000000-0000-0000-0000-000000000001',
    type: 'new' as const,
    estimated_hours: 2,
    priority_score: 90,
    display_order: 1,
    status: 'completed' as const,
    completed_at: '2026-02-24T13:35:55.283Z',
    actual_hours: 2,
    topic: {
      id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Temple Architecture — Nagara Style',
      chapter_id: 'b1000000-0000-0000-0000-000000000001',
      importance: 5,
      difficulty: 3,
      estimated_hours: 2,
      display_order: 1,
      pyq_frequency: 15,
      pyq_weight: 4.8,
      pyq_trend: 'stable' as const,
      last_pyq_year: 2021,
      chapter_name: 'Visual Arts (Architecture & Sculpture)',
      subject_name: 'Indian Heritage & Culture',
    },
  },
  {
    id: 'item-2',
    plan_id: 'demo-plan-1',
    topic_id: 'c1000000-0000-0000-0000-000000000002',
    type: 'revision' as const,
    estimated_hours: 1.5,
    priority_score: 85,
    display_order: 2,
    status: 'pending' as const,
    completed_at: null,
    actual_hours: null,
    topic: {
      id: 'c1000000-0000-0000-0000-000000000002',
      name: 'Temple Architecture — Dravida Style',
      chapter_id: 'b1000000-0000-0000-0000-000000000001',
      importance: 4,
      difficulty: 3,
      estimated_hours: 1.5,
      display_order: 2,
      pyq_frequency: 12,
      pyq_weight: 3.9,
      pyq_trend: 'declining' as const,
      last_pyq_year: 2022,
      chapter_name: 'Visual Arts (Architecture & Sculpture)',
      subject_name: 'Indian Heritage & Culture',
    },
  },
  {
    id: 'item-3',
    plan_id: 'demo-plan-1',
    topic_id: 'c1000000-0000-0000-0000-000000000004',
    type: 'new' as const,
    estimated_hours: 2,
    priority_score: 80,
    display_order: 3,
    status: 'pending' as const,
    completed_at: null,
    actual_hours: null,
    topic: {
      id: 'c1000000-0000-0000-0000-000000000004',
      name: 'Cave Architecture (Ajanta, Ellora, Elephanta)',
      chapter_id: 'b1000000-0000-0000-0000-000000000001',
      importance: 5,
      difficulty: 3,
      estimated_hours: 2,
      display_order: 4,
      pyq_frequency: 15,
      pyq_weight: 4.8,
      pyq_trend: 'stable' as const,
      last_pyq_year: 2024,
      chapter_name: 'Visual Arts (Architecture & Sculpture)',
      subject_name: 'Indian Heritage & Culture',
    },
  },
  {
    id: 'item-4',
    plan_id: 'demo-plan-1',
    topic_id: 'c1000000-0000-0000-0000-000000000005',
    type: 'decay_revision' as const,
    estimated_hours: 1.5,
    priority_score: 75,
    display_order: 4,
    status: 'pending' as const,
    completed_at: null,
    actual_hours: null,
    topic: {
      id: 'c1000000-0000-0000-0000-000000000005',
      name: 'Buddhist & Jain Architecture',
      chapter_id: 'b1000000-0000-0000-0000-000000000001',
      importance: 4,
      difficulty: 3,
      estimated_hours: 1.5,
      display_order: 5,
      pyq_frequency: 12,
      pyq_weight: 3.9,
      pyq_trend: 'declining' as const,
      last_pyq_year: 2025,
      chapter_name: 'Visual Arts (Architecture & Sculpture)',
      subject_name: 'Indian Heritage & Culture',
    },
  },
  {
    id: 'item-5',
    plan_id: 'demo-plan-1',
    topic_id: 'c1000000-0000-0000-0000-000000000008',
    type: 'new' as const,
    estimated_hours: 2,
    priority_score: 70,
    display_order: 5,
    status: 'pending' as const,
    completed_at: null,
    actual_hours: null,
    topic: {
      id: 'c1000000-0000-0000-0000-000000000008',
      name: 'Sculpture (Gandhara, Mathura, Amaravati schools)',
      chapter_id: 'b1000000-0000-0000-0000-000000000001',
      importance: 4,
      difficulty: 3,
      estimated_hours: 2,
      display_order: 8,
      pyq_frequency: 12,
      pyq_weight: 3.9,
      pyq_trend: 'declining' as const,
      last_pyq_year: 2022,
      chapter_name: 'Visual Arts (Architecture & Sculpture)',
      subject_name: 'Indian Heritage & Culture',
    },
  },
  {
    id: 'item-6',
    plan_id: 'demo-plan-1',
    topic_id: 'c1000000-0000-0000-0000-00000000000a',
    type: 'stretch' as const,
    estimated_hours: 3,
    priority_score: 65,
    display_order: 6,
    status: 'pending' as const,
    completed_at: null,
    actual_hours: null,
    topic: {
      id: 'c1000000-0000-0000-0000-00000000000a',
      name: 'Classical Dance Forms (Bharatanatyam, Kathak, etc.)',
      chapter_id: 'b1000000-0000-0000-0000-000000000002',
      importance: 4,
      difficulty: 4,
      estimated_hours: 3,
      display_order: 10,
      pyq_frequency: 12,
      pyq_weight: 4.4,
      pyq_trend: 'stable' as const,
      last_pyq_year: 2024,
      chapter_name: 'Performing Arts',
      subject_name: 'Indian Heritage & Culture',
    },
  }
  ],
};

export const demoSyllabus = [
  {
    id: 'a1000000-0000-0000-0000-000000000001', name: 'Indian Heritage & Culture', papers: ["Prelims GS-I","Mains GS-I"], importance: 4, difficulty: 4, estimated_hours: 48, display_order: 1,
    progress: { total_topics: 14, completed_topics: 5, weighted_completion: 0.24, avg_confidence: 54 },
    chapters: [
    {
      id: 'b1000000-0000-0000-0000-000000000001', subject_id: 'a1000000-0000-0000-0000-000000000001', name: 'Visual Arts (Architecture & Sculpture)', importance: 5, difficulty: 3, estimated_hours: 14, display_order: 1,
      progress: { total_topics: 5, completed_topics: 3, weighted_completion: 0.28, avg_confidence: 37 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000001', chapter_id: 'b1000000-0000-0000-0000-000000000001', name: 'Temple Architecture — Nagara Style', importance: 5, difficulty: 3, estimated_hours: 2, display_order: 1, pyq_frequency: 15, pyq_weight: 4.8, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000002', chapter_id: 'b1000000-0000-0000-0000-000000000001', name: 'Temple Architecture — Dravida Style', importance: 4, difficulty: 3, estimated_hours: 1.5, display_order: 2, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000003', chapter_id: 'b1000000-0000-0000-0000-000000000001', name: 'Temple Architecture — Vesara Style', importance: 3, difficulty: 3, estimated_hours: 1, display_order: 3, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 42, confidence_status: 'stale' as const, last_touched: '2026-02-21T13:35:41.053Z', revision_count: 2, health_score: 38 } },
      { id: 'c1000000-0000-0000-0000-000000000004', chapter_id: 'b1000000-0000-0000-0000-000000000001', name: 'Cave Architecture (Ajanta, Ellora, Elephanta)', importance: 5, difficulty: 3, estimated_hours: 2, display_order: 4, pyq_frequency: 15, pyq_weight: 4.8, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000005', chapter_id: 'b1000000-0000-0000-0000-000000000001', name: 'Buddhist & Jain Architecture', importance: 4, difficulty: 3, estimated_hours: 1.5, display_order: 5, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000002', subject_id: 'a1000000-0000-0000-0000-000000000001', name: 'Performing Arts', importance: 3, difficulty: 4, estimated_hours: 8, display_order: 2,
      progress: { total_topics: 4, completed_topics: 0, weighted_completion: 0, avg_confidence: 76 },
      topics: [
      { id: 'c1000000-0000-0000-0000-00000000000a', chapter_id: 'b1000000-0000-0000-0000-000000000002', name: 'Classical Dance Forms (Bharatanatyam, Kathak, etc.)', importance: 4, difficulty: 4, estimated_hours: 3, display_order: 10, pyq_frequency: 12, pyq_weight: 4.4, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000000b', chapter_id: 'b1000000-0000-0000-0000-000000000002', name: 'Folk Dances of India (State-wise)', importance: 3, difficulty: 4, estimated_hours: 2, display_order: 11, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000000c', chapter_id: 'b1000000-0000-0000-0000-000000000002', name: 'Indian Music (Carnatic vs Hindustani)', importance: 3, difficulty: 4, estimated_hours: 2, display_order: 12, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'in_progress' as const, confidence_score: 76, confidence_status: 'fresh' as const, last_touched: '2026-02-12T13:35:41.054Z', revision_count: 0, health_score: 50 } },
      { id: 'c1000000-0000-0000-0000-00000000000d', chapter_id: 'b1000000-0000-0000-0000-000000000002', name: 'Theatre & Puppetry Traditions', importance: 2, difficulty: 4, estimated_hours: 1, display_order: 13, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000003', subject_id: 'a1000000-0000-0000-0000-000000000001', name: 'Religion & Philosophy', importance: 5, difficulty: 3, estimated_hours: 12, display_order: 3,
      progress: { total_topics: 5, completed_topics: 2, weighted_completion: 0.31, avg_confidence: 72 },
      topics: [
      { id: 'c1000000-0000-0000-0000-00000000000e', chapter_id: 'b1000000-0000-0000-0000-000000000003', name: 'Vedic Religion & Upanishadic Philosophy', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 14, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000000f', chapter_id: 'b1000000-0000-0000-0000-000000000003', name: 'Six Schools of Indian Philosophy (Samkhya, Yoga, Vedanta, etc.)', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 15, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 77, confidence_status: 'fresh' as const, last_touched: '2026-02-23T13:35:41.054Z', revision_count: 2, health_score: 82 } },
      { id: 'c1000000-0000-0000-0000-000000000010', chapter_id: 'b1000000-0000-0000-0000-000000000003', name: 'Buddhism — Sects, Councils, Literature, Spread', importance: 5, difficulty: 3, estimated_hours: 3, display_order: 16, pyq_frequency: 15, pyq_weight: 5, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000011', chapter_id: 'b1000000-0000-0000-0000-000000000003', name: 'Jainism — Sects, Councils, Literature', importance: 5, difficulty: 3, estimated_hours: 2, display_order: 17, pyq_frequency: 15, pyq_weight: 4.8, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000012', chapter_id: 'b1000000-0000-0000-0000-000000000003', name: 'Bhakti Movement', importance: 4, difficulty: 3, estimated_hours: 1.5, display_order: 18, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'revised' as const, confidence_score: 66, confidence_status: 'fading' as const, last_touched: '2026-02-20T13:35:41.054Z', revision_count: 2, health_score: 62 } }
      ],
    }
    ],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002', name: 'Modern Indian History', papers: ["Prelims GS-I","Mains GS-I"], importance: 5, difficulty: 3, estimated_hours: 78, display_order: 2,
    progress: { total_topics: 15, completed_topics: 4, weighted_completion: 0.26, avg_confidence: 59 },
    chapters: [
    {
      id: 'b1000000-0000-0000-0000-000000000007', subject_id: 'a1000000-0000-0000-0000-000000000002', name: 'Decline of Mughals & Advent of Europeans', importance: 2, difficulty: 2, estimated_hours: 5, display_order: 7,
      progress: { total_topics: 5, completed_topics: 1, weighted_completion: 0.18, avg_confidence: 66 },
      topics: [
      { id: 'c1000000-0000-0000-0000-00000000001f', chapter_id: 'b1000000-0000-0000-0000-000000000007', name: 'Carnatic Wars', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 31, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000020', chapter_id: 'b1000000-0000-0000-0000-000000000007', name: 'Anglo-Mysore Wars', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 32, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000021', chapter_id: 'b1000000-0000-0000-0000-000000000007', name: 'Anglo-Maratha Wars', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 33, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'first_pass' as const, confidence_score: 66, confidence_status: 'fading' as const, last_touched: '2026-02-19T13:35:41.054Z', revision_count: 1, health_score: 45 } },
      { id: 'c1000000-0000-0000-0000-000000000022', chapter_id: 'b1000000-0000-0000-0000-000000000007', name: 'Battle of Plassey & Buxar', importance: 3, difficulty: 2, estimated_hours: 1, display_order: 34, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000023', chapter_id: 'b1000000-0000-0000-0000-000000000007', name: 'Consolidation of British Power', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 35, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000008', subject_id: 'a1000000-0000-0000-0000-000000000002', name: 'British Expansion & Economic Impact', importance: 5, difficulty: 3, estimated_hours: 10, display_order: 8,
      progress: { total_topics: 5, completed_topics: 1, weighted_completion: 0.2, avg_confidence: 46 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000024', chapter_id: 'b1000000-0000-0000-0000-000000000008', name: 'Land Revenue Systems (Zamindari, Ryotwari, Mahalwari)', importance: 5, difficulty: 3, estimated_hours: 3, display_order: 36, pyq_frequency: 15, pyq_weight: 5, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'in_progress' as const, confidence_score: 45, confidence_status: 'fading' as const, last_touched: '2026-02-16T13:35:41.054Z', revision_count: 0, health_score: 28 } },
      { id: 'c1000000-0000-0000-0000-000000000025', chapter_id: 'b1000000-0000-0000-0000-000000000008', name: 'Commercialization of Agriculture', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 37, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000026', chapter_id: 'b1000000-0000-0000-0000-000000000008', name: 'Drain of Wealth Theory (Dadabhai Naoroji)', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 38, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000027', chapter_id: 'b1000000-0000-0000-0000-000000000008', name: 'Deindustrialization & Impact on Indian Economy', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 39, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 47, confidence_status: 'fading' as const, last_touched: '2026-02-13T13:35:41.054Z', revision_count: 2, health_score: 42 } },
      { id: 'c1000000-0000-0000-0000-000000000028', chapter_id: 'b1000000-0000-0000-0000-000000000008', name: 'British Education & Administrative Reforms', importance: 3, difficulty: 3, estimated_hours: 1, display_order: 40, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000009', subject_id: 'a1000000-0000-0000-0000-000000000002', name: 'Socio-Religious Reform Movements', importance: 5, difficulty: 3, estimated_hours: 8, display_order: 9,
      progress: { total_topics: 5, completed_topics: 2, weighted_completion: 0.36, avg_confidence: 61 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000029', chapter_id: 'b1000000-0000-0000-0000-000000000009', name: 'Brahmo Samaj (Raja Ram Mohan Roy)', importance: 4, difficulty: 3, estimated_hours: 1.5, display_order: 41, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000002a', chapter_id: 'b1000000-0000-0000-0000-000000000009', name: 'Arya Samaj (Dayananda Saraswati)', importance: 4, difficulty: 3, estimated_hours: 1, display_order: 42, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'revised' as const, confidence_score: 64, confidence_status: 'fading' as const, last_touched: '2026-02-24T13:35:41.054Z', revision_count: 2, health_score: 68 } },
      { id: 'c1000000-0000-0000-0000-00000000002b', chapter_id: 'b1000000-0000-0000-0000-000000000009', name: 'Aligarh Movement & Muslim Reform', importance: 3, difficulty: 3, estimated_hours: 1, display_order: 43, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000002c', chapter_id: 'b1000000-0000-0000-0000-000000000009', name: 'Caste Reform (Jyotiba Phule, Periyar)', importance: 5, difficulty: 3, estimated_hours: 1.5, display_order: 44, pyq_frequency: 15, pyq_weight: 4.8, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000002d', chapter_id: 'b1000000-0000-0000-0000-000000000009', name: 'B.R. Ambedkar & Dalit Movement', importance: 5, difficulty: 3, estimated_hours: 1.5, display_order: 45, pyq_frequency: 15, pyq_weight: 4.8, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'first_pass' as const, confidence_score: 57, confidence_status: 'fading' as const, last_touched: '2026-02-21T13:35:41.054Z', revision_count: 1, health_score: 35 } }
      ],
    }
    ],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003', name: 'Post-Independence India', papers: ["Mains GS-I"], importance: 2, difficulty: 2, estimated_hours: 17, display_order: 3,
    progress: { total_topics: 8, completed_topics: 2, weighted_completion: 0.24, avg_confidence: 58 },
    chapters: [
    {
      id: 'b1000000-0000-0000-0000-000000000011', subject_id: 'a1000000-0000-0000-0000-000000000003', name: 'Integration of Princely States', importance: 3, difficulty: 2, estimated_hours: 3, display_order: 17,
      progress: { total_topics: 2, completed_topics: 0, weighted_completion: 0, avg_confidence: 39 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000054', chapter_id: 'b1000000-0000-0000-0000-000000000011', name: 'Sardar Patel & V.P. Menon\'s Role', importance: 3, difficulty: 2, estimated_hours: 1, display_order: 84, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'in_progress' as const, confidence_score: 39, confidence_status: 'stale' as const, last_touched: '2026-02-24T13:35:41.054Z', revision_count: 0, health_score: 22 } },
      { id: 'c1000000-0000-0000-0000-000000000055', chapter_id: 'b1000000-0000-0000-0000-000000000011', name: 'Operation Polo (Hyderabad), Junagadh, Kashmir Accession', importance: 3, difficulty: 2, estimated_hours: 2, display_order: 85, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000012', subject_id: 'a1000000-0000-0000-0000-000000000003', name: 'Reorganization of States', importance: 3, difficulty: 2, estimated_hours: 3, display_order: 18,
      progress: { total_topics: 2, completed_topics: 1, weighted_completion: 0.5, avg_confidence: 59 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000056', chapter_id: 'b1000000-0000-0000-0000-000000000012', name: 'Linguistic Reorganization & SRC Commission', importance: 3, difficulty: 2, estimated_hours: 1.5, display_order: 86, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000057', chapter_id: 'b1000000-0000-0000-0000-000000000012', name: 'Formation of New States (Telangana, Jharkhand, etc.)', importance: 3, difficulty: 2, estimated_hours: 1.5, display_order: 87, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 59, confidence_status: 'fading' as const, last_touched: '2026-02-21T13:35:41.054Z', revision_count: 2, health_score: 55 } }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000013', subject_id: 'a1000000-0000-0000-0000-000000000003', name: 'Land Reforms & Agrarian Changes', importance: 4, difficulty: 3, estimated_hours: 5, display_order: 19,
      progress: { total_topics: 4, completed_topics: 1, weighted_completion: 0.28, avg_confidence: 77 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000058', chapter_id: 'b1000000-0000-0000-0000-000000000013', name: 'Zamindari Abolition', importance: 4, difficulty: 3, estimated_hours: 1.5, display_order: 88, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000059', chapter_id: 'b1000000-0000-0000-0000-000000000013', name: 'Bhoodan & Gramdan Movements (Vinoba Bhave)', importance: 3, difficulty: 3, estimated_hours: 1, display_order: 89, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000005a', chapter_id: 'b1000000-0000-0000-0000-000000000013', name: 'Green Revolution — Impact & Critique', importance: 4, difficulty: 3, estimated_hours: 1.5, display_order: 90, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'revised' as const, confidence_score: 77, confidence_status: 'fresh' as const, last_touched: '2026-02-18T13:35:41.054Z', revision_count: 2, health_score: 75 } },
      { id: 'c1000000-0000-0000-0000-00000000005b', chapter_id: 'b1000000-0000-0000-0000-000000000013', name: 'Land Ceiling & Cooperative Farming', importance: 3, difficulty: 3, estimated_hours: 1, display_order: 91, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null }
      ],
    }
    ],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004', name: 'World History (post-1750)', papers: ["Mains GS-I"], importance: 3, difficulty: 3, estimated_hours: 27, display_order: 4,
    progress: { total_topics: 10, completed_topics: 3, weighted_completion: 0.27, avg_confidence: 54 },
    chapters: [
    {
      id: 'b1000000-0000-0000-0000-000000000016', subject_id: 'a1000000-0000-0000-0000-000000000004', name: 'Industrial Revolution', importance: 2, difficulty: 2, estimated_hours: 3, display_order: 22,
      progress: { total_topics: 3, completed_topics: 1, weighted_completion: 0.33, avg_confidence: 62 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000062', chapter_id: 'b1000000-0000-0000-0000-000000000016', name: 'Causes & Impact on Society', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 98, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000063', chapter_id: 'b1000000-0000-0000-0000-000000000016', name: 'Rise of Capitalism & Imperialism', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 99, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 62, confidence_status: 'fading' as const, last_touched: '2026-02-23T13:35:41.054Z', revision_count: 2, health_score: 58 } },
      { id: 'c1000000-0000-0000-0000-000000000064', chapter_id: 'b1000000-0000-0000-0000-000000000016', name: 'Labor Movements', importance: 2, difficulty: 2, estimated_hours: 1, display_order: 100, pyq_frequency: 6, pyq_weight: 2.1, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000017', subject_id: 'a1000000-0000-0000-0000-000000000004', name: 'American & French Revolutions', importance: 3, difficulty: 3, estimated_hours: 5, display_order: 23,
      progress: { total_topics: 3, completed_topics: 1, weighted_completion: 0.33, avg_confidence: 33 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000065', chapter_id: 'b1000000-0000-0000-0000-000000000017', name: 'Enlightenment Ideas (Locke, Rousseau, Montesquieu)', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 101, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000066', chapter_id: 'b1000000-0000-0000-0000-000000000017', name: 'American Revolution & Bill of Rights', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 102, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'revised' as const, confidence_score: 33, confidence_status: 'stale' as const, last_touched: '2026-02-20T13:35:41.054Z', revision_count: 2, health_score: 18 } },
      { id: 'c1000000-0000-0000-0000-000000000067', chapter_id: 'b1000000-0000-0000-0000-000000000017', name: 'French Revolution — Causes, Course, Impact', importance: 3, difficulty: 3, estimated_hours: 2, display_order: 103, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000018', subject_id: 'a1000000-0000-0000-0000-000000000004', name: 'World Wars I & II', importance: 3, difficulty: 3, estimated_hours: 7, display_order: 24,
      progress: { total_topics: 4, completed_topics: 1, weighted_completion: 0.23, avg_confidence: 48 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000068', chapter_id: 'b1000000-0000-0000-0000-000000000018', name: 'Causes of WWI & Alliance System', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 104, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000069', chapter_id: 'b1000000-0000-0000-0000-000000000018', name: 'Treaty of Versailles & League of Nations', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 105, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'first_pass' as const, confidence_score: 48, confidence_status: 'fading' as const, last_touched: '2026-02-17T13:35:41.054Z', revision_count: 1, health_score: 32 } },
      { id: 'c1000000-0000-0000-0000-00000000006a', chapter_id: 'b1000000-0000-0000-0000-000000000018', name: 'Rise of Fascism (Italy) & Nazism (Germany)', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 106, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000006b', chapter_id: 'b1000000-0000-0000-0000-000000000018', name: 'WWII — Causes, Key Events, UN Formation', importance: 3, difficulty: 3, estimated_hours: 2, display_order: 107, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null }
      ],
    }
    ],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000005', name: 'Geography (Physical, Indian, World)', papers: ["Prelims GS-I","Mains GS-I"], importance: 5, difficulty: 4, estimated_hours: 95, display_order: 5,
    progress: { total_topics: 15, completed_topics: 5, weighted_completion: 0.26, avg_confidence: 66 },
    chapters: [
    {
      id: 'b1000000-0000-0000-0000-00000000001b', subject_id: 'a1000000-0000-0000-0000-000000000005', name: 'Geomorphology', importance: 3, difficulty: 4, estimated_hours: 14, display_order: 27,
      progress: { total_topics: 5, completed_topics: 1, weighted_completion: 0.19, avg_confidence: 65 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000074', chapter_id: 'b1000000-0000-0000-0000-00000000001b', name: 'Interior of Earth & Seismic Waves', importance: 3, difficulty: 4, estimated_hours: 2, display_order: 116, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000075', chapter_id: 'b1000000-0000-0000-0000-00000000001b', name: 'Plate Tectonics & Continental Drift', importance: 4, difficulty: 4, estimated_hours: 2.5, display_order: 117, pyq_frequency: 12, pyq_weight: 4.4, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'first_pass' as const, confidence_score: 73, confidence_status: 'fresh' as const, last_touched: '2026-02-19T13:35:41.054Z', revision_count: 1, health_score: 52 } },
      { id: 'c1000000-0000-0000-0000-000000000076', chapter_id: 'b1000000-0000-0000-0000-00000000001b', name: 'Earthquakes — Types, Distribution, Zones', importance: 4, difficulty: 4, estimated_hours: 2, display_order: 118, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000077', chapter_id: 'b1000000-0000-0000-0000-00000000001b', name: 'Volcanoes — Types, Distribution', importance: 3, difficulty: 4, estimated_hours: 1.5, display_order: 119, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000078', chapter_id: 'b1000000-0000-0000-0000-00000000001b', name: 'Weathering & Erosion', importance: 3, difficulty: 4, estimated_hours: 2, display_order: 120, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'in_progress' as const, confidence_score: 57, confidence_status: 'fading' as const, last_touched: '2026-02-16T13:35:41.054Z', revision_count: 0, health_score: 30 } }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-00000000001c', subject_id: 'a1000000-0000-0000-0000-000000000005', name: 'Climatology', importance: 5, difficulty: 4, estimated_hours: 18, display_order: 28,
      progress: { total_topics: 5, completed_topics: 3, weighted_completion: 0.37, avg_confidence: 73 },
      topics: [
      { id: 'c1000000-0000-0000-0000-00000000007b', chapter_id: 'b1000000-0000-0000-0000-00000000001c', name: 'Atmosphere — Composition & Structure', importance: 4, difficulty: 4, estimated_hours: 2, display_order: 123, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 79, confidence_status: 'fresh' as const, last_touched: '2026-02-13T13:35:41.054Z', revision_count: 2, health_score: 85 } },
      { id: 'c1000000-0000-0000-0000-00000000007c', chapter_id: 'b1000000-0000-0000-0000-00000000001c', name: 'Insolation & Heat Budget', importance: 4, difficulty: 4, estimated_hours: 2, display_order: 124, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000007d', chapter_id: 'b1000000-0000-0000-0000-00000000001c', name: 'Pressure Belts & Wind Systems', importance: 5, difficulty: 4, estimated_hours: 2.5, display_order: 125, pyq_frequency: 15, pyq_weight: 5, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-00000000007e', chapter_id: 'b1000000-0000-0000-0000-00000000001c', name: 'Cyclones — Tropical & Temperate', importance: 5, difficulty: 4, estimated_hours: 2.5, display_order: 126, pyq_frequency: 15, pyq_weight: 5, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'revised' as const, confidence_score: 70, confidence_status: 'fresh' as const, last_touched: '2026-02-24T13:35:41.054Z', revision_count: 2, health_score: 72 } },
      { id: 'c1000000-0000-0000-0000-00000000007f', chapter_id: 'b1000000-0000-0000-0000-00000000001c', name: 'Indian Monsoon Mechanism', importance: 5, difficulty: 4, estimated_hours: 3, display_order: 127, pyq_frequency: 15, pyq_weight: 5, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-00000000001d', subject_id: 'a1000000-0000-0000-0000-000000000005', name: 'Oceanography', importance: 4, difficulty: 3, estimated_hours: 10, display_order: 29,
      progress: { total_topics: 5, completed_topics: 1, weighted_completion: 0.25, avg_confidence: 67 },
      topics: [
      { id: 'c1000000-0000-0000-0000-000000000083', chapter_id: 'b1000000-0000-0000-0000-00000000001d', name: 'Ocean Floor Configuration', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 131, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000084', chapter_id: 'b1000000-0000-0000-0000-00000000001d', name: 'Ocean Currents — Major Gyres & Maps', importance: 4, difficulty: 3, estimated_hours: 2.5, display_order: 132, pyq_frequency: 12, pyq_weight: 4.4, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'in_progress' as const, confidence_score: 55, confidence_status: 'fading' as const, last_touched: '2026-02-18T13:35:41.054Z', revision_count: 0, health_score: 33 } },
      { id: 'c1000000-0000-0000-0000-000000000085', chapter_id: 'b1000000-0000-0000-0000-00000000001d', name: 'Salinity & Temperature Distribution', importance: 3, difficulty: 3, estimated_hours: 2, display_order: 133, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000086', chapter_id: 'b1000000-0000-0000-0000-00000000001d', name: 'Tides — Types & Mechanism', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 134, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-000000000087', chapter_id: 'b1000000-0000-0000-0000-00000000001d', name: 'Coral Reefs — Types, Threats (Env overlap)', importance: 4, difficulty: 3, estimated_hours: 2.5, display_order: 135, pyq_frequency: 12, pyq_weight: 4.4, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 79, confidence_status: 'fresh' as const, last_touched: '2026-02-15T13:35:41.054Z', revision_count: 2, health_score: 88 } }
      ],
    }
    ],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000006', name: 'Indian Society', papers: ["Mains GS-I"], importance: 4, difficulty: 3, estimated_hours: 47, display_order: 6,
    progress: { total_topics: 14, completed_topics: 4, weighted_completion: 0.24, avg_confidence: 59 },
    chapters: [
    {
      id: 'b1000000-0000-0000-0000-000000000022', subject_id: 'a1000000-0000-0000-0000-000000000006', name: 'Salient Features of Indian Society', importance: 4, difficulty: 3, estimated_hours: 7, display_order: 34,
      progress: { total_topics: 4, completed_topics: 2, weighted_completion: 0.47, avg_confidence: 73 },
      topics: [
      { id: 'c1000000-0000-0000-0000-00000000009f', chapter_id: 'b1000000-0000-0000-0000-000000000022', name: 'Unity in Diversity', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 159, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 57, confidence_status: 'fading' as const, last_touched: '2026-02-19T13:35:41.054Z', revision_count: 2, health_score: 53 } },
      { id: 'c1000000-0000-0000-0000-0000000000a0', chapter_id: 'b1000000-0000-0000-0000-000000000022', name: 'Caste System — Evolution & Present Dynamics', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 160, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000a1', chapter_id: 'b1000000-0000-0000-0000-000000000022', name: 'Kinship, Joint Family & Nuclearization', importance: 3, difficulty: 3, estimated_hours: 2, display_order: 161, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000a2', chapter_id: 'b1000000-0000-0000-0000-000000000022', name: 'Multilingualism & Linguistic Diversity', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 162, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'revised' as const, confidence_score: 88, confidence_status: 'fresh' as const, last_touched: '2026-02-16T13:35:41.054Z', revision_count: 2, health_score: 90 } }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000023', subject_id: 'a1000000-0000-0000-0000-000000000006', name: 'Role of Women & Women\'s Organizations', importance: 5, difficulty: 3, estimated_hours: 10, display_order: 35,
      progress: { total_topics: 5, completed_topics: 1, weighted_completion: 0.19, avg_confidence: 68 },
      topics: [
      { id: 'c1000000-0000-0000-0000-0000000000a3', chapter_id: 'b1000000-0000-0000-0000-000000000023', name: 'Feminization of Agriculture & Workforce', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 163, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000a4', chapter_id: 'b1000000-0000-0000-0000-000000000023', name: 'Gender Inequality — Glass Ceiling, Pay Gap', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 164, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000a5', chapter_id: 'b1000000-0000-0000-0000-000000000023', name: 'Self-Help Groups (SHGs) & Microfinance', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 165, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'first_pass' as const, confidence_score: 68, confidence_status: 'fading' as const, last_touched: '2026-02-13T13:35:41.054Z', revision_count: 1, health_score: 46 } },
      { id: 'c1000000-0000-0000-0000-0000000000a6', chapter_id: 'b1000000-0000-0000-0000-000000000023', name: 'Women\'s Movements in India', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 166, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000a7', chapter_id: 'b1000000-0000-0000-0000-000000000023', name: 'Domestic Violence, Dowry, Trafficking — Laws & Impact', importance: 5, difficulty: 3, estimated_hours: 2, display_order: 167, pyq_frequency: 15, pyq_weight: 4.8, pyq_trend: 'declining' as const, last_pyq_year: 2025, user_progress: null }
      ],
    },
    {
      id: 'b1000000-0000-0000-0000-000000000024', subject_id: 'a1000000-0000-0000-0000-000000000006', name: 'Population & Urbanization', importance: 4, difficulty: 3, estimated_hours: 10, display_order: 36,
      progress: { total_topics: 5, completed_topics: 1, weighted_completion: 0.2, avg_confidence: 60 },
      topics: [
      { id: 'c1000000-0000-0000-0000-0000000000a8', chapter_id: 'b1000000-0000-0000-0000-000000000024', name: 'Population Growth — Trends, Demographic Dividend', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 168, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2020, user_progress: { status: 'in_progress' as const, confidence_score: 56, confidence_status: 'fading' as const, last_touched: '2026-02-24T13:35:41.054Z', revision_count: 0, health_score: 34 } },
      { id: 'c1000000-0000-0000-0000-0000000000a9', chapter_id: 'b1000000-0000-0000-0000-000000000024', name: 'Aging Population & Dependency Ratio', importance: 3, difficulty: 3, estimated_hours: 1.5, display_order: 169, pyq_frequency: 9, pyq_weight: 3, pyq_trend: 'stable' as const, last_pyq_year: 2021, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000aa', chapter_id: 'b1000000-0000-0000-0000-000000000024', name: 'Urbanization — Trends, Challenges, Slums', importance: 4, difficulty: 3, estimated_hours: 2.5, display_order: 170, pyq_frequency: 12, pyq_weight: 4.4, pyq_trend: 'declining' as const, last_pyq_year: 2022, user_progress: null },
      { id: 'c1000000-0000-0000-0000-0000000000ab', chapter_id: 'b1000000-0000-0000-0000-000000000024', name: 'Smart Cities Mission & Urban Governance', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 171, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'rising' as const, last_pyq_year: 2023, user_progress: { status: 'exam_ready' as const, confidence_score: 63, confidence_status: 'fading' as const, last_touched: '2026-02-21T13:35:41.054Z', revision_count: 2, health_score: 60 } },
      { id: 'c1000000-0000-0000-0000-0000000000ac', chapter_id: 'b1000000-0000-0000-0000-000000000024', name: 'Migration — Rural-Urban, Interstate, International', importance: 4, difficulty: 3, estimated_hours: 2, display_order: 172, pyq_frequency: 12, pyq_weight: 3.9, pyq_trend: 'stable' as const, last_pyq_year: 2024, user_progress: null }
      ],
    }
    ],
  }
] as any[];

export const demoWeakness = {
  summary: {
    critical: 3,
    weak: 8,
    moderate: 22,
    strong: 15,
    exam_ready: 7,
  },
  weakest_topics: [
    {
      subject_id: 'a1000000-0000-0000-0000-000000000004',
      subject_name: 'World History (post-1750)',
      chapter_id: 'b1000000-0000-0000-0000-000000000017',
      chapter_name: 'American & French Revolutions',
      topic_id: 'c1000000-0000-0000-0000-000000000066',
      topic_name: 'American Revolution & Bill of Rights',
      health_score: 18,
      category: 'critical' as const,
      recommendation: 'Urgent: This topic needs immediate attention. Start with a focused study session.',
    },
    {
      subject_id: 'a1000000-0000-0000-0000-000000000003',
      subject_name: 'Post-Independence India',
      chapter_id: 'b1000000-0000-0000-0000-000000000011',
      chapter_name: 'Integration of Princely States',
      topic_id: 'c1000000-0000-0000-0000-000000000054',
      topic_name: "Sardar Patel & V.P. Menon's Role",
      health_score: 22,
      category: 'critical' as const,
      recommendation: 'Urgent: This topic needs immediate attention. Start with a focused study session.',
    },
    {
      subject_id: 'a1000000-0000-0000-0000-000000000002',
      subject_name: 'Modern Indian History',
      chapter_id: 'b1000000-0000-0000-0000-000000000008',
      chapter_name: 'British Expansion & Economic Impact',
      topic_id: 'c1000000-0000-0000-0000-000000000024',
      topic_name: 'Land Revenue Systems (Zamindari, Ryotwari, Mahalwari)',
      health_score: 28,
      category: 'weak' as const,
      recommendation: 'Low confidence — do a quick revision and attempt practice questions.',
    },
  ],
  by_subject: [
    {
      subject_id: 'a1000000-0000-0000-0000-000000000004',
      subject_name: 'World History (post-1750)',
      weak_count: 2,
      critical_count: 1,
      topics: [
        {
          subject_id: 'a1000000-0000-0000-0000-000000000004',
          subject_name: 'World History (post-1750)',
          chapter_id: 'b1000000-0000-0000-0000-000000000017',
          chapter_name: 'American & French Revolutions',
          topic_id: 'c1000000-0000-0000-0000-000000000066',
          topic_name: 'American Revolution & Bill of Rights',
          health_score: 18,
          category: 'critical' as const,
          recommendation: 'Urgent: This topic needs immediate attention. Start with a focused study session.',
        },
      ],
    },
    {
      subject_id: 'a1000000-0000-0000-0000-000000000003',
      subject_name: 'Post-Independence India',
      weak_count: 1,
      critical_count: 1,
      topics: [
        {
          subject_id: 'a1000000-0000-0000-0000-000000000003',
          subject_name: 'Post-Independence India',
          chapter_id: 'b1000000-0000-0000-0000-000000000011',
          chapter_name: 'Integration of Princely States',
          topic_id: 'c1000000-0000-0000-0000-000000000054',
          topic_name: "Sardar Patel & V.P. Menon's Role",
          health_score: 22,
          category: 'critical' as const,
          recommendation: 'Urgent: This topic needs immediate attention. Start with a focused study session.',
        },
      ],
    },
  ],
};

function healthCategory(score: number) {
  if (score >= 80) return 'exam_ready' as const;
  if (score >= 65) return 'strong' as const;
  if (score >= 45) return 'moderate' as const;
  if (score >= 25) return 'weak' as const;
  return 'critical' as const;
}

function makeHealth(id: string, name: string, score: number, components: { confidence: number; revision: number; effort: number; stability: number }, recommendation: string) {
  return { topic_id: id, topic_name: name, health_score: score, category: healthCategory(score), components, recommendation, trend: [] as { date: string; score: number }[] };
}

export const demoTopicHealth: Record<string, ReturnType<typeof makeHealth>> = {
  'c1000000-0000-0000-0000-000000000003': makeHealth('c1000000-0000-0000-0000-000000000003', 'Temple Architecture — Vesara Style', 38, { confidence: 42, revision: 20, effort: 50, stability: 30 }, 'Revise core concepts and attempt previous-year questions on Vesara style.'),
  'c1000000-0000-0000-0000-00000000000c': makeHealth('c1000000-0000-0000-0000-00000000000c', 'Indian Music (Carnatic vs Hindustani)', 50, { confidence: 55, revision: 40, effort: 60, stability: 45 }, 'Focus on distinguishing features of Carnatic and Hindustani traditions.'),
  'c1000000-0000-0000-0000-00000000000f': makeHealth('c1000000-0000-0000-0000-00000000000f', 'Six Schools of Indian Philosophy', 82, { confidence: 85, revision: 80, effort: 78, stability: 88 }, 'Strong grasp. Quick revision of Samkhya and Vedanta distinctions will keep you exam-ready.'),
  'c1000000-0000-0000-0000-000000000012': makeHealth('c1000000-0000-0000-0000-000000000012', 'Bhakti Movement', 62, { confidence: 65, revision: 55, effort: 70, stability: 58 }, 'Review regional Bhakti saints and their contributions for a confidence boost.'),
  'c1000000-0000-0000-0000-000000000021': makeHealth('c1000000-0000-0000-0000-000000000021', 'Anglo-Maratha Wars', 45, { confidence: 50, revision: 35, effort: 55, stability: 40 }, 'Revise key treaties and battles. Practice timeline-based questions.'),
  'c1000000-0000-0000-0000-000000000024': makeHealth('c1000000-0000-0000-0000-000000000024', 'Land Revenue Systems', 28, { confidence: 30, revision: 15, effort: 40, stability: 25 }, 'Weak area. Create comparison tables for Zamindari, Ryotwari, and Mahalwari systems.'),
  'c1000000-0000-0000-0000-000000000027': makeHealth('c1000000-0000-0000-0000-000000000027', 'Deindustrialization & Impact on Indian Economy', 42, { confidence: 45, revision: 30, effort: 55, stability: 38 }, 'Revise economic impact data and connect to modern implications.'),
  'c1000000-0000-0000-0000-00000000002a': makeHealth('c1000000-0000-0000-0000-00000000002a', 'Arya Samaj (Dayananda Saraswati)', 68, { confidence: 72, revision: 60, effort: 75, stability: 65 }, 'Good foundation. Quick revision of reform contributions will solidify this.'),
  'c1000000-0000-0000-0000-00000000002d': makeHealth('c1000000-0000-0000-0000-00000000002d', 'B.R. Ambedkar & Dalit Movement', 35, { confidence: 38, revision: 25, effort: 45, stability: 32 }, 'Needs attention. Study Ambedkar\'s constitutional contributions and key movements.'),
  'c1000000-0000-0000-0000-000000000054': makeHealth('c1000000-0000-0000-0000-000000000054', "Sardar Patel & V.P. Menon's Role", 22, { confidence: 25, revision: 10, effort: 35, stability: 18 }, 'Urgent: Start with integration of Hyderabad, Junagadh, and Kashmir cases.'),
  'c1000000-0000-0000-0000-000000000057': makeHealth('c1000000-0000-0000-0000-000000000057', 'Formation of New States', 55, { confidence: 60, revision: 45, effort: 62, stability: 52 }, 'Review SRC report and recent state reorganizations for complete coverage.'),
  'c1000000-0000-0000-0000-00000000005a': makeHealth('c1000000-0000-0000-0000-00000000005a', 'Green Revolution — Impact & Critique', 75, { confidence: 78, revision: 70, effort: 80, stability: 72 }, 'Strong. Brush up on critiques and second Green Revolution for completeness.'),
  'c1000000-0000-0000-0000-000000000063': makeHealth('c1000000-0000-0000-0000-000000000063', 'Rise of Capitalism & Imperialism', 58, { confidence: 62, revision: 50, effort: 65, stability: 55 }, 'Connect mercantilism to industrial capitalism. Practice essay-type answers.'),
  'c1000000-0000-0000-0000-000000000066': makeHealth('c1000000-0000-0000-0000-000000000066', 'American Revolution & Bill of Rights', 18, { confidence: 20, revision: 8, effort: 30, stability: 15 }, 'Critical: Immediate revision needed. Focus on key causes, events, and constitutional impact.'),
  'c1000000-0000-0000-0000-000000000069': makeHealth('c1000000-0000-0000-0000-000000000069', 'Treaty of Versailles & League of Nations', 32, { confidence: 35, revision: 22, effort: 42, stability: 28 }, 'Revise the 14 Points, treaty terms, and reasons for League failure.'),
  'c1000000-0000-0000-0000-000000000075': makeHealth('c1000000-0000-0000-0000-000000000075', 'Plate Tectonics & Continental Drift', 52, { confidence: 58, revision: 42, effort: 60, stability: 48 }, 'Practice diagram-based questions on plate boundaries and movement types.'),
  'c1000000-0000-0000-0000-000000000078': makeHealth('c1000000-0000-0000-0000-000000000078', 'Weathering & Erosion', 30, { confidence: 32, revision: 18, effort: 42, stability: 28 }, 'Weak: Revise types of weathering with examples. Draw process diagrams.'),
  'c1000000-0000-0000-0000-00000000007b': makeHealth('c1000000-0000-0000-0000-00000000007b', 'Atmosphere — Composition & Structure', 85, { confidence: 88, revision: 82, effort: 85, stability: 86 }, 'Excellent. Maintain with periodic quick reviews of atmospheric layers.'),
  'c1000000-0000-0000-0000-00000000007e': makeHealth('c1000000-0000-0000-0000-00000000007e', 'Cyclones — Tropical & Temperate', 72, { confidence: 75, revision: 65, effort: 78, stability: 70 }, 'Good. Compare tropical vs temperate cyclone characteristics for completeness.'),
  'c1000000-0000-0000-0000-000000000084': makeHealth('c1000000-0000-0000-0000-000000000084', 'Ocean Currents — Major Gyres & Maps', 33, { confidence: 36, revision: 20, effort: 45, stability: 30 }, 'Practice map-based identification of major currents and their climate effects.'),
  'c1000000-0000-0000-0000-000000000087': makeHealth('c1000000-0000-0000-0000-000000000087', 'Coral Reefs — Types, Threats', 88, { confidence: 90, revision: 85, effort: 88, stability: 90 }, 'Exam-ready. Light revision of reef conservation policies before exam.'),
  'c1000000-0000-0000-0000-00000000009f': makeHealth('c1000000-0000-0000-0000-00000000009f', 'Unity in Diversity', 53, { confidence: 58, revision: 42, effort: 62, stability: 50 }, 'Focus on constitutional provisions and recent examples for essay answers.'),
  'c1000000-0000-0000-0000-0000000000a2': makeHealth('c1000000-0000-0000-0000-0000000000a2', 'Multilingualism & Linguistic Diversity', 90, { confidence: 92, revision: 88, effort: 90, stability: 91 }, 'Top form. Maintain awareness of Eighth Schedule and language policy debates.'),
  'c1000000-0000-0000-0000-0000000000a5': makeHealth('c1000000-0000-0000-0000-0000000000a5', 'Self-Help Groups (SHGs) & Microfinance', 46, { confidence: 50, revision: 38, effort: 55, stability: 42 }, 'Study NABARD and SHG-Bank linkage models. Include recent scheme updates.'),
  'c1000000-0000-0000-0000-0000000000a8': makeHealth('c1000000-0000-0000-0000-0000000000a8', 'Population Growth — Trends, Demographic Dividend', 34, { confidence: 38, revision: 22, effort: 45, stability: 30 }, 'Revise Census data trends and demographic dividend window for India.'),
  'c1000000-0000-0000-0000-0000000000ab': makeHealth('c1000000-0000-0000-0000-0000000000ab', 'Smart Cities Mission & Urban Governance', 60, { confidence: 65, revision: 50, effort: 68, stability: 58 }, 'Review mission progress and key urban governance reforms like 74th Amendment.'),
};

export const demoRecalibration = {
  status: {
    auto_recalibrate: true,
    last_recalibrated_at: '2026-02-23T18:30:00.000Z',
    last_entry: {
      id: 'demo-recal-1',
      user_id: 'demo-user',
      recalibrated_at: '2026-02-23T18:30:00.000Z',
      trigger_type: 'auto_daily',
      window_days: 7,
      old_fatigue_threshold: 85,
      old_buffer_capacity: 0.15,
      old_fsrs_target_retention: 0.90,
      old_burnout_threshold: 75,
      new_fatigue_threshold: 87,
      new_buffer_capacity: 0.14,
      new_fsrs_target_retention: 0.91,
      new_burnout_threshold: 73,
      input_velocity_ratio: 1.08,
      input_velocity_trend: 'improving',
      input_bri_score: 28,
      input_fatigue_avg: 35,
      input_stress_avg: 42,
      input_confidence_avg: 54,
      input_weakness_critical_pct: 12,
      reason_fatigue: 'Healthy and productive',
      reason_buffer: 'Moderately ahead',
      reason_retention: 'Moderately ahead',
      reason_burnout: 'Doing well',
      params_changed: true,
    },
  },
  history: [
    {
      id: 'demo-recal-1',
      user_id: 'demo-user',
      recalibrated_at: '2026-02-23T18:30:00.000Z',
      trigger_type: 'auto_daily',
      window_days: 7,
      old_fatigue_threshold: 85,
      old_buffer_capacity: 0.15,
      old_fsrs_target_retention: 0.90,
      old_burnout_threshold: 75,
      new_fatigue_threshold: 87,
      new_buffer_capacity: 0.14,
      new_fsrs_target_retention: 0.91,
      new_burnout_threshold: 73,
      input_velocity_ratio: 1.08,
      input_velocity_trend: 'improving',
      input_bri_score: 28,
      input_fatigue_avg: 35,
      input_stress_avg: 42,
      input_confidence_avg: 54,
      input_weakness_critical_pct: 12,
      reason_fatigue: 'Healthy and productive',
      reason_buffer: 'Moderately ahead',
      reason_retention: 'Moderately ahead',
      reason_burnout: 'Doing well',
      params_changed: true,
    },
    {
      id: 'demo-recal-2',
      user_id: 'demo-user',
      recalibrated_at: '2026-02-20T18:30:00.000Z',
      trigger_type: 'auto_daily',
      window_days: 7,
      old_fatigue_threshold: 85,
      old_buffer_capacity: 0.15,
      old_fsrs_target_retention: 0.90,
      old_burnout_threshold: 75,
      new_fatigue_threshold: 85,
      new_buffer_capacity: 0.15,
      new_fsrs_target_retention: 0.90,
      new_burnout_threshold: 75,
      input_velocity_ratio: 0.98,
      input_velocity_trend: 'stable',
      input_bri_score: 52,
      input_fatigue_avg: 42,
      input_stress_avg: 55,
      input_confidence_avg: 48,
      input_weakness_critical_pct: 18,
      reason_fatigue: null,
      reason_buffer: null,
      reason_retention: null,
      reason_burnout: null,
      params_changed: false,
    },
  ],
};

export const demoWeeklyReview = {
  id: 'demo-weekly-1',
  user_id: 'demo-user',
  week_end_date: '2026-02-22',
  week_start_date: '2026-02-16',
  generated_at: '2026-02-22T23:59:00.000Z',
  total_hours: 38.5,
  topics_completed: 12,
  gravity_completed: 18.4,
  avg_hours_per_day: 5.5,
  subjects_touched: 4,
  avg_velocity_ratio: 1.08,
  velocity_trend: 'improving',
  completion_pct_start: 0.28,
  completion_pct_end: 0.32,
  confidence_distribution: { fresh: 52, fading: 68, stale: 35, decayed: 0 },
  topics_improved: 8,
  topics_decayed: 3,
  avg_stress: 42,
  avg_bri: 72,
  fatigue_trend: 'stable',
  recovery_days: 0,
  plan_completion_rate: 78,
  plan_total_items: 32,
  plan_completed_items: 25,
  plan_new_count: 18,
  plan_revision_count: 14,
  weakness_distribution: { critical: 3, weak: 8, moderate: 22, strong: 15, exam_ready: 7 },
  critical_count_change: -1,
  weak_count_change: -2,
  buffer_balance_start: 7.2,
  buffer_balance_end: 8.4,
  zero_day_count: 0,
  current_streak: 5,
  best_streak: 12,
  highlights: [
    'Completed 12 topics this week',
    'On-track velocity at 1.08x',
    'Earned 1,250 XP this week',
  ],
  valid_from: '2026-02-22T23:59:00.000Z',
  // Gamification (F12b)
  xp_earned: 1250,
  badges_unlocked: [
    { slug: 'first_week', name: 'First Week', icon_name: 'flame' },
  ],
  level_start: 3,
  level_end: 4,
  // Benchmark (F12b)
  benchmark_score_start: 61,
  benchmark_score_end: 65,
  benchmark_status: 'on_track',
  benchmark_trend: 'improving',
  // Derived
  completion_pct_change: 0.04,
  buffer_balance_change: 1.2,
};

export const demoGamification = {
  xp_total: 2750,
  current_level: 4,
  xp_for_next_level: 2000,
  xp_progress_in_level: 750,
  xp_today: 325,
  recent_badges: [
    { id: 'b1', slug: 'first_week', name: 'First Week', description: 'Maintain a 7-day study streak', icon_name: 'flame', category: 'streak' as const, unlock_condition: { streak_gte: 7 }, xp_reward: 200, unlocked_at: '2026-02-20T10:00:00.000Z' },
    { id: 'b2', slug: 'first_topic', name: 'First Step', description: 'Complete your first topic', icon_name: 'footprints', category: 'study' as const, unlock_condition: { topics_completed_gte: 1 }, xp_reward: 50, unlocked_at: '2026-02-14T08:30:00.000Z' },
    { id: 'b3', slug: 'early_bird', name: 'Early Bird', description: 'Complete your first study session', icon_name: 'sunrise', category: 'special' as const, unlock_condition: { first_session: true }, xp_reward: 100, unlocked_at: '2026-02-14T06:00:00.000Z' },
  ],
  total_badges_unlocked: 4,
};

export const demoBadges = [
  { id: 'b1', slug: 'first_week', name: 'First Week', description: 'Maintain a 7-day study streak', icon_name: 'flame', category: 'streak' as const, unlock_condition: { streak_gte: 7 }, xp_reward: 200, unlocked: true, unlocked_at: '2026-02-20T10:00:00.000Z' },
  { id: 'b2', slug: 'two_weeks', name: 'Two Weeks', description: 'Maintain a 14-day study streak', icon_name: 'flame', category: 'streak' as const, unlock_condition: { streak_gte: 14 }, xp_reward: 400, unlocked: false, unlocked_at: null },
  { id: 'b3', slug: 'monthly', name: 'Monthly Grind', description: 'Maintain a 30-day study streak', icon_name: 'fire', category: 'streak' as const, unlock_condition: { streak_gte: 30 }, xp_reward: 1000, unlocked: false, unlocked_at: null },
  { id: 'b4', slug: 'century', name: 'Century Club', description: 'Maintain a 100-day study streak', icon_name: 'crown', category: 'streak' as const, unlock_condition: { streak_gte: 100 }, xp_reward: 2500, unlocked: false, unlocked_at: null },
  { id: 'b5', slug: 'first_topic', name: 'First Step', description: 'Complete your first topic', icon_name: 'footprints', category: 'study' as const, unlock_condition: { topics_completed_gte: 1 }, xp_reward: 50, unlocked: true, unlocked_at: '2026-02-14T08:30:00.000Z' },
  { id: 'b6', slug: 'ten_topics', name: 'Getting Serious', description: 'Complete 10 topics', icon_name: 'books', category: 'study' as const, unlock_condition: { topics_completed_gte: 10 }, xp_reward: 200, unlocked: false, unlocked_at: null },
  { id: 'b7', slug: 'fifty_topics', name: 'Half Century', description: 'Complete 50 topics', icon_name: 'trophy', category: 'study' as const, unlock_condition: { topics_completed_gte: 50 }, xp_reward: 500, unlocked: false, unlocked_at: null },
  { id: 'b8', slug: 'hundred_topics', name: 'Centurion', description: 'Complete 100 topics', icon_name: 'medal', category: 'study' as const, unlock_condition: { topics_completed_gte: 100 }, xp_reward: 1000, unlocked: false, unlocked_at: null },
  { id: 'b9', slug: 'xp_1000', name: 'XP Starter', description: 'Earn 1,000 total XP', icon_name: 'star', category: 'milestone' as const, unlock_condition: { xp_total_gte: 1000 }, xp_reward: 0, unlocked: true, unlocked_at: '2026-02-17T14:00:00.000Z' },
  { id: 'b10', slug: 'xp_5000', name: 'XP Veteran', description: 'Earn 5,000 total XP', icon_name: 'stars', category: 'milestone' as const, unlock_condition: { xp_total_gte: 5000 }, xp_reward: 0, unlocked: false, unlocked_at: null },
  { id: 'b11', slug: 'xp_10000', name: 'XP Master', description: 'Earn 10,000 total XP', icon_name: 'sparkles', category: 'milestone' as const, unlock_condition: { xp_total_gte: 10000 }, xp_reward: 0, unlocked: false, unlocked_at: null },
  { id: 'b12', slug: 'resilient', name: 'Resilient', description: 'Complete a recovery period', icon_name: 'shield', category: 'recovery' as const, unlock_condition: { recovery_completed_gte: 1 }, xp_reward: 150, unlocked: false, unlocked_at: null },
  { id: 'b13', slug: 'early_bird', name: 'Early Bird', description: 'Complete your first study session', icon_name: 'sunrise', category: 'special' as const, unlock_condition: { first_session: true }, xp_reward: 100, unlocked: true, unlocked_at: '2026-02-14T06:00:00.000Z' },
  { id: 'b14', slug: 'night_owl', name: 'Night Owl', description: 'Study 7+ hours in a single day', icon_name: 'moon', category: 'special' as const, unlock_condition: { daily_hours_gte: 7 }, xp_reward: 150, unlocked: false, unlocked_at: null },
  { id: 'b15', slug: 'perfect_week', name: 'Perfect Week', description: 'Complete 100% of plan items for 7 consecutive days', icon_name: 'check-circle', category: 'special' as const, unlock_condition: { perfect_week: true }, xp_reward: 500, unlocked: false, unlocked_at: null },
];

export const demoBenchmark = {
  composite_score: 65,
  status: 'on_track' as const,
  components: {
    coverage: 62,
    confidence: 65,
    weakness: 55,
    consistency: 72,
    velocity: 83,
  },
  trend: 'improving',
  trend_delta: 4,
  recommendations: [
    'Several topics are in critical or weak zones. Prioritize targeted study on your weakest areas.',
    'Focus on completing more topics — especially high PYQ-weight ones to boost coverage.',
  ],
  snapshot_date: today,
};

export const demoBenchmarkHistory = [
  { snapshot_date: '2026-02-19', composite_score: 55, status: 'needs_work' as const },
  { snapshot_date: '2026-02-20', composite_score: 57, status: 'needs_work' as const },
  { snapshot_date: '2026-02-21', composite_score: 59, status: 'needs_work' as const },
  { snapshot_date: '2026-02-22', composite_score: 61, status: 'on_track' as const },
  { snapshot_date: '2026-02-23', composite_score: 62, status: 'on_track' as const },
  { snapshot_date: '2026-02-24', composite_score: 64, status: 'on_track' as const },
  { snapshot_date: '2026-02-25', composite_score: 65, status: 'on_track' as const },
];

export const demoRevisionsDue = {
  overdue: [
    { topic_id: 'c1000000-0000-0000-0000-000000000002', due: '2026-02-22', topics: { name: 'Temple Architecture — Dravida Style' } },
  ],
  today: [
    { topic_id: 'c1000000-0000-0000-0000-00000000001f', due: '2026-02-24', topics: { name: 'Carnatic Wars' } },
  ],
  upcoming: [
    { topic_id: 'c1000000-0000-0000-0000-000000000074', due: '2026-02-26', topics: { name: 'Interior of Earth & Seismic Waves' } },
  ],
};

// Mock Test demo data
export const demoMockTests = [
  {
    id: 'demo-mock-1', user_id: 'demo-user', test_name: 'Prelims Mock 1', test_date: '2026-02-10',
    total_questions: 100, attempted: 82, correct: 45, incorrect: 37, unattempted: 18,
    score: 65.58, max_score: 200, percentile: null, source: 'manual' as const, created_at: '2026-02-10T18:00:00.000Z',
  },
  {
    id: 'demo-mock-2', user_id: 'demo-user', test_name: 'Prelims Mock 2', test_date: '2026-02-17',
    total_questions: 100, attempted: 88, correct: 52, incorrect: 36, unattempted: 12,
    score: 80.24, max_score: 200, percentile: null, source: 'manual' as const, created_at: '2026-02-17T18:00:00.000Z',
  },
  {
    id: 'demo-mock-3', user_id: 'demo-user', test_name: 'Prelims Mock 3', test_date: '2026-02-24',
    total_questions: 100, attempted: 90, correct: 58, incorrect: 32, unattempted: 10,
    score: 94.88, max_score: 200, percentile: null, source: 'manual' as const, created_at: '2026-02-24T18:00:00.000Z',
  },
];

export const demoMockAnalytics = {
  score_trend: [
    { test_date: '2026-02-10', score_pct: 32.8, test_name: 'Prelims Mock 1' },
    { test_date: '2026-02-17', score_pct: 40.1, test_name: 'Prelims Mock 2' },
    { test_date: '2026-02-24', score_pct: 47.4, test_name: 'Prelims Mock 3' },
  ],
  subject_accuracy: [
    {
      id: 'sa-1', user_id: 'demo-user', subject_id: 'b0000000-0000-0000-0000-000000000001',
      total_questions: 35, correct: 22, accuracy: 0.63, tests_count: 3, avg_score_pct: 40.1, best_score_pct: 47.4,
      trend: 'improving' as const, subject_name: 'Indian Heritage & Culture',
    },
    {
      id: 'sa-2', user_id: 'demo-user', subject_id: 'b0000000-0000-0000-0000-000000000004',
      total_questions: 40, correct: 18, accuracy: 0.45, tests_count: 3, avg_score_pct: 38.5, best_score_pct: 44.0,
      trend: 'stable' as const, subject_name: 'World History',
    },
    {
      id: 'sa-3', user_id: 'demo-user', subject_id: 'b0000000-0000-0000-0000-000000000005',
      total_questions: 30, correct: 21, accuracy: 0.70, tests_count: 3, avg_score_pct: 42.0, best_score_pct: 50.0,
      trend: 'improving' as const, subject_name: 'Physical Geography',
    },
  ],
  weakest_topics: [
    { topic_id: 'c1000000-0000-0000-0000-000000000066', topic_name: 'American Revolution & Bill of Rights', accuracy: 0.2, total_questions: 5, trend: 'declining' as const },
    { topic_id: 'c1000000-0000-0000-0000-000000000069', topic_name: 'Treaty of Versailles & League of Nations', accuracy: 0.3, total_questions: 6, trend: 'stable' as const },
    { topic_id: 'c1000000-0000-0000-0000-000000000084', topic_name: 'Ocean Currents — Major Gyres & Maps', accuracy: 0.35, total_questions: 8, trend: 'improving' as const },
  ],
  strongest_topics: [
    { topic_id: 'c1000000-0000-0000-0000-00000000007b', topic_name: 'Atmosphere — Composition & Structure', accuracy: 0.85, total_questions: 7 },
    { topic_id: 'c1000000-0000-0000-0000-000000000087', topic_name: 'Coral Reefs — Types, Threats', accuracy: 0.80, total_questions: 5 },
  ],
  tests_count: 3,
  avg_score_pct: 40.1,
  best_score_pct: 47.4,
  recommendation: 'Good progress. Target your weakest topics to push above 60%.',
};

export const demoMockTopicHistory = {
  topic_id: 'c1000000-0000-0000-0000-000000000084',
  topic_name: 'Ocean Currents — Major Gyres & Maps',
  current_accuracy: 0.35,
  trend: 'improving' as const,
  history: [
    { test_date: '2026-02-10', questions: 3, correct: 0, accuracy: 0.0 },
    { test_date: '2026-02-17', questions: 2, correct: 1, accuracy: 0.5 },
    { test_date: '2026-02-24', questions: 3, correct: 2, accuracy: 0.67 },
  ],
};
