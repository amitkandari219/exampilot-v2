// ── Type aliases ──
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

// ── Strategy & Persona ──
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
  buffer_deposit_rate: number;
  buffer_withdrawal_rate: number;
  velocity_target_multiplier: number;
  revision_ratio_in_plan: number;
  fatigue_sensitivity: number;
  recalibration_order: string[];
  scope_reduction_threshold: number;
  pyq_weight_minimum: number;
  weekend_boost: boolean;
}

// ── V2 Onboarding ──
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

// ── Syllabus ──
export interface Subject {
  id: string;
  name: string;
  papers: GsPaper[];
  importance: number;
  difficulty: number;
  estimated_hours: number;
  display_order: number;
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

// ── Gamification ──
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

// ── Benchmark ──
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

// ── Mock Test ──
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

// ── User Progress ──
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
  mock_accuracy: number | null;
  notes: string | null;
}

// ── Buffer ──
export type BufferTransactionType = 'deposit' | 'withdrawal' | 'zero_day_penalty' | 'initial' | 'consistency_reward' | 'recalibration_adjustment';

export interface BufferTransaction {
  id: string;
  user_id: string;
  transaction_date: string;
  type: BufferTransactionType;
  amount: number;
  balance_after: number;
  notes: string | null;
}

// ── Daily Plan ──
export interface DailyPlan {
  id: string;
  user_id: string;
  plan_date: string;
  generated_at: string;
  available_hours: number;
  is_regenerated: boolean;
  is_light_day: boolean;
  fatigue_score: number;
  energy_level: EnergyLevel;
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
}

// ── Weekly Review ──
export interface SubjectCoverage {
  touched: string[];
  untouched: string[];
  untouched_over_14d: string[];
}

export interface WeeklyReviewSummary {
  id: string;
  user_id: string;
  week_end_date: string;
  week_start_date: string;
  generated_at: string;
  total_hours: number;
  hours_target: number;
  topics_completed: number;
  gravity_completed: number;
  avg_hours_per_day: number;
  subjects_touched: number;
  avg_velocity_ratio: number;
  velocity_trend: string | null;
  completion_pct_start: number;
  completion_pct_end: number;
  topics_target: number;
  gravity_target: number;
  confidence_distribution: Record<string, number>;
  avg_confidence: number;
  topics_improved: number;
  topics_decayed: number;
  avg_stress: number;
  avg_bri: number;
  peak_bri: number;
  fatigue_trend: string | null;
  recovery_days: number;
  plan_completion_rate: number;
  plan_total_items: number;
  plan_completed_items: number;
  plan_new_count: number;
  plan_revision_count: number;
  weakness_distribution: Record<string, number>;
  critical_count_change: number;
  weak_count_change: number;
  subject_coverage: SubjectCoverage;
  buffer_balance_start: number;
  buffer_balance_end: number;
  zero_day_count: number;
  current_streak: number;
  best_streak: number;
  wins: string[];
  areas_to_improve: string[];
  next_week_recommendations: string[];
  highlights: string[];
  valid_from: string;
  xp_earned: number;
  badges_unlocked: Array<{ slug: string; name: string; icon_name: string }>;
  level_start: number;
  level_end: number;
  benchmark_score_start: number | null;
  benchmark_score_end: number | null;
  benchmark_status: string | null;
  benchmark_trend: string | null;
  completion_pct_change: number;
  buffer_balance_change: number;
}

// ── Recalibration ──
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

// ── Simulation ──
export type SimulationScenarioType = 'skip_days' | 'change_hours' | 'change_strategy' | 'change_exam_date' | 'defer_topics' | 'focus_subject';

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
  verdict: 'green' | 'yellow' | 'red';
  recommendation: string;
}

// ── Current Affairs ──
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
