# ExamPilot V2 — Low-Level Design (LLD)

## 1. Database Schema

### 1.1 Enums

```sql
CREATE TYPE strategy_mode AS ENUM ('balanced', 'aggressive', 'conservative', 'working_professional');
CREATE TYPE exam_mode AS ENUM ('mains', 'prelims', 'post_prelims');
CREATE TYPE velocity_status AS ENUM ('ahead', 'on_track', 'behind', 'at_risk');
```

### 1.2 Core Tables

#### user_profiles (central user record)
```
id                    UUID PK (= Supabase Auth user.id)
name                  TEXT
exam_date             DATE
prelims_date          DATE
daily_hours           INT (default 6)
strategy_mode         strategy_mode (default 'balanced')
strategy_params       JSONB (12 tunable params)
current_mode          exam_mode (default 'mains')
mode_switched_at      TIMESTAMPTZ
onboarding_completed  BOOLEAN (default false)
onboarding_version    INT (1 or 2)
target_exam_year      INT
attempt_number        TEXT
user_type             TEXT
challenges            TEXT[]
fatigue_threshold     INT (default 85)
buffer_capacity       FLOAT (default 0.15)
fsrs_target_retention FLOAT (default 0.9)
burnout_threshold     INT (default 75)
buffer_balance        FLOAT (default 0)
recovery_mode_active  BOOLEAN (default false)
recovery_mode_start   TIMESTAMPTZ
recovery_mode_end     TIMESTAMPTZ
auto_recalibrate      BOOLEAN (default true)
last_recalibrated_at  TIMESTAMPTZ
xp_total              INT (default 0)
current_level         INT (default 1)
avatar_url            TEXT
created_at            TIMESTAMPTZ
```

#### Syllabus Hierarchy
```
subjects
  id          UUID PK
  name        TEXT ('General Studies 1', etc.)
  papers      TEXT[] (['GS1'], ['GS1','GS2'])

chapters
  id          UUID PK
  subject_id  UUID FK → subjects
  name        TEXT
  sort_order  INT

topics
  id              UUID PK
  chapter_id      UUID FK → chapters
  name            TEXT
  estimated_hours FLOAT
  importance      INT (1-5)
  pyq_weight      FLOAT (computed)
  pyq_years       INT[]
  sort_order      INT
```

#### user_progress (living syllabus map)
```
id                UUID PK
user_id           UUID FK → user_profiles
topic_id          UUID FK → topics
status            TEXT ('not_started'|'in_progress'|'first_pass'|'revised'|'exam_ready')
confidence_score  FLOAT (0-100, FSRS-driven)
confidence_status TEXT ('fresh'|'fading'|'stale'|'decayed')
actual_hours      FLOAT
revision_count    INT
last_revised      TIMESTAMPTZ
notes             TEXT
health_score      FLOAT (weakness radar)
health_category   TEXT
updated_at        TIMESTAMPTZ
```

#### fsrs_cards (spaced repetition state)
```
id              UUID PK
user_id         UUID FK
topic_id        UUID FK
due             TIMESTAMPTZ
stability       FLOAT
difficulty      FLOAT
elapsed_days    INT
scheduled_days  INT
reps            INT
lapses          INT
state           INT (0=New, 1=Learning, 2=Review, 3=Relearning)
last_review     TIMESTAMPTZ
learning_steps  INT
```

#### velocity_snapshots (daily velocity + stress)
```
id                UUID PK
user_id           UUID FK
snapshot_date     DATE
topics_completed  INT
gravity_completed FLOAT
required_velocity FLOAT
actual_velocity   FLOAT
velocity_ratio    FLOAT
velocity_status   velocity_status
stress_score      FLOAT
stress_status     TEXT
signal_velocity   FLOAT
signal_buffer     FLOAT
signal_time       FLOAT
signal_confidence FLOAT
```

#### daily_logs
```
id                UUID PK
user_id           UUID FK
log_date          DATE
hours_studied     FLOAT
topics_touched    INT
gravity_completed FLOAT
```

#### buffer_transactions
```
id          UUID PK
user_id     UUID FK
tx_date     DATE
type        TEXT ('deposit'|'withdrawal'|'zero_day_penalty'|'initial'|'consistency_reward')
amount      FLOAT
balance     FLOAT (running balance after tx)
```

#### streaks
```
id            UUID PK
user_id       UUID FK
streak_type   TEXT ('daily_study')
current_count INT
best_count    INT
last_date     DATE
```

#### daily_plans
```
id              UUID PK
user_id         UUID FK
plan_date       DATE
topic_id        UUID FK
item_type       TEXT ('new'|'revision'|'decay_revision')
priority_score  FLOAT
planned_hours   FLOAT
actual_hours    FLOAT
status          TEXT ('pending'|'completed'|'deferred'|'skipped')
completed_at    TIMESTAMPTZ
```

#### burnout_snapshots
```
id                  UUID PK
user_id             UUID FK
snapshot_date       DATE
fatigue_score       FLOAT
bri_score           FLOAT
signal_stress       FLOAT
signal_buffer       FLOAT
signal_velocity     FLOAT
signal_engagement   FLOAT
recovery_triggered  BOOLEAN
```

#### persona_snapshots (append-only audit trail)
```
id                    UUID PK
user_id               UUID FK
strategy_mode         strategy_mode
strategy_params       JSONB
fatigue_threshold     INT
buffer_capacity       FLOAT
fsrs_target_retention FLOAT
burnout_threshold     INT
change_reason         TEXT
valid_from            TIMESTAMPTZ (default now)
valid_to              TIMESTAMPTZ (default 'infinity')
```

#### recalibration_log
```
id                       UUID PK
user_id                  UUID FK
triggered_at             TIMESTAMPTZ
trigger_type             TEXT ('auto'|'manual')
status                   TEXT ('applied'|'no_change'|'skipped')
skipped_reason           TEXT
params_changed           BOOLEAN
old/new_fatigue_threshold INT
old/new_buffer_capacity   FLOAT
old/new_fsrs_target_retention FLOAT
old/new_burnout_threshold INT
data_window_days         INT
```

#### weekly_reviews
```
id            UUID PK
user_id       UUID FK
week_start    DATE
week_end      DATE
topics_done   INT
hours_studied FLOAT
avg_velocity  FLOAT
avg_stress    FLOAT
grade         TEXT ('A+'..'F')
insights      JSONB
strengths     TEXT[]
improvements  TEXT[]
```

#### Gamification Tables
```
xp_transactions: id, user_id, amount, trigger, description, created_at
user_badges: id, user_id, badge_id, unlocked_at
badges (seeded): id, name, description, icon, xp_reward, unlock_condition (JSONB), category
```

#### benchmark_snapshots
```
id, user_id, snapshot_date
score, status
signal_coverage, signal_confidence, signal_weakness, signal_consistency, signal_velocity
```

#### mock_tests + accuracy tables
```
mock_tests: id, user_id, test_date, test_type, total_questions, correct, score, time_taken, notes
mock_subject_accuracy: id, mock_id, subject_id, questions, correct, accuracy
mock_topic_accuracy: id, mock_id, topic_id, questions, correct, accuracy
```

#### current_affairs
```
ca_daily_logs: id, user_id, log_date, hours_spent, completed, notes, subject_ids[]
ca_streaks: id, user_id, current_count, best_count, last_date
```

#### V2 Onboarding Tables
```
user_targets: id, user_id, daily_hours, daily_new_topics, weekly_revisions, weekly_tests, weekly_answer_writing, weekly_ca_hours
user_promises: id, user_id, promise_text, created_at
```

### 1.3 Entity Relationship Summary

```
user_profiles (1)───┬──(N) user_progress ──── topics (N)──── chapters ──── subjects
                    ├──(N) fsrs_cards ──────── topics
                    ├──(N) velocity_snapshots
                    ├──(N) daily_logs
                    ├──(N) buffer_transactions
                    ├──(N) streaks
                    ├──(N) daily_plans ──────── topics
                    ├──(N) burnout_snapshots
                    ├──(N) persona_snapshots
                    ├──(N) recalibration_log
                    ├──(N) weekly_reviews
                    ├──(N) xp_transactions
                    ├──(N) user_badges ──────── badges
                    ├──(N) benchmark_snapshots
                    ├──(N) mock_tests ──┬──(N) mock_subject_accuracy
                    │                   └──(N) mock_topic_accuracy
                    ├──(N) ca_daily_logs
                    ├──(N) ca_streaks
                    ├──(1) user_targets
                    └──(N) user_promises
```

---

## 2. API Layer Detail

### 2.1 Auth Middleware

```typescript
// middleware/auth.ts
app.addHook('onRequest', async (request) => {
  if (request.url === '/health') return;
  const token = request.headers.authorization?.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  request.userId = user.id;  // Injected for all routes
});
```

### 2.2 Route → Service Mapping

| Route File | Service File | Endpoints |
|-----------|-------------|-----------|
| onboarding.ts | strategy.ts | `POST /api/onboarding`, `POST /api/onboarding/reset` |
| strategy.ts | strategy.ts | `GET /api/strategy`, `POST /switch`, `POST /customize`, `POST /exam-mode` |
| profile.ts | profile.ts | `GET /api/profile`, `PATCH /api/profile` |
| pyq.ts | pyq.ts | `GET /api/pyq-stats`, `GET /api/pyq/:topicId` |
| syllabus.ts | syllabus.ts | `GET /api/syllabus`, `GET /progress`, `POST /progress/:topicId` |
| fsrs.ts | fsrs.ts | `POST /api/fsrs/review/:topicId`, `POST /recalculate`, `GET /revisions`, `GET /confidence/overview` |
| velocity.ts | velocity.ts | `GET /api/velocity`, `GET /history`, `GET /buffer` |
| burnout.ts | burnout.ts | `GET /api/burnout`, `POST /recovery/start`, `POST /recovery/end` |
| stress.ts | stress.ts | `GET /api/stress` |
| planner.ts | planner.ts | `GET /api/daily-plan`, `PATCH /items/:id`, `POST /regenerate` |
| weakness.ts | weakness.ts | `GET /overview`, `GET /topic/:id`, `GET /topic/:id/trend`, `POST /recalculate` |
| recalibration.ts | recalibration.ts | `GET /api/recalibration`, `GET /history`, `POST /trigger`, `POST /auto` |
| weeklyReview.ts | weeklyReview.ts | `GET /api/weekly-review`, `GET /history`, `POST /generate` |
| gamification.ts | gamification.ts | `GET /api/gamification`, `GET /badges`, `GET /xp-history` |
| benchmark.ts | benchmark.ts | `GET /api/benchmark`, `GET /history` |
| mockTest.ts | mockTest.ts | `POST /api/mocks`, `GET /api/mocks`, `GET /analytics`, `GET /topic/:id/history` |
| simulator.ts | simulator.ts | `POST /api/simulator/run` |
| currentAffairs.ts | currentAffairs.ts | `POST /api/ca/log`, `GET /stats`, `GET /subject-gaps` |

### 2.3 Strategy Mode Defaults

```
                    balanced  aggressive  conservative  working_professional
daily_new_topics       2          3            1              1
revision_frequency     3          4            5              3
pyq_weight_multiplier  1.5        2.0          1.2            1.5
difficulty_preference  medium     hard         easy           medium
daily_study_hours      6          8            4              3
weekly_mock_tests      1          2            0.5            0.5
answer_writing_hours   4          6            2              2
current_affairs_hours  3          4            2              1.5
buffer_days_per_week   1          0.5          1.5            2
revision_backlog_limit 20         30           15             10
sprint_duration_days   14         10           21             14
break_frequency_days   14         21           10             7
```

### 2.4 Persona Defaults Per Mode

```
                    balanced  aggressive  conservative  working_professional
fatigue_threshold      85         90           75              80
buffer_capacity        0.15       0.10         0.20            0.25
fsrs_target_retention  0.90       0.85         0.95            0.85
burnout_threshold      75         85           60              65
```

---

## 3. Core Algorithms

### 3.1 Velocity Engine

```
Input: user_progress, topics, daily_logs, user_profiles
Output: velocity_ratio, velocity_status, required_velocity

gravity(topic) = pyq_weight × difficulty × estimated_hours
total_gravity = Σ gravity(all_topics)
completed_gravity = Σ gravity(completed_topics)
remaining_gravity = total_gravity - completed_gravity

buffer_pct = user.buffer_capacity                    // 0.10 - 0.25
revision_pct = 1 / strategy.revision_frequency       // 0.20 - 0.33
days_remaining = ceil((exam_date - today) / 86400000)
effective_days = days_remaining × (1 - buffer_pct - revision_pct)

required_velocity = remaining_gravity / effective_days

actual_velocity = weighted_average(
    last_7_days_avg × 0.60,
    last_14_days_avg × 0.40
)

velocity_ratio = actual_velocity / required_velocity

status:
  ratio >= 1.1 → "ahead"
  ratio >= 0.9 → "on_track"
  ratio >= 0.7 → "behind"
  else         → "at_risk"
```

### 3.2 Buffer Bank

```
Input: daily_log.gravity_completed, snapshot.required_velocity
Output: transaction type, amount, new balance

delta = gravity_today - required_velocity

if gravity_today == 0:
    type = "zero_day_penalty", amount = -1.0
elif delta > 0:
    type = "deposit"
    amount = delta × 0.8                  // 80% deposit rate
    amount = min(amount, 0.20 × days_remaining)  // cap at 20%
else:
    type = "withdrawal"
    amount = delta × 1.0                  // 100% withdrawal
    amount = max(amount, -5)              // floor at -5

// Streak bonus
if streak_current % 7 == 0:
    bonus transaction: type = "consistency_reward", amount = +0.1

new_balance = clamp(old_balance + amount, 0, max_buffer)
```

### 3.3 FSRS Spaced Repetition

```
Library: ts-fsrs v5.2
Input: topic review (rating 1-4), existing fsrs_card state
Output: updated card, next due date, confidence_score

Ratings: 1=Again, 2=Hard, 3=Good, 4=Easy

card.repeat(now) → scheduling[rating] → { card, log }

Retrievability (confidence):
  R = (1 + elapsed_days / (9 × stability))^(-1)
  confidence_score = round(R × 100)

confidence_status:
  >= 70 → "fresh"
  >= 45 → "fading"
  >= 20 → "stale"
  else  → "decayed"

Auto-upgrade: revision_count >= 3 AND confidence >= 70 → "exam_ready"
Auto-downgrade: confidence < 30 → "first_pass"
```

### 3.4 Stress Thermometer

```
Input: velocity_snapshot, user_profiles, user_progress
Output: stress_score (0-100), status, 4 signals, recommendation

linearInterpolate(value, low, high):
  value ≤ low  → 0
  value ≥ high → 100
  else → ((value - low) / (high - low)) × 100

signal_velocity   = lerp(velocity_ratio, 0.5, 1.2)      // weight: 35%
signal_buffer     = lerp(buffer_ratio, 0, 0.5)           // weight: 25%
signal_time       = lerp(days_remaining, 30, 180)        // weight: 20%
signal_confidence = lerp(avg_confidence, 20, 80)         // weight: 20%

stress_score = Σ(signal × weight)

status:
  >= 70 → "optimal"
  >= 45 → "elevated"
  >= 25 → "risk_zone"
  else  → "recovery_triggered"
```

### 3.5 Burnout Risk Index (BRI)

```
Input: burnout_snapshots, buffer_transactions, velocity, engagement
Output: BRI score, fatigue_score, recovery trigger

stress_persistence = count(recent snapshots with stress > 0.5) × 33
buffer_hemorrhage  = count(withdrawals last 7 days) × 20
velocity_collapse  = max(0, 100 - signal_velocity)
engagement_decay   = max(0, (1 - recent_avg / prior_avg) × 100)

BRI = 100 - (
    stress_persistence × 0.30 +
    buffer_hemorrhage  × 0.25 +
    velocity_collapse  × 0.25 +
    engagement_decay   × 0.20
)

Recovery trigger: BRI < (100 - burnout_threshold) for 2 consecutive days
Recovery mode: 1-5 days, reduced daily targets, lighter plan
```

### 3.6 Smart Daily Planner (Priority Scoring)

```
Input: all topics with progress, pyq data, confidence, mock results
Output: ordered daily plan items fitting available hours

urgency       = min(10, days_since_last_touched / 7)
freshness     = topic.has_no_progress ? 2 : 0
decay_boost   = confidence "decayed" ? 3 : "stale" ? 2 : 0
mock_boost    = mock_accuracy < 0.3 ? 3 : < 0.5 ? 2 : 0
prelims_boost = (exam_mode == "prelims" && topic in prelims papers) ? 3 : 0

priority = (pyq_weight × 4) +
           (importance × 2) +
           (urgency × 2) +
           decay_boost + freshness + mock_boost + prelims_boost

Algorithm: Greedy fill
  1. Sort all candidate topics by priority (descending)
  2. For each topic, if remaining_hours >= topic.estimated_hours:
       add to plan, subtract hours
  3. Continue until hours exhausted

Item types: "new" (first pass), "revision" (scheduled), "decay_revision" (confidence drop)
```

### 3.7 Weakness Radar (Health Score)

```
Input: confidence, revision count, actual hours, stability
Output: health_score (0-100), health_category

confidence_component = min(100, confidence_score)              // 40%
revision_component   = min(100, revision_count / recommended × 100)  // 25%
effort_component     = min(100, actual_hours / estimated × 100)      // 20%
stability_component  = min(100, stability / 50 × 100)               // 15%

health_score = round(Σ component × weight)

category:
  >= 80 → "exam_ready"
  >= 65 → "strong"
  >= 45 → "moderate"
  >= 25 → "weak"
  else  → "critical"
```

### 3.8 Benchmark Readiness

```
coverage    = weighted_completion_pct × 100            // 30%
confidence  = avg_confidence_score                     // 25%
weakness    = (1 - critical_count / total_topics) × 100 // 25%
consistency = streak_current / best_streak × 100       // 10%
velocity    = velocity_health × 100                    // 10%

composite = Σ signal × weight

status:
  >= 85 → "exam_ready"
  >= 70 → "on_track"
  >= 55 → "needs_work"
  else  → "at_risk"
```

### 3.9 XP & Leveling

```
XP triggers:
  plan_item_new:          100 XP
  plan_item_revision:      75 XP
  plan_item_decay_revision: 80 XP
  fsrs_review_correct:     50 XP
  fsrs_review_incorrect:   20 XP
  streak_milestone_7d:    200 XP
  streak_milestone_14d:   400 XP
  streak_milestone_30d:  1000 XP
  streak_milestone_100d: 2500 XP
  recovery_completion:    150 XP
  badge_unlock:         varies

Level formula:
  cumulative_xp(n) = 500 × n × (n-1) / 2
  level = floor(sqrt(2 × xp_total / 500)) + 1
```

### 3.10 Auto-Recalibration

```
Cooldown: minimum 3 days between runs
Requirements: >= 5 days of study data, not in recovery mode

For each persona param, compare recent performance to thresholds:
  - fatigue_threshold: adjust based on avg fatigue vs current threshold
  - buffer_capacity: adjust based on buffer utilization pattern
  - fsrs_target_retention: adjust based on review accuracy
  - burnout_threshold: adjust based on BRI trends

Changes clamped to ±10% per recalibration
All changes logged in recalibration_log with before/after values
```

---

## 4. Mobile Frontend Detail

### 4.1 Screen → Component → Hook Mapping

| Screen | Components | Hooks |
|--------|-----------|-------|
| **Dashboard** | VelocityCard, BufferBankCard, StressThermometer, BurnoutIndicator, CADashboardCard | useVelocity, useBuffer, useStress, useBurnout, useCAStats |
| **Syllabus** | SubjectCard, ChapterAccordion, TopicRow, ConfidenceMeter, PYQBadge, TopicUpdateSheet, ReviewRatingSheet, SummaryBar | useSyllabus, useFSRS, usePyqStats |
| **Planner** | PlanHeader, PlanItemCard, EnergyBattery, RevisionWidget, RecoveryBanner | usePlanner |
| **Progress** | ProgressRing, SubjectProgressGrid, HistoryChart, WeaknessRadarCard, WeakAreaList, HealthBadge, HealthDetailSheet, MockSummaryCard, MockScoreTrendChart, SubjectAccuracyGrid, WeakestTopicsAlert, MockEntrySheet | useProgress (syllabus), useWeakness, useMocks |
| **Settings** | StrategyCard, BadgeGrid, Profile section (inline) | useStrategy, useProfile, useBurnout, useRecalibration, useGamification |
| **Onboarding** | QuestionScreen, ChatBubble, OptionCard, SelectionCard, ModeCard, HoursSlider, OnboardingProgressBar | useAuth (session) |
| **Simulator** | ScenarioCard, SimulationResultCard | — (direct api call) |

### 4.2 React Query Hook Pattern

```typescript
// Fetch hook
export function useFeature() {
  return useQuery<FeatureData>({
    queryKey: ['feature'],
    queryFn: () => api.getFeature() as Promise<FeatureData>,
  });
}

// Mutation hook
export function useFeatureAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ActionBody) => api.featureAction(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature'] });
      // Invalidate related queries too
    },
  });
}
```

### 4.3 API Client Pattern

```typescript
// lib/api.ts
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeader();  // Bearer token from Supabase session
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    ...options,
  });
  if (!res.ok) throw new Error(error.error || 'Request failed');
  return res.json();
}

export const api = {
  getFeature: () => request('/api/feature'),
  doAction: (body: T) => request('/api/feature/action', {
    method: 'POST', body: JSON.stringify(body)
  }),
};
```

### 4.4 Theme System

```typescript
// Two theme objects: darkTheme, lightTheme
// Persisted via AsyncStorage key 'app_theme_preference'
// ThemeContext provides: { theme, isDark, toggleTheme }

// Dark theme (default)
colors: {
  background: '#0F172A',  surface: '#1E293B',
  primary: '#22D3EE',     text: '#F1F5F9',
  textMuted: '#64748B',   border: '#334155',
}

// Light theme
colors: {
  background: '#E0DCD4',  surface: '#EAE6DF',
  primary: '#0891B2',     text: '#1C1917',
  textMuted: '#78716C',   border: '#D6D3CD',
}
```

### 4.5 Navigation Flow

```
_layout.tsx (Root)
  ├─ QueryClientProvider
  ├─ AuthProvider
  └─ ThemeProvider
       └─ Stack
            ├─ index.tsx ──────────── Redirect logic
            ├─ auth/ ─────────────── Login / Signup
            ├─ onboarding/ ────────── 10-screen flow
            ├─ (tabs)/ ────────────── 5-tab main app
            └─ simulator.tsx ──────── Modal screen
```

### 4.6 Onboarding Data Flow

```
Screen 0 (Name): { name }
  → Screen 1 (Year): + { target_exam_year }
    → Screen 2 (Attempt): + { attempt_number }
      → Screen 3 (Type): + { user_type }
        → Screen 4 (Challenges): + { challenges }
          → Screen 5 (Value Prop): pass-through
            → Screen 6 (Strategy + Date): + { chosen_mode, exam_date }
              → Screen 7 (Targets): + { targets (JSON) }
                → Screen 8 (Promise): + { promise_text }
                  → Screen 9 (Complete): → API submit → redirect to tabs

All params accumulated via ...params spread in router.push()
Redo onboarding: saves name/exam_date to localStorage before reset
```

---

## 5. Migration Sequence

| # | Migration | Purpose |
|---|-----------|---------|
| 001 | enums | strategy_mode, exam_mode, velocity_status |
| 002 | user_profiles | Core user table |
| 003 | strategy_mode_defaults | Seed 48 default param rows |
| 004 | persona_extensions | Add persona columns, persona_snapshots table |
| 005 | syllabus_schema | subjects, chapters, topics |
| 006 | seed_syllabus | GS1 + GS2 topic data |
| 007 | user_progress | Topic progress tracking |
| 008 | fsrs_tables | fsrs_cards, confidence_snapshots, revision_schedule |
| 009 | velocity_buffer | velocity_snapshots, daily_logs, buffer_transactions, streaks |
| 010 | burnout | burnout_snapshots, recovery_log |
| 011 | daily_plans | Smart planner table |
| 012 | weakness_radar | Health score columns on user_progress, weakness_snapshots |
| 013 | recalibration | recalibration_log, auto_recalibrate column |
| 014 | weekly_reviews | weekly_reviews table |
| 015 | gamification | xp_transactions, user_badges, badges (seed 15) |
| 016 | benchmark | benchmark_snapshots |
| 017 | weekly_review_enhancements | Additional weekly review columns |
| 018 | mock_tests | mock_tests, mock_subject_accuracy, mock_topic_accuracy |
| 019 | current_affairs | ca_daily_logs, ca_streaks |
| 020 | onboarding_v2 | V2 columns, user_targets, user_promises |
| 021 | add_avatar_url | avatar_url column on user_profiles |

---

## 6. Error Handling Strategy

```
API Layer:
  - Services throw on Supabase errors
  - Routes return structured { error: string } with HTTP status codes
  - Auth middleware returns 401 for invalid/missing tokens

Mobile Layer:
  - api.ts request() throws on non-2xx responses
  - React Query handles retries (default 3)
  - Hooks expose { data, error, isLoading } states
  - UI shows loading spinners + error states
  - Supabase .single() uses .then({ data, error }) pattern (no .catch)

Graceful degradation:
  - Settings loads profile from Supabase directly if API unreachable
  - Demo mode (isDemoMode) bypasses auth entirely for UI exploration
  - Strategy service has hardcoded defaults if DB unavailable
```
