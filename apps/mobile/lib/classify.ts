import { OnboardingAnswers, OnboardingV2Answers, StrategyMode } from '../types';

export function classifyMode(answers: OnboardingAnswers): StrategyMode {
  const { daily_hours, is_working_professional, attempt_number, study_approach, fallback_strategy } = answers;

  // Working professional override
  if (is_working_professional && daily_hours <= 5) {
    return 'working_professional';
  }

  let score = 0;
  // Higher score → more aggressive

  // Daily hours (strong signal)
  if (daily_hours >= 7) score += 3;
  else if (daily_hours >= 5) score += 1;
  else if (daily_hours <= 3) score -= 2;

  // Attempt number
  if (attempt_number === 'third_plus') score += 2;
  else if (attempt_number === 'second') score += 1;
  else score -= 1; // first attempt → lean conservative

  // Study approach
  if (study_approach === 'strategic') score += 1;
  else score -= 1; // thorough → lean conservative

  // Fallback strategy
  if (fallback_strategy === 'push_harder') score += 1;
  else if (fallback_strategy === 'adjust_plan') score -= 1;
  // revise_more is neutral

  // Classification
  if (score >= 4) return 'aggressive';
  if (score <= -1) return 'conservative';
  return 'balanced';
}

export function classifyModeV2(
  answers: OnboardingV2Answers,
  extra?: { daily_hours?: number; study_approach?: string }
): StrategyMode {
  // Working professional override
  if (answers.user_type === 'working') return 'working_professional';

  let score = 0;

  // Daily hours signal (matches server: 7+ → aggressive leaning)
  const dailyHours = extra?.daily_hours || 0;
  if (dailyHours >= 7) score += 2;
  else if (dailyHours >= 5) score += 1;

  // Study approach signal (matches server: "cover everything" → conservative)
  if (extra?.study_approach === 'cover_everything' || extra?.study_approach === 'thorough') score -= 2;
  else if (extra?.study_approach === 'selective' || extra?.study_approach === 'high_yield') score += 1;

  // Attempt factor
  if (answers.attempt_number === 'third_plus') score += 2;
  else if (answers.attempt_number === 'second') score += 1;
  else score -= 1; // first

  // User type factor
  if (answers.user_type === 'dropout') score += 2;
  if (answers.user_type === 'repeater') score += 1;

  // Challenges factor
  if (answers.challenges.includes('time_management')) score -= 1;
  if (answers.challenges.includes('consistency')) score -= 1;
  if (answers.challenges.includes('syllabus_coverage')) score += 1;

  if (score >= 3) return 'aggressive';
  if (score <= -1) return 'conservative';
  return 'balanced';
}
