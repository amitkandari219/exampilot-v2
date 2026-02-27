import { ModeDefinition, StrategyParams } from '../types';

// These are display-only fallback defaults. The API (modeConfig.ts) is the source of truth.
// Once useStrategy() hook data loads, these are overridden.

const conservativeParams: StrategyParams = {
  revision_frequency: 5,
  daily_new_topics: 1,
  pyq_weight: 35,
  answer_writing_sessions: 3,
  current_affairs_time: 45,
  optional_ratio: 20,
  test_frequency: 3,
  break_days: 4,
  deep_study_hours: 3,
  revision_backlog_limit: 10,
  csat_time: 20,
  essay_practice: 2,
};

const aggressiveParams: StrategyParams = {
  revision_frequency: 3,
  daily_new_topics: 3,
  pyq_weight: 50,
  answer_writing_sessions: 6,
  current_affairs_time: 60,
  optional_ratio: 25,
  test_frequency: 6,
  break_days: 2,
  deep_study_hours: 5,
  revision_backlog_limit: 15,
  csat_time: 30,
  essay_practice: 4,
};

const balancedParams: StrategyParams = {
  revision_frequency: 4,
  daily_new_topics: 2,
  pyq_weight: 40,
  answer_writing_sessions: 4,
  current_affairs_time: 50,
  optional_ratio: 22,
  test_frequency: 4,
  break_days: 3,
  deep_study_hours: 4,
  revision_backlog_limit: 12,
  csat_time: 25,
  essay_practice: 3,
};

const workingProfessionalParams: StrategyParams = {
  revision_frequency: 7,
  daily_new_topics: 1,
  pyq_weight: 45,
  answer_writing_sessions: 3,
  current_affairs_time: 30,
  optional_ratio: 20,
  test_frequency: 2,
  break_days: 4,
  deep_study_hours: 2,
  revision_backlog_limit: 8,
  csat_time: 15,
  essay_practice: 2,
};

export const strategyModes: ModeDefinition[] = [
  {
    mode: 'balanced',
    title: 'Balanced',
    subtitle: 'Steady & sustainable',
    description:
      'A well-rounded approach that balances new learning with revision. Ideal for first-time aspirants with moderate study hours.',
    icon: '⚖️',
    params: balancedParams,
  },
  {
    mode: 'aggressive',
    title: 'Aggressive',
    subtitle: 'High intensity',
    description:
      'Fast-paced coverage with frequent testing and answer writing. Best for experienced aspirants or those with 8+ hours daily.',
    icon: '🔥',
    params: aggressiveParams,
  },
  {
    mode: 'conservative',
    title: 'Conservative',
    subtitle: 'Deep & thorough',
    description:
      'Focuses on deep understanding with generous revision cycles. Great for those who prefer mastery over speed.',
    icon: '🎯',
    params: conservativeParams,
  },
  {
    mode: 'working_professional',
    title: 'Working Professional',
    subtitle: 'Optimized for limited time',
    description:
      'Maximizes output from limited study hours with strategic prioritization and efficient revision cycles.',
    icon: '💼',
    params: workingProfessionalParams,
  },
];

export function getModeDefinition(mode: string): ModeDefinition {
  return strategyModes.find((m) => m.mode === mode) ?? strategyModes[0];
}

export function getDefaultParams(mode: string): StrategyParams {
  return getModeDefinition(mode).params;
}
