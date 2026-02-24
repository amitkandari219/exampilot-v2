# ExamPilot V2 — Unified System Design & Implementation Prompts

> **What this document is:** The complete, merged feature set for ExamPilot. The original 12 features have been enhanced with all 9 strategic improvements (PYQ weighting, confidence decay, weakness radar, mock integration, dynamic buffers, strategy modes, burnout guardrails, gamification, and benchmarks). Nothing is a separate "add-on" — every improvement is baked into the relevant feature.
>
> **Tech Stack:** React Native (Expo), Node.js/Fastify, PostgreSQL (Supabase)
>
> **How to use:** Each prompt is self-contained. Paste it into Claude with the relevant JSON/schema files.

---

## THE UNIFIED FEATURE LIST (18 Features)

### FOUNDATION LAYER (Build first — everything depends on these)

| # | Feature | What it does | Merges |
|---|---------|-------------|--------|
| F1 | **Onboarding & Strategy Mode** | Classifies aspirant into a persona, sets all engine parameters | Improvement 7 |
| F2 | **PYQ Intelligence Layer** | Weights every topic by exam frequency — the data spine | Improvement 2 |
| F3 | **Living Syllabus Map** | Interactive syllabus tree with PYQ badges, health zones, confidence meters | Original #1 + Imp 2 badges + Imp 1 health + Imp 3 decay indicators |

### CORE ENGINE LAYER (The brain)

| # | Feature | What it does | Merges |
|---|---------|-------------|--------|
| F4 | **Weighted Velocity Engine + Dynamic Buffer Bank** | PYQ-weighted velocity calculation + savings-account buffer system | Original #2 + Imp 2 weights + Imp 6 dynamic buffer |
| F5 | **Confidence Decay Engine** | Ebbinghaus-based decay that auto-downgrades stale topics | Improvement 3 |
| F6 | **Spaced Repetition Scheduler** | Auto-schedules revisions at optimal intervals, decay-aware | Original #6 + Imp 3 triggers |
| F7 | **Stress Thermometer** | Composite health indicator using weighted velocity + dynamic buffer + confidence | Original #3, upgraded signals |
| F8 | **Smart Daily Planner** | Daily mission brief: PYQ-prioritized, weakness-boosted, fatigue-constrained | Original #4 + Imp 2 priority + Imp 1 weakness boost + Imp 8 fatigue |

### INTELLIGENCE LAYER (Strategic insights)

| # | Feature | What it does | Merges |
|---|---------|-------------|--------|
| F9 | **Weakness Radar** | 4-signal topic health → exposes false security, blind spots, over-revision | Improvement 1 (replaces original #12) |
| F10 | **Recalibration Engine** | "Google Maps rerouting" with dynamic buffer awareness | Original #5 + Imp 6 buffer |
| F11 | **Fatigue & Burnout Guardian** | Daily fatigue score + multi-day Burnout Risk Index + auto Recovery Mode | Original #8 + Improvement 8 merged |

### REVIEW & ADAPTATION LAYER

| # | Feature | What it does | Merges |
|---|---------|-------------|--------|
| F12 | **Weekly Review Ritual** | Sunday performance digest with all enhanced metrics | Original #7 + all improvement data |
| F13 | **Mock Test Integration** | Prelims mock results → topic accuracy → feeds radar, decay, planner | Improvement 4 |
| F14 | **Prelims/Mains Mode Toggle** | One-tap exam phase switch that restructures entire plan | Original #9 |
| F15 | **"What If" Simulator** | Hypothetical impact calculator for breaks, hour changes, scope cuts | Original #10 (now complete) |

### ENGAGEMENT LAYER (Retention & motivation)

| # | Feature | What it does | Merges |
|---|---------|-------------|--------|
| F16 | **Current Affairs Tracker** | Daily CA toggle with subject tagging + integration to static syllabus | Original #11 |
| F17 | **Gamification Layer** | Weekly Execution Score, 3 streak types, 20+ milestone badges — premium feel | Improvement 5 |
| F18 | **Strategic Benchmark Layer** | Anonymous peer percentiles + "successful aspirant" reference curve | Improvement 9 |

### BUILD ORDER

```
Phase 1 (MVP, Weeks 1-4):     F1 → F2 → F3 → F4 → F7 → F8
Phase 2 (Intelligence, Weeks 5-8): F5 → F6 → F9 → F10 → F11
Phase 3 (Feedback Loop, Weeks 9-12): F12 → F13 → F14 → F15
Phase 4 (Engagement, Weeks 13-16):  F16 → F17 → F18
```

### DATA DEPENDENCY GRAPH

```
F1 (Strategy Mode) ──→ parameterizes everything
F2 (PYQ Weights)   ──→ F3, F4, F8, F9 (all need weights)
F4 (Velocity)      ──→ F7 (stress), F10 (recalibration), F15 (what-if)
F5 (Decay)         ──→ F6 (revision triggers), F9 (radar health score)
F8 (Daily Planner) ←── F4, F5, F6, F9, F11 (everything feeds the planner)
F13 (Mocks)        ──→ F5, F9 (accuracy data closes the loop)
```

---

## F1: ONBOARDING & STRATEGY MODE

### Prompt:

```
I'm building ExamPilot — a UPSC exam study intelligence platform (React Native/Expo, Node.js/Fastify, PostgreSQL via Supabase).

Build "Onboarding & Strategy Mode" — the first-run experience that classifies the candidate into a study persona and sets all engine parameters for the entire system. Every downstream feature (velocity, planner, fatigue, recalibration) reads its configuration from this.

**WHY THIS IS FIRST:**
A working professional studying 3 hrs/day needs fundamentally different parameters than a full-time aspirant at 8 hrs/day. Without this, every algorithm uses generic defaults.

**4 STRATEGY MODES:**

MODE 1: CONSERVATIVE ("Safe & Steady")
  Profile: First-time aspirant, risk-averse, wants full coverage
  Parameters:
    daily_hours: 5-6
    buffer_pct: 0.20
    revision_pct: 0.25
    scope_reduction_threshold: NEVER
    velocity_target_multiplier: 0.9
    fatigue_sensitivity: HIGH
    revision_ratio_in_plan: 0.35
    burnout_bri_threshold: 65 (triggers recovery earlier)
    recalibration_order: ["consume_buffers", "absorb", "increase_hours"]
    buffer_deposit_rate: 0.3
    buffer_withdrawal_rate: 0.4 (less punishing)

MODE 2: AGGRESSIVE ("Full Speed Ahead")
  Profile: Re-attempter, knows syllabus, targets weak areas
  Parameters:
    daily_hours: 7-8
    buffer_pct: 0.10
    revision_pct: 0.15
    scope_reduction_threshold: 0.7
    velocity_target_multiplier: 1.1
    fatigue_sensitivity: LOW
    revision_ratio_in_plan: 0.20
    burnout_bri_threshold: 80 (higher tolerance)
    recalibration_order: ["absorb", "reduce_scope", "increase_hours"]
    buffer_deposit_rate: 0.25
    buffer_withdrawal_rate: 0.5

MODE 3: BALANCED ("Smart & Adaptive")
  Profile: Serious aspirant with moderate time, wants optimization
  Parameters:
    daily_hours: 5-7
    buffer_pct: 0.15
    revision_pct: 0.20
    scope_reduction_threshold: 0.8
    velocity_target_multiplier: 1.0
    fatigue_sensitivity: MEDIUM
    revision_ratio_in_plan: 0.30
    burnout_bri_threshold: 75
    recalibration_order: ["absorb", "consume_buffers", "increase_hours", "reduce_scope"]
    buffer_deposit_rate: 0.3
    buffer_withdrawal_rate: 0.5

MODE 4: WORKING_PROFESSIONAL ("Max Efficiency")
  Profile: Job + studying, limited hours, needs highest ROI
  Parameters:
    daily_hours: 2-4
    buffer_pct: 0.25
    revision_pct: 0.20
    scope_reduction_threshold: 0.6
    velocity_target_multiplier: 0.85
    fatigue_sensitivity: HIGH
    revision_ratio_in_plan: 0.30
    burnout_bri_threshold: 65
    weekend_boost: true (2x topics Sat/Sun)
    pyq_weight_minimum: 3 (only plan topics with pyq_weight >= 3)
    recalibration_order: ["reduce_scope", "consume_buffers", "absorb"]
    buffer_deposit_rate: 0.35
    buffer_withdrawal_rate: 0.4

**ONBOARDING FLOW (5 screens, one question each):**

Screen 1: "How many hours can you study daily?" — Slider: 2-10 hours
Screen 2: "Are you a working professional?" — Yes / No
Screen 3: "Which attempt is this?" — First / Second / Third+
Screen 4: "Your study approach?" — "Cover everything thoroughly" / "Focus on high-yield topics"
Screen 5: "When you fall behind?" — "I need more time" / "I'll skip low-priority" / "I'll push harder"

CLASSIFICATION LOGIC:
  if Q2 == Yes: mode = WORKING_PROFESSIONAL
  elif Q1 >= 7 AND Q3 != First: mode = AGGRESSIVE
  elif Q4 == "Cover everything" OR Q3 == First: mode = CONSERVATIVE
  else: mode = BALANCED

After classification, show recommended mode with key parameters. Allow manual override.

**ADDITIONAL ONBOARDING DATA:**
  - exam_date (date picker)
  - prelims_date (date picker, optional)
  - daily_hours (confirmed from Q1)
  - name (text input)

**DATABASE:**

1. `user_profiles` table:
   - id (FK to auth.users), name, exam_date, prelims_date, daily_hours (float),
     strategy_mode (enum: conservative/aggressive/balanced/working_professional),
     strategy_params (jsonb — stores ALL parameters above),
     current_mode (enum: mains/prelims/post_prelims, default mains),
     mode_switched_at, onboarding_completed (boolean), created_at

2. `strategy_mode_defaults` table (seeded, read-only):
   - mode (enum), param_name (text), param_value (text), description (text)

**API ENDPOINTS:**

1. `POST /api/onboarding/:userId`
   Body: questionnaire answers + exam_date + daily_hours
   Response: recommended mode + all parameters
   Action: Creates user_profile with strategy_params populated

2. `GET /api/strategy/:userId`
   Returns current mode + all active parameters

3. `POST /api/strategy/:userId/switch`
   Body: { "mode": "aggressive" }
   Action: Updates mode, repopulates strategy_params, triggers full recalculation

4. `POST /api/strategy/:userId/customize`
   Body: { "buffer_pct": 0.18, "daily_hours": 6 }
   Action: Overrides individual params within current mode

**FRONTEND — OnboardingFlow:**

1. Full-screen, one question per screen, swipe/button to advance
2. Progress dots at top (5 dots)
3. After classification: show mode card with name, icon, key stats
4. "This is right" / "Choose different" → shows all 4 modes as selectable cards
5. Each mode card: name, 1-line description, key numbers (buffer %, daily hrs, revision %)
6. Final screen: exam date picker + "Let's begin" CTA

**Settings — StrategyCard:**
- Current mode with description
- "Change Mode" button
- Advanced toggle: individual parameter sliders (for power users)

**ACCEPTANCE CRITERIA:**
- [ ] Questionnaire correctly classifies into 4 modes
- [ ] All parameters are populated from mode defaults
- [ ] Custom overrides persist and survive mode changes
- [ ] Working Professional mode sets pyq_weight_minimum and weekend_boost
- [ ] Mode switch triggers full system recalculation
- [ ] Onboarding skippable (defaults to BALANCED)
- [ ] Strategy params are the single source of truth — all features read from here
```

---

## F2: PYQ INTELLIGENCE LAYER

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "PYQ Intelligence Layer" — a data foundation that weights every topic by its Previous Year Question frequency. This is the data spine that the velocity engine, daily planner, weakness radar, and stress thermometer all depend on.

**THE INSIGHT:**
"Fundamental Rights" appeared in 23 of the last 25 UPSC papers. "Pressure Belts" appears once every 4-5 years. Treating them as equal 1-unit topics is fundamentally wrong. PYQ weight corrects this.

**DATA MODEL:**

1. Add to `topics` table:
   - pyq_frequency: int — times appeared in UPSC PYQs (10-year window, 2015-2025)
   - pyq_weight: float (1-5) — normalized weight
   - pyq_trend: enum ("rising", "stable", "declining")
   - last_pyq_year: int

2. Create `pyq_data` table (raw source):
   - id, topic_id (FK), year (int), paper (text: "Prelims"/"Mains GS-I" etc.), question_count (int), question_type (enum: "factual"/"conceptual"/"analytical"/"opinion")

3. Create `pyq_subject_stats` table:
   - subject_id (FK), avg_questions_per_year, total_questions_10yr, trend, highest_year, highest_count

**WEIGHT CALCULATION:**

For each topic:
  recency_weighted_freq = SUM(question_count * multiplier)
  where multiplier: 2024-25=1.5x, 2022-23=1.2x, 2020-21=1.0x, 2018-19=0.8x, 2015-17=0.6x

Normalize to 1-5 using percentile buckets:
  Top 10% → pyq_weight = 5
  70-90th → 4
  40-70th → 3
  10-40th → 2
  Bottom 10% → 1

Trend: if avg(2022-25) > avg(2015-21) * 1.3 → "rising"; < 0.7 → "declining"; else "stable"

**GRAVITY CONCEPT (used everywhere):**
  Each topic's "gravity" = pyq_weight (1-5)
  total_gravity = SUM(pyq_weight for all 466 topics) ≈ 1420
  weighted_completion = SUM(pyq_weight for completed topics) / total_gravity

This replaces raw topic counts throughout the system:
  - Velocity: weighted_topics_remaining / effective_days
  - Stress: uses weighted_completion for time pressure signal
  - Daily Planner: pyq_weight is the top priority factor
  - Completion %: "48% exam-weighted" not just "40% topics"

**SEED DATA SCRIPT:**
Since real PYQ data requires manual curation, create a seeding script that uses the existing `importance` field as proxy:
  importance 5 → pyq_frequency random(18-25), pyq_weight = 5
  importance 4 → pyq_frequency random(10-17), pyq_weight = 4
  importance 3 → pyq_frequency random(5-9), pyq_weight = 3
  importance 2 → pyq_frequency random(2-4), pyq_weight = 2
  importance 1 → pyq_frequency random(0-1), pyq_weight = 1
Generate realistic pyq_data rows (year-by-year) for each topic.

**API ENDPOINTS:**

1. `GET /api/pyq-stats/:userId`
   Returns:
   {
     "total_gravity": 1420,
     "completed_gravity": 680,
     "remaining_gravity": 740,
     "weighted_completion_pct": 47.9,
     "unweighted_completion_pct": 40.1,
     "gravity_gap": 7.8,
     "interpretation": "You've covered 40% of topics but 48% of exam weight — smart prioritization.",
     "high_gravity_untouched": [...top 10 high-weight untouched topics],
     "subject_gravity": [...per subject breakdown],
     "trending_up": [...rising topics],
     "trending_down": [...declining topics]
   }

2. `GET /api/pyq-stats/topic/:topicId`
   Year-by-year breakdown + question types for a specific topic.

**FRONTEND:**

1. PYQ flame badge on topic rows (Syllabus Map):
   Weight 5: 5 flame dots (bright), "Asked 23 times" on tap
   Weight 4: 4 flames, etc. down to Weight 1: 1 dim flame
   Use gradient icon, not emoji.

2. Dashboard toggle: "Topic Progress: 187/466 (40%)" ↔ "Exam-Weighted: 680/1420 (48%)"
   Weighted is the default view.

3. Trending Topics card: 3-5 "rising" topics on dashboard.

4. Syllabus Map color mode: toggle to color by PYQ weight (deep red=5, light yellow=1).

**ACCEPTANCE CRITERIA:**
- [ ] All 466 topics seeded with pyq_weight and pyq_frequency
- [ ] total_gravity calculation is correct
- [ ] Weighted completion % differs from unweighted (verifiable)
- [ ] Trending topics correctly identifies rising/declining
- [ ] PYQ badges render on topic rows
- [ ] Toggle between weighted/unweighted works on dashboard
- [ ] Seed script generates year-by-year pyq_data for all topics
```

---

## F3: LIVING SYLLABUS MAP (Enhanced)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Living Syllabus Map" — the visual backbone of the app. An interactive 3-level hierarchy (Subject → Chapter → Topic) where candidates see, update, and understand their progress with rich intelligence overlays.

**ENHANCEMENTS OVER A BASIC SYLLABUS TRACKER:**
This isn't just a checklist. Each topic shows 5 dimensions:
1. Completion status (untouched → exam_ready)
2. PYQ weight (flame badges from F2)
3. Confidence score (real-time decay from F5)
4. Health zone (from Weakness Radar F9)
5. Revision status (from Spaced Repetition F6)

**DATA MODEL:**

The syllabus: 16 subjects, 93 chapters, 466 topics.

Tables (created in F1/F2, referenced here):
- `subjects` — id, name, paper[], importance, difficulty, estimated_hours, display_order
- `chapters` — id, subject_id (FK), name, importance, difficulty, estimated_hours, display_order
- `topics` — id, chapter_id (FK), name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year
- `user_progress` — id, user_id, topic_id, status (enum: untouched/in_progress/first_pass/revised/exam_ready/deferred_scope), actual_hours_spent, last_touched, revision_count, confidence_numeric (1-5), confidence_score (float 0-100, computed by decay engine), confidence_status (fresh/fading/stale/decayed), health_score (float 0-100, computed by radar), mock_accuracy (float 0-1), notes

Unique constraint: (user_id, topic_id) on user_progress.

**FRONTEND — SyllabusMapScreen:**

1. **Top Summary Bar (always visible, sticky):**
   Two-line display:
   - Line 1: "187/466 topics (40%) · 412/803 hrs"
   - Line 2: "Exam-Weighted: 680/1420 (48%)" — in accent color
   Mini progress ring on the right.

2. **View Mode Toggle (top right):**
   3 modes for coloring the tree:
   - "Progress" (default): colored by completion status
   - "PYQ Weight": colored by pyq_weight (red=5 to yellow=1)
   - "Health": colored by health_score (green=healthy to red=critical)

3. **Subject List (default view):**
   16 expandable cards. Each shows:
   - Subject name
   - Paper badges: "Prelims" (blue), "Mains GS-II" (green), etc.
   - Progress ring: % topics with status != untouched
   - Weighted progress: "Gravity: 140/210 (67%)"
   - Status distribution bar: colored horizontal bar showing untouched(gray)/in_progress(blue)/first_pass(yellow)/revised(orange)/exam_ready(green)/deferred(dim)
   - Confidence indicator: avg confidence_score for the subject, colored dot
   - Hours: "32/85 hrs"

4. **Chapter Drill-Down (accordion):**
   Tapping a subject expands its chapters. Each chapter card:
   - Chapter name
   - Progress ring + topic count: "7/10 topics"
   - Weighted progress
   - Avg confidence bar
   - Subject's status distribution (mini)

5. **Topic List (flat list under chapter):**
   Each topic row shows:
   - Topic name
   - Status pill (colored, tappable to cycle)
   - PYQ flame badge (1-5 flames)
   - Confidence meter: small horizontal bar (green/yellow/orange/red) with number
   - Last touched: "3d ago" or "⚠️ 45d ago" (amber if >30 days)
   - Hours: "1.5/2 hrs"
   - If health_score exists and < 40: "⚠️" warning icon

6. **Quick Update Bottom Sheet (long-press topic):**
   - Status selector: 5 tappable pills (untouched → exam_ready)
   - Hours spent: numeric input, +0.5 increment
   - Self-confidence: 1-5 star rating
   - Notes: text input
   - "Save" button
   - On save: optimistic UI update → sync to Supabase → trigger velocity recalc

7. **Search & Filter Bar:**
   - Search by topic name
   - Filter by: status, subject, PYQ weight range, health zone, confidence status
   - Sort by: default order, PYQ weight DESC, health score ASC, last touched ASC

**PROGRESS AGGREGATION (bubbles up):**
  topic → chapter → subject → overall
  
  Chapter weighted_pct = SUM(pyq_weight where status != untouched) / SUM(pyq_weight)
  Subject weighted_pct = same across all topics in subject
  Overall weighted_pct = same across all 466 topics

**TECH:**
- Supabase JS client for CRUD
- React Query (TanStack) for caching + optimistic updates
- When user updates a topic, optimistically update all aggregations up the chain
- Dark theme, cyan (#22D3EE) primary accent
- FlatList with virtualization for performance (466 items)

**SEED SCRIPT:**
Read the syllabus JSON (466 topics across 16 subjects, 93 chapters). Write a Supabase migration/seed that:
1. Inserts subjects, chapters, topics maintaining FK relationships
2. Populates pyq_weight, pyq_frequency from the seeding logic in F2
3. Creates initial user_progress rows (all untouched) for a test user

**ACCEPTANCE CRITERIA:**
- [ ] All 16 subjects render with correct chapter/topic counts
- [ ] Accordion drill-down: subject → chapters → topics
- [ ] Status update via tap or bottom sheet works with optimistic UI
- [ ] Progress aggregation is correct at all 3 levels (topic/chapter/subject)
- [ ] PYQ flame badges render correctly (1-5)
- [ ] Confidence meter shows decay-based score (not just self-reported)
- [ ] View mode toggle switches coloring correctly
- [ ] Search and filter work across all 466 topics
- [ ] Weighted progress shows different % than unweighted
- [ ] Performance: smooth scrolling with 466 topics (virtualized list)
```

---

## F4: WEIGHTED VELOCITY ENGINE + DYNAMIC BUFFER BANK

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Weighted Velocity Engine + Dynamic Buffer Bank" — the core algorithm combining PYQ-weighted velocity with a savings-account-style buffer system. This is the heart of ExamPilot.

**PART A: WEIGHTED VELOCITY**

The velocity engine no longer counts topics — it counts gravity (PYQ-weighted units).

INPUTS (read from user_profiles.strategy_params):
- exam_date, today
- buffer_pct (from strategy mode: 0.10-0.25)
- revision_pct (from strategy mode: 0.15-0.25)
- velocity_target_multiplier (from strategy mode: 0.85-1.1)

CALCULATIONS:
  days_remaining = exam_date - today
  effective_study_days = days_remaining - floor(days_remaining * buffer_pct) - floor(days_remaining * revision_pct)

  // Weighted metrics
  total_gravity = SUM(pyq_weight) for all 466 topics ≈ 1420
  completed_gravity = SUM(pyq_weight) for topics WHERE status IN (first_pass, revised, exam_ready)
  remaining_gravity = total_gravity - completed_gravity

  // Required velocity (gravity-per-day)
  required_velocity = (remaining_gravity / effective_study_days) * velocity_target_multiplier

  // Actual velocity (rolling window, gravity-weighted)
  actual_velocity_7d = SUM(pyq_weight of topics completed in last 7 days) / 7
  actual_velocity_14d = SUM(pyq_weight of topics completed in last 14 days) / 14
  actual_velocity = (0.6 * actual_velocity_7d) + (0.4 * actual_velocity_14d)

  // Velocity ratio
  velocity_ratio = actual_velocity / required_velocity
  status: >=1.0 green, >=0.8 yellow, >=0.6 orange, <0.6 red

  // Projections
  projected_days = remaining_gravity / actual_velocity
  projected_completion_date = today + projected_days
  weighted_completion_pct = completed_gravity / total_gravity * 100

  // Also track unweighted for comparison
  unweighted_completed = COUNT(topics WHERE status IN (first_pass, revised, exam_ready))
  unweighted_pct = unweighted_completed / 466 * 100

  // Trend
  trend = velocity_7d > velocity_14d * 1.1 ? "improving" : velocity_7d < velocity_14d * 0.9 ? "declining" : "stable"

**PART B: DYNAMIC BUFFER BANK**

Buffer is no longer static. It's a savings account that grows with consistency and shrinks with underperformance.

DAILY BUFFER UPDATE (runs end of each day via cron or on app open):
  delta = actual_topics_today_gravity - required_velocity_per_day

  // Read rates from strategy_params
  deposit_rate = strategy_params.buffer_deposit_rate (default 0.3)
  withdrawal_rate = strategy_params.buffer_withdrawal_rate (default 0.5)

  if delta > 0:
    deposit = delta * deposit_rate
    buffer_balance += deposit
    buffer_balance = min(buffer_balance, days_remaining * 0.20) // cap at 20%
  elif delta < 0:
    withdrawal = abs(delta) * withdrawal_rate // asymmetric: losing is faster
    buffer_balance -= withdrawal
    buffer_balance = max(buffer_balance, -5) // floor: allow small debt
  elif delta == 0:
    buffer_balance += 0.1 // consistency reward

  // Zero-day penalty
  if actual_topics_today == 0:
    buffer_balance -= 1.0

BUFFER STATUS:
  buffer > initial * 0.8: "healthy" (green)
  buffer > initial * 0.4: "moderate" (yellow)
  buffer > 0: "low" (orange)
  buffer <= 0: "debt" (red) → auto-triggers recalibration

**DATABASE:**

1. `velocity_snapshots` table:
   - id, user_id, snapshot_date (date), topics_completed_today (int), gravity_completed_today (float), cumulative_completed (int), cumulative_gravity (float), required_velocity (float), actual_velocity_7d (float), actual_velocity_14d (float), velocity_ratio (float), status (enum), weighted_completion_pct (float), unweighted_completion_pct (float), trend (enum), stress_score (float), stress_status (enum), signal_velocity (float), signal_buffer (float), signal_time (float)

2. `daily_logs` table:
   - id, user_id, log_date (date, unique per user), topics_completed (int), gravity_completed (float), hours_studied (float), subjects_touched (text[])

3. Add to `user_profiles`:
   - buffer_balance (float), buffer_initial (float)

4. `buffer_transactions` table:
   - id, user_id, transaction_date (date), type (enum: deposit/withdrawal/zero_day_penalty/initial/recalibration_adjustment), amount (float), balance_after (float), delta_gravity (float), notes (text)

5. `streaks` table:
   - id, user_id, streak_type (enum: study/revision/plan_completion), current_count (int), best_count (int), last_active_date (date)

**API ENDPOINTS:**

1. `GET /api/velocity/:userId`
   Returns:
   {
     "days_remaining": 245,
     "effective_study_days": 159,
     "total_gravity": 1420,
     "completed_gravity": 680,
     "remaining_gravity": 740,
     "weighted_completion_pct": 47.9,
     "unweighted_completion_pct": 40.1,
     "required_velocity": 4.65,
     "actual_velocity_7d": 5.2,
     "actual_velocity_14d": 4.8,
     "actual_velocity": 5.04,
     "velocity_ratio": 1.08,
     "status": "on_track",
     "projected_completion_date": "2027-03-15",
     "projected_buffer_days": 12,
     "trend": "improving",
     "streak": {"study": 12, "revision": 5, "plan_completion": 8},
     "buffer": {
       "balance": 8.4,
       "initial": 12,
       "status": "healthy",
       "last_transaction": {"type": "deposit", "amount": 0.3, "date": "2026-02-24"}
     }
   }

2. `GET /api/velocity/:userId/history?days=30`
   Returns daily snapshots for trend charts.

3. `POST /api/velocity/:userId/recalculate`
   Forces recalculation. Called after topic status changes.

4. `GET /api/buffer/:userId`
   Returns full buffer details:
   {
     "current_balance": 8.4,
     "initial_balance": 12,
     "max_possible": 15.2,
     "status": "healthy",
     "trend": "growing",
     "last_7_days": [...7 transactions],
     "total_deposited": 14.6,
     "total_withdrawn": 6.2
   }

**FRONTEND COMPONENTS:**

1. VelocityCard (dashboard):
   - Large velocity ratio: "1.08x" in green
   - Subtitle: "Need 4.65 gravity/day, averaging 5.04"
   - Sparkline: 14-day velocity_ratio trend
   - Projected date + buffer remaining
   - Streak: "🔥 12 · 📖 5 · ✅ 8"
   - Trend arrow

2. BufferBankCard (dashboard):
   - Mini "bank account" card
   - Large number: "8.4 days" in green
   - Progress bar (balance vs max)
   - Last transaction: "+0.3 days" in green
   - 14-day sparkline (area chart, green positive, red negative)
   - Tap → expands to full transaction history (bottom sheet)

3. Debt Mode UI (buffer < 0):
   - Card turns red with pulse
   - "Buffer Debt: -2.3 days"
   - "Complete 2 extra topics today to start recovering"
   - Links to recalibration

**EDGE CASES:**
- Day 1: Show required velocity only, skip ratio. Buffer = initial.
- Exam < 30 days: Reduce buffer_pct to 0.10, revision_pct to 0.15
- 0 velocity (no topics ever): Show "At risk" not division-by-zero
- Retroactive topic completion: Recalculate affected daily_logs
- User changes strategy mode: Recalculate buffer_initial and all params

**ACCEPTANCE CRITERIA:**
- [ ] Velocity uses gravity (PYQ weight sum), not topic count
- [ ] Required velocity respects strategy_params multiplier
- [ ] Buffer grows on overperformance (deposit_rate from params)
- [ ] Buffer shrinks faster than it grows (asymmetric penalty)
- [ ] Zero-study day costs exactly 1.0 buffer day
- [ ] Buffer caps at 20% of remaining days
- [ ] Buffer floor at -5 (debt mode)
- [ ] Buffer debt auto-triggers recalibration
- [ ] Streak tracks correctly, resets on missed day
- [ ] Both weighted and unweighted metrics available
- [ ] Trend detection correct (improving/stable/declining)
- [ ] History endpoint suitable for line charts
```

---

## F5: CONFIDENCE DECAY ENGINE

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Confidence Decay Engine" — an Ebbinghaus-inspired system that automatically reduces topic confidence as time passes without revision, preventing false security and triggering corrective actions.

**THE CORE PROBLEM:**
A topic revised 45 days ago with no mock test data looks the same as one revised yesterday. The candidate thinks they know 300 topics, but 80 of them have effectively been forgotten. This engine exposes that.

**ALGORITHM:**

For each topic with status != "untouched":

INPUTS:
  days_since = today - last_touched
  revisions = revision_count
  accuracy = mock_accuracy (null if no data)
  self_conf = confidence_numeric (1-5, null if not set)

DECAY FUNCTION (Ebbinghaus exponential):
  stability = 1 + (revisions * 0.7)
  // 0 revisions = stability 1, 3 revisions = stability 3.1
  
  decay_rate = 0.05 / stability
  // Higher stability = slower decay
  
  raw_retention = e^(-decay_rate * days_since)
  // Examples:
  // 0 rev, 30 days: e^(-0.05*30) = 0.22 (22%)
  // 1 rev, 30 days: e^(-0.029*30) = 0.42 (42%)
  // 3 rev, 30 days: e^(-0.016*30) = 0.62 (62%)

ACCURACY FACTOR:
  if accuracy is not null: accuracy_factor = accuracy
  elif self_conf is not null: accuracy_factor = self_conf / 5
  else: accuracy_factor = 0.6 (neutral)

CONFIDENCE SCORE (0-100):
  confidence_score = raw_retention * accuracy_factor * 100
  Clamped to 0-100.

CONFIDENCE STATUS:
  >= 70: FRESH (green)
  50-69: FADING (yellow)
  30-49: STALE (orange)
  < 30:  DECAYED (red)

SUBJECT-LEVEL CONFIDENCE:
  subject_confidence = weighted_avg(topic confidence_scores, weight = pyq_weight)
  // High-PYQ topics drag down subject confidence more when they decay

**AUTOMATIC ACTIONS:**

1. FRESH → FADING (crosses below 70):
   Auto-schedule a "decay_revision" in the daily plan within 3 days

2. Drops to STALE (below 50):
   Priority boost +4 in daily planner
   Flag in Weakness Radar as "decaying"

3. Drops to DECAYED (below 30):
   AUTO-DOWNGRADE STATUS: "revised"/"exam_ready" → "first_pass"
   This is critical — prevents false green in the syllabus map
   Log in status_changes table
   Notification: "Polity: DPSP has decayed — a 30-min revision will restore it"

4. Subject confidence < 40:
   Weekly review alert: "⚠️ Geography confidence dropped to 38"

**DATABASE CHANGES:**

1. user_progress columns (already in F3 schema):
   - confidence_score: float (0-100)
   - confidence_status: enum (fresh/fading/stale/decayed)
   - last_confidence_calc: timestamp

2. `confidence_snapshots` table:
   - id, user_id, topic_id, snapshot_date, confidence_score, raw_retention, accuracy_factor

3. `status_changes` table:
   - id, user_id, topic_id, old_status, new_status, reason, changed_at
   - Logs both manual changes AND automatic decay downgrades

**API ENDPOINTS:**

1. `POST /api/confidence/recalculate/:userId`
   Recalculates ALL non-untouched topics. Called daily via cron (2 AM) + after mock import.
   Returns:
   {
     "topics_recalculated": 355,
     "status_downgrades": [
       {"topic": "DPSP", "old_confidence": 32, "new_confidence": 28, "action": "downgraded to first_pass"}
     ],
     "decay_revisions_scheduled": 8,
     "subjects_at_risk": [
       {"subject": "Geography", "confidence": 38, "days_untouched": 22}
     ]
   }

2. `GET /api/confidence/:userId/overview`
   Returns:
   {
     "overall_confidence": 58,
     "distribution": {"fresh": 120, "fading": 95, "stale": 60, "decayed": 25, "untouched": 166},
     "subjects": [
       {"name": "Polity", "confidence": 72, "status": "fresh", "decaying_count": 3}
     ],
     "fastest_decaying": [...],
     "most_resilient": [...]
   }

3. `GET /api/confidence/:userId/topic/:topicId/curve`
   Returns projected forgetting curve:
   {
     "current_confidence": 72,
     "stability": 2.4,
     "curve_points": [
       {"days": 0, "confidence": 72},
       {"days": 7, "confidence": 61},
       {"days": 14, "confidence": 52},
       {"days": 30, "confidence": 38}
     ],
     "optimal_revision_date": "2026-03-01",
     "revision_history": [...]
   }

**FRONTEND:**

1. Confidence meter on topic rows (replaces static status):
   Small horizontal bar colored by status + number (72, 38, etc.)
   Pulse animation on topics that just crossed a threshold.

2. Subject confidence grid (dashboard):
   16 mini cards, each: subject name + confidence number + color + trend arrow
   Sortable: worst-first or alphabetical.

3. Forgetting curve visualization (on topic tap):
   Small line chart: X=days, Y=projected confidence
   Shows optimal revision point + how revisions reset the curve.

4. Decay alert banner (top of DailyPlanScreen):
   "⚠️ 3 topics decayed overnight — tap to restore them"
   Tapping shows the topics with "Quick Revision" action.

**ACCEPTANCE CRITERIA:**
- [ ] Decay follows exponential curve correctly (test: 0 rev/30 days ≈ 22%)
- [ ] Higher revision_count = slower decay (stability works)
- [ ] Topics auto-downgrade status when confidence < 30
- [ ] Status downgrades logged in status_changes
- [ ] Decay-triggered revisions appear in daily plan
- [ ] Subject confidence aggregates correctly (PYQ-weighted)
- [ ] Daily cron recalculates all scores
- [ ] Forgetting curve projection is mathematically correct
- [ ] Edge case: Topic revised yesterday + 20% mock accuracy = moderate confidence
- [ ] Edge case: 5 revisions + 90% accuracy = barely decays even at 30 days
```

---

## F6: SPACED REPETITION SCHEDULER (Decay-Aware)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Spaced Repetition Scheduler" — auto-schedules revision touchpoints at optimal intervals, now enhanced with confidence decay awareness. Revisions aren't just calendar-based; they adapt to actual retention.

**BASE INTERVALS (on first_pass):**
  Revision 1: +3 days
  Revision 2: +10 days
  Revision 3: +30 days
  Final: exam_date - 7 days (importance >= 4 only)
  Low confidence (self_confidence <= 2): extra revision at +1 day

**DECAY-AWARE ENHANCEMENTS:**

1. When the Confidence Decay Engine (F5) detects a topic crossing from FRESH → FADING:
   Auto-insert an unscheduled "decay_revision" — this is EXTRA, not part of the base intervals.
   These appear in the daily plan with type = "decay_revision".

2. After each completed revision:
   - revision_count += 1
   - Recalculate confidence_score (resets decay timer since last_touched updates)
   - If revision_count >= 2: upgrade to "revised"
   - If revision_count >= 3 AND confidence_score >= 70: upgrade to "exam_ready"
   - If mock_accuracy >= 0.8 AND revision_count >= 2: fast-track to "exam_ready"

3. Adaptive intervals based on stability:
   If a topic has stability > 3 (i.e., 3+ revisions done), the next scheduled revision
   can be pushed further out: +45 days instead of +30 days.
   If stability < 1.5, pull revision closer: +7 days instead of +10.

**OVERDUE HANDLING:**
  >2 days overdue: flag as priority in daily plan
  >5 days overdue: reschedule to today + add "overdue" badge
  >14 days overdue: suggest 30-min session instead of 15-min
  Any overdue: confidence_score drops faster (decay_rate * 1.3)

**DATABASE:**

Create `revision_schedule` table:
  id, user_id, topic_id (FK), revision_number (1-4), type (enum: "scheduled", "decay_triggered", "mock_triggered"), scheduled_date (date), status (enum: pending/completed/skipped/overdue), created_at, completed_at

**API ENDPOINTS:**

1. `GET /api/revisions/:userId?date=YYYY-MM-DD`
   {
     "due_today": [...],
     "overdue": [...],
     "upcoming_3_days": [...],
     "decay_triggered": [...separate list for decay revisions],
     "total_revision_minutes_today": 50,
     "stats": {"completed_this_week": 12, "due_this_week": 18, "overdue_total": 5}
   }

2. `POST /api/revisions/:revisionId/complete`
   Marks complete → updates user_progress → recalculates confidence.

3. `GET /api/revisions/:userId/calendar?month=YYYY-MM`
   Calendar view of all scheduled revisions.

**DAILY PLAN INTEGRATION:**
When generating daily plan (F8), query:
  SELECT * FROM revision_schedule
  WHERE user_id = ? AND scheduled_date <= today AND status = 'pending'
  ORDER BY type DESC (decay_triggered first), scheduled_date ASC
  LIMIT 3 (or up to strategy_params.revision_ratio_in_plan * total_items)

**FRONTEND — RevisionWidget (in DailyPlanScreen):**
  Collapsible section: "📖 Revisions Due (3)"
  Each card: topic name + subject badge + "Rev 2/3 · ~15 min" + quick-complete button
  Overdue items: amber border + "3 days overdue" badge
  Decay-triggered items: red dot + "Confidence dropping" label

**ACCEPTANCE CRITERIA:**
- [ ] first_pass creates 3-4 revisions at correct intervals
- [ ] Low-confidence topics get extra +1 day revision
- [ ] High-importance topics get exam-7 revision
- [ ] Decay-triggered revisions auto-insert when confidence crosses thresholds
- [ ] Completing revision updates confidence_score (resets decay)
- [ ] 2+ revisions → auto-upgrade to "revised"
- [ ] 3+ revisions + high confidence → "exam_ready"
- [ ] Overdue handling works at 2/5/14 day thresholds
- [ ] Adaptive intervals: high-stability topics get longer gaps
- [ ] Calendar view shows all upcoming revisions
```

---

## F7: STRESS THERMOMETER (Enhanced)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Stress Thermometer" — a single composite indicator (0-100) telling candidates if they're on track. Now uses PYQ-weighted velocity, dynamic buffer, and confidence data for accurate signals.

**ALGORITHM:**

stress_score = (signal_velocity * 0.35) + (signal_buffer * 0.25) + (signal_time * 0.20) + (signal_confidence * 0.20)

Signal 1: Velocity Health (0.35)
  Uses velocity_ratio from Weighted Velocity Engine (F4):
  ratio >= 1.2 → 100, 1.0 → 80, 0.8 → 55, 0.6 → 30, 0.4 → 10, <= 0.2 → 0
  Linear interpolation between points.

Signal 2: Buffer Health (0.25)
  Uses dynamic buffer_balance from Buffer Bank (F4):
  buffer_balance / buffer_initial:
  >= 1.0 → 100, 0.75 → 80, 0.50 → 55, 0.25 → 25, 0 → 10, negative → 0

Signal 3: Time Pressure (0.20)
  gap = weighted_completion_pct - expected_completion_pct
  where expected = (elapsed_days / total_days) * 100
  gap >= +10 → 100, 0 → 70, -10 → 40, -20 → 15, <= -30 → 0

Signal 4: Confidence Health (0.20) — NEW signal from F5
  overall_confidence from Confidence Decay Engine:
  >= 70 → 100, 60 → 75, 50 → 50, 40 → 25, < 30 → 0

COMPOSITE STATUS:
  >= 70: GREEN ("On Track")
  >= 45: YELLOW ("Attention Needed")
  >= 25: ORANGE ("At Risk")
  < 25:  RED ("Critical — Action Required")

**DATABASE:**
Already in velocity_snapshots (F4): stress_score, stress_status, signal_velocity, signal_buffer, signal_time. Add: signal_confidence.

**API:**

`GET /api/stress/:userId`
Returns:
{
  "score": 68,
  "status": "green",
  "label": "On Track",
  "signals": {
    "velocity": {"score": 80, "weight": 0.35, "detail": "Velocity ratio 1.08x"},
    "buffer": {"score": 75, "weight": 0.25, "detail": "8.4 of 12 buffer days intact"},
    "time": {"score": 55, "weight": 0.20, "detail": "3% behind expected weighted progress"},
    "confidence": {"score": 58, "weight": 0.20, "detail": "Overall confidence 58, 25 topics decayed"}
  },
  "recommendation": null,
  "history_7d": [62, 64, 65, 66, 67, 67, 68]
}

Recommendations (when not green):
  YELLOW: "Your confidence is fading on 12 topics. Quick revisions this week will restore green."
  ORANGE: "Buffer consumed 60% + 8 topics decayed. Consider recalibrating."
  RED: "Multiple signals critical. Immediate recalibration recommended."

**FRONTEND — StressThermometer component:**

1. Semi-circular gauge (0-100), color gradient red→orange→yellow→green
2. Large label: "On Track" / "At Risk"
3. Score: 68/100
4. 4 signal mini-bars (new: includes confidence signal)
5. 7-day sparkline
6. Recommendation card (yellow/orange/red only) with CTA "View Options"

**ACCEPTANCE CRITERIA:**
- [ ] Score calculated from 4 weighted signals (not 3)
- [ ] Confidence signal correctly uses decay engine's overall_confidence
- [ ] Dynamic buffer used (not static)
- [ ] Weighted velocity used (not topic-count)
- [ ] Thresholds at 70/45/25 correct
- [ ] Recommendations context-aware (mention specific weak signal)
- [ ] History stored for trend visualization
```

---

## F8: SMART DAILY PLANNER (Enhanced)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Smart Daily Planner" — the daily mission brief that generates 3-6 topics per day. Now enhanced with PYQ-weighted priority, weakness radar boost, fatigue constraints, and decay-triggered revisions.

**ALGORITHM:**

Run on first app open of the day OR via midnight cron.

INPUTS:
  daily_available_hours: from user_profiles (override per day)
  strategy_params: revision_ratio_in_plan, fatigue_sensitivity, pyq_weight_minimum, weekend_boost
  velocity_required: from F4
  fatigue_score: calculated inline (see below)

STEP 1: CHECK FATIGUE CONSTRAINTS (from F11)
  Calculate fatigue_score:
    fatigue = (consecutive_study_days * 10) +
              (avg_difficulty_last_3_days * 8) +
              (hours_last_3_days / target * 20) -
              (rest_days_last_7 * 15)
    Clamped 0-100.

  If fatigue > 85: FORCE LIGHT DAY
    - Only revision topics + 1 easy new topic (difficulty <= 2)
    - Total hours = 60% of normal
    - Mark as "Recovery Day 🌿"

  If consecutive_heavy_days >= 2 (avg difficulty >= 4):
    - Today: only difficulty <= 3 topics allowed

  Every 6th consecutive study day: auto light day.

STEP 2: FILTER ELIGIBLE TOPICS
  - Exclude: status = "exam_ready" or "deferred_scope"
  - Exclude: paused subjects (if prelims mode active, F14)
  - Working Professional mode: exclude pyq_weight < strategy_params.pyq_weight_minimum
  - Result: eligible_pool[]

STEP 3: PRIORITIZE (enhanced scoring)
  For each eligible topic:
  priority_score =
    (pyq_weight * 4) +           // PYQ is dominant factor
    (importance * 2) +            // Original importance
    (urgency * 2) +               // Subject-level urgency
    (weakness_boost) +            // From Weakness Radar (F9)
    (decay_boost) +               // From Confidence Decay (F5)
    (freshness * 1) +             // Recency penalty/bonus
    (variety_bonus * 1)           // Subject diversity

  Where:
    pyq_weight: 1-5 from topic data
    urgency:
      Subject 0% complete + exam < 120 days → 5
      Subject < 30% complete → 4
      Else: proportional to gap
    weakness_boost:
      Topic in "false_security" list (F9) → +5
      Topic in "blind_spots" list (F9) → +3
      Topic in "over_revised" list (F9) → -3
    decay_boost:
      confidence_status = "stale" → +4
      confidence_status = "decayed" → +6
    freshness:
      last_touched > 7 days → +3
      last_touched 3-7 days → +1
      last_touched < 3 days → -2
    variety_bonus: +2 if different subject from previous item in today's plan

STEP 4: SELECT TOPICS
  Sort by priority_score DESC.
  Greedily pick until sum(estimated_hours) <= daily_available_hours.
  Ensure >= 2 different subjects.
  Weekend boost (working professional): allow 2x normal topic count on Sat/Sun.
  Overflow → "stretch goals".

STEP 5: INJECT REVISIONS
  Query from revision_schedule (F6):
    - Pending revisions where scheduled_date <= today
    - Decay-triggered revisions (priority)
    - Limit: strategy_params.revision_ratio_in_plan * total items
    - On light day: revisions dominate (80%+ of plan)

  Total plan = new topics + revision topics.
  new:revision ratio follows strategy_params.revision_ratio_in_plan.

STEP 6: OUTPUT
  {
    plan_items: [...ordered list],
    total_estimated_hours,
    stretch_goals: [...overflow items],
    is_light_day: boolean,
    fatigue_score,
    fatigue_status,
    energy_level: "full"/"moderate"/"low"/"empty"
  }

**DATABASE:**

`daily_plans` table:
  id, user_id, plan_date, generated_at, available_hours, is_regenerated, is_light_day, fatigue_score

`daily_plan_items` table:
  id, plan_id (FK), topic_id (FK), type (enum: new/revision/decay_revision/stretch), estimated_hours, priority_score, display_order, status (pending/completed/skipped/deferred), completed_at, actual_hours

**API ENDPOINTS:**

1. `GET /api/daily-plan/:userId?date=YYYY-MM-DD`
   Returns plan (generates if not exists).

2. `PATCH /api/daily-plan/items/:itemId`
   Update status. On "completed": update user_progress, trigger velocity recalc, check badge milestones.
   On "deferred": add to tomorrow with +1 priority boost.

3. `POST /api/daily-plan/:userId/regenerate`
   Manual regen (hours changed, etc.)

4. `PATCH /api/daily-plan/:userId/hours`
   Update today's hours → trigger regen.

**FRONTEND — DailyPlanScreen:**

1. Header:
   "Today's Mission" + date
   "Available: 5 hrs" (tappable)
   Energy battery icon (full/2-3/1-3/empty colored green/yellow/orange/red)
   Stress dot (green/yellow/red)

2. Topic checklist:
   Each card: checkbox + topic name + chapter (subtitle) + subject badge
   Type badge: "NEW" (blue) / "REVISION" (purple) / "DECAY 🔴" (red)
   PYQ flames (mini, next to topic name)
   Estimated time
   Swipe: Skip / Tomorrow
   Completed → green check, moves to bottom

3. On light day:
   Banner: "Recovery Day 🌿 — Light study today to recharge"
   Fewer items, softer colors

4. Progress footer:
   "3/5 done today" + progress bar + streak

5. Stretch goals (collapsed):
   "Bonus: If you have extra time..."

6. All-done celebration:
   Haptic + subtle animation + "Mission complete!"

**ACCEPTANCE CRITERIA:**
- [ ] PYQ weight is dominant priority factor
- [ ] Weakness radar boost correctly increases priority of weak topics
- [ ] Decay boost correctly prioritizes decaying topics
- [ ] Fatigue constraints enforce light days and heavy-day limits
- [ ] Revision ratio follows strategy_params
- [ ] Working Professional pyq_weight_minimum filter works
- [ ] Weekend boost doubles capacity on Sat/Sun
- [ ] At least 2 different subjects per plan
- [ ] Deferred items appear tomorrow with priority boost
- [ ] Completing a topic cascades: progress → velocity → buffer → stress
```

---

## F9: WEAKNESS RADAR

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Weakness Radar" — an analytical layer that combines 4 signals per topic into a health score, then surfaces the 3 most dangerous gap categories. This replaces the original "Subject-Level Completion Confidence" with real intelligence.

**HEALTH SCORE ALGORITHM (per topic, status != untouched):**

health_score = (completion_weight * completion_base) +
               (revision_weight * revision_score) +
               (accuracy_weight * accuracy_score) +
               (recency_weight * recency_score)

Components:
  completion_base:
    in_progress → 20, first_pass → 40, revised → 65, exam_ready → 85

  revision_score: min(revision_count / expected * 100, 100)
    expected = 3 (or 4 if importance >= 4)

  accuracy_score:
    if mock_accuracy != null: mock_accuracy * 100
    elif confidence_score from decay engine: use confidence_score directly
    else: 50 (neutral)

  recency_score: based on days since last_touched
    0-7d → 100, 8-14d → 80, 15-30d → 60, 31-45d → 35, 46-60d → 15, 60+ → 0

Weights: completion=0.25, revision=0.20, accuracy=0.30, recency=0.25

**HEALTH ZONES:**
  80-100: STRONG (green)
  60-79:  ADEQUATE (blue)
  40-59:  VULNERABLE (yellow)
  20-39:  WEAK (orange)
  0-19:   CRITICAL (red)
  null:   UNTOUCHED (gray)

**THE 3 RADAR INSIGHTS:**

1. "False Security" — Covered but Weak (MOST DANGEROUS)
   Filter: status IN (first_pass, revised) AND health_score < 40
   Sort: (importance * pyq_weight) DESC
   Action: "Re-study these. You've seen them but won't recall them."

2. "Blind Spots" — Untouched High-Priority
   Filter: status = untouched AND importance >= 4
   Sort: (importance * pyq_weight) DESC
   Action: "High-yield topics you haven't started."

3. "Over-Revised" — Diminishing Returns
   Filter: revision_count >= 4 AND health_score >= 80 AND importance <= 3
   Action: "You've mastered these. Reallocate time to weaker areas."

**API:**

1. `GET /api/weakness-radar/:userId`
   Returns:
   {
     "overall_health": 62,
     "zone_distribution": {
       "strong": {"count": 85, "pct": 18.2},
       "adequate": {"count": 120, "pct": 25.8},
       "vulnerable": {"count": 95, "pct": 20.4},
       "weak": {"count": 40, "pct": 8.6},
       "critical": {"count": 15, "pct": 3.2},
       "untouched": {"count": 111, "pct": 23.8}
     },
     "false_security": [...top 15 topics with health < 40 despite status],
     "blind_spots": [...top 10 untouched high-importance topics],
     "over_revised": [...all matching topics],
     "subject_health": [...16 subjects with avg health + weak count]
   }

2. `GET /api/weakness-radar/:userId/subject/:subjectId`
   All topics in subject sorted by health ASC.

3. `POST /api/weakness-radar/:userId/snapshot`
   Daily health recalculation for all topics.

**DAILY PLANNER INTEGRATION:**
  false_security topics: priority_score += 5
  blind_spots topics: priority_score += 3
  over_revised topics: priority_score -= 3

**WEEKLY REVIEW INTEGRATION:**
  "This week: 3 topics moved from Weak → Adequate 🎉"
  "2 topics decayed from Adequate → Vulnerable ⚠️"

**FRONTEND — WeaknessRadarScreen:**

1. Overall Health Ring: large gauge, 62/100, segments colored by zones
2. Zone Distribution Bar: horizontal stacked bar (6 colors), tappable
3. Three Insight Tabs:
   Tab 1 "🔴 False Security": topic rows with health score + reason + "Add to plan" CTA
   Tab 2 "⚫ Blind Spots": untouched topics with PYQ weight + "Schedule today"
   Tab 3 "🟢 Over-Revised": mastered topics with "Redirect time" suggestion
4. Subject Heatmap: 4x4 grid, colored by avg health, tappable drill-down
5. Bottom sticky: "Focus this week: 5 false-security + 3 blind spots" → "Apply to Plan"

**ACCEPTANCE CRITERIA:**
- [ ] Health score calculates correctly from 4 components
- [ ] Zone classification matches thresholds exactly
- [ ] False Security correctly finds high-status + low-health topics
- [ ] Blind Spots only untouched with importance >= 4
- [ ] Over-Revised finds high-revision + high-health + low-importance
- [ ] "Apply to Plan" boosts priority in daily planner
- [ ] Subject heatmap shows correct averages
- [ ] Auto-generated reason strings based on worst component
- [ ] Edge: new user = only Blind Spots tab visible
- [ ] Edge: all untouched = "Start first topic to activate Radar"
```

---

## F10: RECALIBRATION ENGINE (Enhanced)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Recalibration Engine" — "Google Maps rerouting" for study plans. Now uses dynamic buffer bank and reads strategy preferences from the user's strategy mode.

**TRIGGER CONDITIONS:**
1. velocity_ratio < 0.8 for 3 consecutive days
2. buffer_balance consumed > 50% of initial
3. stress_score < 45
4. buffer_balance goes negative (auto from F4)
5. Manual request

**4-STRATEGY CASCADE:**

The ORDER of strategies is personalized per strategy mode (F1):
  Conservative: consume_buffers → absorb → increase_hours (never reduce_scope)
  Aggressive: absorb → reduce_scope → increase_hours
  Balanced: absorb → consume_buffers → increase_hours → reduce_scope
  Working Professional: reduce_scope → consume_buffers → absorb

Strategy 1: ABSORB
  Spread backlog over 7-14 days.
  Feasible: gap < 10 gravity-units behind.
  Shows: "Add 1 extra topic/day for 6 days"

Strategy 2: CONSUME BUFFERS
  Convert buffer_balance days into study days.
  Feasible: buffer_balance > 25% of initial.
  Shows: "Using 5 buffer days → target drops from 5.2 to 4.5 gravity/day"
  Action: Reduce buffer_balance, log buffer_transaction with type "recalibration_adjustment"

Strategy 3: INCREASE VELOCITY
  Add study hours.
  Always feasible.
  Shows: "Add 1 hr/day → cover 1.2 more gravity/day → green in 10 days"

Strategy 4: SCOPE REDUCTION
  Deprioritize low-importance + low-PYQ topics.
  Feasible: depends on strategy_params.scope_reduction_threshold
  Algorithm: Find untouched topics with importance <= 2 AND pyq_weight <= 2
    Sort by (importance + pyq_weight) ASC, estimated_hours DESC
    Calculate how many to defer to close the gap.
  Shows: "Deprioritize 12 topics (avg PYQ weight 1.5) → saves 18 hrs"
  Action: Set status = "deferred_scope" for selected topics.

**API ENDPOINTS:**

1. `GET /api/recalibrate/:userId`
   Returns all strategies ordered by user's strategy preference, with impact previews.
   Each strategy: id, name, description, feasible (bool), impact (before/after metrics), recommended (bool).
   For reduce_scope: includes topic list with checkboxes.

2. `POST /api/recalibrate/:userId/apply`
   Body: { "strategy": "consume_buffers" } or { "strategy": "reduce_scope", "topic_ids": [...] }
   Actions: apply changes, log to recalibration_log, recalculate velocity/stress/buffer.

**DATABASE:**
`recalibration_log`: id, user_id, triggered_at, triggered_by, gap_gravity, strategy_chosen, strategy_details (jsonb), stress_before, stress_after, buffer_before, buffer_after.

**FRONTEND — Full-screen modal:**
1. Header: "Let's get back on track" + gap display
2. Strategy cards (ordered by user preference): name, description, before/after metrics, "Choose This" button
3. Recommended badge on best option
4. Scope reduction: topic list with checkboxes (PYQ weight visible)
5. Confirmation: "Plan adjusted. New target: 4.5 gravity/day. Back to green in ~10 days."

**ACCEPTANCE CRITERIA:**
- [ ] Strategy order follows user's strategy_params.recalibration_order
- [ ] Buffer consumption creates proper buffer_transaction
- [ ] Scope reduction uses PYQ weight (not just importance)
- [ ] Conservative mode NEVER suggests scope reduction
- [ ] Working Professional mode suggests scope reduction FIRST
- [ ] Buffer debt auto-triggers recalibration
- [ ] All impact numbers are accurate (verifiable)
- [ ] Language is co-pilot tone (never shaming)
```

---

## F11: FATIGUE & BURNOUT GUARDIAN

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Fatigue & Burnout Guardian" — two layers: (1) daily fatigue scoring for plan constraints, and (2) multi-day Burnout Risk Index (BRI) with automatic Recovery Mode.

**LAYER 1: DAILY FATIGUE SCORE (used in F8 planner)**

fatigue = (consecutive_study_days * 10) +
          (avg_difficulty_last_3_days * 8) +
          (hours_last_3_days / target * 20) -
          (rest_days_last_7 * 15)
Clamped 0-100.

Actions:
  > 85: Force light day tomorrow
  > 70: Reduce topic count by 1
  < 30: Can handle heavy day

Light day rules (every 6th day or fatigue > 85):
  Only revision + 1 easy (difficulty <= 2) new topic
  Total hours = 60% of normal
  UI: "Recovery Day 🌿"

Heavy day constraint:
  After 2 consecutive days with avg topic difficulty >= 4:
  Day 3 must have avg difficulty <= 3

Subject monotony:
  Max 60% of daily topics from same subject
  Subject in 3+ of last 4 plans: priority -50%

**LAYER 2: BURNOUT RISK INDEX (BRI) — multi-day pattern detection**

BRI = 100 - weighted signals (inverted: high BRI = high risk)

Signal 1: Stress Persistence (0.30)
  red_days_7 = count(stress_score < 25 in last 7 days)
  orange_days_7 = count(stress_score < 45)
  score = max(0, 100 - red_days_7*25 - orange_days_7*10)

Signal 2: Buffer Hemorrhage (0.25)
  buffer_consumed_week = abs(sum of negative buffer_transactions last 7 days)
  score = max(0, 100 - buffer_consumed_week * 20)

Signal 3: Velocity Collapse (0.25)
  ratio = velocity_7d / velocity_14d
  >= 0.9 → 100, 0.7 → 50, 0.5 → 20, < 0.3 → 0

Signal 4: Engagement Decay (0.20)
  ratio = avg_hours_last_7 / target_daily_hours
  >= 0.8 → 100, 0.5 → 40, < 0.3 → 0
  3+ zero days in 7: score -= 30

BRI = 100 - ((s1*0.30) + (s2*0.25) + (s3*0.25) + (s4*0.20))

Thresholds (adjusted by strategy_params.burnout_bri_threshold):
  < 25: LOW (green)
  25-50: MODERATE (yellow) — gentle nudge
  50-75: HIGH (orange) — suggest reduced load
  > bri_threshold: CRITICAL (red) — auto Recovery Mode after 2 consecutive days

**RECOVERY MODE:**

Triggers: BRI > bri_threshold for 2 consecutive days.
Duration: 5-7 days.

Changes during recovery:
  - Daily plan: 50% of normal (only revisions + 1 easy topic)
  - All topics difficulty <= 3
  - Buffer consumption paused (no withdrawals)
  - Velocity target frozen (no "falling behind" during recovery)
  - Stress thermometer shows: "🌿 Recovery Mode"
  - Push notifications use gentle language

Exit conditions:
  - 5 days passed AND BRI < 50, OR
  - 7 days passed (auto), OR
  - Manual exit (with warning if BRI still high)

Post-recovery ramp-up:
  Day 1 after: 70% load
  Day 2: 85% load
  Day 3: 100% load

**EARLY WARNING (BRI 50-75):**
  Banner: "Your burnout risk is elevated. Want to activate a light week?"
  Option: "Activate Light Week (3 days)" / "I'm fine"

**DATABASE:**

`burnout_snapshots`: id, user_id, snapshot_date, bri_score, signal_stress, signal_buffer, signal_velocity, signal_engagement, status, in_recovery

Add to user_profiles:
  recovery_mode_active (bool), recovery_mode_start (date), recovery_mode_end (date)

`recovery_log`: id, user_id, started_at, ended_at, trigger_bri, exit_reason (auto_5day/auto_7day/manual), bri_at_exit

**API:**

1. `GET /api/burnout/:userId` — BRI + signals + recommendation + 7d history
2. `POST /api/burnout/:userId/recovery/start` — activate recovery
3. `POST /api/burnout/:userId/recovery/end` — exit with ramp-up

**FRONTEND:**

1. BRI indicator (dashboard): heart-rate icon, colored by BRI level
2. Recovery banner: green gradient "🌿 Recovery Mode — Day 3/5" + "Exit Early"
3. Early warning modal: "Stressed? Activate light week?" (max once/day)
4. Energy battery icon (daily plan header): full/2-3/1-3/empty

**ACCEPTANCE CRITERIA:**
- [ ] Fatigue score constrains daily plan correctly
- [ ] Light days inserted every 6th day and on fatigue > 85
- [ ] Heavy day limit (max 2 consecutive) enforced
- [ ] BRI calculates from 4 signals correctly
- [ ] Recovery Mode triggers at bri_threshold (from strategy params)
- [ ] Recovery reduces plan to 50%, pauses buffer, freezes velocity
- [ ] Post-recovery ramp-up: 70% → 85% → 100%
- [ ] Manual exit shows warning if BRI still high
- [ ] Conservative mode triggers recovery earlier (threshold 65)
- [ ] Aggressive mode triggers later (threshold 80)
```

---

## F12: WEEKLY REVIEW RITUAL (Enhanced)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Weekly Review" — a structured Sunday performance digest that now includes all enhanced metrics: weighted velocity, confidence trends, weakness radar changes, buffer bank activity, BRI tracking, and gamification scores.

**TRIGGER:** Push notification Sunday 7 PM (configurable).

**API: `GET /api/weekly-review/:userId?week_start=YYYY-MM-DD`**

Returns:
{
  "week": "Feb 17 - Feb 23, 2026",
  "week_number": 8,

  "performance": {
    "topics_completed": 14, "topics_target": 12, "target_met": true,
    "gravity_completed": 42.5, "gravity_target": 35,
    "hours_studied": 28.5, "hours_target": 35,
    "days_active": 6, "days_missed": 1,
    "revisions_completed": 8, "revisions_due": 10, "revisions_overdue": 2,
    "decay_revisions_triggered": 3
  },

  "velocity_trend": {
    "this_week": 6.1, "last_week": 5.2,
    "change_pct": 17.3, "direction": "improving"
  },

  "confidence_trend": {
    "start_of_week": 55, "end_of_week": 58,
    "topics_improved": 8, "topics_decayed": 3,
    "subjects_at_risk": ["Geography"]
  },

  "weakness_radar_changes": {
    "false_security_count": {"start": 18, "end": 15, "change": -3},
    "blind_spots_count": {"start": 12, "end": 10, "change": -2},
    "overall_health": {"start": 58, "end": 62, "change": +4}
  },

  "buffer_bank": {
    "start_balance": 7.2, "end_balance": 8.4,
    "total_deposited": 2.1, "total_withdrawn": 0.9,
    "net": "+1.2 days"
  },

  "burnout": {
    "avg_bri": 35, "peak_bri": 52,
    "recovery_mode_triggered": false,
    "fatigue_light_days": 1
  },

  "subject_coverage": {
    "touched": ["Polity", "Geography", "Economy", "Environment"],
    "untouched_this_week": ["History", "Ethics", "Society"],
    "untouched_over_14_days": ["Art & Culture"],
    "alert": "Art & Culture: 18 days untouched, confidence 35"
  },

  "stress_trend": {
    "start": 62, "end": 68, "change": +6, "status": "green"
  },

  "gamification": {
    "wes": 82, "grade": "A",
    "streaks": {"study": 12, "revision": 5, "plan": 8},
    "badges_earned_this_week": ["Century"],
    "next_milestone": {"name": "Iron Will", "progress": 12, "target": 30}
  },

  "next_week": {
    "recommended_hours": 5,
    "priority_subjects": ["History", "Ethics"],
    "reason": "History untouched 14d. Ethics confidence decayed to 42.",
    "revision_load": 12,
    "new_topic_target": 14,
    "gravity_target": 40
  },

  "wins": [
    "14 topics completed — 2 more than target! 🎉",
    "Velocity improved 17% 📈",
    "Buffer bank grew +1.2 days 💰",
    "3 false-security topics resolved ✅"
  ],

  "areas_to_improve": [
    "2 revisions overdue — overdue revisions accelerate decay.",
    "Geography confidence dropping — 22 days without touch."
  ]
}

**DATABASE:**
`weekly_reviews`: id, user_id, week_start, week_end, data (jsonb), generated_at
Cached — don't regenerate once created.

**FRONTEND — WeeklyReviewScreen:**

1. Hero Card: week number + topics + gravity + velocity arrow + stress change
2. Wins Section (always first, green cards)
3. Subject Heatmap (4x4 grid, colored by recency: green/yellow/red)
4. Weakness Radar Changes: before/after health bars
5. Buffer Bank: "+1.2 days earned this week" with mini trend chart
6. Confidence Trend: # improved vs # decayed + subjects at risk
7. Improvement Nudges (amber cards with tappable actions)
8. WES Score: grade letter + 4-week trend sparkline
9. Next Week Preview: "Accept Plan" button
10. Streak & Milestones: flame + progress to next badge

**ACCEPTANCE CRITERIA:**
- [ ] Review includes ALL enhanced metrics (weighted velocity, buffer, confidence, radar, BRI, WES)
- [ ] Wins always shown first
- [ ] Subject heatmap correctly identifies staleness
- [ ] Buffer bank weekly summary accurate
- [ ] Confidence trend shows topics improved vs decayed
- [ ] Next week recommendations boost planner priorities
- [ ] Cached per week, not regenerated
- [ ] Push notification on Sunday
```

---

## F13: MOCK TEST INTEGRATION

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build "Mock Test Integration" — ingest Prelims mock results, map errors to topics, and feed accuracy data back into the Weakness Radar, Confidence Decay, and Daily Planner. This closes the feedback loop.

**THE FEEDBACK LOOP:**
Mock → Topic Accuracy → Radar finds gaps → Planner boosts weak topics → Next Mock → Improvement.

**DATA MODEL:**

1. `mock_tests`: id, user_id, test_name, test_date, total_questions, attempted, correct, incorrect, unattempted, score, max_score, percentile (nullable), source (manual/csv_import), created_at

2. `mock_questions`: id, mock_test_id (FK), question_number, topic_id (FK, nullable), subject_id (FK), is_correct (bool), is_attempted (bool), difficulty (easy/medium/hard, nullable)

3. `mock_topic_accuracy`: id, user_id, topic_id (FK), total_questions, correct_questions, accuracy (float 0-1), last_mock_date, trend (improving/stable/declining). Unique on (user_id, topic_id).

4. `mock_subject_accuracy`: id, user_id, subject_id (FK), total_questions, correct, accuracy, tests_count, avg_score_pct, best_score_pct, trend

**ENTRY FLOWS:**

Flow 1: Quick Entry
  User enters: name, date, total, correct, incorrect + subject breakdown.

Flow 2: Detailed Entry
  Per question: number, subject (dropdown), topic (dropdown/optional), correct/incorrect.

Flow 3: CSV Import
  Columns: question_number, subject, topic_keyword, result.
  Fuzzy topic matching using pg_trgm: SELECT id, similarity(name, $keyword) as sim FROM topics WHERE similarity > 0.3.
  Show mapping preview before confirm.
  Cache mappings in `topic_keyword_mappings` for future auto-matching.

**ACCURACY AGGREGATION (after each mock):**
For each topic with questions in this mock:
  Upsert mock_topic_accuracy: update totals + accuracy.
  Calculate trend: last 3 mocks avg vs prior 3 avg.
  Update user_progress.mock_accuracy for the topic.
  Trigger confidence recalculation (F5) for affected topics.

**SYSTEM INTEGRATION:**
After mock import:
  Subject accuracy < 0.5: boost urgency +2 in daily planner.
  Topic accuracy < 0.3: add to false_security in Weakness Radar.
  Topic accuracy < 0.3: schedule immediate revision (override spaced rep).
  Update health_score accuracy component for all affected topics.

**API ENDPOINTS:**

1. `POST /api/mocks/:userId` — create mock (manual or detailed)
2. `POST /api/mocks/:userId/import-csv` — upload + mapping preview
3. `GET /api/mocks/:userId/analytics` — score trends, subject accuracy, weakest/strongest topics, difficulty breakdown, next recommendation
4. `GET /api/mocks/:userId/topic/:topicId/history` — per-topic accuracy trend

**FRONTEND — MockAnalyticsScreen:**

1. Score Trend Chart: line chart over time, green zone (60%+), yellow (45-60%), red (<45%), target line at 60%
2. Subject Accuracy Grid: 16 tiles colored by accuracy, trend arrow, tappable drill-down
3. Weakest Topics Alert: top 5 lowest accuracy + "Add to plan" CTA
4. Mock Entry FAB: "+" → Quick / Detailed / CSV
5. Score Projection: "At current rate, projected 68% in 30 days" (linear regression)

**ACCEPTANCE CRITERIA:**
- [ ] Quick and detailed mock entry works
- [ ] CSV import with fuzzy matching + preview
- [ ] Topic accuracy aggregates across multiple mocks
- [ ] mock_accuracy feeds into user_progress
- [ ] Low-accuracy subjects get priority boost in planner
- [ ] Low-accuracy topics appear in Weakness Radar
- [ ] Confidence Decay recalculates after import
- [ ] Score trend chart renders with 3+ data points
- [ ] Edge: first mock works (no prior data)
- [ ] Edge: unmapped topics flagged for manual assignment
```

---

## F14: PRELIMS/MAINS MODE TOGGLE

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build "Prelims/Mains Mode Toggle" — one-tap exam phase switch that restructures the entire plan.

**3 MODES:**

MAINS MODE (default, Months 1-8):
  All 16 subjects active. Deep coverage. Answer writing 2/day from Month 6.
  Ethics active. CA: 2 hrs/day. Priority: depth.

PRELIMS MODE (Months 9-11):
  PAUSED: Ethics, Internal Security, World History (grayed out, no scheduling)
  BOOSTED: Environment, Science & Tech, Art & Culture (importance +1)
  HIGH PRIORITY: Geography, Polity, Economy (factual precision)
  Daily plan: 70% revision, 30% new high-yield
  Mock tests: 2/week as plan items
  CA: last 12 months only

POST-PRELIMS MODE (Months 11-12):
  Reactivate paused subjects. Answer writing 4/day.
  Data enrichment focus. Mains mock 1/week.

**DATABASE:**

Already in user_profiles (F1): current_mode, mode_switched_at, prelims_date.

`mode_config` table (seeded): mode, subject_id, is_active, importance_modifier, revision_ratio

**API:**

1. `POST /api/mode/:userId/switch` — updates mode, logs, regenerates plan
2. `GET /api/mode/:userId/preview?mode=prelims` — shows diff without applying

**INTEGRATION:**
Daily planner: filters paused subjects, applies modifiers, adjusts revision_ratio, adds mock slots.
Velocity engine: recalculates with reduced topic scope.
Weakness radar: only active subjects.

**FRONTEND:**
Segmented control [Mains][Prelims][Post-Prelims]
Preview card → confirmation → mode banner on dashboard

**ACCEPTANCE CRITERIA:**
- [ ] Mode switch pauses/boosts correct subjects
- [ ] Daily plan reflects new mode immediately
- [ ] Preview shows diff without applying
- [ ] Paused subjects grayed in syllabus map
- [ ] Switching back reactivates
- [ ] Velocity recalculates with new scope
```

---

## F15: "WHAT IF" SIMULATOR

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "What If Simulator" — a tool for candidates to ask hypothetical questions and see instant impact on velocity, stress, buffer, and completion date.

**SUPPORTED SCENARIOS:**

1. "What if I take N days off?"
   Input: break days (1-14)
   Impact: remaining effective days decrease, required velocity increases, stress changes, buffer consumed
   Shows: before/after velocity, stress, buffer, projected completion date

2. "What if I add/reduce X hours per day?"
   Input: hours change (-3 to +3)
   Impact: topics per day changes, velocity ratio changes, projected date shifts
   Shows: before/after daily capacity, velocity ratio, completion date, stress

3. "What if I drop all importance ≤ N topics?"
   Input: importance threshold (1-3)
   Impact: remaining gravity reduces, velocity requirement drops, hours saved
   Shows: topics removed, gravity removed, new velocity, new stress, which subjects affected

4. "What if I focus only on subject X for 2 weeks?"
   Input: subject + duration
   Impact: subject completion projection, other subjects' decay, overall velocity impact
   Shows: subject before/after, side effects on other subjects' confidence

5. "What if my exam is postponed by N days?"
   Input: extra days (7-90)
   Impact: more study days, lower required velocity, buffer recalculates
   Shows: new pace, new buffer, new stress, "You'd have X extra days of buffer"

**ALGORITHM:**
For each scenario, the engine runs a TEMPORARY velocity/stress/buffer calculation with modified inputs. No data is saved — it's purely a preview.

simulation_result = {
  current: {velocity_ratio, stress_score, buffer_balance, projected_date, weighted_completion},
  simulated: {velocity_ratio, stress_score, buffer_balance, projected_date, weighted_completion},
  delta: {velocity_ratio_change, stress_change, buffer_change, days_gained_or_lost},
  verdict: "green" / "yellow" / "red" — would this change improve or worsen your position?
  recommendation: "Taking 5 days off would consume 2.5 buffer days but you'd still be green. Go rest."
}

**API:**

`POST /api/simulate/:userId`
Body: { "scenario": "days_off", "params": { "days": 5 } }
Returns: simulation_result (no side effects, read-only calculation)

**FRONTEND — SimulatorScreen:**

1. Scenario selector: 5 cards, each with icon + description
2. Parameter input: slider or number input specific to scenario
3. Impact preview: before/after cards showing key metrics
   Left card (current): velocity 1.08x, stress 68, buffer 8.4
   Right card (simulated): velocity 0.95x, stress 55, buffer 5.9
   Color-coded: green if improved, red if worsened
4. Verdict banner: "Safe to take 5 days off 🟢" or "This would put you in yellow ⚠️"
5. Delta display: arrows showing each metric's change

**ACCEPTANCE CRITERIA:**
- [ ] All 5 scenarios calculate correctly
- [ ] No data is written — purely read-only simulation
- [ ] Before/after comparison is accurate
- [ ] Verdict correctly assesses net impact
- [ ] Scope reduction scenario accounts for PYQ weights
- [ ] Subject focus scenario shows confidence decay side effects
- [ ] Exam postponement correctly recalculates buffer
```

---

## F16: CURRENT AFFAIRS TRACKER

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build "Current Affairs Tracker" — a daily CA logging system with subject tagging that integrates with the static syllabus.

**WHY SEPARATE:**
CA isn't chapter-based — it's continuous (2 hrs/day, 365 days). It needs its own tracking mechanism but must connect to the static syllabus.

**DATA MODEL:**

`ca_daily_logs`: id, user_id, log_date (date, unique per user), completed (bool), hours_spent (float), notes (text)

`ca_tags`: id, ca_log_id (FK), subject_id (FK), tag_text (text)
  Each CA session can tag articles to static subjects: "This article relates to Polity: Federalism"

`ca_streaks`: id, user_id, current_streak, best_streak, last_active_date

**FEATURES:**

1. Daily Toggle: "Did you read the newspaper today?" Yes/No
   If yes: log hours + optional subject tags
   Quick tag buttons: 16 subject buttons, tap multiple

2. Streak Counter: "🗞️ 23-day CA streak"

3. Subject Distribution: Over time, build a pie chart of which subjects your CA sessions cover.
   "Your CA covers: Polity 25%, Economy 30%, Environment 20%, Others 25%"
   Alert: "Science & Tech barely covered in your CA — look for tech articles"

4. Monthly CA Heatmap: calendar grid, green=completed, gray=missed

5. Prelims Mode Integration:
   When in Prelims mode: CA focuses on last 12 months only.
   Show: "Cover 12 months of CA = ~240 hrs. You've done 180 hrs."

**API:**
1. `POST /api/ca/:userId/log` — log today's CA
2. `GET /api/ca/:userId/stats` — streak, distribution, monthly heatmap
3. `GET /api/ca/:userId/subject-gaps` — subjects undercovered in CA

**FRONTEND:**
1. CA card on dashboard: streak + today's status + "Log CA" button
2. Log sheet: toggle + hours + subject tag buttons + notes
3. Stats screen: streak, heatmap, subject distribution pie chart

**ACCEPTANCE CRITERIA:**
- [ ] Daily toggle logs CA completion
- [ ] Subject tagging works (multiple tags per day)
- [ ] Streak tracks correctly
- [ ] Subject distribution calculates from tags
- [ ] Alert for undercovered subjects
- [ ] Monthly heatmap renders correctly
```

---

## F17: GAMIFICATION LAYER (Premium)

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Gamification Layer" — subtle, premium motivation. Bloomberg Terminal aesthetics, NOT Duolingo. The audience is stressed adults aged 21-30.

**COMPONENT 1: WEEKLY EXECUTION SCORE (WES) 0-100**

WES = (plan_adherence * 0.35) + (velocity_factor * 0.25) + (revision_consistency * 0.20) + (consistency_factor * 0.20)

  plan_adherence = avg(daily_items_completed / daily_items_total) * 100 over 7 days
  velocity_factor = min(velocity_ratio * 100, 100)
  revision_consistency = (revisions_completed / revisions_due) * 100
  consistency_factor = (days_active / 7) * 100

Grades: 90-100="S" (gold), 80-89="A" (silver), 70-79="B" (bronze), 60-69="C", <60="D"

**COMPONENT 2: STREAKS (3 types)**

Already tracked in F4. Display:
  Study streak: consecutive days with 1+ topic completed. "🔥 12"
  Revision streak: consecutive days with all due revisions done. "📖 8"
  Plan completion streak: consecutive days with 80%+ plan items done. "✅ 5"

**COMPONENT 3: MILESTONES & BADGES**

`badges` table: id, name, description, icon, condition_type, condition_value
`user_badges`: id, user_id, badge_id, earned_at

Progress: "First Step" (1 topic), "Century" (100), "Halfway" (50% weighted), "Sprint" (10/day), "Deep Diver" (5+ hrs one subject)
Consistency: "Week Warrior" (7d streak), "Iron Will" (30d), "Revision Machine" (14d rev streak)
Mastery: "Polity Master" (all Polity exam_ready) × 16 subjects, "Full Coverage" (all first_pass+), "Exam Ready" (80% weighted, avg confidence >70)
Mock: "Mock Marathon" (10 mocks), "Sixty Club" (60%+), "Seventy Club" (70%+), "Improving" (3 consecutive improvements)
Recovery: "Comeback Kid" (red → green in 14d), "Never Give Up" (resume after 7d gap)

**COMPONENT 4: CELEBRATIONS (subtle)**
  Complete daily plan: brief haptic + checkmark animation
  Badge earned: slide-up card, auto-dismiss 3s
  New streak record: banner notification
  WES "S" rank: gold shimmer on WES card
  NO confetti, NO sound effects, NO childish UI

**API:**

`GET /api/gamification/:userId`
Returns: wes (current + grade + trend), streaks, badges_earned, badges_next (with progress), celebrations_pending

`POST /api/gamification/:userId/check`
Called after any progress update. Returns newly earned badges.

**FRONTEND (integrated, not separate screen):**
Dashboard: WES card (grade + sparkline) + streak line + next milestone progress bar
Profile/Stats: full badge gallery (earned=color, locked=gray) + WES history + records

**VISUAL DESIGN:**
Badges: minimalist geometric icons, monochrome + accent
WES: large letter in thin circle, grade-colored
Numbers: JetBrains Mono font
Colors: dark theme, accent only for active states

**ACCEPTANCE CRITERIA:**
- [ ] WES calculates from 4 components correctly
- [ ] Grade thresholds correct
- [ ] All 3 streaks track + reset on miss
- [ ] Badges unlock at correct conditions, fire exactly once
- [ ] Celebrations are subtle (no sound, auto-dismiss)
- [ ] UI is premium/dashboard-like, never childish
- [ ] Performance: gamification check < 200ms
```

---

## F18: STRATEGIC BENCHMARK LAYER

### Prompt:

```
I'm building ExamPilot — a UPSC exam intelligence platform (React Native/Expo, Fastify, Supabase).

Build the "Strategic Benchmark Layer" — anonymous peer comparison that adds competitive context without toxic comparison.

**DESIGN PRINCIPLES:**
  All data anonymized and aggregated. Opt-in only. Show percentiles not rankings.
  Can be disabled anytime. Never show individual users.

**DATA MODEL:**

`benchmark_cohorts`: id, exam_year, exam_month, creation_month, strategy_mode, is_active

`benchmark_snapshots` (aggregated daily):
  id, cohort_id, snapshot_date, metric (enum), p25, p50, p75, p90, mean, sample_size
  Metrics: weighted_completion_pct, velocity_ratio, stress_score, mock_avg_score, revision_consistency, confidence_avg, study_streak, wes

`user_benchmark_opt_in`: user_id, opted_in, opted_in_at, cohort_id

Minimum 20 opted-in users per cohort.

**PERCENTILE CALCULATION:**
  user_value vs cohort_values → percentile
  >= 90: "Top 10% 🏆", >= 75: "Top 25%", >= 50: "Above Average", >= 25: "Below Average", < 25: "Bottom 25%"

**"SUCCESSFUL ASPIRANT" REFERENCE LINE:**
Synthetic benchmark from successful users (60%+ mock scores) OR seeded estimates:
  Week 4: 8% completion, Week 12: 30%, Week 20: 55%, Week 30: 75%, Week 40: 90%

**API:**

1. `GET /api/benchmarks/:userId`
   Returns: opt_in status, cohort info, percentile on each metric, successful aspirant comparison, trend over weeks

2. `POST /api/benchmarks/:userId/opt-in` and `/opt-out`

**COLD START:**
  < 20 users: show only reference line + "14/20 needed to unlock peer data"

**ANTI-TOXIC:**
  Never "You're bottom 10%" → "You have room to grow"
  Never individual data or rankings
  > 5 checks/day: "Focus on your plan today"
  Low percentiles always paired with action

**FRONTEND:**

1. Percentile Radar Chart: 6-axis spider, your shape vs cohort median
2. Metric Cards: your value + percentile badge + mini bell curve with your dot
3. "Successful Aspirant" Track: line chart, you vs reference, green when ahead
4. Cohort stats: member count, your week, avg streak
5. Privacy footer: "Your data is anonymous"

**ACCEPTANCE CRITERIA:**
- [ ] Opt-in/opt-out works
- [ ] Cohort based on exam year + start month
- [ ] Percentile calculation correct
- [ ] Min 20 users enforced
- [ ] Reference line shows always (even pre-20)
- [ ] Radar chart renders 6 axes
- [ ] No individual data exposed
- [ ] Low percentiles include actionable advice
- [ ] Performance: handles 10K+ users per cohort
```

---

## COMPLETE DATABASE SCHEMA SUMMARY

For reference, here is every table across all 18 features:

**Core Tables (F1-F3):**
- `user_profiles` — strategy_mode, strategy_params, exam_date, prelims_date, daily_hours, current_mode, buffer_balance, buffer_initial, recovery_mode_active/start/end, onboarding_completed
- `subjects` — name, paper[], importance, difficulty, estimated_hours, display_order
- `chapters` — subject_id, name, importance, difficulty, estimated_hours, display_order
- `topics` — chapter_id, name, importance, difficulty, estimated_hours, display_order, pyq_frequency, pyq_weight, pyq_trend, last_pyq_year
- `user_progress` — user_id, topic_id, status, actual_hours_spent, last_touched, revision_count, confidence_numeric, confidence_score, confidence_status, health_score, mock_accuracy, notes
- `strategy_mode_defaults` — mode, param_name, param_value

**PYQ Data (F2):**
- `pyq_data` — topic_id, year, paper, question_count, question_type
- `pyq_subject_stats` — subject_id, avg_questions_per_year, total_questions_10yr, trend

**Velocity & Buffer (F4):**
- `velocity_snapshots` — user_id, snapshot_date, topics_completed_today, gravity_completed_today, cumulative_completed, cumulative_gravity, required/actual velocity, ratio, status, weighted/unweighted pct, trend, stress signals
- `daily_logs` — user_id, log_date, topics_completed, gravity_completed, hours_studied, subjects_touched
- `buffer_transactions` — user_id, date, type, amount, balance_after, delta_gravity, notes
- `streaks` — user_id, type, current_count, best_count, last_active_date

**Confidence & Revisions (F5-F6):**
- `confidence_snapshots` — user_id, topic_id, snapshot_date, confidence_score, raw_retention, accuracy_factor
- `status_changes` — user_id, topic_id, old_status, new_status, reason, changed_at
- `revision_schedule` — user_id, topic_id, revision_number, type, scheduled_date, status

**Intelligence (F9-F11):**
- `topic_health_history` — user_id, topic_id, snapshot_date, health_score, components
- `recalibration_log` — user_id, triggered_at/by, gap, strategy, details, stress/buffer before/after
- `burnout_snapshots` — user_id, snapshot_date, bri_score, signals, status, in_recovery
- `recovery_log` — user_id, started/ended_at, trigger_bri, exit_reason, bri_at_exit

**Planning & Reviews (F8, F12):**
- `daily_plans` — user_id, plan_date, available_hours, is_regenerated, is_light_day, fatigue_score
- `daily_plan_items` — plan_id, topic_id, type, estimated_hours, priority_score, display_order, status, actual_hours
- `weekly_reviews` — user_id, week_start/end, data (jsonb), generated_at

**Mocks (F13):**
- `mock_tests` — user_id, test_name, test_date, total/attempted/correct/incorrect, score, source
- `mock_questions` — mock_test_id, question_number, topic_id, subject_id, is_correct, is_attempted, difficulty
- `mock_topic_accuracy` — user_id, topic_id, total/correct, accuracy, trend
- `mock_subject_accuracy` — user_id, subject_id, total/correct, accuracy, tests_count, trend
- `topic_keyword_mappings` — keyword, topic_id (cache for fuzzy matching)

**Mode & CA (F14, F16):**
- `mode_config` — mode, subject_id, is_active, importance_modifier, revision_ratio
- `ca_daily_logs` — user_id, log_date, completed, hours_spent, notes
- `ca_tags` — ca_log_id, subject_id, tag_text
- `ca_streaks` — user_id, current_streak, best_streak, last_active_date

**Gamification & Benchmarks (F17-F18):**
- `badges` — name, description, icon, condition_type, condition_value
- `user_badges` — user_id, badge_id, earned_at
- `benchmark_cohorts` — exam_year/month, creation_month, strategy_mode
- `benchmark_snapshots` — cohort_id, snapshot_date, metric, p25/p50/p75/p90, mean, sample_size
- `user_benchmark_opt_in` — user_id, opted_in, cohort_id

**Total: ~35 tables**
