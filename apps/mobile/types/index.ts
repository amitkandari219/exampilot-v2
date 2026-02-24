export type StrategyMode = 'conservative' | 'aggressive' | 'balanced' | 'working_professional';

export type ExamMode = 'mains' | 'prelims' | 'post_prelims';

export interface StrategyParams {
  revision_frequency: number;       // days between revisions (3-14)
  daily_new_topics: number;         // new topics per day (1-4)
  pyq_weight: number;               // PYQ emphasis percentage (20-60)
  answer_writing_sessions: number;  // per week (2-7)
  current_affairs_time: number;     // minutes per day (30-90)
  optional_ratio: number;           // % time on optional subject (15-35)
  test_frequency: number;           // mock tests per month (2-8)
  break_days: number;               // rest days per month (2-6)
  deep_study_hours: number;         // hours of deep focus per day (2-6)
  revision_backlog_limit: number;   // max pending revisions before pause (5-20)
  csat_time: number;                // minutes per day for CSAT (0-60)
  essay_practice: number;           // essay practice sessions per month (2-6)
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
