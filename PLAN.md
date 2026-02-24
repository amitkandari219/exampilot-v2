# ExamPilot V2 — Complete Plan & Progress

## 18 Features Across 5 Phases

```
COMPLETED                          REMAINING
─────────                          ─────────
F1  Onboarding & Strategy    ✅    F9  Weakness Radar
F2  PYQ Intelligence         ✅    F10 Recalibration Engine
F3  Living Syllabus Map      ✅    F12 Weekly Review
F4  Velocity Engine + Buffer ✅    F13 Mock Test Integration
F5  Confidence Decay (FSRS)  ✅    F14 Prelims/Mains Toggle
F6  Spaced Repetition        ✅    F15 "What If" Simulator
F7  Stress Thermometer       ✅    F16 Current Affairs Tracker
F8  Smart Daily Planner      ✅    F17 Gamification Layer
F11 Burnout Guardian         ✅    F18 Strategic Benchmark
```

---

## Phase Breakdown & Dependencies

### Phase 1 — Foundation (DONE)

| Feature | Status | Description |
|---------|--------|-------------|
| **F1** Onboarding & Strategy | Done | 7 onboarding screens, 4 strategy modes, 12 params per mode |
| **F2** PYQ Intelligence | Done | Syllabus schema, seed data (466 topics), gravity calculations |
| **F5** Confidence Decay (FSRS-6) | Done | ts-fsrs engine, retrievability formula, confidence snapshots |

### Phase 2 — Core Engines (DONE)

| Feature | Status | Depends On |
|---------|--------|------------|
| **F3** Living Syllabus Map | Done | F1, F2 |
| **F6** Spaced Repetition | Done | F5 |

### Phase 3 — Intelligence Layer (DONE)

| Feature | Status | Depends On |
|---------|--------|------------|
| **F4** Velocity Engine + Buffer Bank | Done | F1, F2 |
| **F11** Burnout Guardian | Done | F4 |

### Phase 4 — Integration Layer (DONE)

| Feature | Status | Depends On |
|---------|--------|------------|
| **F7** Stress Thermometer | Done | F4, F5 |
| **F8** Smart Daily Planner | Done | F4, F5, F6, F11 |

### Phase 5 — Engagement & Polish (NOT STARTED)

| Feature | Status | Depends On | Description |
|---------|--------|------------|-------------|
| **F9** Weakness Radar | Pending | F3, F5 | Health scoring per topic/chapter, identifies weak areas |
| **F10** Recalibration Engine | Pending | F4, F7 | Auto-adjust persona params based on performance |
| **F13** Mock Test Integration | Pending | F3 | Mock test scores feed accuracy data back to FSRS |
| **F14** Prelims/Mains Toggle | Pending | F3, F8 | Switch syllabus and planner between exam modes |
| **F15** "What If" Simulator | Pending | F4 | Project scenarios (what if I skip 3 days, change strategy, etc.) |
| **F16** Current Affairs Tracker | Pending | F1 | Fully independent — own data model, own UI |
| **F17** Gamification Layer | Pending | F4, F8 | Badges, XP, streaks, leaderboard |
| **F18** Strategic Benchmark | Pending | F4, F17 | Blocked by F17 — weighted exam-readiness score |
| **F12** Weekly Review | Pending | F4, F5, F7, F8, F9, F11, F17 | Final aggregator — blocked by F9 and F17 |

---

## Dependency Graph

```
F1 ──► F2 ──► F3 ──► F9 (pending) ──► F12 (blocked)
  │         │         │
  │         │         ├──► F13 (pending)
  │         │         └──► F14 (pending)
  │         │
  │         └──► F4 ──► F7 ──► F10 (pending)
  │                │
  │                ├──► F11
  │                ├──► F15 (pending)
  │                └──► F17 (pending) ──► F18 (blocked)
  │                                         │
  │                                         └──► F12 (blocked)
  │
  ├──► F5 ──► F6
  │
  └──► F16 (pending, independent)

F8 (integrates F4, F5, F6, F11)
```

---

## What's Built (Phase 1-4)

### Files Created/Modified: 78 files, 11,372 lines

| Layer | Count | Details |
|-------|-------|---------|
| SQL Migrations | 8 | 004_persona_extensions through 011_daily_plans |
| API Middleware | 1 | auth.ts (Bearer token validation) |
| API Services | 7 | pyq, syllabus, fsrs, velocity, burnout, stress, planner |
| API Routes | 9 | 7 new + 2 modified (onboarding, strategy) |
| Mobile Auth | 4 | login, signup, _layout, useAuth hook |
| Mobile Hooks | 8 | useAuth, usePyqStats, useSyllabus, useFSRS, useVelocity, useBurnout, useStress, usePlanner |
| Mobile Components | 20 | syllabus (8), planner (5), dashboard (4), progress (3), common (1) |
| Mobile Screens | 5 | Dashboard, Syllabus, Planner, Progress, Settings |
| Types | 2 | API + mobile shared types |
| Demo Data | 1 | Generated from 466-topic topic_weightage.json |

### Key Algorithms Implemented

| Formula | Expression |
|---------|-----------|
| Topic Gravity | `pyq_weight * difficulty * estimated_hours` |
| Required Velocity | `remaining_gravity / (days_remaining - buffer% - revision%)` |
| FSRS Retrievability | `R = (1 + elapsed_days / (9 * stability))^(-1)` |
| Confidence Score | `retrievability * accuracy_factor * 100` |
| Buffer Deposit | `(gravity_completed - required_velocity) * deposit_rate` (cap 20%) |
| Buffer Withdrawal | `abs(deficit) * withdrawal_rate` (floor -5) |
| Stress Score | `velocity(0.35) + buffer(0.25) + time(0.20) + confidence(0.20)` |
| BRI (Burnout) | `100 - (stress_persist(0.30) + buffer_hemo(0.25) + velocity_collapse(0.25) + engagement(0.20))` |
| Fatigue | `(consec_days*10) + (avg_diff_3d*8) + (hours_3d/target*20) - (rest_days_7*15)` |
| Planner Priority | `(pyq_weight*4) + (importance*2) + (urgency*2) + decay + freshness + variety` |

### Append-Only Temporal Tables

`persona_snapshots`, `fsrs_review_logs`, `confidence_snapshots`, `velocity_snapshots`, `daily_logs`, `buffer_transactions`, `burnout_snapshots`, `status_changes`

---

## Recommended Build Order (Phase 5)

All remaining features except F12 and F18 are **unblocked**:

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | **F9** Weakness Radar | Quick win, unblocks F12 |
| 2 | **F16** Current Affairs | Independent, can parallelize with anything |
| 3 | **F13** Mock Test Integration | Feeds accuracy data back to FSRS |
| 4 | **F17** Gamification | Unblocks F18 and F12 |
| 5 | **F10** Recalibration + **F14** Toggle + **F15** Simulator | All unblocked, can parallelize |
| 6 | **F18** Strategic Benchmark | Needs F17 |
| 7 | **F12** Weekly Review | Final aggregator, build last |

---

## Tech Stack

- **Mobile**: Expo SDK 52, Expo Router v4, React Native, React Query
- **API**: Fastify 5.2, TypeScript, ts-fsrs 5.2
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Theme**: Dark (#0F172A bg, #1E293B surface, #22D3EE cyan accent)
