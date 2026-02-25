export type StrategyMode = 'conservative' | 'aggressive' | 'balanced' | 'working_professional';

export type ExamMode = 'mains' | 'prelims' | 'post_prelims';

export type GsPaper = 'GS-I' | 'GS-II' | 'GS-III' | 'GS-IV' | 'Prelims';

export type PyqTrend = 'rising' | 'stable' | 'declining';

export type TopicStatus = 'untouched' | 'in_progress' | 'first_pass' | 'revised' | 'exam_ready' | 'deferred_scope';

export type ConfidenceStatus = 'fresh' | 'fading' | 'stale' | 'decayed';

export type VelocityStatus = 'ahead' | 'on_track' | 'behind' | 'at_risk';

export type EnergyLevel = 'full' | 'moderate' | 'low' | 'empty';

export type PlanItemType = 'new' | 'revision' | 'decay_revision' | 'stretch';

export type PlanItemStatus = 'pending' | 'completed' | 'skipped' | 'deferred';

export type BurnoutStatus = 'low' | 'moderate' | 'high' | 'critical';

export type HealthCategory = 'critical' | 'weak' | 'moderate' | 'strong' | 'exam_ready';

export interface StrategyParams {
  revision_frequency: number;
  daily_new_topics: number;
  pyq_weight: number;
  answer_writing_sessions: number;
  current_affairs_time: number;
  optional_ratio: number;
  test_frequency: number;
  break_days: number;
  deep_study_hours: number;
  revision_backlog_limit: number;
  csat_time: number;
  essay_practice: number;
}

export interface PersonaParams {
  fatigue_threshold: number;
  buffer_capacity: number;
  fsrs_target_retention: number;
  burnout_threshold: number;
}

export interface UserProfile {
  id: string;
  name: string | null;
  exam_date: string | null;
  prelims_date: string | null;
  daily_hours: number;
  strategy_mode: StrategyMode;
  strategy_params: StrategyParams;
  current_mode: ExamMode;
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
}

export interface OnboardingAnswers {
  daily_hours: number;
  is_working_professional: boolean;
  attempt_number: 'first' | 'second' | 'third_plus';
  study_approach: 'thorough' | 'strategic';
  fallback_strategy: 'push_harder' | 'revise_more' | 'adjust_plan';
}

// V2 Onboarding types
export type UserType = 'student' | 'working' | 'dropout' | 'repeater';

export type Challenge =
  | 'time_management'
  | 'consistency'
  | 'syllabus_coverage'
  | 'revision'
  | 'answer_writing'
  | 'motivation'
  | 'optional_subject'
  | 'current_affairs';

export interface OnboardingV2Answers {
  name: string;
  target_exam_year: number;
  attempt_number: 'first' | 'second' | 'third_plus';
  user_type: UserType;
  challenges: Challenge[];
}

export interface UserTargets {
  daily_hours: number;
  daily_new_topics: number;
  weekly_revisions: number;
  weekly_tests: number;
  weekly_answer_writing: number;
  weekly_ca_hours: number;
}

export interface OnboardingV2Payload {
  answers: OnboardingV2Answers;
  chosen_mode: StrategyMode;
  targets: UserTargets;
  promise_text?: string;
  exam_date: string;
}

export interface ModeDefinition {
  mode: StrategyMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  params: StrategyParams;
}

export interface Subject {
  id: string;
  name: string;
  papers: GsPaper[];
  importance: number;
  difficulty: number;
  estimated_hours: number;
  display_order: number;
  chapters?: ChapterWithTopics[];
  progress?: SubjectProgress;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  importance: number;
  difficulty: number;
  estimated_hours: number;
  display_order: number;
}

export interface ChapterWithTopics extends Chapter {
  topics: TopicWithProgress[];
  progress?: ChapterProgress;
}

export interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  importance: number;
  difficulty: number;
  estimated_hours: number;
  display_order: number;
  pyq_frequency: number;
  pyq_weight: number;
  pyq_trend: PyqTrend;
  last_pyq_year: number | null;
}

export interface TopicWithProgress extends Topic {
  user_progress?: UserProgress | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  status: TopicStatus;
  actual_hours_spent: number;
  last_touched: string | null;
  revision_count: number;
  confidence_score: number;
  confidence_status: ConfidenceStatus;
  health_score: number;
  notes: string | null;
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
  high_gravity_untouched: number;
  trending_topics: TopicWithProgress[];
}

export interface VelocityData {
  velocity_ratio: number;
  status: VelocityStatus;
  actual_velocity_7d: number;
  actual_velocity_14d: number;
  required_velocity: number;
  weighted_completion_pct: number;
  trend: string | null;
  projected_completion_date: string | null;
  streak: { current_count: number; best_count: number } | null;
  buffer_balance: number;
  buffer_capacity: number;
}

export interface BufferData {
  balance: number;
  capacity: number;
  balance_days: number;
  transactions: BufferTransaction[];
}

export interface BufferTransaction {
  id: string;
  transaction_date: string;
  type: string;
  amount: number;
  balance_after: number;
  notes: string | null;
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

export interface DailyPlan {
  id: string;
  plan_date: string;
  available_hours: number;
  is_light_day: boolean;
  fatigue_score: number;
  energy_level: EnergyLevel;
  items: DailyPlanItem[];
}

export interface DailyPlanItem {
  id: string;
  plan_id: string;
  topic_id: string;
  type: PlanItemType;
  estimated_hours: number;
  priority_score: number;
  display_order: number;
  status: PlanItemStatus;
  completed_at: string | null;
  actual_hours: number | null;
  topic?: Topic;
  chapter_name?: string;
  subject_name?: string;
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

export interface RecalibrationLogEntry {
  id: string;
  user_id: string;
  recalibrated_at: string;
  trigger_type: string;
  window_days: number;
  old_fatigue_threshold: number | null;
  old_buffer_capacity: number | null;
  old_fsrs_target_retention: number | null;
  old_burnout_threshold: number | null;
  new_fatigue_threshold: number | null;
  new_buffer_capacity: number | null;
  new_fsrs_target_retention: number | null;
  new_burnout_threshold: number | null;
  input_velocity_ratio: number | null;
  input_velocity_trend: string | null;
  input_bri_score: number | null;
  input_fatigue_avg: number | null;
  input_stress_avg: number | null;
  input_confidence_avg: number | null;
  input_weakness_critical_pct: number | null;
  reason_fatigue: string | null;
  reason_buffer: string | null;
  reason_retention: string | null;
  reason_burnout: string | null;
  params_changed: boolean;
}

export interface RecalibrationStatus {
  auto_recalibrate: boolean;
  last_recalibrated_at: string | null;
  last_entry: RecalibrationLogEntry | null;
}

export interface WeeklyReviewSummary {
  id: string;
  user_id: string;
  week_end_date: string;
  week_start_date: string;
  generated_at: string;
  // Study metrics
  total_hours: number;
  topics_completed: number;
  gravity_completed: number;
  avg_hours_per_day: number;
  subjects_touched: number;
  // Velocity
  avg_velocity_ratio: number;
  velocity_trend: string | null;
  completion_pct_start: number;
  completion_pct_end: number;
  // Confidence
  confidence_distribution: Record<string, number>;
  topics_improved: number;
  topics_decayed: number;
  // Stress & Burnout
  avg_stress: number;
  avg_bri: number;
  fatigue_trend: string | null;
  recovery_days: number;
  // Planner
  plan_completion_rate: number;
  plan_total_items: number;
  plan_completed_items: number;
  plan_new_count: number;
  plan_revision_count: number;
  // Weakness
  weakness_distribution: Record<string, number>;
  critical_count_change: number;
  weak_count_change: number;
  // Buffer
  buffer_balance_start: number;
  buffer_balance_end: number;
  zero_day_count: number;
  // Streak
  current_streak: number;
  best_streak: number;
  // Highlights
  highlights: string[];
  valid_from: string;
  // Gamification (F12b)
  xp_earned: number;
  badges_unlocked: Array<{ slug: string; name: string; icon_name: string }>;
  level_start: number;
  level_end: number;
  // Benchmark (F12b)
  benchmark_score_start: number | null;
  benchmark_score_end: number | null;
  benchmark_status: string | null;
  benchmark_trend: string | null;
  // Derived
  completion_pct_change: number;
  buffer_balance_change: number;
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

// Gamification types
export type XPTriggerType = 'plan_item_new' | 'plan_item_revision' | 'plan_item_decay_revision' | 'plan_item_stretch' | 'fsrs_review_correct' | 'fsrs_review_incorrect' | 'streak_milestone' | 'recovery_completion' | 'badge_unlock' | 'mock_completion';
export type BadgeCategory = 'streak' | 'milestone' | 'study' | 'recovery' | 'special';

export interface XPTransaction {
  id: string;
  user_id: string;
  xp_amount: number;
  trigger_type: XPTriggerType;
  topic_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  unlock_condition: Record<string, any>;
  xp_reward: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_slug: string;
  unlocked_at: string;
}

export interface GamificationProfile {
  xp_total: number;
  current_level: number;
  xp_for_next_level: number;
  xp_progress_in_level: number;
  xp_today: number;
  recent_badges: Array<BadgeDefinition & { unlocked_at: string }>;
  total_badges_unlocked: number;
}

export interface BadgeWithStatus extends BadgeDefinition {
  unlocked: boolean;
  unlocked_at: string | null;
}

// Benchmark types
export type BenchmarkStatus = 'exam_ready' | 'on_track' | 'needs_work' | 'at_risk';

export interface BenchmarkComponents {
  coverage: number;
  confidence: number;
  weakness: number;
  consistency: number;
  velocity: number;
}

export interface BenchmarkProfile {
  composite_score: number;
  status: BenchmarkStatus;
  components: BenchmarkComponents;
  trend: string;
  trend_delta: number;
  recommendations: string[];
  snapshot_date: string;
}

export interface BenchmarkHistoryPoint {
  snapshot_date: string;
  composite_score: number;
  status: BenchmarkStatus;
}

// Mock Test types
export type MockTrend = 'improving' | 'stable' | 'declining';
export type MockSource = 'manual' | 'csv_import';
export type MockDifficulty = 'easy' | 'medium' | 'hard';

export interface MockTest {
  id: string;
  user_id: string;
  test_name: string;
  test_date: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  max_score: number;
  percentile: number | null;
  source: MockSource;
  created_at: string;
}

export interface MockQuestion {
  id: string;
  mock_test_id: string;
  question_number: number;
  topic_id: string | null;
  subject_id: string;
  is_correct: boolean;
  is_attempted: boolean;
  difficulty: MockDifficulty | null;
}

export interface MockTopicAccuracy {
  id: string;
  user_id: string;
  topic_id: string;
  total_questions: number;
  correct_questions: number;
  accuracy: number;
  last_mock_date: string | null;
  trend: MockTrend;
}

export interface MockSubjectAccuracy {
  id: string;
  user_id: string;
  subject_id: string;
  total_questions: number;
  correct: number;
  accuracy: number;
  tests_count: number;
  avg_score_pct: number;
  best_score_pct: number;
  trend: MockTrend;
}

export interface MockAnalytics {
  score_trend: Array<{ test_date: string; score_pct: number; test_name: string }>;
  subject_accuracy: Array<MockSubjectAccuracy & { subject_name: string }>;
  weakest_topics: Array<{ topic_id: string; topic_name: string; accuracy: number; total_questions: number; trend: MockTrend }>;
  strongest_topics: Array<{ topic_id: string; topic_name: string; accuracy: number; total_questions: number }>;
  tests_count: number;
  avg_score_pct: number;
  best_score_pct: number;
  recommendation: string;
}

export interface MockTopicHistory {
  topic_id: string;
  topic_name: string;
  current_accuracy: number;
  trend: MockTrend;
  history: Array<{ test_date: string; questions: number; correct: number; accuracy: number }>;
}

// Current Affairs types
export interface CADailyLog {
  id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  hours_spent: number;
  notes: string | null;
  created_at: string;
  tags?: CATag[];
}

export interface CATag {
  id: string;
  ca_log_id: string;
  subject_id: string;
  tag_text: string | null;
  subject_name?: string;
}

export interface CAStreak {
  current_streak: number;
  best_streak: number;
  last_active_date: string | null;
}

export interface CAStats {
  streak: CAStreak;
  today_logged: boolean;
  today_log: CADailyLog | null;
  total_hours: number;
  total_days_logged: number;
  subject_distribution: Array<{ subject_id: string; subject_name: string; count: number; percentage: number }>;
  monthly_heatmap: Array<{ date: string; completed: boolean }>;
}

export interface CASubjectGap {
  subject_id: string;
  subject_name: string;
  tag_count: number;
  percentage: number;
  alert: string | null;
}

// Simulation types
export type SimulationScenarioType = 'skip_days' | 'change_hours' | 'change_strategy' | 'change_exam_date' | 'defer_topics';

export interface SimulationScenario {
  type: SimulationScenarioType;
  params: Record<string, any>;
}

export interface SimulationSnapshot {
  velocity_ratio: number;
  status: VelocityStatus;
  actual_velocity: number;
  required_velocity: number;
  days_remaining: number;
  projected_completion_date: string | null;
  weighted_completion_pct: number;
  buffer_balance: number;
  buffer_capacity: number;
  buffer_max: number;
  daily_hours: number;
  strategy_mode: StrategyMode;
  exam_date: string;
  total_gravity: number;
  completed_gravity: number;
  remaining_gravity: number;
}

export interface SimulationDelta {
  velocity_ratio_change: number;
  status_change: string;
  days_remaining_change: number;
  completion_date_shift_days: number | null;
  buffer_balance_change: number;
}

export interface SimulationResult {
  scenario: SimulationScenario;
  baseline: SimulationSnapshot;
  projected: SimulationSnapshot;
  delta: SimulationDelta;
}
