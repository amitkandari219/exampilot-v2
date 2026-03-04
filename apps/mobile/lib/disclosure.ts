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

export const DASHBOARD_SECTIONS = {
  metricRow:     { fresher: 3,  veteran: 0 },
  examReadiness: { fresher: 8,  veteran: 0 },
  backlog:       { fresher: 3,  veteran: 0 },
  splitBar:      { fresher: 3,  veteran: 0 },
  navCards:      { fresher: 3,  veteran: 0 },
  activityFeed:  { fresher: 5,  veteran: 0 },
} as const;

type DashboardSectionId = keyof typeof DASHBOARD_SECTIONS;

export function isDashboardSectionUnlocked(sectionId: DashboardSectionId, daysUsed: number, isVeteran: boolean): boolean {
  const rule = DASHBOARD_SECTIONS[sectionId];
  const threshold = isVeteran ? rule.veteran : rule.fresher;
  return daysUsed >= threshold;
}
