# ExamPilot UX Transformation: Implementation Guide

> **Goal:** Fresher UX 4.5→9.0+ | Experienced UX 6.5→9.5
> **Approach:** 6 phases, 28 new files, 6 migrations, ~32 file edits
> **Architecture:** Follow ALL rules in CLAUDE.md strictly. Read it before starting.

---

## Architecture Rules Quick Reference (from CLAUDE.md)

1. **Thin Controllers** — Routes: validate → call service → return. No `supabase.from()`, no logic, no `try/catch` in routes. Route files < 60 LOC.
2. **Constants in thresholds.ts** — All tuning values go there. Zero imports in that file.
3. **Side Effects via Event Emitter** — Use `appEvents.emit()` from `events.ts`. Never directly import gamification/notification from business services.
4. **Types in shared-types** — Types used by both API and mobile go in `packages/shared-types/src/index.ts`.
5. **No `as any` in API** — Use `as unknown as TargetType` for Supabase inference issues.
6. **Dependency Direction** — Strict tier system. Never import upward. Dynamic imports to break cycles between Tier 3 peers.
7. **Planner Separation** — Generation in `planner.ts`, mutations in `planActions.ts`.
8. **Mobile Hooks for All Mutations** — Every API mutation through `useMutation()` React Query hook.
9. **Service Size Limits** — Service > 500 LOC: review. > 700 LOC: MUST decompose. Function > 60 LOC: extract helpers.

### Tier System
```
TIER 0: constants/, utils/
TIER 1: modeConfig, stress, benchmark, currentAffairs, syllabus, notification, pyq, resources, systemEvents, answerWriting, cohortBenchmark
TIER 2: fsrs, burnout, velocity, weakness, gamification, decayTrigger, recalibration, alerts
TIER 3: planner, planActions, simulator, strategy, mode, mockTest, weeklyReview, strategyCascade, endOfDay
TIER 4: events, cron, middleware
```

### Route Registration Pattern
```typescript
// apps/api/src/routes/newFeature.ts
import { FastifyInstance } from 'fastify';
import { serviceFunction } from '../services/myService.js';

export async function newFeatureRoutes(app: FastifyInstance) {
  app.get('/api/new-feature', async (request, reply) => {
    const result = await serviceFunction(request.userId);
    return reply.status(200).send(result);
  });
}
```
Then register in `apps/api/src/index.ts` — find the route registration block and add `app.register(newFeatureRoutes)`.

### Event Emitter Pattern
```typescript
// In events.ts EventMap interface, add:
'system:log': { userId: string; title: string; description: string; metadata?: Record<string, unknown> };

// Handler registration (bottom of events.ts):
appEvents.on('system:log', async (payload) => {
  try {
    const { logSystemEvent } = await import('./systemEvents.js');
    await logSystemEvent(payload);
  } catch (e) { console.warn('[events:system:log]', e); }
});

// Emit from any service:
appEvents.emit('system:log', { userId, title: 'Plan recalibrated', description: '...' });
```

### Mobile Hook Pattern
```typescript
export const useNewQuery = (param: string) => useQuery({
  queryKey: ['new-feature', param],
  queryFn: () => api.getNewFeature(param),
});
```

---

## Phase 1: Foundation — Plain Language + Tooltips + Dashboard Hierarchy

**Fresher impact: HIGH | Experienced impact: MEDIUM**
**Estimated: 3-5 days**

### 1A. Create `apps/mobile/lib/labelMap.ts` (NEW FILE)

Centralized human-readable labels for all metrics. Every UI component should import from here instead of hardcoding metric names.

```typescript
export const METRIC_LABELS = {
  velocity: {
    label: 'Study Pace',
    explanation: 'How fast you\'re covering the syllabus compared to the ideal pace for your exam date.',
  },
  buffer: {
    label: 'Safety Margin',
    explanation: 'Extra days you\'ve banked by studying ahead. Acts as a cushion for sick days or breaks.',
  },
  stress: {
    label: 'Preparation Health',
    explanation: 'Overall health of your preparation. Higher is better — combines pace, margin, coverage, and memory.',
  },
  confidence: {
    label: 'Memory Strength',
    explanation: 'How well you remember topics you\'ve studied. Decays over time without revision.',
  },
  coverage: {
    label: 'Syllabus Coverage',
    explanation: 'Percentage of syllabus topics you\'ve completed at least once.',
  },
  weakness: {
    label: 'Weak Areas',
    explanation: 'Topics where your memory has faded or mock test scores are low.',
  },
} as const;

export type MetricKey = keyof typeof METRIC_LABELS;

/** "1.1x" → "10% ahead of pace" */
export function humanizeVelocity(ratio: number): string {
  if (ratio >= 1.0) return `${Math.round((ratio - 1) * 100)}% ahead of pace`;
  return `${Math.round((1 - ratio) * 100)}% behind pace`;
}

/** 4.2 → "4 spare days" */
export function humanizeBuffer(balance: number): string {
  if (balance < 0) return `${Math.abs(Math.round(balance))} days in deficit`;
  return `${Math.round(balance)} spare days`;
}

/** Invert stress score to "health" for display (high = good) */
export function stressToHealth(stressScore: number): number {
  return 100 - stressScore;
}
```

### 1B. Replace Jargon Across UI

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

**StatBox labels (around line 97-101):**
- Change `"Velocity"` → `"Study Pace"` and value from `velocity_ratio.toFixed(2) + 'x'` → use `humanizeVelocity(velocity_ratio)` from labelMap
- Change `"Buffer"` → `"Safety Margin"` and value from `buffer.balance + 'd'` → use `humanizeBuffer(buffer.balance)` from labelMap

**Chart titles (around line 116-126):**
- Change `"Velocity (30d)"` → `"Study Pace (30d)"`
- Change `"Stress (7d)"` → `"Preparation Health (7d)"` — AND invert the data: `stressChartData.map(d => ({ ...d, value: 100 - d.value }))` so high = good

#### Edit `apps/mobile/app/(tabs)/index.tsx`

**ReadinessBar labels (around lines 248-252):**
- Change `"Velocity"` → `"Study Pace"`
- Change `"Weakness"` → `"Weak Areas"`

**V4Tip texts:** Find any V4Tip instances using jargon terms and replace with plain English equivalents.

#### Edit `apps/api/src/services/stress.ts`

**SIGNAL_RECOMMENDATIONS (lines 15-19):**
```typescript
const SIGNAL_RECOMMENDATIONS: Record<SignalName, string> = {
  velocity: 'Your study pace is the weakest signal. Focus on completing high-priority topics to close the pace gap.',
  buffer: 'Your safety margin is the weakest signal. Build surplus on good days — even small deposits compound over time.',
  time: 'Your completion gap vs timeline is the weakest signal. Prioritize high PYQ-weight topics for maximum exam impact.',
  confidence: 'Topic memory strength is the weakest signal. Schedule quick revisions for fading topics before they decay further.',
};
```

### 1C. Tooltip "?" on Every Metric

#### Edit `apps/mobile/components/v4/V4MetricBox.tsx`

Current interface (line 5-10):
```typescript
interface V4MetricBoxProps {
  value: string | number;
  label: string;
  sublabel?: string;
  valueColor?: string;
}
```

Add `tooltip?: string` prop. When set, render a small "?" icon (TouchableOpacity) that toggles a `V4Tip` component below the metric box. Import `V4Tip` from the existing V4 components.

```typescript
interface V4MetricBoxProps {
  value: string | number;
  label: string;
  sublabel?: string;
  valueColor?: string;
  tooltip?: string;  // NEW
}
```

Implementation: Add `const [showTip, setShowTip] = useState(false)` inside the component. After the label text, conditionally render `<TouchableOpacity onPress={() => setShowTip(!showTip)}><Text>?</Text></TouchableOpacity>`. Below the container, if `showTip && tooltip`, render `<V4Tip text={tooltip} />`.

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Add `tooltip={METRIC_LABELS.xxx.explanation}` to all V4MetricBox instances in the metric rows (lines 169-217). Import `METRIC_LABELS` from `../../lib/labelMap`.

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

Add tooltips to StatBox instances or convert them to use V4MetricBox with tooltips.

### 1D. 3-Tier Progressive Dashboard

#### Edit `apps/mobile/lib/disclosure.ts`

Current file has only `SCREEN_RULES` for navigation. Add dashboard-level section rules:

```typescript
export const DASHBOARD_SECTIONS = {
  metricRow:     { fresher: 3,  veteran: 0 },
  examReadiness: { fresher: 8,  veteran: 0 },
  activityFeed:  { fresher: 7,  veteran: 0 },
  backlogCard:   { fresher: 3,  veteran: 0 },
} as const;

type DashboardSection = keyof typeof DASHBOARD_SECTIONS;

export function isDashboardSectionVisible(section: DashboardSection, daysUsed: number, isVeteran: boolean): boolean {
  const rule = DASHBOARD_SECTIONS[section];
  const threshold = isVeteran ? rule.veteran : rule.fresher;
  return daysUsed >= threshold;
}
```

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Wrap sections with `isDashboardSectionVisible` guards:

- **Day 1-2 freshers**: Show ONLY header + hero "START HERE" card + single summary line ("You studied X.X hrs. Y/Z tasks done.") + planner link. Hide everything else.
- **Day 3-7**: Add metric row (lines 169-217) and backlog card. Still hide exam readiness and activity feed.
- **Day 8+**: Full dashboard (current behavior).

Wrap the metric rows (lines 169-217) in:
```typescript
{isDashboardSectionVisible('metricRow', daysUsed, isVeteran) && (
  <View style={styles.metricRow}>...</View>
)}
```

Similarly wrap exam readiness section (around lines 237-259) with `examReadiness` check.

---

## Phase 2: Transparency — Reason Field + Full Plan View + Activity Feed + Actual Hours

**Fresher impact: HIGH | Experienced impact: HIGH**
**Estimated: 6-8 days**

### 2A. "Why This Topic" Reason on Plan Items

#### Migration: `supabase/migrations/040_plan_item_reason.sql`

```sql
ALTER TABLE daily_plan_items ADD COLUMN reason TEXT;
```

#### Edit `packages/shared-types/src/index.ts`

Add to `DailyPlanItem` interface (around line 313-324):
```typescript
reason?: string | null;
```

#### Edit `apps/api/src/services/planner.ts`

**Add `computeReason()` function** (new function, keep under 60 LOC):

```typescript
function computeReason(topic: TopicWithJoins, type: string, ctx: PlannerContext): string {
  if (type === 'decay_revision') return 'Memory fading — revision needed to prevent forgetting';
  if (type === 'revision') return 'Scheduled revision to strengthen retention';

  const reasons: string[] = [];
  if (topic.pyq_weight >= 3) reasons.push(`High exam frequency (PYQ weight: ${topic.pyq_weight})`);
  if (/* topic is from deferred list */) reasons.push('Rolled over from yesterday');
  if (/* topic matches mock weakness */) reasons.push('Weak area identified from mock tests');
  if (/* topic matches radar blind spot */) reasons.push('Blind spot — not yet covered');

  return reasons.length > 0 ? reasons[0] : 'Prioritized by syllabus coverage needs';
}
```

**Call in `allocateGreedy`** when building PlanItem objects — add `reason: computeReason(candidate.topic, candidate.type, ctx)` to the PlanItem.

**Include in `formatPlan`** output — ensure `reason` is included in the items array response.

#### Edit `apps/mobile/app/(tabs)/planner.tsx`

In `renderTaskCard` (line 128), after the topic name Text, add:
```typescript
{item.reason && (
  <Text style={{ fontSize: 11, color: theme.colors.textMuted, fontStyle: 'italic', marginTop: 2 }}>
    {item.reason}
  </Text>
)}
```

### 2B. Actual Hours from Timer

#### Edit `apps/mobile/app/(tabs)/planner.tsx`

Change `handleComplete` (lines 98-101) from silently using estimated_hours to showing a quick Alert:

```typescript
const handleComplete = (itemId: string) => {
  const item = plan?.items?.find(i => i.id === itemId);
  const estMinutes = Math.round((item?.estimated_hours || 1) * 60);

  Alert.alert(
    'How long did you study?',
    `Estimated: ~${estMinutes} min`,
    [
      { text: `~${estMinutes} min`, onPress: () => completeMutation.mutate({ itemId, actualHours: item?.estimated_hours || 1 }) },
      { text: 'Less (half)', onPress: () => completeMutation.mutate({ itemId, actualHours: (item?.estimated_hours || 1) * 0.5 }) },
      { text: 'More (1.5x)', onPress: () => completeMutation.mutate({ itemId, actualHours: (item?.estimated_hours || 1) * 1.5 }) },
    ]
  );
};
```

### 2C. System Activity Feed

#### Migration: `supabase/migrations/041_system_events.sql`

```sql
CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_events_user_created ON system_events(user_id, created_at DESC);

ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own events" ON system_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert" ON system_events FOR INSERT WITH CHECK (true);
```

#### Edit `apps/api/src/services/events.ts`

Add to `EventMap` interface (around line 6-9):
```typescript
'system:log': { userId: string; title: string; description: string; metadata?: Record<string, unknown> };
```

Add handler at bottom of file:
```typescript
appEvents.on('system:log', async (payload) => {
  try {
    const { logSystemEvent } = await import('./systemEvents.js');
    await logSystemEvent(payload);
  } catch (e) { console.warn('[events:system:log]', e); }
});
```

#### Create `apps/api/src/services/systemEvents.ts` (NEW FILE — Tier 1)

```typescript
import { supabase } from '../lib/supabase.js';

export async function logSystemEvent(params: {
  userId: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  await supabase.from('system_events').insert({
    user_id: params.userId,
    event_type: 'system:log',
    title: params.title,
    description: params.description,
    metadata: params.metadata || {},
  });
}

export async function getRecentEvents(userId: string, limit = 20) {
  const { data } = await supabase
    .from('system_events')
    .select('id, event_type, title, description, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}
```

#### Create `apps/api/src/routes/systemEvents.ts` (NEW FILE)

```typescript
import { FastifyInstance } from 'fastify';
import { getRecentEvents } from '../services/systemEvents.js';

export async function systemEventRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { limit?: number } }>('/api/system-events', async (request, reply) => {
    const limit = request.query.limit || 20;
    const events = await getRecentEvents(request.userId, limit);
    return reply.status(200).send(events);
  });
}
```

Register in `apps/api/src/index.ts`.

#### Edit `apps/api/src/services/recalibration.ts`

After the `recalibration_log` insert (around line 419), add:
```typescript
appEvents.emit('system:log', {
  userId,
  title: 'Study plan recalibrated',
  description: `Your study parameters were adjusted based on ${daysAnalyzed} days of data.`,
  metadata: { type: 'recalibration', params_changed: paramsChanged },
});
```

#### Edit `apps/api/src/services/burnout.ts`

After recovery mode activation (around line 175 in `activateRecoveryMode`):
```typescript
appEvents.emit('system:log', {
  userId,
  title: 'Recovery mode activated',
  description: 'Your study load has been reduced to help you recover. Focus on light revision.',
  metadata: { type: 'recovery_enter' },
});
```

After recovery exit (around line 217 in `exitRecoveryMode`):
```typescript
appEvents.emit('system:log', {
  userId,
  title: 'Recovery mode ended',
  description: 'You\'re back to normal study load. Great job recovering!',
  metadata: { type: 'recovery_exit' },
});
```

#### Create `apps/mobile/hooks/useSystemEvents.ts` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useSystemEvents = (limit = 20) => useQuery({
  queryKey: ['system-events', limit],
  queryFn: () => api.getSystemEvents(limit),
  staleTime: 5 * 60 * 1000,
});
```

Add `getSystemEvents` to the api client in `apps/mobile/lib/api.ts`.

#### Create `apps/mobile/components/dashboard/ActivityFeed.tsx` (NEW FILE)

V4Card listing recent system events with timestamps. Use `useSystemEvents` hook. Show relative timestamps ("2 hours ago", "yesterday"). Gate visibility: day 7+ for freshers, day 0 for veterans (use `isDashboardSectionVisible('activityFeed', ...)`).

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Add `<ActivityFeed />` component, gated by `isDashboardSectionVisible('activityFeed', daysUsed, isVeteran)`, placed after the exam readiness section.

### 2D. "Your Full Study Plan" — Long-Term Plan Visibility

**This is a critical trust-building feature.** Currently the planner only shows today's 5-6 tasks. Users have zero visibility into how the system plans to cover 466 topics across 8 subjects before exam day. This makes the algorithm feel like a black box.

**Where it lives:** NOT a separate tab. Add a "View Full Plan" button on the planner tab (below the capacity card) that opens a dedicated screen. Also add a smaller link on the dashboard hero card.

#### New Screen: `apps/mobile/app/study-plan.tsx` (NEW FILE)

A scrollable screen with 4 sections:

**Section 1: Overall Timeline**
- Big headline: "Projected to finish by [date]" (from `calculateVelocity` → `projected_completion_date`)
- Visual bar: exam date on right, today marker, projected finish marker
- Status badge: "On Track" / "Behind" / "Ahead" based on velocity status
- Days remaining countdown
- If projected date is AFTER exam: show red warning with deficit days

**Section 2: Subject-by-Subject Breakdown**
- For each active subject, a card showing:
  - Subject name
  - Progress bar: `completed_topics / total_topics` (from `getUserProgress`)
  - PYQ-weighted completion %
  - Projected finish date for THIS subject (from new `getSubjectProjections` service)
  - Topics remaining count
  - Average confidence across completed topics
  - If sequential mode: highlight current focus subject with "Currently focusing" badge
- Sorted by: current focus subject first, then by projected finish date (latest first = most at risk)

**Section 3: Revision Calendar Preview**
- Shows next 7 days of upcoming revisions (from `getRevisionsDue` → upcoming + next week)
- Each day: count of revisions + topic names
- "View Full Calendar" link → opens month view using `getRevisionsCalendar`
- Color-coded: days with 5+ revisions shown in orange (heavy day), 8+ in red

**Section 4: "What If" Quick Actions**
- 3 quick simulator scenarios with one-tap access:
  - "What if I take 3 days off?" → calls `runSimulation({ type: 'skip_days', days: 3 })`
  - "What if I study 2 more hours/day?" → calls `runSimulation({ type: 'change_hours', hours: currentHours + 2 })`
  - "What if I focus on [weakest subject] for a week?" → calls `runSimulation({ type: 'focus_subject', ... })`
- Each shows: verdict (green/yellow/red pill), one-line impact summary
- "Explore More Scenarios" link → opens full simulator screen

#### New Service: `apps/api/src/services/studyPlanOverview.ts` (NEW FILE — Tier 1)

```typescript
import { supabase } from '../lib/supabase.js';
import { toDateString, daysUntil } from '../utils/dateUtils.js';

interface SubjectProjection {
  subject_id: string;
  subject_name: string;
  total_topics: number;
  completed_topics: number;
  completion_pct: number;
  weighted_completion_pct: number;
  avg_confidence: number;
  remaining_gravity: number;
  projected_finish_date: string | null;
  days_to_finish: number | null;
  is_focus_subject: boolean;
}

interface StudyPlanOverview {
  overall: {
    projected_completion_date: string | null;
    velocity_status: string;
    velocity_ratio: number;
    days_remaining: number;
    total_topics: number;
    completed_topics: number;
    weighted_completion_pct: number;
  };
  subjects: SubjectProjection[];
  revision_preview: {
    date: string;
    count: number;
    topics: { name: string; pyq_weight: number }[];
  }[];
}

export async function getStudyPlanOverview(userId: string): Promise<StudyPlanOverview> {
  // 1. Fetch velocity data (has overall projected_completion_date)
  // Use: calculateVelocity(userId) or read latest velocity_snapshot

  // 2. Fetch per-subject progress (getUserProgress gives subject-level aggregates)
  // Each subject has: total_topics, completed_topics, weighted_completion

  // 3. Compute per-subject projected finish dates:
  //    - For each subject: remaining_gravity = sum of (pyq_weight × difficulty) for uncompleted topics
  //    - subject_velocity = global_actual_velocity × (subject_remaining_gravity / total_remaining_gravity)
  //    - days_to_finish = subject_remaining_gravity / subject_velocity
  //    - projected_finish_date = today + days_to_finish

  // 4. Fetch revision preview for next 7 days
  //    - Use getRevisionsDue() for today + query fsrs_cards for next 7 days

  // 5. Check if sequential mode → mark focus subject

  return { overall, subjects, revision_preview };
}
```

**Key computation for per-subject projections:**
```typescript
// Global velocity from velocity_snapshots
const globalVelocity = latestSnapshot.actual_velocity_7d;

// Per subject
for (const subject of subjects) {
  const remainingGravity = subject.topics
    .filter(t => !['first_pass', 'revised', 'exam_ready'].includes(t.status))
    .reduce((sum, t) => sum + t.pyq_weight * t.difficulty, 0);

  if (globalVelocity > 0 && remainingGravity > 0) {
    const daysToFinish = Math.ceil(remainingGravity / globalVelocity);
    subject.projected_finish_date = addDays(new Date(), daysToFinish);
    subject.days_to_finish = daysToFinish;
  }
}
```

#### New Route: `apps/api/src/routes/studyPlanOverview.ts` (NEW FILE)

```typescript
import { FastifyInstance } from 'fastify';
import { getStudyPlanOverview } from '../services/studyPlanOverview.js';

export async function studyPlanOverviewRoutes(app: FastifyInstance) {
  app.get('/api/study-plan-overview', async (request, reply) => {
    const overview = await getStudyPlanOverview(request.userId);
    return reply.status(200).send(overview);
  });
}
```

Register in `apps/api/src/index.ts`.

#### New Hook: `apps/mobile/hooks/useStudyPlanOverview.ts` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useStudyPlanOverview = () => useQuery({
  queryKey: ['study-plan-overview'],
  queryFn: () => api.getStudyPlanOverview(),
  staleTime: 30 * 60 * 1000, // 30 min — doesn't change frequently
});
```

Add `getStudyPlanOverview` to `apps/mobile/lib/api.ts`.

#### Edit `apps/mobile/app/(tabs)/planner.tsx`

Add a "View Full Study Plan" button below the capacity card (after the `availableHoursCard` section, before the task list):

```typescript
<TouchableOpacity
  style={[styles.fullPlanButton, { borderColor: theme.colors.accent + '44' }]}
  onPress={() => router.push('/study-plan')}
>
  <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '600' }}>
    View Full Study Plan →
  </Text>
  <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}>
    See how every subject gets covered before your exam
  </Text>
</TouchableOpacity>
```

#### Edit `apps/mobile/app/_layout.tsx`

Add the new screen to the Stack navigator:
```typescript
<Stack.Screen name="study-plan" options={{ presentation: 'modal' }} />
```

#### Edit `apps/mobile/app/(tabs)/index.tsx`

On the hero "START HERE" card, add a small link: "How will I cover everything?" → navigates to `/study-plan`. This is especially important for freshers who are anxious about the vast syllabus.

#### Types: Edit `packages/shared-types/src/index.ts`

Add:
```typescript
export interface SubjectProjection {
  subject_id: string;
  subject_name: string;
  total_topics: number;
  completed_topics: number;
  completion_pct: number;
  weighted_completion_pct: number;
  avg_confidence: number;
  remaining_gravity: number;
  projected_finish_date: string | null;
  days_to_finish: number | null;
  is_focus_subject: boolean;
}

export interface StudyPlanOverview {
  overall: {
    projected_completion_date: string | null;
    velocity_status: string;
    velocity_ratio: number;
    days_remaining: number;
    total_topics: number;
    completed_topics: number;
    weighted_completion_pct: number;
  };
  subjects: SubjectProjection[];
  revision_preview: {
    date: string;
    count: number;
    topics: { name: string; pyq_weight: number }[];
  }[];
}
```

---

## Phase 3: Emotional Layer — Welcome-Back, Guided Journey, Warm States

**Fresher impact: HIGH | Experienced impact: MEDIUM**
**Estimated: 3-4 days**

### 3A. Welcome-Back Banner

#### Create `apps/mobile/components/dashboard/WelcomeBackBanner.tsx` (NEW FILE)

Props: `missedDays: number`, `bufferBalance: number`

Display: "Welcome back! You missed {X} days. Plan adjusted — you still have {Y} safety margin days. Let's go!"

Use V4Card with accent border. Include a dismiss button that stores dismissal in AsyncStorage for the current day.

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Detect missed days: if `streak.current_count === 0 && daysUsed > 1`, compute missed days from last activity. Show `<WelcomeBackBanner>` before the hero START HERE card.

### 3B. Guided Day 1-3 Journey Card

#### Create `apps/mobile/components/dashboard/GuidedJourneyCard.tsx` (NEW FILE)

Day-specific checklists with AsyncStorage tracking:

- **Day 1**: "Open planner → Start first topic → Mark complete" (3 checkboxes)
- **Day 2**: "Complete 2 topics → Check revisions tab" (2 checkboxes)
- **Day 3**: "Check Progress tab → Finish all planned tasks" (2 checkboxes)

Each checkbox persisted to `AsyncStorage` key `journey_day_{N}_step_{M}`. When all steps for a day complete, show brief celebration animation.

Use V4Card with accent border, title "Your Journey — Day {N}".

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Replace the welcome card block (around lines 128-135, the `daysUsed <= 3` section) with `<GuidedJourneyCard day={daysUsed} />` for freshers only (`!isVeteran && daysUsed <= 3`).

### 3C. Warm Empty States

#### Create `apps/mobile/components/common/WarmEmptyState.tsx` (NEW FILE)

Reusable component:
```typescript
interface WarmEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

Centered layout with title (18px bold), message (14px muted), optional action button.

#### Edit `apps/mobile/app/(tabs)/planner.tsx`

Replace empty state text (lines 295-299):
- Old: "No study items for today" / "Your plan will generate automatically"
- New: Use `<WarmEmptyState title="Your study plan is being prepared..." message="Check back in a moment — we're crafting today's optimal study schedule." />`

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

**Mock empty state (lines 169-174):**
- Old: "No mock tests recorded yet"
- New: `<WarmEmptyState title="Ready for your first mock?" message="Recording mock scores helps us find your weak spots and sharpen your strategy." actionLabel="Record Mock" onAction={() => /* navigate to mock entry */} />`

**Day 1-2 freshers (new guard):**
For `daysUsed < 3 && !isVeteran`: Show only overall progress ring + `<WarmEmptyState title="Analytics loading..." message="Keep studying for a few days to see detailed analytics here. Every session counts!" />`

### 3D. Celebration Variations

#### Edit `apps/mobile/app/(tabs)/planner.tsx`

Replace static celebration text (lines 322-327) with streak-aware messages:

```typescript
{allDone && (
  <View style={styles.celebration}>
    <Text style={styles.celebrationText}>
      {streak > 3 ? `${streak} days in a row! Strong momentum.` :
       streak === 1 ? 'First day conquered! The hardest part is starting.' :
       'All done for today!'}
    </Text>
    <Text style={styles.celebrationSub}>
      {streak > 7 ? 'You\'re building an unstoppable habit.' :
       streak > 3 ? 'Consistency is your superpower.' :
       'Great work. Rest well.'}
    </Text>
  </View>
)}
```

---

## Phase 4: Fresher-Specific — Resource Guidance + Simplified First Week

**Fresher impact: HIGH | Experienced impact: LOW**
**Estimated: 4-5 days**

### 4A. Topic Resource Guidance

#### Migration: `supabase/migrations/042_topic_resources.sql`

```sql
CREATE TABLE topic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES syllabus_topics(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('book', 'video', 'notes', 'website')),
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topic_resources_topic ON topic_resources(topic_id, display_order);

ALTER TABLE topic_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read resources" ON topic_resources FOR SELECT USING (true);

-- Seed data for top PYQ-weight topics
-- Add INSERT statements for key topics:
-- Polity: Laxmikanth chapters
-- Geography: NCERT Class 11-12
-- History: Spectrum, Bipin Chandra
-- Economy: Ramesh Singh, Indian Economy by Sanjeev Verma
-- Environment: Shankar IAS
-- Science & Tech: Current affairs based
-- Ethics: Lexicon, previous year papers
```

Add seed INSERT statements for at least the top 50 PYQ-weight topics. Query `syllabus_topics` to find them: `SELECT id, name, pyq_weight FROM syllabus_topics ORDER BY pyq_weight DESC LIMIT 50`.

#### Create `apps/api/src/services/resources.ts` (NEW FILE — Tier 1)

```typescript
import { supabase } from '../lib/supabase.js';

export async function getTopicResources(topicId: string) {
  const { data } = await supabase
    .from('topic_resources')
    .select('id, resource_type, title, source_name, url, display_order')
    .eq('topic_id', topicId)
    .order('display_order', { ascending: true });

  return data || [];
}
```

#### Create `apps/api/src/routes/resources.ts` (NEW FILE)

```typescript
import { FastifyInstance } from 'fastify';
import { getTopicResources } from '../services/resources.js';

export async function resourceRoutes(app: FastifyInstance) {
  app.get<{ Params: { topicId: string } }>('/api/topics/:topicId/resources', async (request, reply) => {
    const resources = await getTopicResources(request.params.topicId);
    return reply.status(200).send(resources);
  });
}
```

Register in `apps/api/src/index.ts`.

#### Create `apps/mobile/hooks/useResources.ts` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useTopicResources = (topicId: string) => useQuery({
  queryKey: ['topic-resources', topicId],
  queryFn: () => api.getTopicResources(topicId),
  enabled: !!topicId,
});
```

Add `getTopicResources` to api client.

#### Edit `apps/mobile/components/syllabus/TopicRow.tsx`

In the `topRow` View (lines 66-77), add a small book badge before `<PYQBadge>`:
```typescript
{/* After HealthBadge, before PYQBadge */}
<TouchableOpacity onPress={() => router.push(`/topic-detail?id=${topic.id}`)}>
  <Text style={{ fontSize: 12 }}>📚</Text>
</TouchableOpacity>
```

#### Edit `apps/mobile/app/topic-detail.tsx`

Currently a stub ("Coming Soon"). Build it out:
- Read `topicId` from route params
- Fetch topic details and resources using hooks
- Display: topic name, subject, chapter, PYQ weight, confidence score, last reviewed date
- Add "Recommended Resources" section using `useTopicResources(topicId)` — list each resource with type icon, title, source name, and optional link

### 4B. Simplified First-Week Progress Tab

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

At the top of the render, add early return for new freshers:

```typescript
if (daysUsed < 3 && !isVeteran) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Simple overall progress ring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          {/* Single circular progress indicator showing overall completion % */}
          <WarmEmptyState
            title="Analytics unlocking soon"
            message="Keep studying for a few days to see detailed charts and insights here. Every session helps us understand your patterns better."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Phase 5: Experienced-Specific — Past Attempts, Deep Mock, Answer Writing

**Fresher impact: LOW | Experienced impact: HIGH**
**Estimated: 7-10 days**

### 5A. Past Attempt Intake in Onboarding

#### Migration: `supabase/migrations/043_past_attempt_data.sql`

```sql
ALTER TABLE user_profiles ADD COLUMN past_attempt_data JSONB;

COMMENT ON COLUMN user_profiles.past_attempt_data IS 'For 2nd+ attempt users: { prelims_score, mains_weakest_papers, biggest_challenge }';
```

#### Edit `packages/shared-types/src/index.ts`

Add to `OnboardingV2Payload` (around line 77-84):
```typescript
past_attempt_data?: {
  prelims_score?: number;        // 0-200 slider
  mains_weakest_papers?: string[]; // e.g. ['gs1', 'gs2', 'essay']
  biggest_challenge?: string;     // 'time_management' | 'answer_writing' | 'revision' | 'motivation'
} | null;
```

#### Create `apps/mobile/app/onboarding/past-attempt.tsx` (NEW FILE)

Only shown when `attempt_number >= 2`. Screen with:
1. **Prelims score slider** (0-200) — "What was your best Prelims score?"
2. **Weakest Mains papers** multi-select — GS1, GS2, GS3, GS4, Essay, Optional
3. **Biggest challenge** single-select — Time Management, Answer Writing, Revision Consistency, Motivation

Follow existing onboarding pattern: `<QuestionScreen step={N} totalSteps={7}>` + navigation via `router.push`.

#### Edit `apps/mobile/app/onboarding/complete.tsx`

Include `past_attempt_data` in the payload assembly (around line 63-104):
```typescript
const payload: OnboardingV2Payload = {
  answers, chosen_mode: chosenMode, targets, exam_date: examDate,
  study_approach: params.study_approach || 'mixed',
  weak_subjects: weakSubjects,
  past_attempt_data: params.past_attempt_data ? JSON.parse(params.past_attempt_data) : undefined,
};
```

Also update the onboarding flow to route through `past-attempt.tsx` when `attempt_number >= 2` — check in the step before `complete.tsx`.

#### Edit `apps/api/src/services/strategy.ts`

In `completeOnboardingV2` (lines 105-208), after the profile upsert:
- Store `past_attempt_data` in the user_profiles upsert
- If `past_attempt_data.mains_weakest_papers` is provided, seed the weakness radar: for each paper, find associated subjects and boost their weakness scores

### 5B. Deep Mock Analysis

#### Edit `apps/api/src/services/mockTest.ts`

Enhance `getMockAnalytics` (lines 329-419) to return additional fields:

```typescript
// Add to the return object:
deep_analysis: tests_count >= 2 ? {
  negative_marking_impact: /* compute total marks lost to wrong answers */,
  attempt_rate: /* (questions_attempted / total_questions) * 100 */,
  cutoff_trajectory: /* array of { test_date, score, estimated_cutoff } */,
  topic_gaps: /* weakest_topics with specific advice instead of generic */,
} : null,
```

For `topic_gaps`, replace generic recommendations with specific ones:
- "You scored 30% in Constitutional Bodies — revise Laxmikanth Ch. 20-25"
- "Geography physical scored 25% — focus on geomorphology and climatology"

#### Edit `packages/shared-types/src/index.ts`

Add interface:
```typescript
export interface DeepMockAnalysis {
  negative_marking_impact: number;
  attempt_rate: number;
  cutoff_trajectory: { test_date: string; score: number; estimated_cutoff: number }[];
  topic_gaps: { topic: string; accuracy: number; advice: string }[];
}
```

Add `deep_analysis?: DeepMockAnalysis | null` to `MockAnalytics`.

#### Create `apps/mobile/components/mock/DeepAnalysisCard.tsx` (NEW FILE)

V4Card that renders:
- Negative marking impact (red if > 10% of total)
- Attempt rate bar
- Cutoff trajectory chart (line chart: your score vs cutoff line)
- Top 5 topic gaps with specific advice

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

After `MockSummaryCard`, add:
```typescript
{mockAnalytics?.deep_analysis && (
  <DeepAnalysisCard analysis={mockAnalytics.deep_analysis} />
)}
```

### 5C. Answer Writing Tracker

#### Migration: `supabase/migrations/044_answer_writing.sql`

```sql
CREATE TABLE answer_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES syllabus_topics(id),
  question_text TEXT,
  word_count INT,
  time_taken_minutes INT,
  self_score INT CHECK (self_score BETWEEN 1 AND 10),
  practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_answer_practice_user_date ON answer_practice(user_id, practice_date DESC);

ALTER TABLE answer_practice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own answers" ON answer_practice FOR ALL USING (auth.uid() = user_id);
```

#### Create `apps/api/src/services/answerWriting.ts` (NEW FILE — Tier 1)

```typescript
import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';

export async function logAnswer(userId: string, data: {
  topicId?: string;
  questionText?: string;
  wordCount?: number;
  timeTakenMinutes?: number;
  selfScore?: number;
}) {
  const { data: result } = await supabase
    .from('answer_practice')
    .insert({
      user_id: userId,
      topic_id: data.topicId,
      question_text: data.questionText,
      word_count: data.wordCount,
      time_taken_minutes: data.timeTakenMinutes,
      self_score: data.selfScore,
      practice_date: toDateString(new Date()),
    })
    .select()
    .single();

  return result;
}

export async function getAnswerStats(userId: string) {
  const today = toDateString(new Date());

  const [todayRes, totalRes, avgRes] = await Promise.all([
    supabase.from('answer_practice').select('id', { count: 'exact' })
      .eq('user_id', userId).eq('practice_date', today),
    supabase.from('answer_practice').select('id', { count: 'exact' })
      .eq('user_id', userId),
    supabase.from('answer_practice').select('self_score, word_count')
      .eq('user_id', userId).gt('self_score', 0),
  ]);

  const scores = avgRes.data || [];
  const avgScore = scores.length > 0
    ? scores.reduce((s, r) => s + r.self_score, 0) / scores.length : 0;
  const avgWordCount = scores.length > 0
    ? scores.reduce((s, r) => s + (r.word_count || 0), 0) / scores.length : 0;

  return {
    today_count: todayRes.count || 0,
    total_count: totalRes.count || 0,
    avg_self_score: Math.round(avgScore * 10) / 10,
    avg_word_count: Math.round(avgWordCount),
  };
}
```

#### Create `apps/api/src/routes/answerWriting.ts` (NEW FILE)

```typescript
import { FastifyInstance } from 'fastify';
import { logAnswer, getAnswerStats } from '../services/answerWriting.js';

export async function answerWritingRoutes(app: FastifyInstance) {
  app.get('/api/answer-writing/stats', async (request, reply) => {
    const stats = await getAnswerStats(request.userId);
    return reply.status(200).send(stats);
  });

  app.post<{
    Body: { topicId?: string; questionText?: string; wordCount?: number; timeTakenMinutes?: number; selfScore?: number };
  }>('/api/answer-writing', async (request, reply) => {
    const result = await logAnswer(request.userId, request.body);
    return reply.status(201).send(result);
  });
}
```

Register in `apps/api/src/index.ts`.

#### Create `apps/mobile/hooks/useAnswerWriting.ts` (NEW FILE)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAnswerStats = () => useQuery({
  queryKey: ['answer-stats'],
  queryFn: () => api.getAnswerStats(),
});

export const useLogAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { topicId?: string; questionText?: string; wordCount?: number; timeTakenMinutes?: number; selfScore?: number }) =>
      api.logAnswer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['answer-stats'] }),
  });
};
```

Add `getAnswerStats` and `logAnswer` to api client.

#### Create `apps/mobile/components/answer/AnswerEntrySheet.tsx` (NEW FILE)

Bottom sheet (or modal) with:
- Optional topic selector (from syllabus)
- Question text input (optional)
- Word count input
- Time taken (minutes)
- Self score slider (1-10)
- Submit button

#### Create `apps/mobile/components/answer/AnswerStatsCard.tsx` (NEW FILE)

V4Card showing: today's count, total count, avg self-score, avg word count. Include a "+" button to open AnswerEntrySheet.

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Wire up "answers today" metric (around line 182) — currently shows `"—"` with `"coming soon"`. Replace with real data from `useAnswerStats`:
```typescript
<V4MetricBox value={answerStats?.today_count || 0} label="answers today"
  sublabel={`${answerStats?.total_count || 0} total`} valueColor={theme.colors.purple} />
```

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

In Mains mode, add `<AnswerStatsCard />` after the existing stats sections.

### 5D. Selective Revision for Repeaters

#### Edit `apps/api/src/constants/thresholds.ts`

Add to the `PLANNER` object:
```typescript
PAST_WEAKNESS_BOOST: 4,
```

#### Edit `apps/api/src/services/planner.ts`

In `fetchPlannerData` — add `past_attempt_data` to the profile select query:
```typescript
// In the user_profiles select, add past_attempt_data to the fields
.select('..., past_attempt_data')
```

In `scoreTopic` — add boost for past attempt weak papers:
```typescript
// After existing boosts, before return
if (ctx.profile?.past_attempt_data?.mains_weakest_papers?.length) {
  const weakPapers = ctx.profile.past_attempt_data.mains_weakest_papers;
  // Map paper names to subject names, check if topic's subject matches
  if (weakPapers.includes(mapSubjectToPaper(t.subject_name))) {
    priority += PLANNER.PAST_WEAKNESS_BOOST;
  }
}
```

You'll need a small `mapSubjectToPaper` helper to map subject names to Mains paper codes (gs1, gs2, gs3, gs4, essay, optional).

---

## Phase 6: Polish — Proactive Alerts, Peer Benchmarking, Animations

**Fresher impact: MEDIUM | Experienced impact: HIGH**
**Estimated: 5-7 days**

### 6A. Proactive Smart Alerts

#### Create `apps/api/src/services/alerts.ts` (NEW FILE — Tier 2)

```typescript
import { supabase } from '../lib/supabase.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';

interface SmartAlert {
  type: 'subject_neglect' | 'confidence_decay' | 'buffer_critical' | 'streak_risk';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action_label?: string;
  action_route?: string;
}

export async function getActiveAlerts(userId: string): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];

  // 1. Subject neglect: any subject not studied in 14+ days
  const { data: subjectActivity } = await supabase
    .from('study_logs')
    .select('subject_name, created_at')
    .eq('user_id', userId)
    .gte('created_at', daysAgo(14).toISOString());

  // Find subjects with no activity in 14 days...
  // Push alert if found

  // 2. Confidence decay: 5+ topics with decayed confidence
  const { data: decayed } = await supabase
    .from('user_progress')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .lt('confidence_score', 30)
    .gt('confidence_score', 0);

  if ((decayed as any)?.length >= 5) {
    alerts.push({
      type: 'confidence_decay',
      severity: 'warning',
      title: 'Memory fading',
      message: `${(decayed as any).length} topics need revision before they fade further.`,
      action_label: 'View Revisions',
      action_route: '/revision',
    });
  }

  // 3. Buffer critical: buffer < -2
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('buffer_balance')
    .eq('id', userId)
    .single();

  if (profile && profile.buffer_balance < -2) {
    alerts.push({
      type: 'buffer_critical',
      severity: 'critical',
      title: 'Safety margin depleted',
      message: 'You\'re behind schedule. Consider a focused catch-up session today.',
      action_label: 'Open Planner',
      action_route: '/(tabs)/planner',
    });
  }

  // 4. Streak at risk (studied yesterday but not today yet, and it's after 6pm)
  // Check if today has any study logs...

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
```

#### Create `apps/api/src/routes/alerts.ts` (NEW FILE)

```typescript
import { FastifyInstance } from 'fastify';
import { getActiveAlerts } from '../services/alerts.js';

export async function alertRoutes(app: FastifyInstance) {
  app.get('/api/alerts', async (request, reply) => {
    const alerts = await getActiveAlerts(request.userId);
    return reply.status(200).send(alerts);
  });
}
```

Register in `apps/api/src/index.ts`.

#### Create `apps/mobile/hooks/useAlerts.ts` (NEW FILE)

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAlerts = () => useQuery({
  queryKey: ['alerts'],
  queryFn: () => api.getAlerts(),
  staleTime: 10 * 60 * 1000,
});
```

Add `getAlerts` to api client.

#### Create `apps/mobile/components/dashboard/AlertBanner.tsx` (NEW FILE)

Shows the highest-severity alert with:
- Color-coded border (critical=red, warning=orange, info=blue)
- Title + message
- Action button that navigates to `action_route`
- Dismiss button (stores in AsyncStorage, re-shows next day)

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Add `<AlertBanner />` before the hero card, gated by `isDashboardSectionVisible('activityFeed', daysUsed, isVeteran)` (same gate as activity feed — day 7+):

```typescript
{isDashboardSectionVisible('activityFeed', daysUsed, isVeteran) && alerts?.[0] && (
  <AlertBanner alert={alerts[0]} />
)}
```

### 6B. Peer Benchmarking

#### Migration: `supabase/migrations/045_cohort_benchmarks.sql`

```sql
CREATE TABLE cohort_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric TEXT NOT NULL,
  percentile_10 REAL,
  percentile_25 REAL,
  percentile_50 REAL,
  percentile_75 REAL,
  percentile_90 REAL,
  sample_size INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date, metric)
);

ALTER TABLE cohort_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cohort data" ON cohort_snapshots FOR SELECT USING (true);
CREATE POLICY "Service role can write" ON cohort_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update" ON cohort_snapshots FOR UPDATE USING (true);
```

#### Create `apps/api/src/services/cohortBenchmark.ts` (NEW FILE — Tier 1)

```typescript
import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';

export async function computeCohortPercentiles() {
  // Fetch all active users' velocity_ratio, weighted_completion_pct from latest velocity_snapshots
  // Compute percentiles (10, 25, 50, 75, 90) for each metric
  // Upsert into cohort_snapshots
}

export async function getUserPercentile(userId: string) {
  const today = toDateString(new Date());

  const [userSnapshot, cohort] = await Promise.all([
    supabase.from('velocity_snapshots')
      .select('velocity_ratio, weighted_completion_pct')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('cohort_snapshots')
      .select('*')
      .eq('snapshot_date', today),
  ]);

  if (!userSnapshot.data || !cohort.data?.length) return null;

  // Calculate which percentile band the user falls in for each metric
  // Return { coverage_percentile, velocity_percentile, consistency_percentile }
  return {
    coverage_percentile: /* computed */,
    velocity_percentile: /* computed */,
    consistency_percentile: /* computed */,
  };
}
```

#### Edit `apps/api/src/services/cron.ts`

Add a new step in `runDailyMaintenance` (after existing steps, before cron log update):

```typescript
// Step N: Cohort benchmarks (runs once for all users, not per-user)
try {
  const { computeCohortPercentiles } = await import('./cohortBenchmark.js');
  await computeCohortPercentiles();
} catch (e: any) {
  errors.push({ userId: 'system', step: 'cohort_benchmarks', error: e.message });
}
```

#### Create `apps/mobile/components/benchmark/PeerComparisonCard.tsx` (NEW FILE)

V4Card showing: "Your coverage is in the top {X}%" for each metric. Use progress bars or simple text. Motivational framing — always positive ("top 30%" not "bottom 70%").

#### Edit `apps/mobile/app/(tabs)/progress.tsx`

Add `<PeerComparisonCard />`, gated by `daysUsed >= 14`:

```typescript
{daysUsed >= 14 && <PeerComparisonCard userId={session.user.id} />}
```

### 6C. Micro-Animations

#### Edit `apps/mobile/app/(tabs)/planner.tsx`

Add `Animated` from react-native. On task completion:
- Fade-in checkmark
- Animated strikethrough on topic name
- Brief scale bounce on the celebration card

#### Edit `apps/mobile/app/(tabs)/index.tsx`

Add fade-in for dashboard sections as they mount:
```typescript
const fadeAnim = useRef(new Animated.Value(0)).current;
useEffect(() => {
  Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
}, []);
```

Wrap major sections in `<Animated.View style={{ opacity: fadeAnim }}>`.

#### Edit `apps/mobile/components/v4/V4Bar.tsx`

Verify the existing animation is smooth on mount. If not, add `useEffect` with `Animated.timing` for the width transition.

---

## Summary Tables

### New Files (28)

| # | File | Phase | Type |
|---|------|-------|------|
| 1 | `apps/mobile/lib/labelMap.ts` | 1 | Mobile lib |
| 2 | `apps/mobile/components/dashboard/WelcomeBackBanner.tsx` | 3 | Component |
| 3 | `apps/mobile/components/dashboard/GuidedJourneyCard.tsx` | 3 | Component |
| 4 | `apps/mobile/components/dashboard/ActivityFeed.tsx` | 2 | Component |
| 5 | `apps/mobile/components/dashboard/AlertBanner.tsx` | 6 | Component |
| 6 | `apps/mobile/components/common/WarmEmptyState.tsx` | 3 | Component |
| 7 | `apps/mobile/components/mock/DeepAnalysisCard.tsx` | 5 | Component |
| 8 | `apps/mobile/components/answer/AnswerEntrySheet.tsx` | 5 | Component |
| 9 | `apps/mobile/components/answer/AnswerStatsCard.tsx` | 5 | Component |
| 10 | `apps/mobile/components/benchmark/PeerComparisonCard.tsx` | 6 | Component |
| 11 | `apps/mobile/app/study-plan.tsx` | 2 | Screen |
| 12 | `apps/mobile/hooks/useStudyPlanOverview.ts` | 2 | Hook |
| 13 | `apps/mobile/hooks/useSystemEvents.ts` | 2 | Hook |
| 12 | `apps/mobile/hooks/useResources.ts` | 4 | Hook |
| 13 | `apps/mobile/hooks/useAnswerWriting.ts` | 5 | Hook |
| 14 | `apps/mobile/hooks/useAlerts.ts` | 6 | Hook |
| 15 | `apps/mobile/app/onboarding/past-attempt.tsx` | 5 | Screen |
| 18 | `apps/api/src/services/studyPlanOverview.ts` | 2 | Service (Tier 1) |
| 19 | `apps/api/src/services/systemEvents.ts` | 2 | Service (Tier 1) |
| 17 | `apps/api/src/services/resources.ts` | 4 | Service (Tier 1) |
| 18 | `apps/api/src/services/answerWriting.ts` | 5 | Service (Tier 1) |
| 19 | `apps/api/src/services/alerts.ts` | 6 | Service (Tier 2) |
| 20 | `apps/api/src/services/cohortBenchmark.ts` | 6 | Service (Tier 1) |
| 24 | `apps/api/src/routes/studyPlanOverview.ts` | 2 | Route |
| 25 | `apps/api/src/routes/systemEvents.ts` | 2 | Route |
| 22 | `apps/api/src/routes/resources.ts` | 4 | Route |
| 23 | `apps/api/src/routes/answerWriting.ts` | 5 | Route |
| 24 | `apps/api/src/routes/alerts.ts` | 6 | Route |

### Migrations (6)

| # | File | Phase | Description |
|---|------|-------|-------------|
| 1 | `040_plan_item_reason.sql` | 2 | Add `reason TEXT` to `daily_plan_items` |
| 2 | `041_system_events.sql` | 2 | Create `system_events` table |
| 3 | `042_topic_resources.sql` | 4 | Create `topic_resources` table + seed data |
| 4 | `043_past_attempt_data.sql` | 5 | Add `past_attempt_data JSONB` to `user_profiles` |
| 5 | `044_answer_writing.sql` | 5 | Create `answer_practice` table |
| 6 | `045_cohort_benchmarks.sql` | 6 | Create `cohort_snapshots` table |

### Files to Edit (~30)

| File | Phases | Changes |
|------|--------|---------|
| `apps/mobile/app/(tabs)/index.tsx` | 1,2,3,5,6 | Jargon→plain, tooltips, 3-tier dashboard, welcome-back, guided journey, activity feed, alert banner, answer stats, animations |
| `apps/mobile/app/(tabs)/progress.tsx` | 1,3,4,5,6 | Jargon→plain, tooltips, warm empty states, simplified first-week, deep mock analysis, answer stats, peer benchmarking |
| `apps/mobile/app/(tabs)/planner.tsx` | 2,3,6 | Reason display, actual hours prompt, "View Full Plan" button, warm empty state, celebration variations, animations |
| `apps/mobile/components/v4/V4MetricBox.tsx` | 1 | Add tooltip prop + "?" toggle |
| `apps/mobile/components/v4/V4Bar.tsx` | 6 | Verify/add mount animation |
| `apps/mobile/lib/disclosure.ts` | 1 | Add DASHBOARD_SECTIONS + isDashboardSectionVisible |
| `apps/mobile/components/syllabus/TopicRow.tsx` | 4 | Add resource badge |
| `apps/mobile/app/topic-detail.tsx` | 4 | Build out full screen + resources section |
| `apps/mobile/app/onboarding/complete.tsx` | 5 | Include past_attempt_data in payload |
| `apps/mobile/app/_layout.tsx` | 2 | Add study-plan screen to Stack navigator |
| `apps/mobile/lib/api.ts` | 2,4,5,6 | Add new API endpoints |
| `apps/api/src/services/stress.ts` | 1 | Plain language recommendations |
| `apps/api/src/services/planner.ts` | 2,5 | computeReason, past_weakness_boost, fetchPlannerData |
| `apps/api/src/services/events.ts` | 2 | Add system:log event type + handler |
| `apps/api/src/services/recalibration.ts` | 2 | Emit system:log on recalibration |
| `apps/api/src/services/burnout.ts` | 2 | Emit system:log on recovery enter/exit |
| `apps/api/src/services/mockTest.ts` | 5 | Deep mock analysis fields |
| `apps/api/src/services/strategy.ts` | 5 | Store past_attempt_data, seed weakness radar |
| `apps/api/src/services/cron.ts` | 6 | Add cohort benchmark step |
| `apps/api/src/constants/thresholds.ts` | 5 | Add PAST_WEAKNESS_BOOST |
| `packages/shared-types/src/index.ts` | 2,5 | Add reason to DailyPlanItem, StudyPlanOverview + SubjectProjection types, past_attempt_data to OnboardingV2Payload, DeepMockAnalysis interface |
| `apps/api/src/index.ts` | 2,4,5,6 | Register new routes |

### Verification After Each Phase

```bash
# After API changes
cd apps/api && npm test

# After mobile changes
cd apps/mobile && npm test

# Apply migrations
supabase db push  # or supabase migration up

# Test on device
npx expo start
```

**Manual test checklist:**
- Phase 1: Verify jargon replaced everywhere, tooltips appear on "?", dashboard sections gated by daysUsed
- Phase 2: Verify reason shows below topic name on plan cards, actual hours prompt appears on manual completion, activity feed populates after recalibration/burnout events, "View Full Plan" button opens study plan overview with subject projections and revision calendar
- Phase 3: Miss a day → verify welcome-back banner. Day 1 → verify guided journey checklist. Empty planner/progress → verify warm messages
- Phase 4: Tap topic → verify resources section. Day 1 progress tab → verify simplified view
- Phase 5: Onboard as 2nd attempt → verify past attempt screens appear. Record 2+ mocks → verify deep analysis card. Log answers → verify stats
- Phase 6: Neglect a subject 14 days → verify alert banner. Check progress at day 14+ → verify percentile card. Verify animations on task completion

### Projected UX Score After Each Phase

| Phase | Fresher | Experienced |
|-------|---------|-------------|
| Current | 4.5 | 6.5 |
| After Phase 1 | 6.5 | 7.0 |
| After Phase 2 | 7.0 | 8.0 |
| After Phase 3 | 8.0 | 8.5 |
| After Phase 4 | 8.5 | 8.5 |
| After Phase 5 | 8.5 | 9.0 |
| After Phase 6 | **9.0+** | **9.5** |
