# ExamPilot — Full Product & UX Review

> Reviewed by: Claude (code-level audit of all 22 mobile screens + 14 backend services)
> Date: March 2026

---

## Executive Summary

ExamPilot is a UPSC Civil Services study planner with one of the most sophisticated backends in the ed-tech space — adaptive recalibration, FSRS-6 memory modeling, multi-signal burnout detection, PYQ-gravity weighting, and a 6-scenario what-if simulator. However, the mobile UI surfaces roughly 30% of this capability. The result: a rocket engine behind a basic dashboard.

**Engine: 9.5/10 | Cockpit: 5/10**

---

## What Was Reviewed

### Mobile App (22 files, every line of JSX)

| Screen | File | Lines |
|--------|------|-------|
| Dashboard | `app/(tabs)/index.tsx` | 619 |
| Planner | `app/(tabs)/planner.tsx` | 603 |
| Progress | `app/(tabs)/progress.tsx` | 388 |
| Syllabus | `app/(tabs)/syllabus.tsx` | 167 |
| Settings | `app/(tabs)/settings.tsx` | 518 |
| Tab Layout | `app/(tabs)/_layout.tsx` | 79 |
| Onboarding (7 screens) | `app/onboarding/*.tsx` | 593 |
| Login | `app/auth/login.tsx` | 156 |
| Revision | `app/revision.tsx` | 257 |
| Full Syllabus | `app/fullsyllabus.tsx` | 426 |
| Mock Tests | `app/mocks.tsx` | 415 |
| Low Day | `app/lowday.tsx` | 136 |
| Ranker | `app/ranker.tsx` | 371 |
| Weekly Review | `app/weeklyreview.tsx` | 339 |
| Topic Detail | `app/topic-detail.tsx` | 138 |
| Weekly Detail | `app/weekly-detail.tsx` | 17 |

### Backend Services (14 files, full logic analysis)

| Service | File | What It Does |
|---------|------|-------------|
| Planner | `services/planner.ts` (582 LOC) | 9-signal topic scoring, fatigue-aware capacity, greedy allocation with constraints |
| Velocity | `services/velocity.ts` | PYQ-gravity weighted progress, buffer system with deposits/withdrawals, projected completion |
| Burnout | `services/burnout.ts` | 4-signal BRI (Burnout Resilience Index), auto-recovery with 3-day ramp-up |
| Recalibration | `services/recalibration.ts` | Closed-loop adaptive tuning of 4 parameters with ±20% drift guardrails |
| FSRS | `services/fsrs.ts` | Per-topic memory modeling (stability, difficulty, retrievability), auto-downgrade |
| Weakness | `services/weakness.ts` | 4-component health score, radar insights (false security, blind spots, over-revised) |
| Benchmark | `services/benchmark.ts` | 5-component exam readiness composite (coverage, confidence, weakness, consistency, velocity) |
| Mock Tests | `services/mockTest.ts` | Cascading effects on submission (confidence recalc, health recalc, immediate revision scheduling) |
| Gamification | `services/gamification.ts` | XP with 8 trigger types, quadratic level curve, badge system with 10+ condition types, 3 streak types |
| Simulator | `services/simulator.ts` | 6 what-if scenarios including FSRS-based confidence decay modeling |
| Weekly Review | `services/weeklyReview.ts` (678 LOC) | 15+ parallel queries, auto-generated wins/improvements/recommendations |
| Strategy | `services/strategy.ts` | 4 persona modes, scoring-based classification, mode switching with override preservation |
| Current Affairs | `services/currentAffairs.ts` | Daily logging, subject tagging, CA streak, subject gap detection |
| Mode Config | `services/modeConfig.ts` | Persona parameter definitions, exam mode config (Prelims/Mains subject weighting) |

### Also Reviewed
- `CLAUDE.md` — 10 architecture rules, tier system, size limits
- `packages/shared-types/src/index.ts` — All shared interfaces
- `apps/api/src/constants/thresholds.ts` — All tuning constants
- `apps/api/src/services/events.ts` — Event emitter system
- `apps/mobile/lib/disclosure.ts` — Progressive disclosure rules
- `apps/mobile/components/v4/` — V4 design system components

---

## Review: As a Fresher (1st Attempt UPSC Candidate)

### Score: 4.5/10

### Onboarding — 6.5/10

**What works:**
- Clean 6-step flow: attempt number → user type → exam cycle → study approach → weak subjects → daily hours
- Mode classification happens silently — no confusing "pick your strategy" decision
- Promise text ("I commit to...") adds emotional investment
- Weak subjects selection is optional and doesn't overwhelm

**What breaks:**
- After sharing 6 screens of personal data, I land on a dashboard with zero "here's your plan" moment. No summary like "We've built a plan covering 466 topics across 8 subjects. You'll study 2 new topics per day with revisions every 4 days."
- No explicit exam date confirmation — it's derived from cycle selection, but I never see "Your exam: May 2027, 420 days away"
- The `complete.tsx` screen shows a loading spinner → redirect. No celebratory "You're all set!" transition

### Day 1 Dashboard — 3/10

This is where freshers bounce. What I see on first load:

1. **Header** with Prelims/Mains toggle — I don't know what changes when I tap this
2. **Welcome card** — "Your AI study engine is calibrating" — vague and technical
3. **"START HERE" hero card** — Good, points to planner. But it's competing with 10 other elements
4. **5 metric boxes**: `hrs today: 0.0`, `tasks done: 0/0`, `day streak: 0`, `revisions due: 0`, `momentum: —`
   - Every number is zero. Immediate feeling: "this app has nothing for me"
   - "Momentum" shows "—" with no explanation
   - "Day streak: 0" is a known bug — the backend doesn't compute streaks correctly on Day 1
5. **Navigation grid** with 6 cards — most show lock icons. "Revision (Day 3)", "Mock Tests (Day 7)", etc.
   - Seeing locked features on Day 1 is anxiety-inducing, not motivating
6. **No single sentence** telling me what to do, how long it'll take, or why I should trust this

**The core problem:** A fresher's Day 1 dashboard should show ONE thing: "Open your planner. Complete your first topic. Everything else comes later." Instead, it shows 11+ cards, 5 zero-value metrics, and locked features.

### Planner — 6/10

**What works:**
- Clean task cards with colored type pills (NEW=teal, REVISION=purple, DECAY=red, STRETCH=orange)
- Subject + chapter context on each card
- Timer integration — tap Start, it counts time, auto-completes on finish
- Capacity card: "X hrs planned / Y hrs available" with a buffer remaining line
- Recovery mode banner when burnout is detected

**What's broken or missing:**
- **No "reason" for any topic** — The backend uses 9 scoring signals (PYQ weight, urgency, decay boost, mock weakness, radar insights, deferred rollover...) but the card just shows a topic name. "Why Fundamental Rights today?" is never answered
- **No defer button** — The `useDeferPlanItem` mutation exists in hooks, but `renderTaskCard` never renders a defer UI element. Users can only complete or let items expire. This is a bug.
- **Manual completion silently uses estimated hours** — `handleComplete` at line 98 calls `completeMutation.mutate({ itemId, actualHours: item.estimated_hours })` without asking the user how long they actually studied
- **No link to the bigger picture** — "These 5 tasks are part of a 466-topic plan that finishes by [date]" is never communicated
- **Empty state is cold** — "No study items for today / Your plan will generate automatically"
- **Celebration is static** — Always says "All done for today! Great work. Rest well." regardless of whether it's a 7-day streak or Day 1

### Syllabus Tab — 4/10

- Shows a collapsible tree: Subject → Chapter → topic rows with status pills
- Search works
- **No progress bar per subject** — I can't see "Indian Polity: 12/65 topics done"
- **No time estimates** — "How many hours left to finish Geography?" is unanswerable
- **Tapping a topic is a dead end** — `topic-detail.tsx` renders "Topic Detail — Coming Soon" (line 8). A stub since day one.
- **No resource recommendations** — A fresher looking at "Indian Polity" has no idea: read Laxmikanth? Watch a video? Which chapters first?
- **No sorting** — Can't sort by PYQ weight, difficulty, or confidence. Just alphabetical within chapters.

### Progress Tab — 3.5/10

**Jargon overload:**
- `Velocity: 0.92x` — What does 0.92x mean? Faster? Slower? Than what?
- `Buffer: 3.2d` — "3.2 days of buffer"? Buffer from what? For what?
- `Stress (7d)` chart — Higher is worse? Lower is worse? Stress about what?
- `Streak: 0d` — Broken on Day 1

**What a fresher sees in Week 1:**
- Three metrics they don't understand
- Two charts with no data
- A mock analytics section saying "No mock tests recorded yet" — cold and unhelpful
- Exam readiness is hidden until Day 8 (good progressive disclosure, but what fills the void?)

**What's missing:**
- Plain English: "You're 8% behind ideal pace" instead of "Velocity: 0.92x"
- "Preparation Health" instead of "Stress" (inverted so high = good)
- Tooltips explaining every metric
- Simplified first-week view — just show "Keep studying, analytics unlock after a few days"

### Settings — 7/10

Actually one of the better screens:
- Dark/light theme toggle
- Exam mode switch with explanation
- Target editing (daily hours, new topics, etc.)
- Strategy mode display with mode info cards
- Account deletion works
- Recalibration status section (but shows technical data — "last_run: 2026-03-01T...")

### Locked Screens (Progressive Disclosure)

The app gates features by `daysUsed`:

| Screen | Fresher Unlock | What It Shows |
|--------|---------------|---------------|
| Revision | Day 3 | Overdue/today/upcoming revisions, FSRS confidence data |
| Mock Tests | Day 7 | Record mocks (quick or detailed), score trends, subject accuracy |
| Weekly Review | Day 7 | Rich weekly summary with wins, improvements, recommendations |
| Low Day | Day 7 | "Take a lighter day" with activity suggestions |
| Full Syllabus | Day 14 | Full 466-topic browser with filters |
| Ranker | Day 30 | Leaderboard, badges, XP history, level progression |

**Gate messages are good** — Full Syllabus says "Seeing 466 topics in week 1 causes anxiety." This is thoughtful design. But the unlock thresholds may be too conservative (Day 14 for syllabus browser?).

### What a Fresher Needs But Doesn't Get

1. **"Here's your plan"** — Subject timelines, projected coverage dates, "you'll finish by [date]"
2. **"Here's why this topic"** — Reason for every plan item
3. **"Here's how to study this"** — Book/video/notes recommendations per topic
4. **Guided Day 1-3** — Step-by-step checklist, not a metric dashboard
5. **Plain English** — "Study Pace" not "Velocity", "Safety Margin" not "Buffer"
6. **Emotional warmth** — Encouragement, celebrations, welcome-back messages
7. **Working topic detail** — Not a "Coming Soon" stub

---

## Review: As an Experienced Candidate (2nd+ Attempt)

### Score: 6.5/10

### What Works Well

- **All screens unlocked from Day 0** — No patronizing gates for veterans
- **Full Syllabus browser** is immediately useful for scanning coverage
- **Mock test recording** with subject-level breakdown is solid
- **Weekly Review** is genuinely rich — wins, areas to improve, subject coverage gaps, untouched-14-days alerts, next-week recommendations
- **Revision screen** clearly shows overdue/today/upcoming with FSRS data
- **Ranker** has XP, levels, badges, streak tracking — gamification works
- **The engine** — PYQ weighting, fatigue management, burnout protection, sequential mode — is clearly doing intelligent work behind the scenes

### What's Still Broken

#### 1. No Past Attempt Intake — Missing Feature

I'm a 2nd attempt candidate. The app doesn't ask:
- What was my Prelims score last time?
- Which Mains papers were weakest?
- What was my biggest preparation challenge?

The `past_attempt_data` JSONB column exists in the schema plan but isn't implemented. This means the algorithm treats me identically to a fresher with the same daily hours. It doesn't know I scored 110/200 in Prelims and was weak in GS2. The planner has a `PAST_WEAKNESS_BOOST` signal ready but no data to feed it.

#### 2. Black Box Planner — Critical Trust Gap

Same issue as freshers, but MORE frustrating because I have domain knowledge:
- I know my Polity is weak — is the planner prioritizing it? I can't tell
- Sequential mode silently suppresses other subjects to focus on one — never explained
- The planner uses 9 scoring signals (PYQ weight, urgency, decay boost, mock weakness, radar insights, deferred rollover, weekend boost, past-weakness boost, subject-repeat penalty) — user sees NONE of this
- Recalibration adjusted my `fsrs_target_retention` from 0.90 to 0.87 three days ago — I was never notified

#### 3. Shallow Mock Analysis — Under-Delivering

After 2+ mocks, the Progress tab shows:
- Score trend chart (good)
- Subject accuracy with trend arrows (good)
- Weakest and strongest topics (good)
- Generic recommendation: "Focus on building fundamentals" or "Good progress, target your weakest topics"

**What the backend computes but the UI doesn't show:**
- Negative marking impact (total marks lost to wrong answers)
- Attempt rate (what % of questions I'm attempting)
- Cutoff trajectory (my score vs estimated cutoff per test)
- Topic-specific advice: "You scored 30% in Constitutional Bodies — revise Laxmikanth Ch. 20-25" instead of "Focus on fundamentals"

The `getMockAnalytics` service computes all of this. The mobile app renders only the surface.

#### 4. No Answer Writing Tracker — Zero Support for Mains

Mains preparation is 50%+ answer writing practice. The app has:
- A dashboard placeholder: "answers today: — / coming soon" (line 182 of index.tsx)
- No backend service
- No database table
- No UI

For a serious candidate, this is a glaring gap.

#### 5. The Simulator is Invisible — Best Feature, Zero Exposure

The backend has 6 what-if scenarios:

| Scenario | What It Computes |
|----------|-----------------|
| `skip_days` | Buffer absorption, velocity impact, projected date shift |
| `change_hours` | Proportional velocity scaling, new completion date |
| `change_strategy` | Mode switch effects on buffer and velocity targets |
| `change_exam_date` | Required velocity recalculation |
| `defer_topics` | Gravity removal for N lowest-priority topics |
| `focus_subject` | Topics coverable + FSRS-based confidence decay on OTHER subjects during focus |

The `focus_subject` scenario is extraordinary — it tells a user: "If you spend 7 days on Polity, you can cover ~12 more topics and push it to 73% complete, but your other subjects will retain only 64% of their current confidence during that period."

**This may have zero mobile UI exposure.** The simulator service is fully built but I found no button, link, or screen in the mobile app that calls it.

#### 6. Recalibration is Silent

The system adjusts 4 parameters daily:
- `fsrs_target_retention` — How aggressively revisions are scheduled
- `burnout_threshold` — How sensitive burnout detection is
- `fatigue_threshold` — When light-day mode kicks in
- `buffer_capacity` — What fraction of days become buffer

Each adjustment is logged with reasons ("User thriving — tightening retention target"). Full audit trail exists in `recalibration_log`. Users see... a timestamp in Settings saying "Last recalibrated: 2 days ago."

#### 7. FSRS Data is Hidden

Per-topic FSRS data available but not shown:
- `stability` — How long until this topic decays (the core memory metric)
- `difficulty` — How hard THIS specific topic is for THIS specific user (learned from reviews)
- `retrievability` — Current probability of recall (0-100%)
- Topics can silently fall from `exam_ready` back to `first_pass` when confidence decays. Users may not know their "done" topics can get un-done.

#### 8. Weekly Review Chart Uses Synthetic Data

The weekly review's daily hours chart distributes `total_hours / 7` evenly across all days rather than showing actual per-day hours. Presented as real data. Misleading.

### What an Experienced Candidate Needs But Doesn't Get

1. **Past attempt context** — Prelims score, weakest Mains papers, biggest challenge
2. **Deep mock analysis** — Negative marking, cutoff trajectory, topic-specific advice
3. **Answer writing tracker** — Log answers, track word count, self-score, time taken
4. **Simulator access** — "What if I focus on Polity for 2 weeks?" with confidence decay modeling
5. **Recalibration transparency** — "We adjusted your plan because X" as a notification
6. **Per-topic FSRS data** — Show stability, difficulty, decay curve in topic detail
7. **Revision calendar** — Month view of upcoming spaced repetition dates

---

## Bugs Found During Review

| Bug | Severity | Location |
|-----|----------|----------|
| Streak always shows 0 on Day 1 | Medium | `app/(tabs)/index.tsx` — backend doesn't compute correctly for new users |
| Defer button missing from UI | High | `app/(tabs)/planner.tsx` — `useDeferPlanItem` hook exists but no UI renders it |
| Topic detail is a stub | High | `app/topic-detail.tsx` — Shows "Coming Soon" text only |
| Weekly detail is a stub | Medium | `app/weekly-detail.tsx` — 17 lines, "Coming Soon" |
| Manual completion silently uses estimated hours | Medium | `app/(tabs)/planner.tsx:98` — Should prompt user |
| Weekly review chart is synthetic | Medium | `weeklyreview.tsx` — Divides total hours evenly instead of actual per-day |
| Low Day screen doesn't preserve streak | Low | `lowday.tsx` claims grace day but system doesn't honor it |
| No Forgot Password link on login | Low | `auth/login.tsx` — Only has sign up + sign in |
| "answers today" hardcoded to "—" | Medium | `app/(tabs)/index.tsx:182` — Placeholder never wired |

---

## Feature-by-Feature Scorecard

| Feature | Engine | UX | Gap Analysis |
|---------|--------|-----|-------------|
| Daily Plan Generation | 9.5 | 5.0 | 9 scoring signals, zero shown. No reasons, no defer button |
| Spaced Repetition (FSRS) | 9.5 | 6.0 | Calendar exists, but stability/difficulty/auto-downgrade invisible |
| Burnout Detection | 9.0 | 6.5 | Recovery works but parameter changes are silent, ramp-up unexplained |
| Velocity & Buffer | 9.0 | 3.5 | Jargon-heavy. "Buffer: 3.2d" means nothing. Projected date buried |
| Exam Readiness | 8.5 | 6.0 | Shown day 8+, components clear, but weights hidden and no tooltips |
| Recalibration | 9.5 | 2.0 | Fully adaptive closed-loop system. User sees a timestamp |
| Health Radar | 9.0 | 5.0 | False security, blind spots, over-revised — brilliant but underexposed |
| Simulator | 9.0 | 1.0 | 6 scenarios with FSRS decay modeling. Possibly zero mobile UI |
| Mock Analytics | 8.0 | 5.5 | Deep analysis computed, only surface rendered |
| Weekly Review | 8.5 | 6.5 | Rich auto-generated narrative. Synthetic chart data is a lie |
| Gamification | 7.5 | 6.0 | XP/levels/badges/streaks work. Celebrations are flat |
| Onboarding | 7.0 | 6.5 | Clean flow, no "here's your plan" payoff at the end |
| Syllabus Browser | 7.0 | 4.5 | Tree works. No resources, stub topic detail, no progress per subject |
| Current Affairs | 6.0 | 5.0 | Basic tracking. Not integrated with main planner or velocity |
| Answer Writing | 0 | 0 | Not implemented at all |
| Full Plan Visibility | 0 | 0 | Not implemented at all |

---

## The 5 Highest-Impact Backend Features Users Can't See

### 1. Adaptive Recalibration
The system silently tightens or loosens 4 algorithmic parameters based on observed behavior. A user crushing velocity gets a harder retention target. A user burning out gets automatic protection. Full audit trail with reasons. **User sees: a timestamp.**

### 2. What-If Simulator
"What if I take 3 days off?" → Shows buffer absorption and projected date shift. "What if I focus on Polity for a week?" → Shows topics coverable AND FSRS-based confidence decay on all other subjects. **User sees: nothing (no UI).**

### 3. Health Radar — False Security Detector
Catches the exact pattern that makes candidates fail: topics marked "first pass" but with decayed confidence and low mock accuracy. The user THINKS they know it; the system KNOWS they don't. **User sees: possibly just a list in the progress tab, if they scroll that far.**

### 4. Mock Cascade Effects
A single mock submission triggers: topic accuracy update → confidence recalculation across ALL FSRS cards → health score recalculation → weak topics queued for urgent revision → notification → XP. **User sees: a score trend chart.**

### 5. Per-Topic Memory Model (FSRS)
Each topic has its own stability (memory half-life), difficulty (learned from reviews), and retrievability (current recall probability). Topics auto-downgrade from "exam_ready" to "first_pass" when memory decays. **User sees: a confidence percentage and a next-due date.**

---

## Overall Scores

### Fresher (1st Attempt) — 4.5/10

| Dimension | Score | Why |
|-----------|-------|-----|
| First Impression | 4 | Dashboard shows 11 elements, all zeros, no guidance |
| Daily Usability | 5 | Planner works but no reasons, no defer, no context |
| Trust & Transparency | 3 | Black box algorithm, no plan visibility, no explanations |
| Emotional Experience | 3 | Clinical tone, cold empty states, no celebrations |
| Feature Completeness | 5 | Core loop works, but topic detail stub, no resources |
| Discoverability | 4 | Best features locked or hidden, no progressive onboarding |

### Experienced (2nd+ Attempt) — 6.5/10

| Dimension | Score | Why |
|-----------|-------|-----|
| First Impression | 6 | All screens available, but still no plan overview |
| Daily Usability | 7 | Planner + revision + syllabus browser work well together |
| Trust & Transparency | 5 | Still a black box, but weekly review provides some insight |
| Emotional Experience | 5 | Less patronizing but no past-attempt personalization |
| Feature Completeness | 6 | No answer writing, shallow mock analysis, no simulator |
| Discoverability | 5 | Simulator and recalibration hidden, radar underexposed |

### The Bottom Line

The product has built a genuinely differentiated engine — adaptive, memory-aware, fatigue-conscious, PYQ-weighted. Very few UPSC apps do this. But the mobile experience treats it like a basic task manager with some charts. The gap between what the engine knows and what the user sees is the single biggest opportunity. Closing it doesn't require building new algorithms — just surfacing what's already there.
