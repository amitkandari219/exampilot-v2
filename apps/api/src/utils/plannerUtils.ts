// Planner utility functions — extracted from planner.ts to stay under 700 LOC limit

interface TopicWithPapers {
  id: string;
  pyq_weight: number;
  pyq_years: number[] | null;
  chapters?: {
    subjects?: { name: string; papers: string[] };
  };
}

interface ProgressLike {
  strategy_locked_until?: string | null;
  confidence_status?: string | null;
}

interface ReasonContext {
  date: string;
  progressMap: Map<string, ProgressLike>;
  deferredTopicIds: Set<string>;
  blindSpotIds: Set<string>;
  falseSecurityIds: Set<string>;
  revisionTopicIds: Set<string>;
  pastWeakPapers: string[];
  timePressuredPapers: string[];
}

export function mapSubjectToPaper(subjectName: string): string {
  const lower = subjectName.toLowerCase();
  if (lower.includes('ethics') || lower.includes('integrity') || lower.includes('aptitude')) return 'GS-IV';
  if (lower.includes('essay')) return 'Essay';
  if (lower.includes('econom') || lower.includes('environment') || lower.includes('biodiversity') || lower.includes('ecology') || lower.includes('science') || lower.includes('technology') || lower.includes('security') || lower.includes('disaster')) return 'GS-III';
  if (lower.includes('polity') || lower.includes('governance') || lower.includes('international') || lower.includes('constitution') || lower.includes('social justice')) return 'GS-II';
  if (lower.includes('history') || lower.includes('culture') || lower.includes('society') || lower.includes('geography') || lower.includes('art')) return 'GS-I';
  return 'Optional';
}

function pyqYearsSuffix(topic: TopicWithPapers): string {
  const years = topic.pyq_years;
  if (!years || years.length === 0) return '';
  const recent = years.slice(-4).join(', ');
  return ` — asked ${recent} (${years.length} times)`;
}

export function computeReason(
  topic: TopicWithPapers,
  type: 'new' | 'revision',
  ctx: ReasonContext,
): string {
  const prog = ctx.progressMap.get(topic.id);

  if (prog?.strategy_locked_until && prog.strategy_locked_until >= ctx.date) {
    return 'Strategy locked — you pinned this topic for focused study';
  }
  if (ctx.deferredTopicIds.has(topic.id)) {
    return 'Rolled over from yesterday';
  }
  if (prog?.confidence_status === 'decayed') {
    return 'Memory fading — revision prevents full re-study';
  }
  if (prog?.confidence_status === 'stale') {
    return 'Starting to fade — revision before decay';
  }
  if (ctx.blindSpotIds.has(topic.id)) {
    return `Blind spot — high PYQ weight but not yet covered${pyqYearsSuffix(topic)}`;
  }
  if (ctx.falseSecurityIds.has(topic.id)) {
    return 'Mock scores low despite feeling familiar';
  }
  if (ctx.revisionTopicIds.has(topic.id) && type === 'revision') {
    return 'Spaced repetition says it\'s time to review';
  }
  // Past weakness from previous attempt
  const subjectName = topic.chapters?.subjects?.name || '';
  const paper = mapSubjectToPaper(subjectName);
  if (paper && ctx.pastWeakPapers.includes(paper)) {
    return 'Previous attempt weak area — extra focus recommended';
  }
  if (paper && ctx.timePressuredPapers.includes(paper)) {
    return 'Time-pressured paper — practice for speed and coverage';
  }
  if (topic.pyq_weight >= 4) {
    return `High exam frequency${pyqYearsSuffix(topic)}`;
  }
  const papers: string[] = topic.chapters?.subjects?.papers || [];
  if (papers.includes('Prelims') && papers.some(p => p.startsWith('GS-'))) {
    return 'Double value: helps both Prelims MCQs and Mains answers';
  }
  return 'Scheduled based on priority scoring and available time';
}
