import { OnboardingV2Answers, UserTargets, Challenge, StrategyMode } from '../types';

// Exam year options (current year + next 2)
export function getExamYearOptions(): Array<{ key: number; label: string }> {
  const currentYear = new Date().getFullYear();
  return [
    { key: currentYear, label: String(currentYear) },
    { key: currentYear + 1, label: String(currentYear + 1) },
    { key: currentYear + 2, label: String(currentYear + 2) },
  ];
}

// Attempt options with icons and motivational subtitles
export const attemptOptions = [
  { key: 'first' as const, label: 'First attempt', icon: '🌱', subtitle: 'Fresh start — exciting!' },
  { key: 'second' as const, label: 'Second attempt', icon: '💪', subtitle: 'Experience is your edge' },
  { key: 'third_plus' as const, label: 'Third or more', icon: '🔥', subtitle: 'Persistence wins' },
];

// User type options
export const userTypeOptions = [
  { key: 'student' as const, label: 'Full-time student', icon: '📚', subtitle: 'Dedicated preparation' },
  { key: 'working' as const, label: 'Working professional', icon: '💼', subtitle: 'Balancing job & prep' },
  { key: 'dropout' as const, label: 'Left job to prepare', icon: '🎯', subtitle: 'All-in commitment' },
  { key: 'repeater' as const, label: 'Full-time repeater', icon: '🔄', subtitle: 'Focused comeback' },
];

// Challenge options (multi-select, max 3)
export const challengeOptions: Array<{ key: Challenge; label: string; icon: string }> = [
  { key: 'time_management', label: 'Time management', icon: '⏰' },
  { key: 'consistency', label: 'Staying consistent', icon: '📅' },
  { key: 'syllabus_coverage', label: 'Covering the syllabus', icon: '📖' },
  { key: 'revision', label: 'Regular revision', icon: '🔁' },
  { key: 'answer_writing', label: 'Answer writing practice', icon: '✍️' },
  { key: 'motivation', label: 'Staying motivated', icon: '💡' },
  { key: 'optional_subject', label: 'Optional subject prep', icon: '📝' },
  { key: 'current_affairs', label: 'Current affairs coverage', icon: '📰' },
];

// Motivational responses per screen (shown via ChatBubble after user selects)
export const motivationalResponses: Record<string, Record<string, string>> = {
  attempt: {
    first: "First timers who plan well have the best conversion rates. Let's make it count!",
    second: 'Second attempt aspirants have the highest selection rate. Your experience is gold.',
    third_plus: "UPSC rewards persistence. Many toppers cleared after 3+ attempts. You've got this!",
  },
  usertype: {
    student: "Full-time prep gives you the best runway. Let's maximize every hour!",
    working: "Juggling work and UPSC is tough but doable. I'll optimize your limited hours.",
    dropout: "Bold move! That commitment energy is exactly what UPSC needs. Let's channel it.",
    repeater: "You know the drill. This time, let's add strategy to your experience.",
  },
};

// Value prop items based on challenges
export const valuePropItems: Record<Challenge, string> = {
  consistency: 'Daily smart plans that adapt to your pace',
  revision: 'FSRS-powered spaced repetition for 90%+ retention',
  answer_writing: 'Weekly answer writing targets with tracking',
  time_management: 'Velocity tracking to keep you on schedule',
  current_affairs: 'Daily CA tracker with subject gap alerts',
  motivation: 'XP system and streaks to keep you engaged',
  syllabus_coverage: 'Weighted syllabus coverage with PYQ analysis',
  optional_subject: 'Smart optional subject integration in your plan',
};

export const alwaysValueProps = [
  'Burnout detection and recovery mode',
  'Smart exam mode switching (Prelims/Mains)',
];

// Base targets by strategy mode
const modeBaseTargets: Record<StrategyMode, UserTargets> = {
  conservative: { daily_hours: 5, daily_new_topics: 1, weekly_revisions: 5, weekly_tests: 1, weekly_answer_writing: 2, weekly_ca_hours: 4 },
  balanced: { daily_hours: 7, daily_new_topics: 2, weekly_revisions: 4, weekly_tests: 1, weekly_answer_writing: 3, weekly_ca_hours: 5 },
  aggressive: { daily_hours: 10, daily_new_topics: 3, weekly_revisions: 3, weekly_tests: 2, weekly_answer_writing: 4, weekly_ca_hours: 7 },
  working_professional: { daily_hours: 4, daily_new_topics: 1, weekly_revisions: 2, weekly_tests: 1, weekly_answer_writing: 1, weekly_ca_hours: 3 },
};

export function getDefaultTargets(answers: OnboardingV2Answers, chosenMode: StrategyMode): UserTargets {
  const base = { ...(modeBaseTargets[chosenMode] || modeBaseTargets.balanced) };

  // Challenge-based adjustments
  if (answers.challenges.includes('revision')) base.weekly_revisions += 1;
  if (answers.challenges.includes('answer_writing')) base.weekly_answer_writing += 1;
  if (answers.challenges.includes('current_affairs')) base.weekly_ca_hours += 2;

  // Attempt-based adjustments
  if (answers.attempt_number === 'first') base.daily_new_topics += 1;
  if (answers.attempt_number === 'third_plus') base.weekly_tests += 1;

  return base;
}

// Promise templates
export const promiseTemplates = [
  'study for at least {hours} hours every day',
  'not skip revision days',
  'complete my daily plan before checking social media',
  'write at least {answers} answers every week',
];

export function getPromiseText(name: string, targets: UserTargets): string {
  return `I, ${name}, commit to:\n• Study for at least ${targets.daily_hours} hours every day\n• Not skip revision days\n• Complete my daily plan before distractions\n• Write at least ${targets.weekly_answer_writing} answers every week`;
}
