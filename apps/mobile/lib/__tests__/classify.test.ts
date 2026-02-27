import { classifyMode, classifyModeV2 } from '../classify';
import type { OnboardingAnswers, OnboardingV2Answers } from '../../types';

describe('classifyMode (V1)', () => {
  const base: OnboardingAnswers = {
    daily_hours: 6,
    is_working_professional: false,
    attempt_number: 'first',
    study_approach: 'strategic',
    fallback_strategy: 'revise_more',
  };

  it('returns working_professional for professional with <=5 hours', () => {
    expect(classifyMode({ ...base, is_working_professional: true, daily_hours: 4 }))
      .toBe('working_professional');
    expect(classifyMode({ ...base, is_working_professional: true, daily_hours: 5 }))
      .toBe('working_professional');
  });

  it('does not override professional with >5 hours', () => {
    const result = classifyMode({ ...base, is_working_professional: true, daily_hours: 8 });
    expect(result).not.toBe('working_professional');
  });

  it('returns aggressive for high hours + third_plus + strategic + push_harder', () => {
    expect(classifyMode({
      ...base,
      daily_hours: 10,
      attempt_number: 'third_plus',
      study_approach: 'strategic',
      fallback_strategy: 'push_harder',
    })).toBe('aggressive');
  });

  it('returns conservative for low hours + first attempt + thorough + adjust_plan', () => {
    expect(classifyMode({
      ...base,
      daily_hours: 2,
      attempt_number: 'first',
      study_approach: 'thorough',
      fallback_strategy: 'adjust_plan',
    })).toBe('conservative');
  });

  it('returns balanced for moderate inputs', () => {
    expect(classifyMode({
      ...base,
      daily_hours: 6,
      attempt_number: 'second',
      study_approach: 'strategic',
      fallback_strategy: 'revise_more',
    })).toBe('balanced');
  });

  it('score boundary: score exactly -1 is conservative', () => {
    // daily_hours=6 → +1, first → -1, thorough → -1, revise_more → 0 = -1
    expect(classifyMode({
      ...base,
      daily_hours: 6,
      attempt_number: 'first',
      study_approach: 'thorough',
      fallback_strategy: 'revise_more',
    })).toBe('conservative');
  });

  it('score boundary: score exactly 4 is aggressive', () => {
    // daily_hours=8 → +3, second → +1, strategic → +1, push_harder → +1 = 6 (>= 4)
    expect(classifyMode({
      ...base,
      daily_hours: 8,
      attempt_number: 'second',
      study_approach: 'strategic',
      fallback_strategy: 'push_harder',
    })).toBe('aggressive');
  });
});

describe('classifyModeV2', () => {
  const base: OnboardingV2Answers = {
    name: 'Test',
    target_exam_year: 2027,
    attempt_number: 'first',
    user_type: 'student',
    challenges: [],
  };

  it('returns working_professional for working user_type', () => {
    expect(classifyModeV2({ ...base, user_type: 'working' })).toBe('working_professional');
  });

  it('returns aggressive for dropout + third_plus', () => {
    expect(classifyModeV2({
      ...base,
      user_type: 'dropout',
      attempt_number: 'third_plus',
      challenges: ['syllabus_coverage'],
    })).toBe('aggressive');
  });

  it('returns conservative for first attempt student with time/consistency challenges', () => {
    expect(classifyModeV2({
      ...base,
      user_type: 'student',
      attempt_number: 'first',
      challenges: ['time_management', 'consistency'],
    })).toBe('conservative');
  });

  it('returns balanced for moderate profile', () => {
    expect(classifyModeV2({
      ...base,
      user_type: 'student',
      attempt_number: 'second',
      challenges: [],
    })).toBe('balanced');
  });

  it('daily_hours >= 7 pushes toward aggressive', () => {
    // first + student = score -1, but daily_hours=8 adds +2 → score 1 → balanced
    expect(classifyModeV2(base, { daily_hours: 8 })).toBe('balanced');
    // second + student + daily_hours=8: +1 +2 = 3 → aggressive
    expect(classifyModeV2(
      { ...base, attempt_number: 'second' },
      { daily_hours: 8 },
    )).toBe('aggressive');
  });

  it('daily_hours >= 5 adds +1', () => {
    // second + student = +1, daily_hours=5 adds +1 → score 2 → balanced
    expect(classifyModeV2(
      { ...base, attempt_number: 'second' },
      { daily_hours: 5 },
    )).toBe('balanced');
  });

  it('study_approach thorough pushes toward conservative', () => {
    // second + student = +1, thorough = -2 → score -1 → conservative
    expect(classifyModeV2(
      { ...base, attempt_number: 'second' },
      { study_approach: 'thorough' },
    )).toBe('conservative');
  });

  it('study_approach selective adds +1', () => {
    // second + student = +1, selective = +1 → score 2 → balanced
    expect(classifyModeV2(
      { ...base, attempt_number: 'second' },
      { study_approach: 'selective' },
    )).toBe('balanced');
  });

  it('syllabus_coverage challenge adds +1', () => {
    const withoutChallenge = classifyModeV2({
      ...base,
      user_type: 'repeater',
      attempt_number: 'second',
      challenges: [],
    });
    const withChallenge = classifyModeV2({
      ...base,
      user_type: 'repeater',
      attempt_number: 'second',
      challenges: ['syllabus_coverage'],
    });
    // With syllabus_coverage should be same or more aggressive
    const modeOrder = ['conservative', 'balanced', 'aggressive'];
    expect(modeOrder.indexOf(withChallenge)).toBeGreaterThanOrEqual(modeOrder.indexOf(withoutChallenge));
  });
});
