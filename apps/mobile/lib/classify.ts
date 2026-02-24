import { OnboardingAnswers, StrategyMode } from '../types';

export function classifyMode(answers: OnboardingAnswers): StrategyMode {
  const { daily_hours, is_working_professional, attempt_number, study_approach, fallback_strategy } = answers;

  // Working professional override
  if (is_working_professional && daily_hours <= 5) {
    return 'working_professional';
  }

  let score = 0;
  // Higher score → more aggressive

  // Daily hours (strong signal)
  if (daily_hours >= 8) score += 3;
  else if (daily_hours >= 6) score += 1;
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
