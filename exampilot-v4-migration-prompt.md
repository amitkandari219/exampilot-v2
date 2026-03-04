# ExamPilot V4 — Complete UI Migration Spec & Implementation Prompt

> **Purpose:** This document is a self-contained prompt for Claude (Claude Code or Claude chat) to migrate the existing ExamPilot V2 React Native app to the V4 UI design. It contains the full context — what the app is, what the current UI looks like, what V4 should look like, and exactly what needs to change. Feed this entire document as context.

---

## PART 1: WHAT IS EXAMPILOT

ExamPilot is a UPSC Civil Services Exam preparation management app. It is NOT a content app or test series — it's an execution-focused study intelligence platform that helps aspirants plan realistically, track progress with spaced repetition (FSRS), identify weaknesses, prevent burnout, and maintain consistency over 12-18 month prep cycles.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 52), Expo Router v4 (file-based routing) |
| Backend | Fastify 5 (Node.js) |
| Database | Supabase (PostgreSQL) |
| Server State | React Query (TanStack Query v5) |
| Local State | AsyncStorage |
| Spaced Repetition | ts-fsrs (FSRS-6 algorithm) |

### Project Structure

```
cse-study-planner/
├── apps/
│   ├── mobile/           # Expo React Native app
│   │   ├── app/          # File-based routing (Expo Router)
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # API client, classify.ts, Supabase client
│   │   ├── hooks/        # React Query hooks (16 hooks)
│   │   ├── types/        # TypeScript interfaces
│   │   └── constants/    # Theme colors, strategy mode definitions
│   └── api/              # Fastify backend
│       └── src/
│           ├── routes/   # 17 API routes
│           ├── services/ # 15 service modules
│           ├── lib/      # Supabase client
│           └── types/    # API type definitions
└── package.json          # npm workspaces root
```

### 18 Features (17 complete, 1 pending)

| ID | Feature | Status | What It Does |
|----|---------|--------|-------------|
| F1 | Onboarding & Strategy | ✅ | 7 onboarding screens → 4 strategy modes (Balanced/Aggressive/Conservative/Working Pro) with 12 tunable params each |
| F2 | PYQ Intelligence | ✅ | 466-topic syllabus seeded with Previous Year Question weights and gravity calculations |
| F3 | Living Syllabus Map | ✅ | Hierarchical topic tree: Paper → Subject → Topic, with PYQ dots, confidence bars, status tags (Untouched/Weak/Moderate/Exam Ready/First Pass) |
| F4 | Velocity Engine + Buffer Bank | ✅ | Topics/day velocity, projected completion date, buffer days for overruns |
| F5 | Confidence Decay (FSRS-6) | ✅ | ts-fsrs engine calculates retrievability per topic. States: Fresh → Fading → Stale → Decayed |
| F6 | Spaced Repetition | ✅ | Auto-schedules revisions based on FSRS optimal intervals |
| F7 | Stress Thermometer | ✅ | 4-factor stress scoring (Velocity, Buffer, Timeline, Consistency) |
| F8 | Smart Daily Planner | ✅ | Generates 3-5 daily study blocks with NEW/REVISION/DECAY/DAILY tags, capacity-aware scheduling |
| F9 | Weakness Radar | ✅ | 5-tier subject classification: Critical → Vulnerable → Developing → Competent → Ready |
| F10 | Recalibration Engine | ✅ | Weekly auto-adjustment of study plan based on drift from targets. Has drift limits to prevent wild swings |
| F11 | Burnout Guardian | ✅ | Fatigue threshold, burnout detection, enforced break recommendations |
| F12a | Weekly Review (Minimal) | ✅ | Bar chart of daily hours, total hours, tasks completed, readiness delta |
| F12b | Weekly Review (Enhanced) | ✅ | Reflection questions, AI-generated plan adjustment suggestions |
| F13 | Mock Test Integration | ✅ | Score tracking, subject-wise accuracy, score trend visualization |
| F14 | Prelims/Mains Toggle | ✅ | Switches entire app between Prelims focus and Mains focus (adds answer writing tracking, GS paper-wise progress) |
| F15 | "What If" Simulator | ✅ | Scenario modeling: "If I study 8 hrs instead of 6, what changes?" with projected readiness and completion dates |
| F16 | Current Affairs Tracker | ⏳ | PENDING — daily CA time logging with streak tracking |
| F17 | Gamification Layer | ✅ | XP, levels, badges (Streak/Study/XP Milestones/Recovery/Special), streak tracking with grace days |
| F18 | Strategic Benchmark | ✅ | Percentile positioning against strategy targets |

> **V4 note on F16:** CA tasks appear in the Planner (tagged DAILY/CA) and can be logged via Quick Log, but these are regular plan items — time is tracked, subject coverage updated. The dedicated CA Tracker feature (F16) with its own streak heatmap, subject-tagging of articles to GS topics, and monthly consolidation is **deferred to V5**. Do NOT build F16-specific UI in V4.

### Current Screens (V2)

The existing app has approximately 6 main screens accessed via Expo Router:
1. **Dashboard** — Exam Readiness score (65/100) with 5-axis breakdown, strategy mode display, XP/level, stress indicators, current affairs streak, study hours today
2. **Syllabus Map** — Hierarchical tree with PYQ dots, confidence bars, status tags, weighted completion %
3. **Planner** — "Today's Mission" with time-allocated blocks tagged NEW/REVISION/DECAY, capacity bar, defer options, built-in timer
4. **Progress** — Mock test score trends, subject accuracy breakdown, confidence distribution (Fresh/Fading/Stale/Decayed), weekly review charts
5. **Settings** — Strategy mode switcher, 12 parameter sliders, exam mode toggle (Prelims/Mains/Post-Prelims), redo onboarding
6. **Simulator** — What-If scenario modeling

### Current Design System (V2)

- Dark theme: background `#0F172A`, surface `#1E293B`, accent cyan `#22D3EE`
- Components: QuestionScreen, HoursSlider, OptionCard, ModeCard, ProgressDots, StrategyCard
- Standard React Native components with inline styles

---

## PART 2: WHAT V4 CHANGES

The V4 redesign is driven by two core insights from aspirant-perspective reviews:

1. **First-time users (freshers) are overwhelmed** — seeing 466 topics, a readiness score of 0%, and 15 metrics on day 1 causes anxiety and early churn
2. **Repeat aspirants (veterans) need more power** — answer writing tracking, mock-to-revision feedback loops, subject-specific what-if scenarios, and task editing in the weekly plan

V4 introduces **progressive disclosure** (features unlock over time), **attempt-based personalization** (veterans see everything from day 1), **mode-aware metrics** (Prelims vs Mains changes the dashboard), and **psychological safety** (guilt-free language, hidden anxiety triggers for new users).

### V4 Design System

```
COLORS (update from V2 → V4):
  Background:    #0F172A → #0B1120
  Surface:       #1E293B → #131C31
  Card:          (new)     #182036
  Border:        (new)     #1E2D4A
  Accent:        #22D3EE → #3ECFB4 (cyan → muted teal, reduces eye strain)
  Warning:       #F59E42
  Danger:        #EF4444
  Green:         #34D399
  Purple:        #A78BFA
  Orange:        #F97316
  Text primary:  #E8ECF4
  Text dimmed:   #7B8BA5
  Text muted:    #4A5568

TYPOGRAPHY:
  System fonts: 'Segoe UI', system-ui, sans-serif (no custom fonts to load)
  
COMPONENT PATTERNS:
  Card:          bg #182036, borderRadius 16, border 1px solid #1E2D4A, padding 18
  Pill badge:    borderRadius 20, padding 3px 10px, fontSize 11, fontWeight 600
  Metric box:    borderRadius 14, padding 14px 16px, flex 1
  Section label: fontSize 12, fontWeight 700, uppercase, letterSpacing 1.2
  Progress bar:  borderRadius 6, height 6, animated width transition
```

---

## PART 3: EVERY SCREEN IN V4 — DETAILED SPEC

### Screen 0: Onboarding (6 steps — changed from V2's 7 steps)

**What changed from V2:** V2 had 7 screens (Hours → Professional → Attempt → Approach → Fallback → Result → Exam Date). V4 replaces Approach/Fallback/Result with a single "Study preference" question and removes the Result screen (plan generates silently). V4 also reorders to put Attempt first (it drives progressive disclosure).

| Step | Question | Options | Data Stored |
|------|----------|---------|-------------|
| 0 | "Which attempt is this?" | 1st Attempt / 2nd Attempt / 3rd+ Attempt | `attempt` (integer: 1, 2, or 3) — **drives progressive disclosure** |
| 1 | "Are you a working professional?" | Full-time prep / Working + preparing | `professional` (boolean) |
| 2 | "Which Prelims cycle?" | This year (2026) / Next year (2027) / Not sure | `cycle` (string) |
| 3 | "How do you prefer to study?" | One subject at a time / Mix subjects daily | `studyApproach` ("sequential" or "mixed") — **NEW: shapes F8 planner output** |
| 4 | "Hours per day?" (slider 2-12) | Continuous slider, 0.5 increments | `hoursPerDay` (float) |
| 5 | "3 weakest GS subjects" (pick 3 chips) | 10 GS subjects as tappable chips | `weakSubjects` (array of 3 strings) |

**Study approach downstream behavior:**
- **Sequential mode:** Daily planner schedules max 2 subjects per day (1 primary subject consuming 70%+ of hours, 1 revision/CA subject). The greedy fill algorithm's variety_bonus is disabled, and the 60% same-subject cap is raised to 80%. Subject ordering follows PYQ-weighted priority — highest gravity subject first until it reaches a completion threshold (e.g., 60%), then moves to next subject.
- **Mixed mode (default):** Daily planner uses standard 3-5 subject diversity per day. Greedy fill variety_bonus (+2) is active, 60% same-subject cap enforced, min 2 subjects guaranteed.

**Chip-to-subject mapping:** The 10 chips shown (Indian Polity, Economics, Geography, Ancient History, Modern History, Art & Culture, Science & Tech, Environment, Ethics, CSAT) map to the database `subjects` table via display_name → subject_id lookup. Note: "Ancient History" and "Modern History" are separate chips but may map to a single "History" subject in the DB — use the subject_id mapping, not string matching. The 16-subject DB includes subjects like IR, Governance, Indian Society that are NOT shown as onboarding chips (they're too granular for a fresher to assess). The 3 selected weak subjects seed the F9 Weakness Radar's initial priority ordering.

**Critical behavior:** After step 5, tapping "Generate My UPSC Plan →" navigates to Dashboard (NOT back to step 0 — this was a V2 bug). The `attempt` value is stored and used immediately to determine which tabs are visible.

**Strategy mode mapping:** V4 removes the explicit strategy mode selection screen. Instead, strategy is auto-calculated from attempt + hours + professional status using the existing `classify.ts` logic. The user never sees "Balanced/Aggressive/Conservative" labels — the app just adapts.

### Screen 1: Dashboard

**Layout (top to bottom):**

1. **Header row:** "Good morning" + "Prelims in X days" countdown (left), PRELIMS/MAINS mode pill badge (right)

2. **Welcome card (day 1-3 ONLY):** Teal-bordered card saying "For the next few days, just focus on the Start Here card below. Tap it, study, mark done. Everything else fills in as you build history." — **HIDDEN after day 3**

3. **Hero "START HERE" card:** Gradient teal background, shows the single most important study task: subject name, topic name, estimated duration, PYQ weight. Large "▶ Start Studying" button. Has a (?) tooltip on PYQ weight explaining "Topics asked more often in past exams are prioritized. This topic appeared X times in the last 10 years."
   
   **On tap behavior:** "▶ Start Studying" navigates to the Planner screen and auto-starts the timer for the hero task (first incomplete task in today's plan).

4. **5-metric row (two rows of boxes):**
   - Row 1: Hours today (of target), Tasks done (X/Y), **Streak OR Answer writing** (mode-dependent — see below)
   - Row 2: Revisions due (with (?) tooltip), Momentum (7-day score)
   
   **Mode-aware metric (3rd box):**
   - **Prelims mode:** Shows "12 day streak"
   - **Mains mode:** Shows "3 answers today / 12 this week"

5. **Prelims/Mains split bar (Mains mode ONLY):** Horizontal stacked bar: "Prelims 65% | Mains 35%" with "Answer writing: 12 this week · Weakest paper: GS2" below

6. **Exam Readiness card (HIDDEN first 7 days):** Score X/100 with 5-axis breakdown bars: Coverage, Confidence, Consistency, Velocity, Weakness. Has (?) tooltip explaining composite score.

   **Readiness score calculation (from F18 Strategic Benchmark service):**
   - **Coverage** (0-100): PYQ-weighted completion percentage across all active subjects
   - **Confidence** (0-100): Average FSRS retrievability × 100 across all covered topics
   - **Consistency** (0-100): 7-day rolling plan adherence (tasks_completed / tasks_planned × 100)
   - **Velocity** (0-100): velocity_ratio × 100, capped at 100 (ratio = actual_velocity / required_velocity)
   - **Weakness** (0-100): 100 - (critical_subjects + vulnerable_subjects) / total_subjects × 100
   - **Composite:** Weighted average — Coverage 25%, Confidence 25%, Consistency 20%, Velocity 15%, Weakness 15%

7. **Backlog card (HIDDEN day 1):** Warm orange background: "2 items rolled over from yesterday — tap to adjust." The word "adjust" not "complete."

**What V4 removes from V2 dashboard:** BRI score indicator, stress level toggles (Vel/Buf/Tim/Con), XP/level display, strategy mode label. These move to Settings or are absorbed into other metrics.

### Screen 2: Daily Planner

**Layout:**
1. **Capacity card:** "Today's Plan — X.X hrs / 6 hrs" with progress bar. Shows "X.X hrs buffer remaining" (not "time left"). If overplanned (>7 hrs when target is 6), shows warning in red.

2. **Task cards (3-5 per day):** Each card has:
   - Left colored border (teal=NEW, purple=REVISION, red=DECAY, orange=DAILY)
   - Pill tag: NEW / REVISION / DECAY / DAILY / MAINS / CA
   - Subject name (bold), topic name (dimmed)
   - Duration in minutes (right side)
   - "▶ Start" button (for incomplete) or "✓ Done" (for complete, card at 50% opacity)
   - DECAY tasks have a (?) tooltip: "This topic is fading from memory. Our algorithm detected you're at risk of forgetting it. A quick revision now saves a full re-study later."

   **Timer behavior (unchanged from V2, clarified here):**
   - Tapping "▶ Start" on any task starts a countdown timer using the task's estimated duration (e.g. 90 min)
   - Timer shows as an inline bar replacing the "▶ Start" button: elapsed time, remaining time, pause/stop controls
   - Pausing stops the clock but keeps the task in "active" state
   - Stopping (before timer completes) prompts: "Mark as done?" [Yes = complete task, log actual time] [No = return to paused]
   - Timer reaching 0 triggers a gentle nudge: "Time's up! Mark done or keep going?" — does NOT auto-complete
   - Only one timer can be active at a time across all tasks
   - Time logged from timer is the primary input for daily study hours tracking

3. **Quick-logged session card (shows when Quick Log has been used):** Appears with LOGGED pill tag, slightly dimmed (0.7 opacity), shows "Logged via Quick Log · 60 min · [topic]" and "✓ Counts toward today's hours and updates subject coverage"

4. **Progress bar at bottom:** X/Y tasks done

### Screen 3: Week Plan

**Top controls:** "This Week" / "Next Week" toggle buttons

**Weekly summary card:**
- Date range + total planned hours / target hours
- Progress bar
- Task distribution stacked bar (NEW / REV / CA / TEST / MAINS segments)

**First-week behavior (day 1-7, fresher only):**
- Only 3 days planned (Mon-Wed)
- Thu-Sun shows a single "LEARNING" tagged placeholder: "We're learning your study rhythm. These days will auto-plan from week 2."
- Purple info card: "Your first week is tentative. We've planned 3 days to start. The rest adjusts as we learn your rhythm."

**Day rows (collapsible):**
- Each day: day name, task count, total hours, TODAY badge (if current day)
- Tap to expand → shows task list inside
- **Each task has Move and Defer buttons** (small, right-aligned): Move opens a day picker, Defer pushes to next available day

   **Move behavior:** Tapping "Move" opens a horizontal day picker showing Mon–Sun of the current week. Selecting a day moves the task to that day's plan via `PATCH /api/dailyplan/:planId/move` with `{ targetDate }`. If the target day exceeds capacity (>target hours + 1hr buffer), show orange warning "This day is full — add anyway?" but allow it. Cannot move to past days.

   **Defer behavior:** Tapping "Defer" pushes the task to the next available day that has capacity below target hours. Backend: `PATCH /api/dailyplan/:planId/defer`. Deferred items get +1 priority boost the next day (already implemented in priority scoring fix #6).

**Mains mode additions:**
- MAINS-tagged answer writing blocks appear on Tue/Wed/Fri
- Distribution bar includes MAINS segment

### Screen 4: Syllabus (Simple View)

**First-week behavior:**
- Info card: "Getting Started — Your progress appears here as you study. Follow the daily plan — each completed session updates these numbers."
- All subjects show "Not started" label instead of 0%
- Topic detail expansion is disabled (no point showing all 0% topics)

**After first week:**
- Collapsible subject list with colored left border
- Each row: Subject name, mini progress bar, percentage
- Tap to expand → shows topics with status pills (Exam Ready / Moderate / First Pass / Weak / Untouched), FSRS decay state (Fresh / Fading / Stale / Decayed), PYQ dot visualization
- Header text: "Weighted by PYQ importance" with (?) tooltip

### Screen 5: Full Syllabus Bible

**Progressive disclosure:** LOCKED for freshers until day 14. Shows lock message: "Full Syllabus unlocks in X days. Seeing 466 topics in week 1 causes anxiety, not motivation. Focus on your daily plan — it's built from this syllabus anyway." Veterans see it from day 1.

**When unlocked:**
- Global stats: "X of Y topics · Weighted by PYQ" with overall progress bar
- Filter bar: All / Untouched / Needs Revision / Weak / Exam Ready
- 3-level collapsible hierarchy: Papers (GS1-GS4) → Subjects → Topics
- All papers collapsed by default (V2 had GS1 expanded)

**Per-topic detail card:**
- Topic name, status pill, FSRS decay state, PYQ weight count
- Metadata: Covered date, Last revised, Next revision (colored red if "Overdue")
- **Rich notes (NEW):** Text notes (📝 icon, orange italic) and link notes (📎 icon, purple). Examples: "📝 Focus on regional spread", "📎 Spectrum Ch.5, pg 78-92", "📝 Mnemonic: RAM-DIS"
- "+ Add note or link" button at bottom of each topic

### Screen 6: Revision Hub

**Top metrics row:** Due today (red), This week (orange), Retention % (green)

**Memory Health card:**
- Stacked bar: Fresh X% / Fading X% / Stale X% / Decayed X%
- (?) tooltip: "We track how well you remember each topic. 'Fresh' = solid. 'Decayed' = likely forgotten."
- "142 topics · Predicted 82% retention on exam day"

**Revise Today list:** Sorted by urgency (Decayed → Stale → Fading). Each row: topic name, subject, urgency pill.

**Coming Up section:** Topics due in 3-5 days, dimmed at 0.6 opacity.

### Screen 7: Mock Test Analysis (NEW SCREEN)

**Log New Mock button (top):** Dashed border card "+" icon + "Log New Mock Test". Expands inline to show:
- Test name input
- Score / Total inputs (side by side)
- Subject-wise breakdown (optional): 6 chips (Polity, History, Geo, Eco, Sci, Env) each with score fields
- "Save Test" button

**Score Trend chart:** Vertical bar chart of last 5 test scores with color coding (green ≥45%, orange ≥35%, red <35%). Trend line: "↑ Trending up: 34% → 47% over 5 tests"

**Subject-wise Accuracy:** Horizontal bar chart for each subject showing test accuracy % (this is DIFFERENT from syllabus coverage — coverage is "how many topics studied", accuracy is "how many questions answered correctly in tests")

**Repeated Mistakes section:** Topics wrong multiple times across tests. Each row: topic name, subject, "Wrong Xx" pill. (?) tooltip: "Topics you keep getting wrong across tests. These need targeted PYQ practice, not just re-reading."
Auto-flag message: "💡 Auto-flagged for intensive revision next week"

**Recent Tests list:** Cards with test name, date, score/total, percentage (color-coded)

### Screen 8: Weekly Review

**Bar chart:** Daily study hours for the week, colored by threshold (green ≥5, orange ≥3, red <3)

**3-metric row:** Tasks completed (X/Y), Revisions done, Readiness delta (+X%)

**Adaptive reflection questions:**
- **First 3 weeks (daysUsed < 21):** Simpler prompts titled "Quick Check-in" — "Did you mostly follow the daily plan?", "One subject that felt manageable?", "Any topic you want to revisit?"
- **After 3 weeks:** Full reflection titled "Weekly Reflection" — "What felt easy this week?", "Where did you get stuck?", "One thing to change next week?"

**Recalibration Engine card (UPGRADED):**
- Now differentiates **coverage gaps** vs **understanding gaps**
- Coverage gap example: 🔴 "Coverage gap" pill + "Economics at 22% — shift 2 Polity sessions to Economics. Polity is at 58%, well ahead."
- Understanding gap example (veterans only, requires mock data): 🟡 "Understanding" pill + "Geography accuracy dropped to 42% in last mock despite 41% coverage. Try PYQs from Climatology — re-reading notes isn't enough."

### Screen 9: Low Day Mode

**Progressive disclosure:** Hidden for freshers until day 7 (veterans see it from day 3).

**Layout:**
- Calming gradient purple header with wave emoji: "Low energy day? That's okay. Every topper had off days."
- "Minimum Viable Day" card (~2 hrs): 3 tasks only — revise 1 fading topic (30 min), read current affairs (30 min), 1 PYQ set (45 min)
- "Hidden Today" list: Shows what's been suppressed — full task list, readiness score, backlog count, streak counter, velocity metrics
- "Feeling better? → Switch to full mode" link at bottom

   **Behavior:** Low Day is a view, NOT a persistent mode. The full plan remains in the backend. Tapping "Switch to full mode" navigates back to the Dashboard with all normal metrics and full plan visible. No backend state change needed — Low Day is purely a client-side UI filter that shows a reduced set of tasks.

### Screen 10: Ranker Mode

**Progressive disclosure:** Day 30 for freshers, Day 0 for veterans.

**Layout:**
- Header: 🔥 Ranker Mode — "8+ hrs/day · Top 100 target"
- **Velocity Intelligence:** Topics/day rate, projected completion date, required velocity increase
- **Weakness Radar:** 4 subjects with 5-tier classification (Critical → Developing), horizontal bars
- **What-If Simulator (ENHANCED):** Subject-specific projections: "If I go 6→8 hrs and prioritize Economics..." → Economics: 22%→48%, Polity: 58%→58% (paused), Mock projected: 47%→55%. Burnout warning if >9 hrs/day.
- **Answer Writing section (Mains):** Total answers written, weakest paper, paper-wise breakdown (GS1: 14, GS2: 8, etc.)

### Screen 11: Settings (V4 changes only)

The Settings screen structure is largely unchanged from V2, with these V4-specific modifications:

**Layout (top to bottom):**
1. **Profile section:** Name, email, exam target (Prelims 2026/2027), days remaining
2. **Exam Mode toggle:** Segmented control [Prelims] [Mains] [Post-Prelims] — tapping switches mode app-wide (triggers daily plan regeneration)
3. **Study Preference:** Display current value (Sequential / Mixed) with edit option — changing triggers planner recalculation
4. **Daily Hours target:** Slider (2-12, 0.5 increments) — same as onboarding step 4
5. **Achievements section (NEW in V4):** Shows XP level, current streak, and "View All Badges →" link opening a grid of earned (colored) and locked (gray) badges. This is where gamification moved FROM the V2 dashboard.
6. **Strategy Info (read-only):** Shows the auto-calculated strategy mode (Balanced/Aggressive/Conservative/Working Pro) with a brief explanation: "Based on your attempt, hours, and schedule." No manual override — strategy is auto-derived from `classify.ts`.
7. **Redo Onboarding:** "Start fresh" button — clears onboarding data and restarts the 6-step flow
8. **Notifications:** Toggle for daily reminders, weekly review alerts, streak warnings
9. **About / Support / Logout**

**V4 removes from Settings:** The 12 parameter sliders (these are now auto-managed by the engine). Strategy mode manual switcher (auto-calculated).

### Screen 12: Quick Log Modal (floating)

**Always-visible FAB (floating action button):** Green "+" circle, bottom-right corner, on every screen.

**Modal (bottom sheet):**
- Subject selection: 10 chips (Polity, History, Geography, Economics, Science, Environment, Ethics, CSAT, Current Affairs, Answer Writing)
- Duration slider: 15 min to 180 min (15-min steps)
- Optional topic text field
- "Log Study Session" button (disabled until subject selected)
- Success state: "✓ Logged! 60 min of Economics added to today"

---

## PART 4: PROGRESSIVE DISCLOSURE RULES

This is the most important behavioral change from V2. Tabs/screens unlock based on two factors: **days used** and **attempt number**.

### Tab Visibility Matrix

| Screen | Fresher (1st attempt) | Veteran (2nd/3rd+) |
|--------|----------------------|-------------------|
| Onboarding | Always | Always |
| Dashboard | Always | Always |
| Planner | Always | Always |
| Week Plan | Always | Always |
| Syllabus (simple) | Always | Always |
| Revision Hub | Day 3+ | Day 0 |
| Full Syllabus | Day 14+ | Day 0 |
| Mocks | Day 7+ | Day 0 |
| Weekly Review | Day 7+ | Day 0 |
| Low Day | Day 7+ | Day 3+ |
| Ranker Mode | Day 30+ | Day 0 |

### Per-Screen Day-Awareness

| Condition | Behavior |
|-----------|----------|
| Day 1-3 | Dashboard shows Welcome card |
| Day 1 | Backlog card hidden (no yesterday to roll over from) |
| Day 1-7 | Readiness score hidden (meaningless without data) |
| Day 1-7 | Syllabus shows "Getting Started" card + "Not started" labels instead of 0% |
| Day 1-7 | Week Plan shows only 3 planned days + "learning your rhythm" placeholder |
| Day < 14 | Full Syllabus locked with explanation |
| Day < 21 | Weekly Review shows simpler "Quick Check-in" prompts |

---

## PART 5: IMPLEMENTATION INSTRUCTIONS

### Step 0: Audit the Existing Codebase

Before making any changes, you must understand the current state:

```
1. Read the full project structure:
   ls -la apps/mobile/app/
   ls -la apps/mobile/components/
   ls -la apps/mobile/constants/
   ls -la apps/mobile/hooks/
   ls -la apps/mobile/lib/

2. Read the current theme/colors:
   cat apps/mobile/constants/theme.ts (or colors.ts or similar)

3. Read the current navigation structure:
   cat apps/mobile/app/_layout.tsx
   cat apps/mobile/app/(tabs)/_layout.tsx (if tab-based)

4. Read each existing screen file to understand current component structure

5. Read the onboarding flow:
   ls apps/mobile/app/onboarding/ (or wherever onboarding screens live)

6. Check for shared component patterns:
   ls apps/mobile/components/
```

**Document what you find** before proceeding. Map every existing screen to its V4 equivalent.

### Step 1: Update Design System

Create or update the theme constants file:

```typescript
// apps/mobile/constants/theme.ts
export const V4 = {
  bg: '#0B1120',
  surface: '#131C31',
  card: '#182036',
  border: '#1E2D4A',
  accent: '#3ECFB4',
  accentDim: 'rgba(62,207,180,0.12)',
  warn: '#F59E42',
  warnDim: 'rgba(245,158,66,0.12)',
  danger: '#EF4444',
  dangerDim: 'rgba(239,68,68,0.10)',
  text: '#E8ECF4',
  textDim: '#7B8BA5',
  textMuted: '#4A5568',
  green: '#34D399',
  greenDim: 'rgba(52,211,153,0.12)',
  purple: '#A78BFA',
  purpleDim: 'rgba(167,139,250,0.12)',
  orange: '#F97316',
};
```

### Step 2: Create Shared V4 Components

Build these reusable components first (they appear across all screens):

1. **`<V4Card>`** — Standard card wrapper (bg, border, radius 16, padding 18)
2. **`<V4Bar>`** — Progress bar (animated width, configurable color/height, optional label)
3. **`<V4Pill>`** — Tag/badge pill (bg + text color, border-radius 20)
4. **`<V4MetricBox>`** — The metric display boxes used on dashboard (colored border, value + label)
5. **`<V4Tip>`** — Inline tooltip component ((?) icon that expands to show explanation text with "Got it" dismiss)
6. **`<V4SectionLabel>`** — Uppercase section header (12px, 700 weight, letter-spacing 1.2)
7. **`<QuickLogFAB>`** — Floating action button + modal (persistent across all screens)
8. **`<QuickLogModal>`** — Bottom sheet with subject chips, duration slider, optional topic input

### Step 3: Modify Onboarding

Changes from V2:
- Reduce from 7 screens to 6 (remove Approach, Fallback, Result screens)
- Add "Study preference" screen (sequential vs mixed)
- Reorder: Attempt is now screen 0 (was screen 2 in V2)
- Store `attempt` value — it drives progressive disclosure
- "Generate My UPSC Plan" button navigates to Dashboard (was broken in V2)
- Remove strategy mode display screen — strategy auto-calculated in background

### Step 4: Add Progressive Disclosure to Navigation

Modify the tab navigator (`_layout.tsx`) to conditionally show/hide tabs:

```typescript
// Pseudocode for tab visibility
const daysUsed = calculateDaysSinceOnboarding(user.created_at);
const isVeteran = user.attempt >= 2;

const isTabVisible = (tabId: string) => {
  const rules = {
    revision:     { fresher: 3,  veteran: 0 },
    fullSyllabus: { fresher: 14, veteran: 0 },
    mocks:        { fresher: 7,  veteran: 0 },
    weeklyReview: { fresher: 7,  veteran: 0 },
    lowDay:       { fresher: 7,  veteran: 3 },
    ranker:       { fresher: 30, veteran: 0 },
  };
  const minDays = isVeteran ? rules[tabId]?.veteran : rules[tabId]?.fresher;
  return minDays === undefined || daysUsed >= minDays;
};
```

### Step 5: Modify Each Screen

Work through screens in this order (dependencies flow downward):

1. **Dashboard** — Add `daysUsed` awareness: welcome card, hide readiness, hide backlog, mode-aware metrics
2. **Planner** — Add LOGGED card for quick-logged sessions, DECAY tooltip
3. **Syllabus (simple)** — Add first-week "Getting Started" state
4. **Week Plan** — Add first-week tentative plan, Move/Defer buttons on tasks, Mains-tagged tasks
5. **Revision Hub** — Add Memory Health tooltip, styled FSRS decay visualization
6. **Full Syllabus** — Add lock screen for freshers, rich notes (text + links), collapsed-by-default papers
7. **Mocks** — NEW SCREEN: Log New Test form, score trend chart, subject accuracy, repeated mistakes, auto-flagging
8. **Weekly Review** — Adaptive prompts, smarter recalibration (coverage vs understanding gap labels)
9. **Low Day** — "Minimum Viable Day" with hidden metrics list
10. **Ranker** — Enhanced What-If with subject-specific projections, burnout warnings

### Step 6: Add Quick Log System

1. Create `QuickLogFAB` component rendered in root layout (visible on all screens)
2. Create `QuickLogModal` bottom sheet
3. Create API endpoint: `POST /api/quicklog/:userId` with body `{ subject, duration, topic? }`
4. Backend: quicklog creates a study session record that counts toward daily hours and subject coverage
5. Planner screen queries for quick-logged sessions and renders them as LOGGED cards

### Step 7: Add Prelims/Mains Mode Awareness

The F14 toggle already exists in settings. V4 changes:
- Dashboard: 3rd metric box switches between streak (Prelims) and answer count (Mains)
- Dashboard: Prelims/Mains split bar appears only in Mains mode
- Week Plan: MAINS-tagged answer writing tasks injected when in Mains mode
- Ranker: Answer writing tracker section visible in Mains mode

### Step 8: Test All State Combinations

Critical test matrix (test each combination):

| Day | Attempt | Mode | What to verify |
|-----|---------|------|---------------|
| 1 | 1st | Prelims | Only 5 tabs visible, welcome card shown, readiness hidden, syllabus shows "Getting Started", week plan shows 3 tentative days |
| 1 | 2nd | Prelims | ALL 12 tabs visible, welcome card shown, readiness hidden |
| 7 | 1st | Prelims | Revision/Mocks/Review/Low Day unlocked, syllabus shows percentages, full week plan |
| 7 | 1st | Mains | Same + answer writing metric on dashboard, split bar, MAINS tasks in week plan |
| 14 | 1st | Prelims | Full Syllabus unlocks |
| 21 | 1st | Prelims | Weekly Review switches to full reflection prompts |
| 30 | 1st | Prelims | Ranker Mode unlocks |
| 45 | 2nd | Mains | Everything visible, all veteran features, mains mode fully active |

---

## PART 6: REFERENCE — V4 WIREFRAME

The complete interactive wireframe is available as a React component in the file `exampilot-v4.jsx`. This file contains working React code for all 12 screens with mock data. Use it as the pixel-perfect reference for colors, spacing, typography, component hierarchy, and behavioral logic.

**To view the wireframe:** Open the `.jsx` file in any React environment. It includes demo controls at the top (Day: 1/7/21/45, Attempt: 1/2/3+, Mode: Prelims/Mains) so you can simulate every user state.

**The wireframe is NOT production code.** It uses inline styles and mock data. Your job is to translate the visual design and behavioral logic into the existing React Native codebase using the real hooks, API calls, and component architecture already in place.

---

## PART 6b: INTENTIONALLY DEFERRED TO V5

The following features were discussed during V4 planning but are **intentionally excluded** from this migration. They are NOT forgotten — they require backend infrastructure that doesn't exist yet. Do not build UI for these.

| Feature | Why Deferred | Prerequisite |
|---------|-------------|-------------|
| **Optional Subject support** | V4 covers GS1-GS4 + CSAT only. Optional subjects (History, Geography, PSIR, Sociology, etc.) require a separate syllabus tree, separate velocity tracking, and separate daily plan allocation. | New `optional_subjects` table, separate planner queue, UI for optional subject selection in onboarding |
| **CA-to-syllabus subject tagging** | Current Affairs items should be tagged to the GS subject they relate to (e.g., a Supreme Court ruling → Polity). This closes the loop between CA and static subject knowledge. | NLP-based auto-tagging or manual tagging UI, `ca_subject_tags` junction table, integration with F16 |
| **Previous attempt autopsy** | 2nd/3rd attempt users should be able to import their Prelims scorecard and Mains marks to seed the system with prior knowledge gaps. | CSV/manual import flow, score-to-subject mapping, initial weakness seeding logic |
| **Answer writing input flow** | V4 shows answer counts in dashboard and Ranker, but there's no dedicated "I wrote an answer" logging screen. Currently, answer writing is tracked via Quick Log (select "Answer Writing" subject + duration). | Dedicated answer writing tracker with paper selection (GS1-GS4), question prompt storage, word count tracking, self-evaluation rubric |
| **Deep mock analysis** | V4's Mock screen handles score logging and trend visualization. Question-level analysis (time per question, negative marking patterns, topic-level accuracy drill-down) requires a more complex data model. | `mock_questions` table with per-question data, topic mapping algorithm, detailed analysis service |
| **Hindi language support** | Key UI labels in Hindi for Hindi-medium aspirants. | Translation file, language toggle in Settings, RTL-safe components |

---

## PART 7: WHAT NOT TO CHANGE

- **Backend API structure** — All 17 API routes remain the same. Only additions needed: Quick Log endpoint, Mock Test logging endpoint (if F13 doesn't already support input)
- **FSRS engine** — ts-fsrs integration stays exactly as-is
- **Strategy classification** — `classify.ts` logic stays, but the explicit strategy mode selection screen is removed from onboarding
- **Data model** — Supabase schema stays. New tables/columns only for: quick_log sessions, study_preference (sequential/mixed), rich notes on topics
- **Hooks** — All 16 React Query hooks stay. Add new hooks only for Quick Log and enriched mock test logging
- **Gamification** — XP/badges/streaks stay in the backend but are de-emphasized in V4 UI (moved out of dashboard, accessible via Settings or a dedicated Achievements section)

---

## SUMMARY OF ALL CHANGES (CHECKLIST)

### New Screens
- [ ] Mock Test Analysis (Screen 7)
- [ ] Quick Log Modal (Screen 11)

### Modified Screens
- [ ] Onboarding: 7 screens → 6, reorder, store attempt, navigate to dashboard
- [ ] Dashboard: welcome card, hide readiness first week, hide backlog day 1, mode-aware metrics
- [ ] Planner: LOGGED card for quick-log sessions, DECAY tooltip, timer behavior on Start
- [ ] Syllabus: "Getting Started" first-week state, hide percentages
- [ ] Full Syllabus: lock for freshers <14 days, collapsed by default, rich notes
- [ ] Week Plan: tentative first-week plan, Move/Defer buttons with day picker, MAINS tasks
- [ ] Weekly Review: adaptive prompts, coverage vs understanding gap labels
- [ ] Low Day: progressive unlock (day 7 freshers, day 3 veterans), "full mode" returns to Dashboard
- [ ] Ranker: progressive unlock (day 30 freshers, day 0 veterans), enhanced simulator
- [ ] Settings: remove parameter sliders, add Achievements section, show auto-calculated strategy, add study preference display

### New Components
- [ ] V4Card, V4Bar, V4Pill, V4MetricBox, V4Tip, V4SectionLabel
- [ ] QuickLogFAB (persistent across all screens)
- [ ] QuickLogModal (bottom sheet)

### System Changes
- [ ] Theme update (all colors)
- [ ] Progressive disclosure logic in tab navigator
- [ ] Attempt value stored from onboarding and used globally
- [ ] daysUsed calculation (days since onboarding completion)
- [ ] Exam mode awareness propagated to Dashboard, Week Plan, Ranker
- [ ] Study preference (sequential/mixed) modifies planner greedy fill params
- [ ] Timer state management (one active timer at a time, pause/stop/complete flow)

### Backend Additions (minimal)
- [ ] POST /api/quicklog/:userId
- [ ] PATCH /api/dailyplan/:planId/move — move task to different day
- [ ] PATCH /api/dailyplan/:planId/defer — defer task to next available day
- [ ] Study preference storage (sequential/mixed) + planner param override
- [ ] Rich notes CRUD on topics (text + links)
- [ ] Mock test logging with subject-wise breakdown input
