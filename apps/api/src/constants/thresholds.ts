// Confidence status thresholds (used in fsrs, decayTrigger, syllabus, planner)
export const CONFIDENCE = {
  FRESH: 70,
  FADING: 45,
  STALE: 20,
} as const;

// Velocity status thresholds (used in velocity, simulator)
export const VELOCITY = {
  AHEAD: 1.1,
  ON_TRACK: 0.9,
  BEHIND: 0.7,
} as const;

// Buffer bank constants (used in velocity)
export const BUFFER = {
  DEPOSIT_RATE: 0.30,
  WITHDRAWAL_RATE: 0.50,
  DEBT_FLOOR: -5,
  ZERO_DAY_PENALTY: -1.0,
  CONSISTENCY_REWARD: 0.1,
} as const;

// Burnout/fatigue constants (used in planner, burnout)
export const BURNOUT = {
  FATIGUE_DEFAULT: 85,
  FATIGUE_MIN_TARGET_HOURS: 6,
  COLD_RESTART_MISSED_DAYS: 2,
  COLD_RESTART_CAP: 0.6,
  LIGHT_DAY_MULTIPLIER: 0.6,
  RECOVERY_HALF: 0.5,
  RAMP_DAY1: 0.7,
  RAMP_DAY2: 0.85,
} as const;

// Stress composite weights (used in stress)
export const STRESS_WEIGHTS = {
  VELOCITY: 0.35,
  BUFFER: 0.25,
  TIME: 0.20,
  CONFIDENCE: 0.20,
} as const;

// Burnout Risk Index weights (used in burnout)
export const BRI_WEIGHTS = {
  STRESS: 0.30,
  BUFFER: 0.25,
  VELOCITY: 0.25,
  ENGAGEMENT: 0.20,
} as const;

// Benchmark readiness weights (used in benchmark)
export const BENCHMARK_WEIGHTS = {
  COVERAGE: 0.30,
  CONFIDENCE: 0.25,
  WEAKNESS: 0.20,
  CONSISTENCY: 0.15,
  VELOCITY: 0.10,
} as const;

// Topic health weights (used in weakness)
export const HEALTH_WEIGHTS = {
  COMPLETION: 0.25,
  REVISION: 0.20,
  ACCURACY: 0.30,
  RECENCY: 0.25,
} as const;

// Planner scoring factors (used in planner)
export const PLANNER = {
  PYQ_FACTOR: 4,
  IMPORTANCE_FACTOR: 2,
  URGENCY_FACTOR: 2,
  SUBJECT_REPEAT_PENALTY: 0.5,
  MAX_SAME_SUBJECT_PCT: 0.6,
  VARIETY_BONUS: 2,
  DEFERRED_BOOST: 1,
  DECAY_BOOST_DECAYED: 6,
  DECAY_BOOST_STALE: 4,
  PRELIMS_BOOST: 3,
  WEEKEND_BOOST: 3,
  REVISION_BASE_BOOST: 5,
  POST_HEAVY_MAX_TOPICS: 3,
  POST_HEAVY_MAX_DIFFICULTY: 3,
  // Capacity & freshness
  RECENT_LOGS_LIMIT: 7,
  RECENT_PLANS_LIMIT: 4,
  DEFAULT_REVISION_RATIO: 0.25,
  CONSECUTIVE_DAYS_LIGHT: 6,
  POST_HEAVY_DIFFICULTY: 4,
  DEFAULT_DAILY_HOURS: 6,
  FATIGUE_ENERGY_FULL: 30,
  FATIGUE_ENERGY_MODERATE: 55,
  FATIGUE_ENERGY_LOW: 80,
  FATIGUE_TOPIC_LIMIT: 70,
  HOURS_PER_TOPIC_ESTIMATE: 1.5,
  FRESHNESS_STALE_DAYS: 7,
  FRESHNESS_MODERATE_DAYS: 3,
  FRESHNESS_SCORE_NEW: 3,
  FRESHNESS_SCORE_MODERATE: 1,
  FRESHNESS_SCORE_RECENT: -2,
  MOCK_ACCURACY_LOW: 0.3,
  MOCK_ACCURACY_MED: 0.5,
  MOCK_BOOST_LOW: 3,
  MOCK_BOOST_MED: 2,
  INSIGHT_FALSE_SECURITY: 5,
  INSIGHT_BLIND_SPOT: 3,
  INSIGHT_OVER_REVISED: -3,
  SUBJECT_REPEAT_LIMIT: 3,
  MIN_HOURS_PER_TOPIC: 0.5,
  FATIGUE_STATUS_CRITICAL: 85,
  FATIGUE_STATUS_HIGH: 70,
  FATIGUE_STATUS_MODERATE: 50,
  MAX_IMMEDIATE_REVISIONS: 3,
  DECAY_REVISION_HOURS: 0.5,
  DECAY_REVISION_PRIORITY: 99,
} as const;

// FSRS constants (used in fsrs, decayTrigger)
export const FSRS = {
  TARGET_RETENTION: 0.9,
  ACCURACY_FLOOR: 0.7,
  ACCURACY_MULTIPLIER: 0.3,
} as const;

// Recalibration constants (used in recalibration)
export const RECALIBRATION = {
  DRIFT_LIMIT: 0.10,
  COOLDOWN_DAYS: 3,
  MIN_DATA_POINTS: 5,
  DEFAULT_WINDOW_DAYS: 7,
  EXTENDED_WINDOW_DAYS: 14,
  BOUNDS: {
    fatigue_threshold: [60, 95] as const,
    buffer_capacity: [0.05, 0.35] as const,
    fsrs_target_retention: [0.80, 0.98] as const,
    burnout_threshold: [50, 90] as const,
  },
  STEPS: {
    RETENTION_BIG: 0.02,
    RETENTION_SMALL: 0.01,
    BURNOUT_BIG: 3,
    BURNOUT_SMALL: 2,
    FATIGUE_BIG: 3,
    FATIGUE_SMALL: 2,
    BUFFER_BIG: 0.02,
    BUFFER_SMALL: 0.01,
  },
  SIGNALS: {
    VELOCITY_THRIVING: 1.15,
    VELOCITY_GOOD: 1.10,
    VELOCITY_OK: 1.05,
    VELOCITY_FALLING: 0.90,
    VELOCITY_STRUGGLING: 0.75,
    VELOCITY_BEHIND: 0.85,
    BRI_THRIVING: 75,
    BRI_HEALTHY: 70,
    BRI_GOOD: 65,
    BRI_OK: 60,
    BRI_MODERATE: 55,
    BRI_CONCERN: 45,
    BRI_STRUGGLING: 40,
    FATIGUE_LOW: 30,
    FATIGUE_MODERATE_LOW: 35,
    FATIGUE_OK: 40,
    FATIGUE_MODERATE_HIGH: 45,
    FATIGUE_MODERATE: 50,
    FATIGUE_ELEVATED: 55,
    FATIGUE_HIGH: 60,
    FATIGUE_CHRONIC: 70,
    CONFIDENCE_GOOD: 65,
    CONFIDENCE_OK: 55,
    WEAKNESS_CRITICAL_PCT: 30,
  },
} as const;

// Gamification constants (used in gamification, endOfDay)
export const GAMIFICATION = {
  STREAK_MILESTONES: { 7: 200, 14: 400, 30: 1000, 100: 2500 } as Record<number, number>,
} as const;

// Weekly review constants (used in weeklyReview)
export const WEEKLY_REVIEW = {
  DAYS_IN_WEEK: 7,
  FATIGUE_TREND_DELTA: 5,
  UNTOUCHED_DAYS: 14,
  LOW_CONFIDENCE_THRESHOLD: 50,
  XP_PER_LEVEL_DIVISOR: 500,
  BENCHMARK_TREND_DELTA: 2,
  VELOCITY_IMPROVEMENT_THRESHOLD: 0.05,
  ON_TRACK_VELOCITY: 0.9,
  PLAN_ADHERENCE_STRONG: 80,
  STREAK_WIN_THRESHOLD: 7,
  MAX_LOW_CONF_SUBJECTS: 3,
  ZERO_DAY_WARNING: 2,
  MAX_UNTOUCHED_RECOMMENDATIONS: 2,
  MAX_LOW_CONF_RECOMMENDATIONS: 2,
  MAX_RECOMMENDATIONS: 5,
  MAX_HIGHLIGHTS: 3,
  BRI_LOW_RISK: 60,
  BRI_ELEVATED: 40,
  ZERO_DAY_HIGHLIGHT: 3,
} as const;

// Velocity composite weighting (used in velocity, simulator)
export const VELOCITY_WEIGHTING = {
  WEIGHT_7D: 0.6,
  WEIGHT_14D: 0.4,
} as const;
