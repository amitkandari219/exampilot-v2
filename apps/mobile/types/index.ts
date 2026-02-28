// Re-export all shared types
export type {
  StrategyMode, ExamMode, GsPaper, PyqTrend, TopicStatus, ConfidenceStatus,
  VelocityStatus, EnergyLevel, PlanItemType, PlanItemStatus, BurnoutStatus, HealthCategory,
  StrategyParams, PersonaParams,
  UserType, Challenge, OnboardingV2Answers, UserTargets, OnboardingV2Payload, PreviousAttemptData,
  Chapter, Topic,
  XPTriggerType, BadgeCategory, XPTransaction, BadgeDefinition, UserBadge, GamificationProfile, BadgeWithStatus,
  BenchmarkStatus, BenchmarkComponents, BenchmarkProfile, BenchmarkHistoryPoint,
  MockTrend, MockSource, MockDifficulty, MockTest, MockQuestion, MockTopicAccuracy, MockSubjectAccuracy, MockAnalytics, MockTopicHistory,
  RecalibrationLogEntry,
  SimulationScenarioType, SimulationScenario, SimulationSnapshot, SimulationDelta, SimulationResult,
  CADailyLog, CATag, CAStreak, CAStats, CASubjectGap,
  UserProgress, BufferTransactionType, BufferTransaction,
  SubjectCoverage, WeeklyReviewSummary,
  ScopeTriageItem, ScopeTriageResult, StrategyDeltaItem, StrategyDelta, MockCSVRow, MockCSVResult,
} from '@exampilot/shared-types';

// ── Mobile-only types ──

import type {
  StrategyMode, StrategyParams, TopicStatus, ConfidenceStatus, VelocityStatus, EnergyLevel,
  PlanItemType, PlanItemStatus, BurnoutStatus, HealthCategory,
  Topic as SharedTopic, Chapter as SharedChapter, Subject as SharedSubject,
  DailyPlan as DailyPlanBase, DailyPlanItem as DailyPlanItemBase,
  UserProgress, BufferTransaction,
} from '@exampilot/shared-types';

export interface Subject extends SharedSubject {
  chapters?: ChapterWithTopics[];
  progress?: SubjectProgress;
}

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  exam_date: string | null;
  prelims_date: string | null;
  daily_hours: number;
  strategy_mode: StrategyMode;
  strategy_params: StrategyParams;
  current_mode: import('@exampilot/shared-types').ExamMode;
  mode_switched_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  fatigue_threshold: number;
  buffer_capacity: number;
  fsrs_target_retention: number;
  burnout_threshold: number;
  buffer_balance: number;
  recovery_mode_active: boolean;
  recovery_mode_start: string | null;
  recovery_mode_end: string | null;
  attempt_number?: string | null;
}

export interface OnboardingAnswers {
  daily_hours: number;
  is_working_professional: boolean;
  attempt_number: 'first' | 'second' | 'third_plus';
  study_approach: 'thorough' | 'strategic';
  fallback_strategy: 'push_harder' | 'revise_more' | 'adjust_plan';
}

export interface ModeDefinition {
  mode: StrategyMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  params: StrategyParams;
}

export interface ChapterWithTopics extends SharedChapter {
  topics: TopicWithProgress[];
  progress?: ChapterProgress;
}

export interface TopicWithProgress extends SharedTopic {
  user_progress?: UserProgress | null;
}

export interface SubjectProgress {
  total_topics: number;
  completed_topics: number;
  weighted_completion: number;
  avg_confidence: number;
}

export interface ChapterProgress {
  total_topics: number;
  completed_topics: number;
  weighted_completion: number;
  avg_confidence: number;
}

export interface PYQStats {
  total_gravity: number;
  completed_gravity: number;
  remaining_gravity: number;
  weighted_completion_pct: number;
  unweighted_completion_pct: number;
  high_gravity_untouched: Array<{ id: string; name: string; pyq_weight: number; gravity: number }>;
  subject_gravity: Array<{ subject_id: string; name: string; total_gravity: number; completed_gravity: number; pct: number }>;
  trending_up: Array<{ id: string; name: string; pyq_weight: number; pyq_trend: string }>;
  trending_down: Array<{ id: string; name: string; pyq_weight: number; pyq_trend: string }>;
}

export interface VelocityData {
  velocity_ratio: number;
  status: VelocityStatus;
  actual_velocity_7d: number;
  actual_velocity_14d: number;
  required_velocity: number;
  weighted_completion_pct: number;
  unweighted_completion_pct: number;
  trend: string | null;
  projected_completion_date: string | null;
  days_remaining: number;
  total_gravity: number;
  completed_gravity: number;
  remaining_gravity: number;
  streak: { current_count: number; best_count: number } | null;
  buffer_balance: number;
  buffer_capacity: number;
}

export interface VelocityHistoryPoint {
  snapshot_date: string;
  velocity_ratio: number;
  status: string;
  weighted_completion_pct: number;
  stress_score: number | null;
}

export interface BufferData {
  balance: number;
  capacity: number;
  buffer_initial: number | null;
  balance_days: number;
  max_buffer: number;
  status: 'debt' | 'critical' | 'caution' | 'healthy';
  transactions: BufferTransaction[];
}

export interface BurnoutData {
  bri_score: number;
  fatigue_score: number;
  status: BurnoutStatus;
  in_recovery: boolean;
  recovery_day?: number;
  recovery_end?: string;
  signals: {
    stress: number;
    buffer: number;
    velocity: number;
    engagement: number;
  };
  history: Array<{ date: string; bri_score: number; fatigue_score: number }>;
  consecutive_missed_days: number;
}

export interface StressData {
  score: number;
  status: string;
  label: string;
  signals: {
    velocity: number;
    buffer: number;
    time: number;
    confidence: number;
  };
  recommendation: string;
  history: Array<{ date: string; score: number }>;
}

export interface DailyPlanItem extends DailyPlanItemBase {
  topic?: SharedTopic;
  chapter_name?: string;
  subject_name?: string;
}

export interface DailyPlan extends DailyPlanBase {
  items: DailyPlanItem[];
}

export interface ConfidenceOverview {
  distribution: Record<ConfidenceStatus, number>;
  fastest_decaying: Array<{
    topic_id: string;
    topic_name: string;
    confidence_score: number;
    stability: number;
  }>;
}

export interface WeakArea {
  subject_id: string;
  subject_name: string;
  chapter_id: string;
  chapter_name: string;
  topic_id: string;
  topic_name: string;
  health_score: number;
  category: HealthCategory;
  recommendation: string;
}

export interface WeaknessOverview {
  summary: {
    critical: number;
    weak: number;
    moderate: number;
    strong: number;
    exam_ready: number;
  };
  weakest_topics: WeakArea[];
  by_subject: Array<{
    subject_id: string;
    subject_name: string;
    weak_count: number;
    critical_count: number;
    topics: WeakArea[];
  }>;
}

export interface TopicHealthDetail {
  topic_id: string;
  topic_name: string;
  health_score: number;
  category: HealthCategory;
  components: {
    confidence: number;
    revision: number;
    effort: number;
    stability: number;
  };
  recommendation: string;
  trend: Array<{ date: string; score: number }>;
}

export interface RecalibrationStatus {
  auto_recalibrate: boolean;
  last_recalibrated_at: string | null;
  last_entry: import('@exampilot/shared-types').RecalibrationLogEntry | null;
}

export interface RecalibrationResult {
  status: 'applied' | 'no_change' | 'skipped';
  skipped_reason?: string;
  adjustments?: Array<{
    param: string;
    oldValue: number;
    newValue: number;
    step: number;
    reason: string;
  }>;
  newParams?: {
    fatigue_threshold: number;
    buffer_capacity: number;
    fsrs_target_retention: number;
    burnout_threshold: number;
  };
}
