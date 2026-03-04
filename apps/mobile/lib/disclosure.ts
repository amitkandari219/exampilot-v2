export const SCREEN_RULES = {
  revision:     { fresher: 3,  veteran: 0 },
  fullSyllabus: { fresher: 14, veteran: 0 },
  mocks:        { fresher: 7,  veteran: 0 },
  weeklyReview: { fresher: 7,  veteran: 0 },
  lowDay:       { fresher: 7,  veteran: 3 },
  ranker:       { fresher: 30, veteran: 0 },
} as const;

type ScreenId = keyof typeof SCREEN_RULES;

export function isScreenUnlocked(screenId: ScreenId, daysUsed: number, isVeteran: boolean): boolean {
  const rule = SCREEN_RULES[screenId];
  const threshold = isVeteran ? rule.veteran : rule.fresher;
  return daysUsed >= threshold;
}
