# ExamPilot V4 Migration — Complete Implementation Plan

> Generated from verified codebase audit + V4 spec analysis. Every item from the corrected analysis is covered.

---

## PHASE 1: Foundation (Do First — Everything Else Depends on This)

### Step 1.1 — Update Design System (theme.ts)

**File:** `apps/mobile/constants/theme.ts`

**Current state:** `darkColors` uses V2 palette (`#0F172A`, `#22D3EE`, etc.). Has `lightColors`, `shared` spacing/radius/fontSize, Theme type export.

**Changes:**

1. Update `darkColors` values:
   ```
   background:     #0F172A → #0B1120
   surface:        #1E293B → #131C31
   card:           #1E293B → #182036  (was same as surface, now separate)
   border:         #334155 → #1E2D4A
   primary:        #22D3EE → #3ECFB4  (cyan → muted teal)
   primaryDim:     #0891B2 → rgba(62,207,180,0.12)
   text:           #F8FAFC → #E8ECF4
   textSecondary:  #94A3B8 → #7B8BA5
   textMuted:      #64748B → #4A5568
   purple:         #A855F7 → #A78BFA
   ```

2. Add new tokens to `darkColors`:
   ```typescript
   accentDim:   'rgba(62,207,180,0.12)',
   warnDim:     'rgba(245,158,66,0.12)',
   dangerDim:   'rgba(239,68,68,0.10)',
   greenDim:    'rgba(52,211,153,0.12)',
   purpleDim:   'rgba(167,139,250,0.12)',
   warn:        '#F59E42',
   danger:      '#EF4444',    // was 'error: #F87171'
   green:       '#34D399',    // was 'success: #34D399'
   ```

3. Keep `lightColors` as-is (V4 is dark-only for now, light mode can be updated later).

4. Update the `Theme` type to include all new color keys.

5. Keep `shared` spacing/borderRadius/fontSize unchanged — they work for V4.

**Verify:** All existing components that reference `theme.colors.primary` etc. will pick up the new values automatically via ThemeContext. Do a global search for any hardcoded hex values in component files and replace with theme references.

---

### Step 1.2 — Create V4 Shared Components

**Directory:** `apps/mobile/components/v4/`

Create 6 reusable components. These are used across every V4 screen.

#### 1.2.1 — V4Card.tsx
```
Props: { children, style?, borderColor?, background? }
Default: bg theme.colors.card, borderRadius 16, border 1px theme.colors.border, padding 18
```

#### 1.2.2 — V4Bar.tsx (animated progress bar)
```
Props: { percent, color?, height=6, label?, showPercent? }
- Animated.View width transition (use useEffect + Animated.timing on percent change)
- borderRadius matches height
- Optional label row above: left=label text, right=percent value
- Track bg: theme.colors.border
```

#### 1.2.3 — V4Pill.tsx (tag/badge)
```
Props: { label, bg, textColor, style? }
- borderRadius 20, paddingVertical 3, paddingHorizontal 10
- fontSize 11, fontWeight 600
```

#### 1.2.4 — V4MetricBox.tsx
```
Props: { value, label, sublabel?, color, bgColor }
- borderRadius 14, padding 14x16, flex 1
- Value: fontSize 22, fontWeight 800
- Label: fontSize 11, textSecondary
- Sublabel: fontSize 10, textMuted
- Border: 1px solid color at 14% opacity
```

#### 1.2.5 — V4Tip.tsx (inline tooltip)
```
Props: { text }
- (?) circle icon, 16x16, bg border color
- On press: toggles absolute-positioned tooltip bubble
  - bg surface, border, borderRadius 10, padding 10
  - fontSize 11, textSecondary, lineHeight 1.5
  - "Got it" dismiss link in accent color
- Uses React Native Modal or absolute positioning within a wrapper View
```

#### 1.2.6 — V4SectionLabel.tsx
```
Props: { children, style? }
- fontSize 12, fontWeight 700, textTransform uppercase
- letterSpacing 1.2, color textSecondary, marginBottom 12
```

**Testing:** Create a simple storybook-style test screen (optional) to visually verify all 6 components render correctly.

---

### Step 1.3 — Create UserContext (daysUsed + attempt + profile data)

**File:** `apps/mobile/context/UserContext.tsx`

**Problem:** V4 progressive disclosure requires `daysUsed` and `attempt` available on every screen. Currently `useAuth` only provides Supabase User (email, id, created_at). The `attempt_number`, `user_type`, and onboarding completion date are in `user_profiles` table, fetched via `GET /api/profile`.

**Implementation:**

1. Create `UserContext` with:
   ```typescript
   interface UserContextValue {
     daysUsed: number;            // Math.floor((now - onboardingCompletedAt) / 86400000)
     attempt: number;             // 1, 2, or 3
     isVeteran: boolean;          // attempt >= 2
     examMode: ExamMode;          // 'prelims' | 'mains' | 'post_prelims'
     studyPreference: 'sequential' | 'mixed';
     profileLoading: boolean;
     refetchProfile: () => void;
   }
   ```

2. Inside provider, use `useProfile()` hook to fetch from `/api/profile`. Compute `daysUsed` from `profile.created_at` (or `onboarding_completed_at` if that field exists).

3. Wrap in root `_layout.tsx` **inside** AuthProvider but **outside** ThemeProvider (it needs auth to fetch profile).

4. Expose `useUser()` hook for any screen to access.

5. `daysUsed` recalculates on each render (it's just a date diff, very cheap).

**Fallback:** If profile fetch fails or user hasn't completed onboarding, default to `{ daysUsed: 0, attempt: 1, isVeteran: false }`.

---

### Step 1.4 — Create TimerContext (Global Singleton)

**File:** `apps/mobile/context/TimerContext.tsx`

**Requirements from V4 spec:**
- Countdown timer using task's estimated duration
- Pause/stop controls — pause keeps task "active," stop prompts confirmation
- One-active-at-a-time — starting new timer stops previous
- "Time's up" nudge — does NOT auto-complete
- Time logged = primary input for daily study hours
- Persist through app backgrounding

**Implementation:**

1. Create `TimerContext`:
   ```typescript
   interface TimerState {
     activePlanItemId: string | null;
     taskSubject: string;
     taskTopic: string;
     estimatedMinutes: number;
     elapsedSeconds: number;
     status: 'idle' | 'running' | 'paused' | 'timeup';
   }

   interface TimerContextValue {
     timer: TimerState;
     startTimer: (planItemId: string, subject: string, topic: string, estimatedMin: number) => void;
     pauseTimer: () => void;
     resumeTimer: () => void;
     stopTimer: () => Promise<{ elapsedMinutes: number }>;  // returns actual time for logging
     isRunning: boolean;
   }
   ```

2. Use `useRef` for interval ID. `setInterval` at 1-second ticks when running.

3. **AsyncStorage persistence** — On every status change and every 30 seconds while running, save timer state to `@timer_state`. On app mount, restore from AsyncStorage. This handles:
   - App backgrounded → comes back → timer restored with correct elapsed (store `startedAt` timestamp, compute elapsed from wall clock)
   - App killed → restarted → timer shows as paused with last saved elapsed

4. **Background time calculation:** Instead of relying on setInterval (which stops when app is backgrounded), store `runningStartedAt: Date` when timer starts/resumes. On any read of `elapsedSeconds`, compute: `savedElapsed + (now - runningStartedAt)`. This way backgrounding is handled automatically.

5. **One-at-a-time enforcement:** `startTimer()` calls `stopTimer()` on any existing active timer first.

6. **"Time's up" state:** When elapsed >= estimated, set status to `'timeup'`. UI shows nudge: "Time's up! Mark done or keep going?" Timer keeps counting (doesn't stop).

7. **Integration with study session logging:** `stopTimer()` returns `elapsedMinutes`. The calling code (Planner screen) uses this to call `api.updatePlanItem(planItemId, { status: 'completed', actual_minutes: elapsedMinutes })`. Timer doesn't directly call APIs.

8. Wrap in root `_layout.tsx` inside AuthProvider.

---

### Step 1.5 — Restructure Navigation (5 tabs → 12 conditional screens)

**File:** `apps/mobile/app/(tabs)/_layout.tsx`

**Current state:** 5 fixed `<Tabs.Screen>` entries (Dashboard, Syllabus, Planner, Progress, Settings) with letter icons.

**V4 requires:** 12 screens with progressive disclosure — some hidden based on `daysUsed` and `isVeteran`.

**Decision: Use scrollable top tab bar or keep bottom tabs with additional screens as stack routes?**

**Recommended approach — Hybrid:**
- Keep **bottom tab bar** with 5 core tabs: Dashboard, Planner, Week Plan, Syllabus, Settings
- Add other screens as **stack routes** accessible from Dashboard/navigation:
  - Revision Hub, Full Syllabus, Mocks, Weekly Review, Low Day, Ranker
- This avoids a 12-item bottom tab bar (bad UX on mobile)
- Progressive disclosure hides these routes via conditional rendering in Dashboard navigation cards or a "More" section

**Alternative — Scrollable bottom tabs:** Expo Router's `<Tabs>` can scroll if you add enough items, but 12 tabs is too many for bottom nav.

**Implementation:**

1. **New tab files to create** in `apps/mobile/app/(tabs)/`:
   - `weekplan.tsx` — Week Plan (replaces nothing, entirely new)

2. **New stack screens** in `apps/mobile/app/`:
   - `revision.tsx` — Revision Hub
   - `fullsyllabus.tsx` — Full Syllabus Bible
   - `mocks.tsx` — Mock Test Analysis
   - `weeklyreview.tsx` — Weekly Review
   - `lowday.tsx` — Low Day Mode
   - `ranker.tsx` — Ranker Mode

3. **Modify `(tabs)/_layout.tsx`:**
   - Change Progress tab → Week Plan tab
   - Move Progress/Mocks/Review/etc. to stack screens
   - Use `useUser()` to conditionally show/hide tabs:
     ```typescript
     const { daysUsed, isVeteran } = useUser();
     // Week Plan: always visible
     // Other tabs: always visible (Dashboard, Planner, Syllabus, Settings)
     ```

4. **Register stack screens in `app/_layout.tsx`:**
   ```typescript
   <Stack.Screen name="revision" />
   <Stack.Screen name="fullsyllabus" />
   <Stack.Screen name="mocks" />
   <Stack.Screen name="weeklyreview" />
   <Stack.Screen name="lowday" />
   <Stack.Screen name="ranker" />
   ```

5. **Progressive disclosure helper** — Create `apps/mobile/lib/disclosure.ts`:
   ```typescript
   export const SCREEN_RULES = {
     revision:     { fresher: 3,  veteran: 0 },
     fullSyllabus: { fresher: 14, veteran: 0 },
     mocks:        { fresher: 7,  veteran: 0 },
     weeklyReview: { fresher: 7,  veteran: 0 },
     lowDay:       { fresher: 7,  veteran: 3 },
     ranker:       { fresher: 30, veteran: 0 },
   } as const;

   export function isScreenUnlocked(
     screenId: keyof typeof SCREEN_RULES,
     daysUsed: number,
     isVeteran: boolean
   ): boolean {
     const rule = SCREEN_RULES[screenId];
     const minDays = isVeteran ? rule.veteran : rule.fresher;
     return daysUsed >= minDays;
   }
   ```

6. **Dashboard will render navigation cards** to unlocked screens (see Step 2.1).

---

### Step 1.6 — QuickLogFAB + QuickLogModal

**New files:**
- `apps/mobile/components/v4/QuickLogFAB.tsx`
- `apps/mobile/components/v4/QuickLogModal.tsx`
- `apps/mobile/hooks/useQuickLog.ts`

#### 1.6.1 — QuickLogFAB.tsx
- Green "+" circle, position absolute, bottom-right corner
- 56x56, borderRadius 28, bg accent
- `onPress` → opens QuickLogModal
- Rendered in root `_layout.tsx` so it appears on ALL screens
- Only shown when user has completed onboarding (check UserContext)

#### 1.6.2 — QuickLogModal.tsx
- Bottom sheet (use React Native Modal or `@gorhom/bottom-sheet` if already installed)
- Subject chips: 10 options (Polity, History, Geography, Economics, Science, Environment, Ethics, CSAT, Current Affairs, Answer Writing)
- Duration slider: 15–180 min, 15-min steps (use React Native Slider or custom)
- Optional topic text input
- "Log Study Session" button (disabled until subject selected)
- Success state: "✓ Logged! X min of [Subject] added to today"
- On submit: calls `useQuickLog` mutation

#### 1.6.3 — useQuickLog.ts (React Query hook)
```typescript
export const useQuickLog = () => useMutation({
  mutationFn: (data: { subject: string; duration: number; topic?: string }) =>
    api.quickLog(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dailyPlan'] });
    queryClient.invalidateQueries({ queryKey: ['velocity'] });
    queryClient.invalidateQueries({ queryKey: ['syllabus'] });
  },
});
```

#### 1.6.4 — Backend: POST /api/quicklog
**New files:**
- `apps/api/src/routes/quicklog.ts`
- `apps/api/src/services/quicklog.ts`

**Service logic:**
1. Create a `study_sessions` record (or insert into `daily_plan_items` with type='quicklog')
2. Update `user_progress` for the subject — increment actual_hours_spent
3. Emit `appEvents.emit('xp:award', { userId, triggerType: 'study_logged' })` (per Rule 4)
4. Return { success: true, logged_minutes, subject }

**Route (thin controller per Rule 1):**
```typescript
app.post('/api/quicklog', async (request) => {
  return logQuickSession(request.userId, request.body);
});
```

**Mobile API client addition** in `apps/mobile/lib/api.ts`:
```typescript
quickLog: (data: { subject: string; duration: number; topic?: string }) =>
  request('/api/quicklog', { method: 'POST', body: JSON.stringify(data) }),
```

---

### Step 1.7 — Add QuickLogFAB to Root Layout

**File:** `apps/mobile/app/_layout.tsx`

Modify RootLayout to render QuickLogFAB globally:
```typescript
import { QuickLogFAB } from '../components/v4/QuickLogFAB';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <TimerProvider>
            <ThemeProvider>
              <ThemedStatusBar />
              <Stack screenOptions={{ headerShown: false }}>
                {/* ... existing screens ... */}
              </Stack>
              <QuickLogFAB />
            </ThemeProvider>
          </TimerProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## PHASE 2: Core Screens (Dashboard, Planner, Onboarding)

### Step 2.1 — Dashboard Overhaul

**File:** `apps/mobile/app/(tabs)/index.tsx`

**Current V2 state:** Shows readiness score, BRI, stress toggles, XP/level, velocity card, burnout indicator, buffer bank card, stress thermometer using dedicated components.

**V4 replaces entirely.** The screen will be rewritten top-to-bottom.

**Layout (top to bottom):**

#### 2.1.1 — Header Row
```
Left:  "Good morning" (fontSize 14, textSecondary)
       "Prelims in X days" (fontSize 24, bold, countdown in accent)
Right: PRELIMS/MAINS pill badge (V4Pill)
```
- Days countdown: calculate from exam date in UserContext or profile
- Mode pill: use `examMode` from UserContext

#### 2.1.2 — Welcome Card (day 1-3 only)
```
if (daysUsed <= 3) → Show V4Card with accent border:
  "Welcome to ExamPilot"
  "For the next few days, just focus on the Start Here card below..."
```

#### 2.1.3 — Hero "START HERE" Card
```
- Gradient teal background (LinearGradient from expo-linear-gradient)
- "START HERE" label (uppercase, accent, letterSpacing 1.5)
- Subject name + topic name (from first incomplete daily plan item)
- "New topic · ~90 min · High PYQ weight" with V4Tip on PYQ
- "▶ Start Studying" button
```

**Data source:** `usePlanner()` hook → get today's plan → find first item with `status !== 'completed'`.

**On press behavior (cross-screen auto-start):**
```typescript
onPress={() => {
  router.push({
    pathname: '/(tabs)/planner',
    params: { autoStartItemId: firstIncompleteItem.id }
  });
}}
```
The Planner screen reads this param and calls `timerContext.startTimer(...)` on mount.

#### 2.1.4 — 5-Metric Row (two rows)
Row 1 (3 boxes): Hours today, Tasks done, **Mode-aware 3rd box**
Row 2 (2 boxes): Revisions due (with V4Tip), Momentum (7-day score)

**Mode-aware 3rd box:**
```typescript
if (examMode === 'mains') {
  // Show: "3 answers today / 12 this week"
} else {
  // Show: "12 day streak"
}
```

**Data sources:**
- Hours today: `usePlanner()` → sum completed items' actual_minutes
- Tasks done: `usePlanner()` → completed / total
- Streak: `useGamification()` → current_streak
- Revisions due: `useFSRS()` → revisions_due_count
- Momentum: `useBenchmark()` → 7-day consistency score or custom calc

#### 2.1.5 — Prelims/Mains Split Bar (Mains mode ONLY)
```
if (examMode === 'mains') → Show stacked horizontal bar:
  "Prelims 65% | Mains 35%"
  "Answer writing: 12 this week · Weakest paper: GS2"
```

#### 2.1.6 — Exam Readiness Card (HIDDEN first 7 days)
```
if (daysUsed > 7) → Show V4Card:
  Score X/100 (from useBenchmark)
  5 V4Bar components: Coverage, Confidence, Consistency, Velocity, Weakness
  V4Tip explaining composite score
```

#### 2.1.7 — Backlog Card (HIDDEN day 1)
```
if (daysUsed > 1 && hasBacklog) → Show card with warn bg:
  "X items rolled over from yesterday — tap to adjust"
```

#### 2.1.8 — Navigation Cards to Unlocked Screens
Below the main content, show cards/links to screens unlocked by progressive disclosure:
```typescript
const navItems = [
  { id: 'revision', label: 'Revision Hub', icon: '↻', route: '/revision' },
  { id: 'mocks', label: 'Mock Analysis', icon: '📝', route: '/mocks' },
  { id: 'weeklyReview', label: 'Weekly Review', icon: '📊', route: '/weeklyreview' },
  { id: 'lowDay', label: 'Low Day Mode', icon: '🌊', route: '/lowday' },
  { id: 'ranker', label: 'Ranker Mode', icon: '🔥', route: '/ranker' },
  { id: 'fullSyllabus', label: 'Full Syllabus', icon: '📚', route: '/fullsyllabus' },
].filter(item => isScreenUnlocked(item.id, daysUsed, isVeteran));
```

#### 2.1.9 — Remove V2 Components
- Remove imports of: `VelocityCard`, `BurnoutIndicator`, `StressThermometer`, `BufferBankCard`
- These components remain in the codebase (other screens might use them) but are no longer imported by Dashboard
- Remove: BRI score indicator, stress level toggles, XP/level display, strategy mode label from Dashboard

---

### Step 2.2 — Planner Modifications

**File:** `apps/mobile/app/(tabs)/planner.tsx`

#### 2.2.1 — Accept autoStartItemId param
```typescript
const { autoStartItemId } = useLocalSearchParams<{ autoStartItemId?: string }>();
const { startTimer } = useTimer();

useEffect(() => {
  if (autoStartItemId && plan) {
    const item = plan.items.find(i => i.id === autoStartItemId);
    if (item && item.status !== 'completed') {
      startTimer(item.id, item.subject_name, item.topic_name, item.estimated_minutes);
    }
  }
}, [autoStartItemId, plan]);
```

#### 2.2.2 — Capacity Card Update
- "Today's Plan — X.X hrs / Y hrs" with V4Bar
- "X.X hrs buffer remaining" (not "time left")
- Red warning if overplanned (> target + 1hr)

#### 2.2.3 — Task Card Updates
Each task card now has:
- Left colored border: teal=NEW, purple=REVISION, red=DECAY, orange=DAILY
- V4Pill tag: NEW / REVISION / DECAY / DAILY / MAINS / CA
- Subject (bold), topic (dimmed)
- Duration on right
- **Timer integration:** If `timer.activePlanItemId === item.id`:
  - Show elapsed/remaining time (monospace)
  - Pause/stop buttons
  - Hide "▶ Start" button
- If no active timer: show "▶ Start" button
- If completed: show "✓ Done" at 50% opacity

#### 2.2.4 — DECAY Tooltip
For DECAY-tagged tasks, add V4Tip:
> "This topic is fading from memory. Our algorithm detected you're at risk of forgetting it. A quick revision now saves a full re-study later."

#### 2.2.5 — Quick-Logged Session Card
Query for quick-logged sessions for today. Show as LOGGED card:
- Green left border, 0.7 opacity
- V4Pill "LOGGED" in green
- "Logged via Quick Log · 60 min · [topic]"
- "✓ Counts toward today's hours and updates subject coverage"

#### 2.2.6 — Timer Stop Flow
When user taps stop on timer:
```typescript
const handleStop = async () => {
  Alert.alert(
    'Mark as done?',
    `You studied for ${Math.floor(timer.elapsedSeconds / 60)} minutes.`,
    [
      { text: 'No', onPress: () => pauseTimer() },   // return to paused
      { text: 'Yes', onPress: async () => {
        const { elapsedMinutes } = await stopTimer();
        completePlanItem.mutate({ itemId: timer.activePlanItemId, actualMinutes: elapsedMinutes });
      }},
    ]
  );
};
```

#### 2.2.7 — Timer "Time's Up" Nudge
When `timer.status === 'timeup'`:
- Show inline message: "Time's up! Mark done or keep going?"
- Two buttons: "✓ Done" (triggers stop flow) and "Keep going" (resumes timer past estimate)

#### 2.2.8 — Progress Bar at Bottom
- V4Bar showing completed/total tasks
- "X/Y tasks done" label

---

### Step 2.3 — Onboarding Rework

**Current state:** 11 files in `apps/mobile/app/onboarding/`:
```
_layout.tsx, index.tsx (name), professional.tsx, attempt.tsx,
approach.tsx, fallback.tsx, promise.tsx, targets.tsx,
examdate.tsx, result.tsx, complete.tsx
```

**V4 target:** 6 question screens + layout + completion = 8 files

#### 2.3.1 — Delete Screens
Delete these files:
- `apps/mobile/app/onboarding/index.tsx` (name — removed in V4)
- `apps/mobile/app/onboarding/approach.tsx` (replaced by studyPreference)
- `apps/mobile/app/onboarding/fallback.tsx` (removed)
- `apps/mobile/app/onboarding/promise.tsx` (removed)
- `apps/mobile/app/onboarding/result.tsx` (strategy auto-calculated, no display)
- `apps/mobile/app/onboarding/examdate.tsx` (replaced by cycle selection)

#### 2.3.2 — Create New Screens

**`apps/mobile/app/onboarding/index.tsx`** — Step 0: Attempt (WAS step 2, NOW first)
```
Question: "Which attempt is this?"
Subtitle: "No judgment. 2nd and 3rd attempts clear more often than 1st."
Options:
  - "1st Attempt" → desc: "Fresh start — we'll build from zero" → val: 1
  - "2nd Attempt" → desc: "You know the game. Let's sharpen." → val: 2
  - "3rd+ Attempt" → desc: "Aggressive mode. No wasted days." → val: 3
Store: attempt (integer) — THIS DRIVES PROGRESSIVE DISCLOSURE
Navigate: → professional
```

**`apps/mobile/app/onboarding/professional.tsx`** — Step 1: (modify existing)
```
Keep existing question/options, just update the step number indicator.
Navigate: → cycle (was → attempt in V2)
```

**`apps/mobile/app/onboarding/cycle.tsx`** — Step 2: NEW
```
Question: "Which Prelims cycle are you targeting?"
Subtitle: "This decides everything — pace, revision depth, risk tolerance"
Options:
  - "This year (2026)"
  - "Next year (2027)"
  - "Not sure yet" → desc: "We'll plan for the nearest cycle"
Store: cycle (string)
Navigate: → preference
```

**`apps/mobile/app/onboarding/preference.tsx`** — Step 3: NEW
```
Question: "How do you prefer to study?"
Subtitle: "Neither is wrong. This shapes how we build your weekly plan."
Options:
  - "One subject at a time" → desc: "Finish Polity → then Geo → then Eco" → val: "sequential"
  - "Mix subjects daily" → desc: "Study 2-3 subjects each day for variety" → val: "mixed"
Store: studyApproach ('sequential' | 'mixed')
Navigate: → targets
```

**`apps/mobile/app/onboarding/targets.tsx`** — Step 4: (modify existing)
```
Current: shows daily_hours slider + daily_new_topics slider
V4: ONLY hours slider (2-12, 0.5 increments). Remove daily_new_topics slider.
Question: "How many hours can you realistically study daily?"
Subtitle: "Be honest. Not aspirational. You can always increase later."
Navigate: → weaksubjects
```

**`apps/mobile/app/onboarding/weaksubjects.tsx`** — Step 5: NEW
```
Question: "Which 3 GS subjects feel weakest right now?"
Subtitle: "Tap 3. This seeds your revision priority from day one."
10 tappable chips: Indian Polity, Economics, Geography, Ancient History,
  Modern History, Art & Culture, Science & Tech, Environment, Ethics, CSAT
Max selection: 3. Show "X/3 selected" counter.
When 3 selected → show "Generate My UPSC Plan →" button
Store: weakSubjects (array of 3 strings)
Navigate: → complete (submit + go to Dashboard)
```

#### 2.3.3 — Modify complete.tsx

**Current behavior:** Shows strategy summary card, submits payload, then navigates to `/` (root).

**V4 changes:**
1. Remove summary card display — plan generates silently
2. Auto-calculate strategy mode using `classifyModeV2` from `apps/mobile/lib/classify.ts` instead of passing `chosen_mode` from result screen
3. Submit payload with new fields: `cycle`, `studyApproach`, `weakSubjects`, auto-calculated `chosen_mode`
4. Navigate to `/(tabs)` (Dashboard) on success — NOT back to `/` (V2 bug fix)
5. Show simple loading animation during submission: "Generating your UPSC plan..."

#### 2.3.4 — Update Onboarding Payload Type

**File:** `apps/mobile/types/index.ts` (or shared-types)

Add to `OnboardingV2Payload`:
```typescript
cycle: string;              // 'this_year' | 'next_year' | 'not_sure'
study_approach: 'sequential' | 'mixed';
weak_subjects: string[];    // array of 3 subject display names
```

#### 2.3.5 — Update Backend Onboarding Endpoint

**File:** `apps/api/src/routes/onboarding.ts` + `apps/api/src/services/onboarding.ts` (or wherever completeOnboarding lives)

Accept new fields. Store:
- `study_approach` in `user_profiles` or `strategy_params` table (new column)
- `weak_subjects` → seed F9 Weakness Radar initial priority
- `cycle` → compute exam_date from cycle selection

#### 2.3.6 — Update Progress Dots

V2 had 7 dots, V4 has 6. Update the `OnboardingProgressBar` component or use inline progress dots showing 6 steps.

---

## PHASE 3: Backend Additions + Settings Rebuild

### Step 3.1 — Backend: Move & Defer Endpoints

**File:** `apps/api/src/services/planActions.ts` (currently 212 LOC — room to add)

#### 3.1.1 — movePlanItem function
```typescript
export async function movePlanItem(
  userId: string,
  planItemId: string,
  targetDate: string  // 'YYYY-MM-DD'
): Promise<{ success: boolean }> {
  // 1. Validate targetDate is not in the past
  // 2. Fetch the plan item, verify it belongs to userId
  // 3. Update the plan item's plan_date to targetDate
  // 4. Check if target day exceeds capacity → return warning flag but allow
  // 5. Return success
}
```

#### 3.1.2 — deferPlanItem function (enhance existing)
Current `deferPlanItem` just marks status as 'deferred'. V4 needs it to:
1. Find next available day that has capacity below target hours
2. Move the item to that day's plan
3. Apply +1 priority boost (already implemented per V4 spec)

#### 3.1.3 — Routes
**File:** `apps/api/src/routes/planner.ts`
```typescript
app.patch('/api/dailyplan/:planId/move', async (request) => {
  const { targetDate } = request.body;
  return movePlanItem(request.userId, request.params.planId, targetDate);
});

app.patch('/api/dailyplan/:planId/defer', async (request) => {
  return deferPlanItem(request.userId, request.params.planId);
});
```

#### 3.1.4 — Mobile hooks
**File:** `apps/mobile/hooks/usePlanner.ts`
```typescript
export const useMovePlanItem = () => useMutation({
  mutationFn: ({ planId, targetDate }: { planId: string; targetDate: string }) =>
    api.movePlanItem(planId, targetDate),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dailyPlan'] });
    queryClient.invalidateQueries({ queryKey: ['weekPlan'] });
  },
});

export const useDeferPlanItem = () => useMutation({
  mutationFn: (planId: string) => api.deferPlanItem(planId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dailyPlan'] });
    queryClient.invalidateQueries({ queryKey: ['weekPlan'] });
  },
});
```

**API client additions** in `apps/mobile/lib/api.ts`:
```typescript
movePlanItem: (planId: string, targetDate: string) =>
  request(`/api/dailyplan/${planId}/move`, { method: 'PATCH', body: JSON.stringify({ targetDate }) }),

deferPlanItem: (planId: string) =>
  request(`/api/dailyplan/${planId}/defer`, { method: 'PATCH' }),
```

---

### Step 3.2 — Backend: Study Preference + Planner Algorithm Changes

#### 3.2.1 — Database Migration
**File:** `apps/api/supabase/migrations/0XX_study_preference.sql`
```sql
ALTER TABLE user_profiles ADD COLUMN study_approach TEXT DEFAULT 'mixed'
  CHECK (study_approach IN ('sequential', 'mixed'));
```

#### 3.2.2 — Thresholds for Sequential Mode
**File:** `apps/api/src/constants/thresholds.ts`

Add to PLANNER object:
```typescript
// Sequential mode overrides
SEQ_VARIETY_BONUS: 0,              // disabled in sequential
SEQ_MAX_SAME_SUBJECT_PCT: 0.80,    // 80% (vs 60% mixed)
SEQ_MIN_SUBJECTS: 1,               // 1 primary + 1 revision/CA
SEQ_PRIMARY_PCT: 0.70,             // 70%+ of hours on primary subject
SEQ_COMPLETION_THRESHOLD: 0.60,    // move to next subject at 60% completion
```

#### 3.2.3 — Planner Service Changes
**File:** `apps/api/src/services/planner.ts`

**In `allocateGreedy` function:**
1. Fetch user's `study_approach` from profile (passed in via `fetchPlannerData`)
2. Branch on approach:
   ```typescript
   const varietyBonus = studyApproach === 'sequential'
     ? PLANNER.SEQ_VARIETY_BONUS
     : PLANNER.VARIETY_BONUS;
   const maxSameSubjectPct = studyApproach === 'sequential'
     ? PLANNER.SEQ_MAX_SAME_SUBJECT_PCT
     : PLANNER.MAX_SAME_SUBJECT_PCT;
   ```
3. **Sequential subject ordering:** In `scoreTopic`, when sequential mode:
   - Identify the current primary subject (highest PYQ gravity that hasn't hit SEQ_COMPLETION_THRESHOLD)
   - Boost primary subject topics by a large factor (e.g., +20)
   - Suppress non-primary, non-revision topics

**IMPORTANT:** `planner.ts` is at 582 LOC. These changes may push it toward 700. If so, extract `applySequentialMode()` and `applyMixedMode()` into a helper file `apps/api/src/services/plannerModes.ts` (Tier 3 peer, can import via standard import since it's part of planner's own decomposition).

---

### Step 3.3 — Backend: Rich Notes CRUD

#### 3.3.1 — Database Migration
**File:** `apps/api/supabase/migrations/0XX_topic_notes.sql`
```sql
CREATE TABLE topic_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  note_type TEXT NOT NULL CHECK (note_type IN ('text', 'link')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_topic_notes_user_topic ON topic_notes(user_id, topic_id);
```

#### 3.3.2 — Service
**File:** `apps/api/src/services/topicNotes.ts` (new, Tier 1 — imports only supabase + utils)
```typescript
export async function getTopicNotes(userId: string, topicId: string)
export async function addTopicNote(userId: string, topicId: string, type: 'text' | 'link', content: string)
export async function updateTopicNote(userId: string, noteId: string, content: string)
export async function deleteTopicNote(userId: string, noteId: string)
```

#### 3.3.3 — Route
**File:** `apps/api/src/routes/topicNotes.ts` (thin controller)

#### 3.3.4 — Mobile Hook + API Client
```typescript
// useTopicNotes.ts
export const useTopicNotes = (topicId: string) => useQuery(...)
export const useAddTopicNote = () => useMutation(...)
export const useDeleteTopicNote = () => useMutation(...)
```

---

### Step 3.4 — Backend: Benchmark Weight Alignment

**VERIFIED MISMATCH:** Current benchmark.ts uses:
```
Coverage: 0.30, Confidence: 0.25, Weakness: 0.20, Consistency: 0.15, Velocity: 0.10
```

V4 spec says:
```
Coverage: 0.25, Confidence: 0.25, Consistency: 0.20, Velocity: 0.15, Weakness: 0.15
```

**Action:** Update `BENCHMARK_WEIGHTS` in `apps/api/src/constants/thresholds.ts`:
```typescript
export const BENCHMARK_WEIGHTS = {
  COVERAGE: 0.25,      // was 0.30
  CONFIDENCE: 0.25,    // same
  CONSISTENCY: 0.20,   // was 0.15
  VELOCITY: 0.15,      // was 0.10
  WEAKNESS: 0.15,      // was 0.20
} as const;
```

Also verify `benchmark.ts` reads from `BENCHMARK_WEIGHTS` in thresholds (not hardcoded). If hardcoded, move to thresholds per Rule 2.

---

### Step 3.5 — Backend: Mock Test Logging Verification

**VERIFIED:** `mockTest.ts` already accepts `subject_breakdown: SubjectBreakdown[]` with `subject_id`, `total`, `correct`. The V4 Mock screen's "Log New Test" form can use the existing `api.createMock()` endpoint as-is.

**No backend changes needed for mock logging.** The mobile form just needs to map the 6 chip labels (Polity, History, Geo, Eco, Sci, Env) to `subject_id` values and call the existing endpoint.

---

### Step 3.6 — Settings Screen Rebuild

**File:** `apps/mobile/app/(tabs)/settings.tsx`

**Current V2:** Profile, strategy mode switcher with 12 parameter sliders, exam mode toggle, redo onboarding, appearance section, gamification section, recalibration section, recovery section.

**V4 rebuild (top to bottom):**

#### 3.6.1 — Profile Section
- Name, email, exam target, days remaining, days of prep
- Use V4MetricBox for days left / day of prep

#### 3.6.2 — Exam Mode Toggle
- Segmented control: [Prelims] [Mains] [Post-Prelims]
- On change → call `api.switchExamMode()` (already triggers plan regen on backend)
- Invalidate queries: `dailyPlan`, `strategy`, `weekPlan`
- Show note: "Switching mode regenerates tomorrow's plan and adjusts subject priorities."

**VERIFIED:** `switchExamMode` backend already calls `regeneratePlan()` for tomorrow. Need React Query invalidation:
```typescript
const switchExamMode = useMutation({
  mutationFn: api.switchExamMode,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dailyPlan'] });
    queryClient.invalidateQueries({ queryKey: ['strategy'] });
    queryClient.invalidateQueries({ queryKey: ['weekPlan'] });
    // Update UserContext examMode
    refetchProfile();
  },
});
```

#### 3.6.3 — Study Preference Display
- Show current value (Sequential / Mixed) with two option cards
- On change → call new API to update study_approach + trigger planner recalculation
- Invalidate dailyPlan queries

#### 3.6.4 — Daily Hours Target
- Slider 2-12, 0.5 increments
- On change → call API to update + trigger plan regen

#### 3.6.5 — Achievements Section (moved from V2 Dashboard)
- XP level, current streak
- Badge grid: earned (colored) vs locked (gray, 0.4 opacity)
- "View All Badges →" link
- Use existing `useGamification()` hook

#### 3.6.6 — Strategy Info (READ-ONLY)
- Show auto-calculated strategy mode as V4Pill
- Brief explanation: "Based on your attempt (Xth), daily hours (Y), and schedule."
- No manual override — `classify.ts` handles this
- If user changes hours or attempt via redo onboarding, strategy auto-recalculates

#### 3.6.7 — Remove
- Delete `PersonaParamsSection` component import (12 parameter sliders)
- Delete `StrategyCard` mode switcher
- Keep recalibration section? → No, V4 moves recalibration into Weekly Review. Remove from Settings.

#### 3.6.8 — Bottom Actions
- Redo Onboarding → clears data, navigates to `/onboarding`
- Notifications → toggle for daily reminders, weekly review alerts, streak warnings
- About / Support / Logout

---

## PHASE 4: New Screens

### Step 4.1 — Week Plan Screen

**File:** `apps/mobile/app/(tabs)/weekplan.tsx`

**New hook:** `apps/mobile/hooks/useWeekPlan.ts`
```typescript
export const useWeekPlan = (weekOffset: number = 0) =>
  useQuery({
    queryKey: ['weekPlan', weekOffset],
    queryFn: () => api.getWeekPlan(weekOffset),
  });
```

**New API endpoint needed?** The planner currently generates daily plans. Week plan may need a new endpoint `GET /api/weekplan?week=current|next` that returns 7 days of plans, OR the mobile can fetch 7 individual daily plans and compose them client-side.

**Recommended:** Add `GET /api/weekplan` route that calls `getDailyPlan` for each day in the week range and aggregates. Thin controller, service logic in planner or a new `weekPlan.ts` helper.

**UI Layout:**

#### 4.1.1 — Week Toggle Buttons
"This Week" / "Next Week" — toggle `weekOffset` (0 or 1)

#### 4.1.2 — Weekly Summary Card
- Date range + total planned hours / target hours
- V4Bar progress
- Task distribution stacked bar (NEW / REV / CA / TEST / MAINS segments)

#### 4.1.3 — First-Week Behavior (daysUsed <= 7, fresher only)
- Only 3 days shown with tasks
- Thu–Sun shows "LEARNING" placeholder card
- Purple info V4Card: "Your first week is tentative..."

#### 4.1.4 — Day Rows (collapsible)
Each day: day name, task count, total hours, TODAY badge
- Tap to expand → shows task list
- Each task has: V4Pill tag, subject, topic, duration, **Move** and **Defer** buttons

#### 4.1.5 — Move Button
On press → show horizontal day picker (Mon–Sun)
- Past days grayed out (disabled)
- Current day highlighted
- Selecting a day → calls `useMovePlanItem` mutation
- If target day exceeds capacity → show orange warning "This day is full — add anyway?" with confirm/cancel

#### 4.1.6 — Defer Button
On press → calls `useDeferPlanItem` mutation directly (backend finds next available day)

#### 4.1.7 — Mains Mode Additions
- MAINS-tagged answer writing blocks on Tue/Wed/Fri
- Distribution bar includes MAINS segment

---

### Step 4.2 — Revision Hub Screen

**File:** `apps/mobile/app/revision.tsx`

**Data sources:** `useFSRS()` hook for revisions due, confidence overview.

**Layout:**

#### 4.2.1 — Top Metrics Row (3 V4MetricBoxes)
- Due today (red/danger)
- This week (orange/warn)
- Retention % (green)

#### 4.2.2 — Memory Health Card
- Stacked bar: Fresh X% / Fading X% / Stale X% / Decayed X% (4 colors)
- V4Tip explaining decay states
- "X topics · Predicted X% retention on exam day"

#### 4.2.3 — "Revise Today" List
- Sorted by urgency: Decayed → Stale → Fading
- Each row: topic name, subject, urgency V4Pill
- Colored left border matching urgency

#### 4.2.4 — "Coming Up" Section
- Topics due in 3-5 days
- Dimmed at 0.6 opacity

---

### Step 4.3 — Full Syllabus Screen

**File:** `apps/mobile/app/fullsyllabus.tsx`

#### 4.3.1 — Lock Screen (freshers < day 14)
```typescript
if (!isVeteran && daysUsed < 14) {
  return <LockedScreen daysRemaining={14 - daysUsed} />;
}
```
Lock message: "Full Syllabus unlocks in X days. Seeing 466 topics in week 1 causes anxiety..."

#### 4.3.2 — Unlocked View
- Global stats: "X of Y topics · Weighted by PYQ" with V4Bar
- Filter bar: All / Untouched / Needs Revision / Weak / Exam Ready (horizontal scroll)
- 3-level collapsible: Papers (GS1-GS4) → Subjects → Topics
- **All papers collapsed by default** (V2 had GS1 expanded)

#### 4.3.3 — Per-Topic Detail Card
When a topic is expanded:
- Topic name, status V4Pill, FSRS decay state, PYQ weight
- Metadata: Covered date, Last revised, Next revision (red if "Overdue")
- Rich notes (from `useTopicNotes` hook):
  - 📝 text notes (orange italic)
  - 📎 link notes (purple)
  - "+ Add note or link" button → opens inline text input or modal

---

### Step 4.4 — Mock Test Analysis Screen

**File:** `apps/mobile/app/mocks.tsx`

**Data source:** `useMockTest()` hook (existing)

#### 4.4.1 — "Log New Mock" Button
- Dashed border card with "+" icon
- On tap → expand inline form:
  - Test name text input
  - Score / Total side-by-side inputs
  - Subject-wise breakdown: 6 chips with score fields (optional)
  - "Save Test" button → calls existing `api.createMock()`

#### 4.4.2 — Score Trend Chart
- Vertical bar chart of last 5 tests
- Color coding: green ≥45%, orange ≥35%, red <35%
- Trend line: "↑ Trending up: X% → Y% over Z tests"
- Implementation: Custom View-based bars or `react-native-chart-kit` / `victory-native`

#### 4.4.3 — Subject-wise Accuracy
- Horizontal V4Bar for each subject
- Test accuracy % (NOT syllabus coverage)

#### 4.4.4 — Repeated Mistakes Section
- Topics wrong multiple times across tests (from mock analytics API)
- Each row: topic name, subject, "Wrong Xx" V4Pill
- V4Tip: "Topics you keep getting wrong across tests..."
- Auto-flag message: "Auto-flagged for intensive revision next week"

#### 4.4.5 — Recent Tests List
- Cards with test name, date, score/total, percentage (color-coded)

---

### Step 4.5 — Low Day Mode Screen

**File:** `apps/mobile/app/lowday.tsx`

**Progressive disclosure:** Hidden for freshers until day 7, veterans see from day 3. Navigation link only shown if `isScreenUnlocked('lowDay', daysUsed, isVeteran)`.

**Layout:**

#### 4.5.1 — Calming Header
- Gradient purple background (LinearGradient)
- 🌊 wave emoji
- "Low energy day? That's okay."
- "Every topper had off days. The goal isn't 6 hours — it's staying in the game."

#### 4.5.2 — Minimum Viable Day Card (~2 hrs)
3 tasks:
- ↻ Revise 1 fading topic (30 min)
- 📰 Read current affairs (30 min)
- 📝 1 PYQ set — any subject (45 min)

#### 4.5.3 — "Hidden Today" List
Shows what's been suppressed:
- ✗ Full task list → 3 essentials only
- ✗ Readiness score → rest day
- ✗ Backlog → zero guilt
- ✗ Streak → grace day, won't break
- ✗ Velocity → rest is part of the plan

#### 4.5.4 — "Feeling better? → Switch to full mode"
On tap → `router.push('/(tabs)')` — navigates back to Dashboard with full UI

**Behavior note:** Low Day is a VIEW, not a persistent mode. No backend state change. The full plan remains.

---

## PHASE 5: Power Features + Polish

### Step 5.1 — Ranker Mode Enhancements

**File:** `apps/mobile/app/ranker.tsx`

**Progressive disclosure:** Day 30 for freshers, Day 0 for veterans.

#### 5.1.1 — Velocity Intelligence
3 V4MetricBoxes: topics/day rate, projected completion date, required velocity increase.
Data from `useVelocity()`.

#### 5.1.2 — Weakness Radar
4 subjects with 5-tier classification bars. Data from `useWeakness()`.

#### 5.1.3 — Enhanced What-If Simulator
**Subject-specific projections:**
"If I go 6→8 hrs and prioritize Economics..."
- Economics: 22% → 48% (+26%)
- Polity: 58% → 58% (paused 2 weeks)
- Mock projected: 47% → 55%

Data from `useSimulator()` — may need to enhance the simulator API to return per-subject breakdowns (verify current response shape).

**Burnout warning:** If simulated hours > 9/day, show: "⚠ Burnout risk HIGH above 9 hrs/day"

#### 5.1.4 — Answer Writing Section (Mains mode)
- Total answers written, weakest paper, paper-wise breakdown (GS1: X, GS2: Y, etc.)
- Only shown when `examMode === 'mains'`

---

### Step 5.2 — Weekly Review Enhancements

**File:** `apps/mobile/app/weeklyreview.tsx`

#### 5.2.1 — Bar Chart
Daily study hours for the week. Color by threshold: green ≥5, orange ≥3, red <3.
Custom View-based bars or chart library.

#### 5.2.2 — 3-Metric Row
V4MetricBoxes: Tasks completed (X/Y), Revisions done, Readiness delta (+X%)

#### 5.2.3 — Adaptive Reflection Questions
```typescript
const isFresh = daysUsed < 21;
const questions = isFresh
  ? ["Did you mostly follow the daily plan?", "One subject that felt manageable?", "Any topic you want to revisit?"]
  : ["What felt easy this week?", "Where did you get stuck?", "One thing to change next week?"];
const title = isFresh ? "Quick Check-in" : "Weekly Reflection";
```

#### 5.2.4 — Recalibration Engine Card (Coverage vs Understanding)
- **Coverage gap** (red pill): "Economics at 22% — shift 2 Polity sessions to Economics."
- **Understanding gap** (orange pill, veterans with mock data only): "Geography accuracy dropped to 42% in last mock despite 41% coverage. Try PYQs from Climatology."

Data: combine `useWeeklyReview()` + `useMockTest()` analytics.

---

### Step 5.3 — Syllabus Simple View First-Week State

**File:** `apps/mobile/app/(tabs)/syllabus.tsx`

#### 5.3.1 — First-Week Info Card (daysUsed <= 7)
V4Card with accent border:
"Getting Started — Your progress appears here as you study. Follow the daily plan..."

#### 5.3.2 — "Not started" Labels
When `daysUsed <= 7`: show "Not started" text instead of 0% and progress bars.

#### 5.3.3 — Disable Topic Expansion
When `daysUsed <= 7`: subject rows are not tappable (no point showing 0% topics).

#### 5.3.4 — After First Week
- Collapsible subject list with colored left border
- Each row: Subject name, mini V4Bar, percentage
- Tap to expand → topics with status V4Pills, FSRS decay state, PYQ dots
- Header: "Weighted by PYQ importance" with V4Tip

---

### Step 5.4 — Hero Card → Planner Auto-Start Wiring

**Verify end-to-end flow:**
1. Dashboard renders hero card with first incomplete task from `usePlanner()` ✓ (Step 2.1.3)
2. "Start Studying" passes `autoStartItemId` param ✓ (Step 2.1.3)
3. Planner reads param and calls `timerContext.startTimer()` ✓ (Step 2.2.1)
4. Timer appears inline on the task card ✓ (Step 2.2.3)
5. Timer stop → logs time → completes task ✓ (Step 2.2.6)

**Edge cases to handle:**
- What if the planner screen is already open with a running timer? Don't restart.
- What if the first incomplete item changes between Dashboard render and Planner mount? Use the ID, not index.
- Clear the `autoStartItemId` param after consuming it to prevent re-triggering on tab switches.

---

### Step 5.5 — First-Week States Across All Screens

Comprehensive checklist of day-awareness behaviors:

| Condition | Screen | Behavior | Step |
|-----------|--------|----------|------|
| Day 1-3 | Dashboard | Welcome card shown | 2.1.2 |
| Day 1 | Dashboard | Backlog card hidden | 2.1.7 |
| Day 1-7 | Dashboard | Readiness score hidden | 2.1.6 |
| Day 1-7 | Syllabus | "Getting Started" card + "Not started" labels | 5.3 |
| Day 1-7 | Week Plan | Only 3 planned days + "learning" placeholder | 4.1.3 |
| Day < 14 | Full Syllabus | Locked with explanation (freshers) | 4.3.1 |
| Day < 21 | Weekly Review | Simpler "Quick Check-in" prompts | 5.2.3 |
| Day < 3 | Low Day | Hidden (freshers), visible day 3+ (veterans) | 4.5 |
| Day < 7 | Low Day | Hidden (freshers) | 4.5 |
| Day < 30 | Ranker | Hidden (freshers) | 5.1 |

---

## PHASE 6: V5 Exclusion Guardrails

### Step 6.1 — Document Deferred Features

**Create file:** `apps/mobile/V5_DEFERRED.md` (or add to CLAUDE.md)

List of features explicitly NOT in V4 scope:

| Feature | Why Deferred | Do NOT Build |
|---------|-------------|-------------|
| Optional Subject support | Needs separate syllabus tree, velocity, planner queue | No optional subject selection in onboarding |
| CA-to-syllabus subject tagging | Needs NLP auto-tagging or manual UI | No `ca_subject_tags` table |
| Previous attempt autopsy | Needs scorecard import flow | No prior-knowledge seeding |
| Dedicated answer writing input | Currently tracked via Quick Log | No dedicated logging screen |
| Deep mock analysis (per-question) | Needs `mock_questions` table | No question-level UI |
| Hindi language support | Needs translation infrastructure | No language toggle |

### Step 6.2 — Add Guardrail Comments

In relevant files, add brief comments:
```typescript
// V5: CA subject tagging deferred — log CA via Quick Log for now
// V5: Per-question mock analysis deferred — subject-level only in V4
// V5: Optional subjects deferred — GS1-GS4 + CSAT only
```

---

## CROSS-CHECK: Every Item Verified

### From Corrected Analysis — Missing Items (all now covered):

| Item | Plan Step |
|------|-----------|
| Timer state management (global singleton, AsyncStorage, backgrounding) | 1.4 |
| "Start Studying" hero → Planner auto-start | 2.1.3 + 2.2.1 + 5.4 |
| Mock test logging with subject-wise breakdown | 3.5 (verified existing) |
| Exam mode toggle → plan regeneration | 3.6.2 |
| Onboarding screen count reconciliation (11 → 8 files) | 2.3.1 – 2.3.6 |

### From Corrected Analysis — Underrepresented Items (all now expanded):

| Item | Plan Step |
|------|-----------|
| V5 deferred features awareness | 6.1 + 6.2 |
| Study preference → planner algorithm (variety_bonus, caps, ordering) | 3.2.2 + 3.2.3 |
| Readiness score weight verification + alignment | 3.4 |

### From Original Analysis — All Work Packages:

| Work Package | Plan Steps |
|-------------|-----------|
| Theme update + shared components | 1.1 + 1.2 |
| Onboarding rework | 2.3 |
| Progressive disclosure system | 1.3 + 1.5 |
| Dashboard overhaul | 2.1 |
| Week Plan (new + 2 API endpoints) | 4.1 + 3.1 |
| Revision Hub | 4.2 |
| Full Syllabus + rich notes | 4.3 + 3.3 |
| Mock Test Analysis | 4.4 |
| Quick Log (FAB + modal + API) | 1.6 + 1.7 |
| Low Day Mode | 4.5 |
| Ranker enhancements | 5.1 |
| Settings rebuild | 3.6 |
| Weekly Review enhancements | 5.2 |
| Planner modifications | 2.2 |
| Syllabus first-week state | 5.3 |
| Backend additions (Move/Defer/QuickLog/Notes/Weights) | 3.1 – 3.5 |
| Timer state management | 1.4 |
| Hero → Planner auto-start | 2.1.3 + 2.2.1 + 5.4 |
| First-week states matrix | 5.5 |

### From V4 Migration Prompt Checklist (Part 7 — Summary):

| Checklist Item | Plan Step |
|---------------|-----------|
| Mock Test Analysis (new screen) | 4.4 |
| Quick Log Modal (new screen) | 1.6 |
| Onboarding: 7→6, reorder, store attempt, navigate to dashboard | 2.3 |
| Dashboard: welcome card, hide readiness, hide backlog, mode-aware | 2.1 |
| Planner: LOGGED card, DECAY tooltip, timer on Start | 2.2 |
| Syllabus: "Getting Started" first-week state | 5.3 |
| Full Syllabus: lock freshers <14, collapsed default, rich notes | 4.3 |
| Week Plan: tentative first-week, Move/Defer, MAINS tasks | 4.1 |
| Weekly Review: adaptive prompts, coverage vs understanding | 5.2 |
| Low Day: progressive unlock, "full mode" returns to Dashboard | 4.5 |
| Ranker: progressive unlock, enhanced simulator | 5.1 |
| Settings: remove sliders, add Achievements, auto strategy, study pref | 3.6 |
| V4Card, V4Bar, V4Pill, V4MetricBox, V4Tip, V4SectionLabel | 1.2 |
| QuickLogFAB (persistent all screens) | 1.6 + 1.7 |
| QuickLogModal (bottom sheet) | 1.6 |
| Theme update (all colors) | 1.1 |
| Progressive disclosure logic in tab navigator | 1.5 |
| Attempt value stored and used globally | 1.3 |
| daysUsed calculation | 1.3 |
| Exam mode awareness (Dashboard, Week Plan, Ranker) | 2.1.4 + 4.1.7 + 5.1.4 |
| Study preference modifies planner greedy fill | 3.2 |
| Timer state management | 1.4 |
| POST /api/quicklog | 1.6.4 |
| PATCH /api/dailyplan/:planId/move | 3.1 |
| PATCH /api/dailyplan/:planId/defer | 3.1 |
| Study preference storage + planner override | 3.2 |
| Rich notes CRUD | 3.3 |
| Mock test logging with subject breakdown | 3.5 (verified existing) |

**Result: 100% coverage. Every item from the corrected analysis, the V4 migration prompt checklist, and all identified gaps are mapped to specific plan steps.**
