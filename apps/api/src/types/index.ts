import type { StrategyMode as _SM, ExamMode as _EM } from '@exampilot/shared-types';

export const STRATEGY_MODES: readonly _SM[] = ['conservative', 'aggressive', 'balanced', 'working_professional'];
export const EXAM_MODES: readonly _EM[] = ['mains', 'prelims', 'csat'];

// Re-export all shared types
export type {
  StrategyMode, ExamMode, GsPaper, PyqTrend, TopicStatus, ConfidenceStatus,
  VelocityStatus, EnergyLevel, PlanItemType, PlanItemStatus, BurnoutStatus, HealthCategory,
  StrategyParams, PersonaParams,
  UserType, Challenge, OnboardingV2Answers, UserTargets, OnboardingV2Payload,
  Subject, Chapter, Topic,
  XPTriggerType, BadgeCategory, XPTransaction, BadgeDefinition, UserBadge, GamificationProfile, BadgeWithStatus,
  BenchmarkStatus, BenchmarkComponents, BenchmarkProfile, BenchmarkHistoryPoint,
  MockTrend, MockSource, MockDifficulty, MockTest, MockQuestion, MockTopicAccuracy, MockSubjectAccuracy, MockAnalytics, MockTopicHistory,
  RecalibrationLogEntry,
  SimulationScenarioType, SimulationScenario, SimulationSnapshot, SimulationDelta, SimulationResult,
  CADailyLog, CATag, CAStreak, CAStats, CASubjectGap,
  UserProgress, BufferTransactionType, BufferTransaction, DailyPlan, DailyPlanItem, SubjectCoverage, WeeklyReviewSummary,
  ScopeTriageItem, ScopeTriageResult, StrategyDeltaItem, StrategyDelta, MockCSVRow, MockCSVResult,
} from '@exampilot/shared-types';

// ── API-only types ──

export interface OnboardingPayload {
  daily_hours: number;
  is_working_professional: boolean;
  attempt_number: 'first' | 'second' | 'third_plus';
  study_approach: 'thorough' | 'strategic';
  fallback_strategy: 'push_harder' | 'revise_more' | 'adjust_plan';
  recommended_mode: import('@exampilot/shared-types').StrategyMode;
  chosen_mode: import('@exampilot/shared-types').StrategyMode;
  exam_date: string;
  name: string;
}

export interface SwitchModePayload {
  mode: import('@exampilot/shared-types').StrategyMode;
}

export interface CustomizePayload {
  params: Partial<import('@exampilot/shared-types').StrategyParams>;
}

export interface WeaknessSnapshot {
  id: string;
  user_id: string;
  topic_id: string;
  snapshot_date: string;
  health_score: number;
  category: import('@exampilot/shared-types').HealthCategory;
  confidence_component: number;
  revision_component: number;
  effort_component: number;
  stability_component: number;
  valid_from: string;
}

export interface PYQData {
  id: string;
  topic_id: string;
  year: number;
  paper: import('@exampilot/shared-types').GsPaper;
  question_count: number;
  question_type: string | null;
}

export interface FSRSCard {
  id: string;
  user_id: string;
  topic_id: string;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
}

export interface VelocitySnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  gravity_completed_today: number;
  cumulative_gravity: number;
  required_velocity: number;
  actual_velocity_7d: number;
  actual_velocity_14d: number;
  velocity_ratio: number;
  status: import('@exampilot/shared-types').VelocityStatus;
  weighted_completion_pct: number;
  trend: string | null;
  projected_completion_date: string | null;
  stress_score: number;
  stress_status: string;
  signal_velocity: number;
  signal_buffer: number;
  signal_time: number;
  signal_confidence: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  topics_completed: number;
  gravity_completed: number;
  hours_studied: number;
  subjects_touched: number;
  avg_difficulty: number;
}

export interface Streak {
  id: string;
  user_id: string;
  streak_type: string;
  current_count: number;
  best_count: number;
  last_active_date: string | null;
}

export interface BurnoutSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  bri_score: number;
  fatigue_score: number;
  signal_stress: number;
  signal_buffer: number;
  signal_velocity: number;
  signal_engagement: number;
  status: import('@exampilot/shared-types').BurnoutStatus;
  in_recovery: boolean;
}

export interface PyqSubjectStats {
  id: string;
  subject_id: string;
  avg_questions_per_year: number;
  total_questions_10yr: number;
  trend: import('@exampilot/shared-types').PyqTrend;
  highest_year: number | null;
  highest_count: number;
}

// Fastify request augmentation
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}
