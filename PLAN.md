# ExamPilot V2 — Complete Plan & Progress

## 18 Features Across 5 Phases

```
COMPLETED                          REMAINING
─────────                          ─────────
F1  Onboarding & Strategy    ✅    F13 Mock Test Integration
F2  PYQ Intelligence         ✅    F14 Prelims/Mains Toggle
F3  Living Syllabus Map      ✅    F15 "What If" Simulator
F4  Velocity Engine + Buffer ✅    F16 Current Affairs Tracker
F5  Confidence Decay (FSRS)  ✅    F18 Strategic Benchmark  ✅
F6  Spaced Repetition        ✅    F12b Weekly Review (Enhanced) ✅
F7  Stress Thermometer       ✅
F8  Smart Daily Planner      ✅
F9  Weakness Radar           ✅
F10 Recalibration Engine     ✅
F11 Burnout Guardian         ✅
F12a Weekly Review (Minimal) ✅
F17 Gamification Layer       ✅
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
| **F9** Weakness Radar | Done | F3, F5 |
| **F10** Recalibration Engine | Done | F4, F7, F9 |

### Phase 5 — Engagement & Polish

| Feature | Status | Depends On | Description |
|---------|--------|------------|-------------|
| **F13** Mock Test Integration | Pending | F3 | Mock test scores feed accuracy data back to FSRS |
| **F14** Prelims/Mains Toggle | Pending | F3, F8 | Switch syllabus and planner between exam modes |
| **F15** "What If" Simulator | Pending | F4 | Project scenarios (what if I skip 3 days, change strategy, etc.) |
| **F16** Current Affairs Tracker | Pending | F1 | Fully independent — own data model, own UI |
| **F17** Gamification Layer | Done | F4, F8 | XP, levels, badges — 6 new files, 13 modified, ~900 LOC |
| **F18** Strategic Benchmark | Done | F4, F17 | Weighted exam-readiness score — 5 new files, 8 modified, ~620 LOC |
| **F12a** Weekly Review (Minimal) | Done | F4, F5, F7, F8, F9, F11 | Core weekly summary — hard dependencies only |
| **F12b** Weekly Review (Enhanced) | Done | F12a, F17 | Adds gamification data + benchmark integration — 1 new file, 5 modified, ~196 LOC |

#### F12 Dependency Analysis

| Dependency | Classification | Rationale |
|------------|---------------|-----------|
| **F4** Velocity Engine | **Hard** | Velocity ratio & trend are core weekly metrics |
| **F5** Confidence Decay | **Hard** | Confidence distribution is a key review metric |
| **F7** Stress Thermometer | **Hard** | Stress trend is essential for weekly health check |
| **F8** Smart Daily Planner | **Hard** | Plan completion rate drives the weekly summary |
| **F9** Weakness Radar | **Hard** | Weak topic count/movement is a core insight |
| **F11** Burnout Guardian | **Hard** | BRI trend and recovery status are critical context |
| **F17** Gamification Layer | **Soft** | XP earned, badges unlocked are nice-to-have enrichment |

**Before:** F12 depends on F4, F5, F7, F8, F9, F11, F17 (7 deps, blocked by F17)
**After:** F12a depends on F4, F5, F7, F8, F9, F11 (6 hard deps, all done — **unblocked now**)
         F12b depends on F12a, F17 (adds gamification data after F17 ships)

---

## Dependency Graph

```
Legend: ✅ = done │ ⏳ = pending │ 🔒 = blocked

F1 ✅ ───┬──► F2 ✅ ──► F3 ✅ ──┬──► F13 ⏳
         │                      │
         │                      └──► F14 ⏳ (also needs F8)
         │
         ├──► F5 ✅ ──► F6 ✅
         │
         ├──► F4 ✅ ──┬──► F11 ✅
         │            │
         │            ├──► F7 ✅
         │            │
         │            ├──► F15 ⏳
         │            │
         │            ├──► F17 ✅ ──► F18 ✅
         │            │               │
         │            │               └──► F12b ✅
         │            │
         │            └──► F8 ✅
         │
         └──► F16 ⏳ (independent)

F9 ✅ ◄── F3 ✅ + F5 ✅
F10 ✅ ◄── F4 ✅ + F7 ✅ + F9 ✅
F8 ✅ ◄── F4 ✅ + F5 ✅ + F6 ✅ + F11 ✅
F12a ✅ ◄── F4 ✅ + F5 ✅ + F7 ✅ + F8 ✅
            + F9 ✅ + F11 ✅ (all done)
```

---

## What's Built (Phase 1-4 + F12a + F17)

### Files Created/Modified: ~113 files, ~13,700 lines

| Layer | Count | Details |
|-------|-------|---------|
| SQL Migrations | 12 | 004_persona_extensions through 015_gamification |
| API Middleware | 1 | auth.ts (Bearer token validation) |
| API Services | 11 | pyq, syllabus, fsrs, velocity, burnout, stress, planner, weakness, recalibration, weeklyReview, gamification |
| API Routes | 13 | 11 new + 2 modified (onboarding, strategy) |
| Mobile Auth | 4 | login, signup, _layout, useAuth hook |
| Mobile Hooks | 12 | useAuth, usePyqStats, useSyllabus, useFSRS, useVelocity, useBurnout, useStress, usePlanner, useWeakness, useRecalibration, useWeeklyReview, useGamification |
| Mobile Components | 27 | syllabus (8), planner (5), dashboard (4), progress (3), weakness (4), weekly (1), gamification (2), common (1) |
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
| Health Score | `confidence(0.40) + revision(0.25) + effort(0.20) + stability(0.15)` |
| Recalibration | Rule-based adjustments with ±20% mode drift limit, 3-day cooldown |
| XP Level | `level = floor(sqrt(2 * xp_total / 500)) + 1`, 500*N XP per level |

### Append-Only Temporal Tables

`persona_snapshots`, `fsrs_review_logs`, `confidence_snapshots`, `velocity_snapshots`, `daily_logs`, `buffer_transactions`, `burnout_snapshots`, `status_changes`, `weakness_snapshots`, `recalibration_log`, `weekly_reviews`, `xp_transactions`, `user_badges`

---

## Recommended Build Order (Phase 5)

### Build Tracks (can run concurrently)

```
Track A (Core Sequential):
  F12a ✅ ──► F17 ✅ ──► F18 ✅ ──► F12b ✅
                          │          │
                         Done       Needs
                                   F12a✅+F17✅+F18✅

Track B (Independent):
  F16 ◄── Can start anytime, zero shared deps

Track C (Unblocked Batch — parallelizable):
  F13, F14, F15 ◄── All unblocked, no ordering
```

### Visual Timeline

```
Week     1       2       3       4       5
       ┌───────┬───────┬───────┬───────┬───────┐
Trk A  │ F17   │ F17   │F18+12b│F18+12b│       │
       ├───────┼───────┼───────┼───────┼───────┤
Trk B  │ F16   │ F16   │       │       │       │
       ├───────┼───────┼───────┼───────┼───────┤
Trk C  │ F13   │F13│F14│ F14   │ F15   │ F15   │
       └───────┴───────┴───────┴───────┴───────┘
```

### Detailed Order with Rationale

| Priority | Feature | Track | Why |
|----------|---------|-------|-----|
| ~~1~~ | ~~**F12a** Weekly Review (Minimal)~~ | ~~A~~ | ~~Done~~ ✅ |
| ~~1~~ | ~~**F17** Gamification~~ | ~~A~~ | ~~Done~~ ✅ |
| 1 | **F16** Current Affairs | B | Independent, can parallelize with everything |
| 2 | **F13** Mock Test Integration | C | Unblocked, feeds accuracy data to FSRS |
| 2 | **F14** Prelims/Mains Toggle | C | Unblocked, configuration feature |
| 2 | **F15** "What If" Simulator | C | Unblocked, can parallelize with F13/F14 |
| ~~3~~ | ~~**F18** Strategic Benchmark~~ | ~~A~~ | ~~Done~~ ✅ |
| ~~4~~ | ~~**F12b** Weekly Review (Enhanced)~~ | ~~A~~ | ~~Done~~ ✅ |

---

## Phase 5 Scope Estimates

Reference: Completed features averaged ~260 LOC backend, ~310 LOC frontend per feature.

| Feature | Size | Layers | Est. Files | Est. LOC | Notes |
|---------|------|--------|-----------|----------|-------|
| **F12a** Weekly Review (Min) | M | SQL, service, route, hook, components, screen | 5+6 | ~700 | ✅ Done — 5 new files, 6 modified, ~700 LOC |
| **F12b** Weekly Review (Enh) | S | Service mod, component mods | 2-3 | 150-250 | ✅ Done — 1 new file, 5 modified, ~196 LOC |
| **F13** Mock Test Integration | L | SQL, service, route, hook, components, screen | 7-9 | 800-1,000 | New tables for tests/attempts/answers; accuracy feeds back to FSRS |
| **F14** Prelims/Mains Toggle | S | Service mod, route, hook, component | 3-4 | 300-450 | Config update + planner/syllabus filtering; minimal new UI |
| **F15** "What If" Simulator | M | Service, route, hook, components | 5-6 | 700-900 | Projection math (Monte Carlo); interactive chart UI |
| **F16** Current Affairs | M | SQL, service, route, hook, components, screen | 6-7 | 550-700 | Standalone data model; news feed + topic tagging UI |
| **F17** Gamification Layer | L | SQL, service, route, hook, components | 7-9 | 900-1,150 | XP calculations, badge unlock logic, streak animations |
| **F18** Strategic Benchmark | L | SQL, service, route, hook, components | 7-8 | 850-1,100 | ✅ Done — 5 new files, 8 modified, ~620 LOC |
| | | | | | |
| **TOTAL** | | | **42-52** | **4,650-6,100** | ~5,400 LOC midpoint estimate |

### Layers Key
- **SQL**: Migration file for new tables
- **Service**: API business logic (`apps/api/src/services/`)
- **Route**: API endpoint handler (`apps/api/src/routes/`)
- **Hook**: React Query hook (`apps/mobile/hooks/`)
- **Components**: UI components (`apps/mobile/components/`)
- **Screen**: Tab or modal screen (`apps/mobile/app/`)

---

## Testing & QA Strategy

### Critical Path Unit Tests

| # | Algorithm | File | What to Test | Priority |
|---|-----------|------|-------------|----------|
| 1 | **FSRS Retrievability** | `apps/api/src/services/fsrs.ts` | Zero elapsed days (R=1), large elapsed (R→0), negative stability guard, accuracy_factor boundaries | P0 |
| 2 | **Velocity Ratio** | `apps/api/src/services/velocity.ts` | Zero days remaining (÷0 guard), no daily logs (velocity=0), ratio boundaries (ahead/on_track/behind/at_risk) | P0 |
| 3 | **BRI Score** | `apps/api/src/services/burnout.ts` | All signals at 0 (BRI=100), all at 100 (BRI=0), recovery mode trigger at threshold, recovery exit | P0 |
| 4 | **Stress Score** | `apps/api/src/services/stress.ts` | All signals at 0 vs 100, weighted sum = exact expected output, status label boundaries | P0 |
| 5 | **Planner Priority** | `apps/api/src/services/planner.ts` | High-gravity topic ranks first, decay revision > new topic, light day reduces load, stretch items excluded at low energy | P0 |
| 6 | **Buffer Deposit/Withdrawal** | `apps/api/src/services/velocity.ts` | Zero-day penalty, surplus capped at 20%, deficit floored at -5, balance never negative, consistency reward at streak % 7 | P1 |
| 7 | **Health Score** | `apps/api/src/services/weakness.ts` | Component weights sum to 1.0, score range 0-100, category boundaries (critical<25, weak<45, moderate<65, strong<80, exam_ready≥80) | P1 |
| 8 | **Recalibration Rules** | `apps/api/src/services/recalibration.ts` | Each adjustment rule triggers correctly, mode drift ±20% enforced, cooldown blocks re-run, recovery mode skips, bounds clamped | P1 |
| 9 | **Topic Gravity** | `apps/api/src/services/pyq.ts` | pyq_weight=0 → gravity=0, all factors at max → expected product, floating point precision | P1 |
| 10 | **Fatigue Formula** | `apps/api/src/services/burnout.ts` | Fresh user (0 consecutive days, 0 difficulty) → low fatigue, max consecutive days + high difficulty → high fatigue, rest days reduce score | P1 |

### API Integration Tests

| Route | Happy Path | Auth Failure | Edge Cases |
|-------|-----------|-------------|-----------|
| `GET /api/strategy` | Returns mode + params for valid user | 401 without Bearer token | New user with no onboarding returns defaults |
| `POST /api/onboarding` | Creates profile, returns persona params | 401 | Duplicate onboarding (idempotent?) |
| `GET /api/syllabus` | Returns subjects > chapters > topics tree | 401 | Empty progress (all untouched) |
| `POST /api/fsrs/review/:topicId` | Updates FSRS card, returns new schedule | 401 | Invalid topicId (404), rating out of range |
| `GET /api/velocity` | Returns velocity_ratio, status, trend | 401 | No daily logs (first day), exam_date in past |
| `GET /api/burnout` | Returns BRI, fatigue, recovery status | 401 | No burnout snapshots yet |
| `GET /api/stress` | Returns score, signals, recommendation | 401 | No velocity snapshots (defaults) |
| `GET /api/daily-plan` | Returns plan with items, topic details | 401 | No plan for date (generate on fly?), all topics completed |
| `GET /api/weakness/overview` | Returns summary + weakest topics | 401 | No progress data (empty overview) |
| `POST /api/recalibration/trigger` | Returns applied/no_change/skipped | 401 | Cooldown active, recovery mode, <5 data points |
| `GET /api/recalibration` | Returns status + last entry | 401 | Never recalibrated (nulls) |

### Mobile E2E Smoke Tests

- [ ] **Onboarding → Dashboard**: Complete 7 onboarding screens → land on dashboard with correct strategy mode and persona params displayed
- [ ] **Study Flow**: Mark topic as studied → FSRS confidence updates → planner re-prioritizes next day's plan
- [ ] **Revision Cycle**: Complete a topic → wait for FSRS due date → revision appears in planner → mark revised → confidence refreshes
- [ ] **Burnout Recovery**: Study intensely (high fatigue) → BRI drops → recovery mode activates → planner shows light day → exit recovery
- [ ] **Recalibration**: Settings → toggle auto-recalibrate on → after processEndOfDay → persona params adjust → settings reflects new values
- [ ] **Weakness Tracking**: Dashboard shows weakness radar card → tap weakest topic → health detail sheet opens with component breakdown
- [ ] **Strategy Switch**: Settings → change mode from balanced to aggressive → params update → planner adjusts topic load
- [ ] **Weekly Review**: Progress tab → WeeklyReviewCard renders with highlights, metrics, grid, and deltas → demo mode shows demo data

### Testing Tools

#### API Testing
- [ ] **Test Runner**: [Vitest](https://vitest.dev/) — fast, TypeScript-native, compatible with Fastify
- [ ] **HTTP Testing**: `fastify.inject()` for integration tests (no real server needed)
- [ ] **Supabase Strategy**: Use a dedicated test project with seeded data; alternatively, mock Supabase client with `vi.mock()` for unit tests
- [ ] **Structure**: `apps/api/src/__tests__/` mirroring `services/` and `routes/`

#### Mobile Testing
- [ ] **E2E Framework**: [Maestro](https://maestro.mobile.dev/) — YAML-based, works with Expo SDK 52, no native build required for web tests
- [ ] **Component Testing**: React Native Testing Library + Jest for isolated component tests
- [ ] **Structure**: `apps/mobile/__tests__/` for component tests, `e2e/` for Maestro flows

#### CI Pipeline (GitHub Actions)
```yaml
# Suggested workflow structure:
jobs:
  api-lint-typecheck:
    - npx tsc --noEmit -p apps/api/tsconfig.json
  api-unit-tests:
    - npx vitest run --project api
  mobile-lint-typecheck:
    - npx tsc --noEmit -p apps/mobile/tsconfig.json
  mobile-bundle-check:
    - npx expo export --platform web
  # Future:
  # api-integration-tests (needs Supabase test instance)
  # mobile-e2e (needs Maestro + Expo dev server)
```

---

## Tech Stack

- **Mobile**: Expo SDK 52, Expo Router v4, React Native, React Query
- **API**: Fastify 5.2, TypeScript, ts-fsrs 5.2
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Theme**: Dark (#0F172A bg, #1E293B surface, #22D3EE cyan accent)
