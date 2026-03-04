// Pure data — no imports. Plain English labels and helpers for all metrics.

export const METRIC_LABELS = {
  velocity: 'Study Pace',
  buffer: 'Safety Margin',
  streak: 'Day Streak',
  weakness: 'Weak Areas',
  gravity: 'Weighted Progress',
  coverage: 'Coverage',
  confidence: 'Confidence',
  consistency: 'Consistency',
  momentum: 'Momentum',
  hoursToday: 'Hrs Today',
  tasksDone: 'Tasks Done',
  revisionsDue: 'Revisions Due',
  answersToday: 'Answers Today',
  studyHealth: 'Study Health',
} as const;

export const METRIC_TOOLTIPS = {
  hoursToday: 'Total study time logged today from plan completions and quick logs.',
  tasksDone: 'Plan items you marked done today out of total scheduled.',
  streak: 'Consecutive days you completed at least one study task.',
  answersToday: 'Answer-writing practice sessions completed today (Mains prep).',
  revisionsDue: 'Topics whose memory is fading and need a quick review to stay fresh.',
  momentum: 'Composite 7-day score combining pace, consistency, and revision health.',
  velocity: 'How fast you are progressing vs. the ideal pace to finish before exam day.',
  buffer: 'Extra days of margin you have banked. Negative means you need to catch up.',
  coverage: 'Percentage of syllabus topics you have studied at least once.',
  confidence: 'Average memory strength across all topics you have reviewed.',
  consistency: 'How regularly you study — fewer gaps means higher consistency.',
  weakness: 'Score reflecting how well you handle your weakest topics.',
  gravity: 'Syllabus completion weighted by topic importance (PYQ frequency).',
  studyHealth: 'Overall study health score — higher means less stress.',
} as const;

export function humanizeVelocity(ratio: number): string {
  if (ratio >= 1.1) return 'Ahead of schedule';
  if (ratio >= 0.95) return 'On track';
  if (ratio >= 0.7) return 'Slightly behind';
  return 'Falling behind — prioritize high-weight topics';
}

export function humanizeBuffer(days: number): string {
  if (days >= 3) return 'Comfortable margin';
  if (days >= 1) return 'Thin margin — bank extra on good days';
  if (days >= 0) return 'No margin — one missed day puts you behind';
  return 'In debt — study extra to recover';
}

export function stressToHealth(score: number): { label: string; status: string } {
  if (score >= 70) return { label: 'Healthy', status: 'optimal' };
  if (score >= 45) return { label: 'Needs Attention', status: 'elevated' };
  if (score >= 25) return { label: 'Strained', status: 'risk_zone' };
  return { label: 'Recovery Needed', status: 'recovery_triggered' };
}
