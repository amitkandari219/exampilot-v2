# ExamPilot V2 — Audit & Refactoring Playbook

> One-file reference for running architecture audits efficiently.
> Last updated: 2026-02-27 | Baseline score: 7.5/10 | Maturity: Level 4.0

---

## 1. Quick Health Check (5 minutes)

Run these commands from repo root. If any number spikes, dig deeper.

```bash
# 1. Dynamic imports (baseline: 23) — cycle-breaker smell
grep -r "await import(" apps/api/src/services/ --include="*.ts" | grep -v __tests__ | wc -l

# 2. as-any / as-unknown casts — type safety smell
grep -r "as any\|as unknown" apps/api/src/ --include="*.ts" | grep -v __tests__ | wc -l    # baseline: 20
grep -r "as any\|as unknown" apps/mobile/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v __tests__ | wc -l  # baseline: 15

# 3. Thresholds coverage (baseline: 207 LOC, 14 groups)
wc -l apps/api/src/constants/thresholds.ts

# 4. Service LOC — god service detector (flag anything > 600)
find apps/api/src/services -name "*.ts" ! -path "*__tests__*" | xargs wc -l | sort -rn | head -10

# 5. Test count (baseline: 15 files, 98 tests)
find apps -name "*.test.ts" -o -name "*.test.tsx" | grep -v node_modules | wc -l

# 6. Fat controller detector (should be 0)
grep -rn "supabase\.\(from\|rpc\)" apps/api/src/routes/ --include="*.ts" | grep -v __tests__ | wc -l

# 7. Event emitter adoption (baseline: 12 emit calls)
grep -r "appEvents.emit" apps/api/src/services/ | grep -v __tests__ | wc -l

# 8. Direct notification/gamification imports outside events.ts (baseline: 2, only in cron.ts)
grep -r "await import.*notification\|await import.*gamification" apps/api/src/services/ | grep -v __tests__ | grep -v events.ts | wc -l
```

### Interpretation

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Dynamic imports | ≤ 25 | 26–35 | > 35 |
| `as any/unknown` (API) | ≤ 20 | 21–35 | > 35 |
| Largest service LOC | ≤ 600 | 601–800 | > 800 |
| Fat controller queries | 0 | 1–2 | > 2 |
| Test files | > 20 | 15–20 | < 15 |
| Notification/gamification direct imports | ≤ 2 | 3–5 | > 5 |

---

## 2. Full 5-Diagnostic Audit Framework

### Diagnostic 1: Shotgun Surgery

> "If I change X, how many files must I touch?"

Test with these domain concepts:
- **strategy_mode** → check modeConfig.ts, strategy.ts, mobile/strategyModes.ts, types
- **exam_mode** → check mode.ts, modeConfig.ts, strategy.ts routes, EXAM_MODES constant
- **a tuning threshold** → should only touch thresholds.ts (if not, it's scattered)
- **XP award trigger** → should only touch events.ts handlers (if not, event pattern is leaking)

```bash
# Find all files that reference a specific concept
grep -rn "strategy_mode\|StrategyMode" apps/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v __tests__ | cut -d: -f1 | sort -u
```

### Diagnostic 2: Copy-Paste Detector

Known duplication points to watch:

| Item | Source of Truth | Check For Copies In |
|------|----------------|---------------------|
| Mode defaults (12 params × 4 modes) | `modeConfig.ts` | `mobile/constants/strategyModes.ts` |
| Persona defaults (14 params × 4 modes) | `modeConfig.ts` | Any service with inline defaults |
| Tuning constants | `thresholds.ts` | Services with hardcoded numbers |
| Shared types | `packages/shared-types` | `api/types`, `mobile/types`, `api.ts` |
| Classification logic | `strategy.ts` (server) | `mobile/lib/classify.ts` |
| Velocity weighting 0.6/0.4 | `VELOCITY_WEIGHTING` | `velocity.ts`, `simulator.ts` |

```bash
# Find hardcoded numbers that should be in thresholds.ts
# Look for decimal constants (weights, multipliers) in services
grep -rn "\b0\.[0-9]\+\b" apps/api/src/services/ --include="*.ts" | grep -v __tests__ | grep -v "import\|from\|thresholds\|\.js\|\.ts" | head -30
```

### Diagnostic 3: Abstraction Quality

Key metrics:
- **Services > 500 LOC** → candidate for decomposition
- **Functions > 50 LOC** → candidate for extraction
- **Inline Supabase in routes** → fat controller violation
- **`as any` count** → type safety regression

Architecture invariants that should hold:
1. Routes are thin controllers (no business logic, no direct DB queries)
2. `modeConfig.ts` has ZERO service imports (leaf node)
3. `events.ts` handles all XP/notification side effects
4. `thresholds.ts` has ZERO imports (pure data)
5. All shared types live in `packages/shared-types`

```bash
# Verify leaf-node invariant for modeConfig
grep "from '\.\/" apps/api/src/services/modeConfig.ts | grep -v supabase | grep -v utils | grep -v constants

# Verify events.ts is the only place importing gamification/notification (besides cron)
grep -r "from.*gamification\|from.*notification" apps/api/src/services/ --include="*.ts" | grep -v __tests__ | grep -v events.ts | grep -v cron.ts
```

### Diagnostic 4: 60K LOC Stress Test

> "Would this architecture survive 6× growth?"

Check:
1. **Dependency graph depth** — can you trace planner → modeConfig without cycles?
2. **Dynamic imports** — are they cycle-breakers or laziness?
3. **Shared types** — would adding a new API field require touching 3+ files?
4. **Test isolation** — can you test planner.ts without standing up the full server?

```bash
# Map the full dependency graph for a service
grep -n "import\|await import" apps/api/src/services/planner.ts | grep -v __tests__

# Check for circular static import chains
# A imports B and B imports A = circular
for f in apps/api/src/services/*.ts; do
  basename=$(basename "$f" .ts)
  importers=$(grep -l "from.*\./$basename" apps/api/src/services/*.ts 2>/dev/null | grep -v __tests__ | grep -v "$f")
  if [ -n "$importers" ]; then
    for imp in $importers; do
      imp_base=$(basename "$imp" .ts)
      if grep -q "from.*\./$imp_base" "$f" 2>/dev/null; then
        echo "CIRCULAR: $basename <-> $imp_base"
      fi
    done
  fi
done
```

### Diagnostic 5: Bus Factor

> "Could a new engineer modify burnout thresholds without reading 5 files?"

Check:
1. Are domain constants in `thresholds.ts` or scattered in service bodies?
2. Is there a clear mapping from "business rule" → "file to edit"?
3. Are complex algorithms (FSRS, BRI, health scores) documented with comments?

```bash
# Count magic numbers per service (decimal constants not from imports)
for f in apps/api/src/services/*.ts; do
  count=$(grep -c "\b[0-9]\+\.\?[0-9]*\b" "$f" 2>/dev/null | head -1)
  echo "$count $f"
done | sort -rn | head -10
```

---

## 3. Current Architecture Map

### Service Dependency Tiers

```
TIER 0 — Pure Data (zero imports)
├── constants/thresholds.ts    (207 LOC, 14 domain groups, 82+ constants)
├── utils/math.ts              (21 LOC — piecewiseLerp, clamp)
└── utils/dateUtils.ts         (31 LOC — toDateString, daysAgo, daysUntil)

TIER 1 — Leaf Services (import only supabase + tier 0)
├── modeConfig.ts              (188 LOC — mode defaults, persona defaults, active subjects)
├── stress.ts                  (150 LOC)
├── benchmark.ts               (205 LOC)
├── currentAffairs.ts          (285 LOC)
├── syllabus.ts                (195 LOC)
├── notification.ts            (129 LOC)
└── pyq.ts                     (328 LOC)

TIER 2 — Core Services (import tier 1, may have dynamic imports)
├── fsrs.ts                    (419 LOC — imports: thresholds, events)
├── burnout.ts                 (292 LOC — imports: thresholds, events, dateUtils)
├── velocity.ts                (411 LOC — imports: thresholds, modeConfig, recalibration)
├── weakness.ts                (583 LOC — imports: thresholds, modeConfig)
├── gamification.ts            (322 LOC — imports: thresholds, events)
├── decayTrigger.ts            (510 LOC — imports: fsrs, thresholds, events)
└── recalibration.ts           (475 LOC — imports: thresholds, modeConfig, events)

TIER 3 — Orchestrators (import tier 2, heavy dynamic imports)
├── planner.ts                 (582 LOC — generation pipeline)
├── planActions.ts             (212 LOC — mutations: complete, defer, skip)
├── simulator.ts               (515 LOC — what-if scenario engine)
├── strategy.ts                (473 LOC — onboarding, mode switching)
├── mode.ts                    (151 LOC — exam mode orchestration)
├── mockTest.ts                (483 LOC — test grading + side effects)
├── weeklyReview.ts            (678 LOC — 15-table aggregation)
├── strategyCascade.ts         (439 LOC — auto-strategy adjustment)
└── endOfDay.ts                (183 LOC — nightly batch orchestrator)

TIER 4 — Infrastructure
├── events.ts                  (41 LOC — typed EventEmitter, XP + notification handlers)
├── cron.ts                    (150 LOC — daily maintenance batch, 10 dynamic imports)
└── middleware/auth.ts         (33 LOC — Bearer token + cron skip)
```

### LOC Distribution

```
Total API source:     9,590 LOC (excl. tests)
Total Mobile source: 13,632 LOC
Shared Types:           506 LOC
─────────────────────────────
Total Production:    23,728 LOC
Tests:                1,730 LOC (15 files)
```

### Route → Service Mapping (32 endpoints)

| Route File | Endpoints | Service(s) |
|------------|-----------|------------|
| planner.ts | 3 | planner, planActions |
| velocity.ts | 4 | velocity |
| simulator.ts | 1 | simulator |
| weakness.ts | 6 | weakness |
| strategy.ts | 4 | strategy |
| mode.ts | 2 | mode |
| mockTest.ts | 4 | mockTest |
| fsrs.ts | 4 | fsrs, decayTrigger |
| syllabus.ts | 3 | syllabus |
| cron.ts | 1 | cron |
| *(+ 10 others)* | 0–3 each | corresponding service |

---

## 4. Known Technical Debt Register

### Active Debt (address when touching these files)

| ID | Location | Issue | Effort | Risk |
|----|----------|-------|--------|------|
| D1 | `mobile/constants/strategyModes.ts` | Hardcoded mode defaults duplicating modeConfig.ts | 1 hr | Values will silently diverge |
| D2 | `stress.ts`, `pyq.ts`, `simulator.ts`, `mockTest.ts`, `currentAffairs.ts` | ~60 magic numbers not in thresholds.ts | 2 hr | Bus factor, scattered tuning |
| D3 | `cron.ts` | 10 dynamic imports (defensive, but hides dependency graph) | — | Low risk, intentional |
| D4 | 20× `as unknown` casts (API) | Supabase join type inference limitation | 1 hr | Could fix with `supabase gen types` |
| D5 | `weeklyReview.ts` (678 LOC) | Second-largest service, reads 15 tables, no decomposition | 3 hr | Hard to test, hard to modify |
| D6 | `weakness.ts` (583 LOC) | 34 hardcoded scoring constants, 9 `as any` casts | 2 hr | Scoring logic is opaque |
| D7 | 15 test files, 98 tests | No test growth across 4 audit cycles | ongoing | All structural changes unverified |

### Resolved Debt (for reference)

| ID | What | When Fixed | How |
|----|------|------------|-----|
| R1 | classifyModeV2 mobile/server divergence | Audit #3 | Aligned mobile scoring with server |
| R2 | settings.tsx handleParamsChange not persisting | Audit #3 | Added `customizeParams.mutate()` |
| R3 | Cron routes blocked by auth middleware | Audit #3 | Added `/api/cron/` skip rule |
| R4 | No global error handler (19/21 routes unprotected) | Audit #3 | `app.setErrorHandler()` in index.ts |
| R5 | 3× mode defaults copies | Audit #3 | Created modeConfig.ts leaf service |
| R6 | Fat controllers (3 routes with inline queries) | Audit #3 | Extracted to service functions |
| R7 | settings.tsx api.switchMode() bypassing React Query | Audit #4 | Switched to `useSwitchMode()` hook |
| R8 | Shadow MockTest + duplicate StrategyData | Audit #4 | Deleted, single source of truth |
| R9 | 5 untyped API endpoints | Audit #4 | All 26 endpoints typed |
| R10 | Planner god service (780 LOC, mixed concerns) | Audit #4 | Split into planner.ts + planActions.ts |
| R11 | XP/notification scattered via 11 dynamic imports | Audit #4 | Created events.ts with typed emitter |
| R12 | weeklyReview zero thresholds integration | Audit #4 | Added WEEKLY_REVIEW block (20 constants) |
| R13 | ~200 scattered magic numbers | Audit #3-4 | thresholds.ts 100→207 LOC |
| R14 | 0.6/0.4 velocity weighting duplication | Audit #4 | VELOCITY_WEIGHTING in thresholds |
| R15 | Type divergence (5 types mismatched) | Audit #4 | Moved to shared-types package |

---

## 5. Refactoring Recipes

### Recipe A: Extract Magic Numbers to Thresholds

**When:** You find hardcoded numbers in a service that represent domain tuning values.

```typescript
// BEFORE (in someService.ts)
const score = velocity * 0.6 + historical * 0.4;
if (bri > 75) status = 'healthy';

// STEP 1: Add to thresholds.ts
export const SOME_SERVICE = {
  VELOCITY_WEIGHT: 0.6,
  HISTORICAL_WEIGHT: 0.4,
  BRI_HEALTHY: 75,
} as const;

// STEP 2: Import and replace
import { SOME_SERVICE } from '../constants/thresholds.js';
const score = velocity * SOME_SERVICE.VELOCITY_WEIGHT + historical * SOME_SERVICE.HISTORICAL_WEIGHT;
if (bri > SOME_SERVICE.BRI_HEALTHY) status = 'healthy';
```

**Do NOT extract:** Array indices (0, 1), structural constants (100 for percentages), milliseconds-per-day (86400000 — consider using dateUtils instead).

### Recipe B: Break a Circular Dependency

**When:** Service A imports B and B imports A.

```
# Pattern: Extract shared reads into a leaf service

1. Identify the READS that cause the cycle (lookups, defaults, config)
2. Move them to a new leaf service (like modeConfig.ts) or into an existing tier-0/1 file
3. Both A and B now import from the leaf instead of each other
4. If A still needs to CALL B for writes/orchestration, use dynamic import:
   const { doThing } = await import('./b.js');
```

### Recipe C: Decompose a God Service

**When:** Service exceeds 600 LOC with multiple distinct responsibilities.

```
1. Identify responsibility boundaries (look for groups of functions that share state)
2. Name the new files by responsibility:
   - planner.ts (generation) + planActions.ts (mutations)
   - weeklyReview.ts (aggregation) + weeklyInsights.ts (recommendations)
3. Move functions, update imports
4. The original file re-exports if needed for backward compatibility
5. Run: grep -rn "from.*oldService" apps/ to find all import sites
```

### Recipe D: Convert Direct Import to Event

**When:** A service calls gamification/notification as a side effect.

```typescript
// BEFORE
const { awardXP } = await import('./gamification.js');
await awardXP(userId, { triggerType: 'topic_completed', topicId });

// AFTER
import { appEvents } from './events.js';
appEvents.emit('xp:award', { userId, triggerType: 'topic_completed', topicId });
```

**Note:** Events are fire-and-forget. Don't use for operations where the caller needs the result.

### Recipe E: Fix Type Divergence

**When:** API and mobile have different fields for the same concept.

```
1. API type is source of truth (matches DB schema)
2. Add canonical type to packages/shared-types/src/index.ts
3. In api/types/index.ts: re-export from @exampilot/shared-types
4. In mobile/types/index.ts: extend if needed (e.g., add UI-only fields)
   export interface SubjectWithUI extends Subject { chapters?: ChapterWithTopics[] }
5. Delete local duplicates, update imports
```

---

## 6. Scoring History

| Dimension | Audit #1 | Audit #2 | Audit #3 | Audit #4 |
|-----------|----------|----------|----------|----------|
| Shotgun Surgery | 5.5 | 5.5 | 6.5 | **7.5** |
| Copy-Paste | 4.0 | 4.0 | 6.0 | **8.0** |
| Abstraction Quality | 5.0 | 5.0 | 7.0 | **8.0** |
| 60K LOC Readiness | 4.5 | 4.5 | 5.5 | **7.0** |
| Bus Factor | 4.0 | 4.0 | 5.0 | **7.0** |
| **Overall** | **4.7** | **4.7** | **6.0** | **7.5** |
| **Maturity Level** | **3.0** | **3.0** | **3.5** | **4.0** |
| **Accidental Complexity** | **35%** | **35%** | **22%** | **12%** |

### Maturity Level Definitions

| Level | Name | Description |
|-------|------|-------------|
| 1 | Ad-hoc | No conventions. Copy-paste driven. |
| 2 | Emerging | Some patterns exist but aren't consistent. |
| 3 | Defined | Conventions exist and are mostly followed. |
| 3.5 | Structural | Conventions enforced by file structure. |
| **4** | **Governed** | **Architecture makes the wrong thing hard to do.** |
| 4.5 | Verified | CI enforces architecture rules, tests cover critical paths. |
| 5 | Evolutionary | Architecture supports change without degradation. |

---

## 7. Next Audit Checklist

When running the next audit, use this checklist:

- [ ] Run Quick Health Check (Section 1) — 5 min
- [ ] Compare numbers to baselines in interpretation table
- [ ] If any metric is Yellow/Red, run the relevant diagnostic (Section 2)
- [ ] Check Active Debt Register (Section 4) — any items resolved?
- [ ] Check if new debt was introduced (new services > 500 LOC? new dynamic imports?)
- [ ] Update scoring history (Section 6)
- [ ] Update debt register with any new findings

### What to look for in code reviews

1. **New service added?** → Does it import from thresholds.ts? Is it in the right tier?
2. **New constant added?** → Is it in thresholds.ts or hardcoded in a service?
3. **New type added?** → Is it in shared-types if used by both API and mobile?
4. **New side effect (XP/notification)?** → Does it use events.ts or direct import?
5. **Route handler?** → Is it a thin controller delegating to a service?
6. **New dynamic import?** → Is it breaking a cycle or just lazy loading?

---

## 8. File Quick-Reference

### Must-read files for new engineers

| File | Why |
|------|-----|
| `constants/thresholds.ts` | All domain tuning values in one place |
| `services/modeConfig.ts` | Mode/persona defaults, the leaf-node pattern |
| `services/events.ts` | How side effects (XP, notifications) work |
| `services/planner.ts` | Core algorithm: fetchData → score → constrain → allocate |
| `middleware/auth.ts` | How auth works, what's skipped |
| `index.ts` | Global error handler, route registration |

### Files most likely to need changes

| Change Type | Files |
|-------------|-------|
| Add tuning constant | `thresholds.ts` |
| Add/modify mode defaults | `modeConfig.ts` + `mobile/constants/strategyModes.ts` |
| Add new API endpoint | `routes/[feature].ts` + `services/[feature].ts` |
| Add shared type | `packages/shared-types/src/index.ts` → re-export in both api + mobile types |
| Add XP trigger | `events.ts` (handler) + calling service (emit) |
| Modify scoring formula | Relevant service + verify thresholds.ts constants |
