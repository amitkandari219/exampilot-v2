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

export interface WeaknessSnapshot {
  id: string;
  user_id: string;
  topic_id: string;
  snapshot_date: string;
  health_score: number;
  category: HealthCategory;
  confidence_component: number;
  revision_component: number;
  effort_component: number;
  stability_component: number;
  valid_from: string;
}

export type BufferTransactionType = 'deposit' | 'withdrawal' | 'zero_day_penalty' | 'initial' | 'consistency_reward';

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

export interface OnboardingPayload {
  daily_hours: number;
  is_working_professional: boolean;
  attempt_number: 'first' | 'second' | 'third_plus';
  study_approach: 'thorough' | 'strategic';
  fallback_strategy: 'push_harder' | 'revise_more' | 'adjust_plan';
  recommended_mode: StrategyMode;
  chosen_mode: StrategyMode;
  exam_date: string;
  name: string;
}

export interface SwitchModePayload {
  mode: StrategyMode;
}

export interface CustomizePayload {
  params: Partial<StrategyParams>;
}

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

export interface PYQData {
  id: string;
  topic_id: string;
  year: number;
  paper: GsPaper;
  question_count: number;
  question_type: string | null;
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
  status: VelocityStatus;
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

export interface BufferTransaction {
  id: string;
  user_id: string;
  transaction_date: string;
  type: BufferTransactionType;
  amount: number;
  balance_after: number;
  notes: string | null;
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
  status: BurnoutStatus;
  in_recovery: boolean;
}

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
  // Derived
  completion_pct_change: number;
  buffer_balance_change: number;
}

// Gamification types
export type XPTriggerType = 'plan_item_new' | 'plan_item_revision' | 'plan_item_decay_revision' | 'plan_item_stretch' | 'fsrs_review_correct' | 'fsrs_review_incorrect' | 'streak_milestone' | 'recovery_completion' | 'badge_unlock';
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

// Fastify request augmentation
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}
