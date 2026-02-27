# ExamPilot V2 — Architecture Rules

> These rules are mandatory. Every code change must comply. No exceptions without explicit user approval.

## Project Structure

- Monorepo: `apps/api` (Fastify), `apps/mobile` (Expo RN), `packages/shared-types`
- Supabase for auth + PostgreSQL. React Query for mobile data fetching.
- Read `AUDIT_PLAYBOOK.md` for full architecture map, scoring history, and refactoring recipes.

---

## Rule 1: Thin Controllers

Route files in `apps/api/src/routes/` are **thin controllers only**.

- **NEVER** put Supabase queries (`supabase.from()`, `supabase.rpc()`) in route files.
- **NEVER** put business logic, calculations, or data transformations in route files.
- Routes must only: validate input → call service function → return result.
- The global error handler in `index.ts` catches all errors. Do NOT add try/catch in routes.

```typescript
// CORRECT
app.get('/api/velocity', async (request) => {
  return getVelocityDashboard(request.userId);
});

// WRONG — fat controller
app.get('/api/velocity', async (request) => {
  const { data: profile } = await supabase.from('user_profiles').select('*')...  // NO
  const velocity = profile.topics_completed / profile.days_elapsed;              // NO
  return { velocity };
});
```

## Rule 2: Constants in thresholds.ts

All domain tuning values (weights, multipliers, thresholds, caps, limits) go in `apps/api/src/constants/thresholds.ts`.

- **NEVER** hardcode numeric domain constants in service files. Use `thresholds.ts`.
- Structural constants (`0`, `1`, `100` for percentages, `86400000` for ms/day) are exempt.
- Group constants under a service-specific key following the existing pattern.
- `thresholds.ts` must have **ZERO imports** — it is pure data.

```typescript
// CORRECT — in thresholds.ts
export const MY_SERVICE = {
  WEIGHT_A: 0.6,
  WEIGHT_B: 0.4,
  THRESHOLD: 75,
} as const;

// CORRECT — in myService.ts
import { MY_SERVICE } from '../constants/thresholds.js';
if (score > MY_SERVICE.THRESHOLD) { ... }

// WRONG — hardcoded in service
if (score > 75) { ... }  // Where does 75 come from? Why 75?
```

## Rule 3: modeConfig.ts is a Leaf Node

`apps/api/src/services/modeConfig.ts` is the **single source of truth** for mode defaults and persona defaults.

- **NEVER** import other services into modeConfig.ts. It may only import from `supabase`, `utils/`, and `constants/`.
- **NEVER** duplicate mode defaults or persona defaults elsewhere. Import from modeConfig.
- If you need mode/persona defaults, import from `modeConfig.ts` — not from `strategy.ts`.

## Rule 4: Side Effects via Event Emitter

XP awards and notification queueing are **cross-cutting side effects**. They go through `apps/api/src/services/events.ts`.

- **NEVER** directly import `gamification.ts` or `notification.ts` from business services.
- Use `appEvents.emit('xp:award', { userId, triggerType, topicId })` instead.
- Use `appEvents.emit('notification:queue', { userId, type, metadata })` instead.
- The only files allowed to directly import gamification/notification are: `events.ts` and `cron.ts`.

```typescript
// CORRECT
import { appEvents } from './events.js';
appEvents.emit('xp:award', { userId, triggerType: 'topic_completed', topicId });

// WRONG
const { awardXP } = await import('./gamification.js');  // NO — use events
await awardXP(userId, { triggerType: 'topic_completed', topicId });
```

## Rule 5: Types in shared-types Package

Types used by both API and mobile must live in `packages/shared-types/src/index.ts`.

- **NEVER** define the same type in both `apps/api/src/types/` and `apps/mobile/types/`.
- API-only types (request payloads, DB row shapes) stay in `apps/api/src/types/`.
- Mobile-only types (UI state, navigation params) stay in `apps/mobile/types/`.
- Mobile may **extend** shared types for UI context (e.g., `interface SubjectWithUI extends Subject`).
- When adding a new API response type, check if mobile will use it. If yes → shared-types.

## Rule 6: No `as any` in API Code

- **NEVER** use `as any` in `apps/api/src/`. Use proper types or `as unknown as TargetType` if Supabase inference fails.
- For Supabase join queries where TypeScript can't infer: define an interface for the expected shape, then cast with `as unknown as MyInterface`.
- Minimize `as any` in mobile code. Current baseline is 15 — do not increase.

## Rule 7: Dependency Direction

Services follow a strict tier system. **Never import upward.**

```
TIER 0: constants/, utils/          — zero imports
TIER 1: modeConfig, stress, benchmark, currentAffairs, syllabus, notification, pyq
                                    — import only supabase + tier 0
TIER 2: fsrs, burnout, velocity, weakness, gamification, decayTrigger, recalibration
                                    — import tier 0-1 + events
TIER 3: planner, planActions, simulator, strategy, mode, mockTest,
        weeklyReview, strategyCascade, endOfDay
                                    — import tier 0-2, may use dynamic import for tier 3 peers
TIER 4: events, cron, middleware    — infrastructure
```

- **Static imports must flow downward** (tier 3 → tier 2 → tier 1 → tier 0).
- **Dynamic imports** (`await import()`) are allowed ONLY to break cycles between tier 3 peers.
- Before adding a dynamic import, check: can this be solved by importing from a lower tier instead?
- Current dynamic import count is **23**. Do NOT increase without justification.

## Rule 8: Planner Separation

Plan **generation** lives in `planner.ts`. Plan **mutations** live in `planActions.ts`.

- `planner.ts` contains: `generateDailyPlan` and its internal pipeline (`fetchPlannerData`, `scoreTopic`, `applyConstraints`, `allocateGreedy`, etc.)
- `planActions.ts` contains: `completePlanItem`, `deferPlanItem`, `skipPlanItem`, `regeneratePlan`, `scheduleImmediateRevision`
- Do not mix generation logic into planActions or mutation logic into planner.

## Rule 9: Mobile Hooks for All API Mutations

On the mobile side, **every API mutation must go through a React Query hook**.

- **NEVER** call `api.someEndpoint()` directly from a component for mutations.
- Use `useMutation()` hooks that invalidate relevant query keys on success.
- This ensures React Query cache stays consistent.

```typescript
// CORRECT — in a hook
export const useSwitchMode = () => useMutation({
  mutationFn: (mode: StrategyMode) => api.switchMode(mode),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategy'] }),
});

// CORRECT — in a component
const switchMode = useSwitchMode();
switchMode.mutate('aggressive');

// WRONG — direct API call in component
await api.switchMode('aggressive');  // NO — cache not invalidated
```

## Rule 10: Classification Parity

`classifyModeV2` in `apps/mobile/lib/classify.ts` must produce **identical results** to `classifyModeV2Server` in `apps/api/src/services/strategy.ts`.

- If you change classification logic on one side, you **must** change the other.
- Both must use the same scoring factors, weights, and thresholds.
- Run `apps/mobile/lib/__tests__/classify.test.ts` after any classification change.

---

## Service Size Limits

| Threshold | Action |
|-----------|--------|
| Service > 500 LOC | Review: can any responsibility be extracted? |
| Service > 700 LOC | **Must** decompose before adding more code. |
| Function > 60 LOC | Extract helper functions. |
| Route file > 60 LOC | You're probably putting logic in the route. Move to service. |

Current services near the limit — decompose before extending:
- `weeklyReview.ts` (678 LOC) — candidate: extract recommendation logic
- `weakness.ts` (583 LOC) — candidate: extract scoring functions
- `planner.ts` (582 LOC) — already at limit after split

---

## Pre-Commit Mental Checklist

Before submitting any code change, verify:

- [ ] No Supabase queries in route files
- [ ] No hardcoded domain constants in services (use thresholds.ts)
- [ ] No new `as any` in API code
- [ ] No direct gamification/notification imports (use events.ts)
- [ ] New shared types are in `packages/shared-types`, not duplicated
- [ ] Dynamic import count has not increased without reason
- [ ] Mobile mutations go through React Query hooks, not direct `api.*` calls
- [ ] If classification logic changed: both mobile and server updated
- [ ] No service exceeds 700 LOC after your change

---

## Quick Audit Commands

Paste these to verify you haven't broken invariants:

```bash
# Fat controllers (must be 0)
grep -rn "supabase\.\(from\|rpc\)" apps/api/src/routes/ --include="*.ts" | grep -v __tests__ | wc -l

# as any in API (must be 0)
grep -r "as any" apps/api/src/ --include="*.ts" | grep -v __tests__ | wc -l

# Dynamic imports (must be ≤ 25)
grep -r "await import(" apps/api/src/services/ --include="*.ts" | grep -v __tests__ | wc -l

# Direct gamification/notification imports outside events.ts and cron.ts (must be 0)
grep -r "await import.*notification\|await import.*gamification" apps/api/src/services/ | grep -v __tests__ | grep -v events.ts | grep -v cron.ts | wc -l

# modeConfig.ts service imports (must be 0 — leaf node)
grep "from '\.\/" apps/api/src/services/modeConfig.ts | grep -v supabase | grep -v utils | grep -v constants

# thresholds.ts imports (must be 0 — pure data)
grep "^import" apps/api/src/constants/thresholds.ts
```
