# ExamPilot V2 — Feature Dependency Chain & Parallel Work Guide

## Dependency Graph

```
F1 (Onboarding & Strategy Mode) ✅ DONE
 │
 ├──► F2 (PYQ Intelligence Layer)
 │     │
 │     ├──► F3 (Living Syllabus Map) ←── also needs F2 for PYQ badges
 │     │     │
 │     │     └──► F9 (Weakness Radar) ←── also needs F5
 │     │
 │     ├──► F4 (Velocity Engine + Buffer Bank)
 │     │     │
 │     │     ├──► F7 (Stress Thermometer) ←── also needs F5
 │     │     ├──► F10 (Recalibration Engine)
 │     │     └──► F15 ("What If" Simulator)
 │     │
 │     └──► F8 (Smart Daily Planner) ←── needs F4, F5, F6, F9, F11
 │
 ├──► F5 (Confidence Decay Engine)
 │     │
 │     ├──► F6 (Spaced Repetition Scheduler)
 │     └──► (feeds into F7, F8, F9)
 │
 ├──► F11 (Fatigue & Burnout Guardian) ←── needs F4 for BRI signals
 │
 ├──► F13 (Mock Test Integration) ←── needs F3 (topics table), feeds F5, F9
 │
 ├──► F14 (Prelims/Mains Mode Toggle) ←── needs F3 (subjects), F8 (planner)
 │
 ├──► F16 (Current Affairs Tracker) ── INDEPENDENT (only needs F1)
 │
 ├──► F17 (Gamification Layer) ←── needs F4 (streaks, velocity), F8 (plan adherence)
 │
 └──► F18 (Strategic Benchmark Layer) ←── needs F4, F17 (WES)

F12 (Weekly Review) ←── aggregator, needs F4, F5, F9, F11, F17
```

## Strict Dependency Table

| Feature | Depends On | Blocks |
|---------|-----------|--------|
| **F1** Onboarding ✅ | — | Everything |
| **F2** PYQ Intelligence | F1 | F3, F4, F8 |
| **F3** Living Syllabus Map | F1, F2 | F9, F13, F14 |
| **F4** Velocity Engine + Buffer | F1, F2 | F7, F8, F10, F11, F15, F17 |
| **F5** Confidence Decay | F1 | F6, F7, F8, F9 |
| **F6** Spaced Repetition | F5 | F8 |
| **F7** Stress Thermometer | F4, F5 | F10, F12 |
| **F8** Smart Daily Planner | F4, F5, F6, F9, F11 | F12, F14, F17 |
| **F9** Weakness Radar | F3, F5 | F8, F12 |
| **F10** Recalibration Engine | F4, F7 | — |
| **F11** Burnout Guardian | F4 | F8, F12 |
| **F12** Weekly Review | F4, F5, F7, F8, F9, F11, F17 | — |
| **F13** Mock Test Integration | F3 | F5 (feeds accuracy data) |
| **F14** Prelims/Mains Toggle | F3, F8 | — |
| **F15** "What If" Simulator | F4 | — |
| **F16** Current Affairs Tracker | F1 | — |
| **F17** Gamification Layer | F4, F8 | F12, F18 |
| **F18** Strategic Benchmark | F4, F17 | — |

---

## Parallel Work Opportunities

### Phase 1 — Foundation (both tracks start immediately)

Since F1 is done, two developers can start in parallel right away:

| Developer A | Developer B |
|-------------|-------------|
| **F2** PYQ Intelligence Layer | **F5** Confidence Decay Engine |
| _Data spine: PYQ weights, seed data, gravity calculations_ | _Ebbinghaus decay, auto-downgrade, confidence scoring_ |

**Why parallel:** F2 and F5 have zero dependency on each other. Both only need F1 (done).

---

### Phase 2 — Core Engines

After Phase 1 completes:

| Developer A | Developer B |
|-------------|-------------|
| **F3** Living Syllabus Map | **F6** Spaced Repetition Scheduler |
| _Needs F2 for PYQ badges_ | _Needs F5 for decay-aware triggers_ |

**Also parallelizable:** **F16** (Current Affairs Tracker) can be built by either developer as a side task at any point — it only needs F1 and is fully independent.

---

### Phase 3 — Intelligence Layer

| Developer A | Developer B |
|-------------|-------------|
| **F4** Velocity Engine + Buffer Bank | **F9** Weakness Radar |
| _Needs F2 for gravity weights_ | _Needs F3 + F5 for health scoring_ |

**After F4 is done, Developer A can immediately start:** **F11** (Burnout Guardian) or **F15** (What If Simulator)

---

### Phase 4 — Integration Layer

| Developer A | Developer B |
|-------------|-------------|
| **F7** Stress Thermometer | **F8** Smart Daily Planner |
| _Needs F4 + F5_ | _Needs F4, F5, F6, F9, F11 — the big integrator_ |
| then **F10** Recalibration Engine | then **F13** Mock Test Integration |

**Note:** F8 is the most dependency-heavy feature. It should start only after F4, F5, F6, F9, and F11 are all done.

---

### Phase 5 — Engagement & Polish

| Developer A | Developer B |
|-------------|-------------|
| **F14** Prelims/Mains Toggle | **F17** Gamification Layer |
| _Needs F3, F8_ | _Needs F4, F8_ |
| then **F15** What If Simulator | then **F18** Strategic Benchmark |
| _(if not done in Phase 3)_ | _Needs F17_ |

**F12** (Weekly Review) should be built last — it's a read-only aggregator of everything else.

---

## Fully Independent Features (can be built anytime after F1)

| Feature | Why Independent |
|---------|----------------|
| **F16** Current Affairs Tracker | Own data model, own UI, no dependency on engines |

---

## Critical Path (longest chain)

```
F1 ✅ → F2 → F4 → F11 → F8 → F17 → F12
                              ↑
               F5 → F6 → ────┘
               F5 → F9 → ────┘
```

**F8 (Smart Daily Planner) is the bottleneck** — it depends on 5 other features. Plan work to unblock F8 as early as possible.

---

## Suggested Sprint Plan (2 Developers)

| Sprint | Dev A | Dev B | Duration |
|--------|-------|-------|----------|
| 1 | F2 (PYQ Intelligence) | F5 (Confidence Decay) | 1-2 weeks |
| 2 | F3 (Syllabus Map) | F6 (Spaced Repetition) | 1-2 weeks |
| 3 | F4 (Velocity + Buffer) | F9 (Weakness Radar) | 1-2 weeks |
| 4 | F7 (Stress) + F11 (Burnout) | F16 (Current Affairs) + F13 (Mocks) | 1-2 weeks |
| 5 | F10 (Recalibration) + F15 (Simulator) | F8 (Daily Planner) | 1-2 weeks |
| 6 | F14 (Prelims/Mains Toggle) | F17 (Gamification) | 1 week |
| 7 | F12 (Weekly Review) | F18 (Benchmarks) | 1 week |

**Total estimated: 7-14 weeks with 2 developers**
