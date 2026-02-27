# ExamPilot V2 — Rectification Prompts

> **How to use:** Run the Feature Coverage Audit against your built app. For each failed check, find the matching rectification prompt below. Paste it into Claude along with the relevant code files. Claude will generate the fix.
>
> **Ordering:** Fix in this exact order. Each fix builds on the previous.

---

## RECT-1: Fix Gravity Formula (Affects Everything)

```
I'm building ExamPilot. My velocity engine currently calculates gravity as:
  gravity = pyq_weight × difficulty × estimated_hours

This is wrong. It should be:
  gravity = pyq_weight (just the pyq_weight value, 1-5 per topic)

This matters because total_gravity should be ≈1420 (sum of pyq_weight across 466 topics), not 15,000+.

Here is my current velocity service file:
[PASTE YOUR velocity.ts / velocity.service.ts HERE]

Fix the gravity calculation everywhere it appears:
1. Change gravity(topic) to just return topic.pyq_weight
2. Verify total_gravity = SUM(pyq_weight) across all topics
3. Keep everything else the same (buffer_pct, revision_pct, velocity_ratio, status thresholds)
4. Add these if missing:
   - unweighted_completion_pct (topic count / 466)
   - weighted_completion_pct (completed_gravity / total_gravity)
   - projected_completion_date
   - trend detection (7d vs 14d comparison)

Also check and fix any other files that reference the gravity calculation:
[PASTE YOUR buffer service, stress service, planner service IF they reference gravity]

Return the corrected files with inline comments marking every change.
```

---

## RECT-2: Fix Buffer Bank Rates + Restore Debt Mode

```
I'm building ExamPilot. My buffer bank has incorrect rates and is missing debt mode.

Here is my current buffer service:
[PASTE YOUR buffer.ts / buffer.service.ts HERE]

Fix these specific issues:

1. RATES — Change to read from user's strategy_params:
   deposit_rate = user.strategy_params.buffer_deposit_rate (default 0.3, NOT 0.8)
   withdrawal_rate = user.strategy_params.buffer_withdrawal_rate (default 0.5, NOT 1.0)
   
   The asymmetry must be: withdrawal > deposit (losing buffer is HARDER than gaining)
   
   Strategy defaults:
   - balanced: deposit=0.30, withdrawal=0.50
   - aggressive: deposit=0.25, withdrawal=0.50
   - conservative: deposit=0.30, withdrawal=0.40
   - working_professional: deposit=0.35, withdrawal=0.40

2. FLOOR — Change from clamp(0, max) to clamp(-5, max):
   Buffer CAN go negative, down to -5. This is "debt mode."

3. DEBT MODE — When buffer_balance < 0:
   - Buffer status must return "debt"
   - This must trigger the recalibration engine automatically
   - The stress thermometer's signal_buffer must return 0 when in debt

4. CONSISTENCY REWARD — When delta == 0 (exact target hit):
   Add +0.1 to buffer. This should happen daily, not just on streak milestones.

5. DATABASE — Ensure:
   - user_profiles has BOTH buffer_balance AND buffer_initial columns
   - buffer_transactions has delta_gravity and notes columns

6. SEED — At onboarding, set:
   buffer_initial = days_remaining × strategy_params.buffer_capacity
   buffer_balance = buffer_initial

Return the corrected buffer service + any migration changes needed.
```

---

## RECT-3: Add Decay Trigger Service

```
I'm building ExamPilot. I use FSRS (ts-fsrs) for spaced repetition, which is good. But I'm missing the behavioral triggers that should fire when topics decay.

Here are my current files:
[PASTE YOUR fsrs.service.ts HERE]
[PASTE YOUR planner.service.ts HERE]
[PASTE YOUR user_progress related code HERE]

Create a new service: decayTrigger.service.ts

This service should:

1. Have a function recalculateAllConfidence(userId) that:
   a. For EVERY user_progress row where status != 'not_started':
      - Read the matching fsrs_card
      - Calculate FSRS retrievability: R = (1 + elapsed_days / (9 × stability))^(-1)
      - If mock_topic_accuracy exists: adjust = R * (0.7 + 0.3 * mock_accuracy)
      - Else: adjust = R
      - confidence_score = round(adjust * 100)
      - confidence_status = >=70 "fresh", >=45 "fading", >=20 "stale", else "decayed"
   
   b. DETECT THRESHOLD CROSSINGS by comparing old confidence_status vs new:
      - FRESH → FADING: insert a decay_revision into daily_plans for next 1-3 days
      - Any → STALE: set a flag that planner reads for +4 priority boost
      - Any → DECAYED: AUTO-DOWNGRADE status to "first_pass" AND insert a row into status_changes table
   
   c. Calculate SUBJECT-LEVEL confidence:
      For each subject: SUM(confidence_score × pyq_weight) / SUM(pyq_weight)
      Store in subject_confidence_cache table (upsert)
      If subject confidence < 40: flag for weekly review alert

   d. Insert confidence_snapshots rows for trend tracking

   e. Return summary: { topics_recalculated, downgrades[], decay_revisions_scheduled, subjects_at_risk[] }

2. Create these database tables (migration):
   
   status_changes:
     id UUID PK, user_id UUID FK, topic_id UUID FK,
     old_status TEXT, new_status TEXT, reason TEXT, changed_at TIMESTAMPTZ
   
   confidence_snapshots:
     id UUID PK, user_id UUID FK, topic_id UUID FK,
     snapshot_date DATE, confidence_score FLOAT, fsrs_retrievability FLOAT, mock_accuracy_factor FLOAT
     UNIQUE(user_id, topic_id, snapshot_date)
   
   subject_confidence_cache:
     id UUID PK, user_id UUID FK, subject_id UUID FK,
     avg_confidence FLOAT, pyq_weighted_confidence FLOAT,
     topics_fresh INT, topics_fading INT, topics_stale INT, topics_decayed INT,
     updated_at TIMESTAMPTZ
     UNIQUE(user_id, subject_id)

3. Create API endpoints:
   POST /api/decay/recalculate — calls recalculateAllConfidence
   GET /api/confidence/overview — returns overall + per-subject + distribution
   GET /api/confidence/topic/:topicId/curve — projected forgetting curve points

4. This should be called:
   - Daily at 2 AM via cron
   - After mock test import
   - Manually via API

Return: the complete decayTrigger.service.ts, the migration SQL, the route file, and show me where to wire the cron job.
```

---

## RECT-4: Restore PYQ Intelligence Layer

```
I'm building ExamPilot. My PYQ system currently only has pyq_weight and pyq_years on the topics table. I need the full PYQ intelligence layer.

Here is my current topics table schema:
[PASTE YOUR topics migration or schema HERE]

Add the following:

1. NEW TABLE: pyq_data
   id UUID PK, topic_id UUID FK, year INT, paper TEXT, question_count INT, question_type TEXT
   UNIQUE(topic_id, year, paper)
   Indexes on topic_id and year

2. NEW TABLE: pyq_subject_stats
   id UUID PK, subject_id UUID FK (UNIQUE), avg_questions_per_year FLOAT,
   total_questions_10yr INT, trend TEXT, highest_year INT, highest_count INT

3. ADD COLUMNS to topics: pyq_frequency INT, pyq_trend TEXT, last_pyq_year INT

4. SEED SCRIPT that generates realistic pyq_data:
   - For each of 466 topics, use importance as proxy:
     importance 5 → 18-25 questions across 2015-2025 (8-10 pyq_data rows)
     importance 4 → 10-17 questions (6-8 rows)
     importance 3 → 5-9 questions (4-6 rows)
     importance 2 → 2-4 questions (2-3 rows)
     importance 1 → 0-1 questions (0-1 rows)
   - Assign papers based on subject (Polity → Prelims + Mains GS-II, etc.)
   - More recent years have higher probability of appearing

5. WEIGHT CALCULATION function:
   - Recency weighting: 2024-25=1.5x, 2022-23=1.2x, 2020-21=1.0x, 2018-19=0.8x, 2015-17=0.6x
   - Percentile bucketing: top 10%=5, 70-90th=4, 40-70th=3, 10-40th=2, bottom 10%=1
   - Trend: recent_avg vs older_avg (>1.3x=rising, <0.7x=declining, else stable)

6. API: GET /api/pyq-stats returns total_gravity, completed_gravity, weighted/unweighted pcts, high_gravity_untouched[], subject_gravity[], trending_up[], trending_down[]

7. API: GET /api/pyq/:topicId returns year-by-year breakdown + question types

Return: migration SQL, seed script, pyq.service.ts, pyq.routes.ts
```

---

## RECT-5: Fix Weakness Radar Health Score

```
I'm building ExamPilot. My weakness radar health score uses:
  health = confidence(0.40) + revision(0.25) + effort(0.20) + stability(0.15)

This is missing mock accuracy as a separate signal. Fix it to:
  health = completion(0.25) + revision(0.20) + accuracy(0.30) + recency(0.25)

Here is my current weakness service:
[PASTE YOUR weakness.service.ts HERE]

Change the health_score calculation to:

1. completion_base (weight 0.25):
   in_progress → 20, first_pass → 40, revised → 65, exam_ready → 85

2. revision_score (weight 0.20):
   min(revision_count / expected_revisions × 100, 100)
   expected = 3 normally, 4 if importance >= 4

3. accuracy_score (weight 0.30) — THE KEY CHANGE:
   if mock_topic_accuracy exists AND has questions: use mock_accuracy × 100
   elif confidence_score from FSRS exists: use confidence_score
   else: use 50 (neutral)
   
   IMPORTANT: mock_accuracy and FSRS confidence are DIFFERENT signals.
   Mock = "can you answer exam questions?" FSRS = "do you remember?"
   Mock must take priority when available.

4. recency_score (weight 0.25):
   days_since_last_touched:
   0-7d → 100, 8-14d → 80, 15-30d → 60, 31-45d → 35, 46-60d → 15, 60+ → 0

Also verify the 3 Radar Insights queries:
- False Security: status IN (first_pass, revised) AND health_score < 40, sorted by importance × pyq_weight DESC
- Blind Spots: status = not_started AND importance >= 4, sorted by importance × pyq_weight DESC
- Over-Revised: revision_count >= 4 AND health_score >= 80 AND importance <= 3

And verify the planner integration:
- false_security topics get priority += 5 in daily planner
- blind_spots topics get priority += 3
- over_revised topics get priority -= 3

Return: corrected weakness.service.ts with the formula change and the 3 insight queries.
```

---

## RECT-6: Fix Stress Thermometer Interpolation

```
I'm building ExamPilot. My stress thermometer uses simple 2-point linear interpolation:
  signal_velocity = lerp(velocity_ratio, 0.5, 1.2)

This should use piecewise linear interpolation with multiple anchor points for more nuanced mapping.

Here is my current stress service:
[PASTE YOUR stress.service.ts HERE]

Replace the interpolation with a piecewise function:

function piecewiseLerp(value: number, points: [number, number][]): number {
  // points is array of [input, output] pairs, sorted by input ascending
  // Returns interpolated output for given input value
  if (value <= points[0][0]) return points[0][1];
  if (value >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 1; i < points.length; i++) {
    if (value <= points[i][0]) {
      const t = (value - points[i-1][0]) / (points[i][0] - points[i-1][0]);
      return points[i-1][1] + t * (points[i][1] - points[i-1][1]);
    }
  }
  return points[points.length - 1][1];
}

Use these anchor points:

signal_velocity (weight 0.35):
  [[0.2, 0], [0.4, 10], [0.6, 30], [0.8, 55], [1.0, 80], [1.2, 100]]

signal_buffer (weight 0.25) — uses buffer_balance / buffer_initial ratio:
  [[0, 0], [0.25, 25], [0.50, 55], [0.75, 80], [1.0, 100]]
  SPECIAL: if buffer_balance < 0 (debt mode): signal = 0

signal_time (weight 0.20) — uses completion gap:
  gap = weighted_completion_pct - expected_completion_pct
  [[-0.3, 0], [-0.2, 15], [-0.1, 40], [0, 70], [0.1, 100]]

signal_confidence (weight 0.20) — uses overall_confidence from decay engine:
  [[20, 0], [30, 10], [40, 25], [50, 50], [60, 75], [70, 100]]

Composite: stress_score = SUM(signal × weight)
Thresholds: >=70 green, >=45 yellow, >=25 orange, <25 red

Also ensure the recommendation text mentions the WEAKEST signal specifically.

Return: corrected stress.service.ts
```

---

## RECT-7: Fix Daily Planner Priority Formula

```
I'm building ExamPilot. My daily planner priority scoring is missing weakness_boost and variety_bonus.

Here is my current planner service:
[PASTE YOUR planner.service.ts HERE]
[PASTE YOUR weakness.service.ts HERE — so I can read the radar results]

Fix the priority formula to include ALL components:

priority_score = 
  (topic.pyq_weight × 4) +          // PYQ dominant
  (topic.importance × 2) +           // syllabus importance
  (urgency × 2) +                    // subject-level urgency
  weakness_boost +                    // FROM WEAKNESS RADAR
  decay_boost +                       // from confidence decay
  freshness +                         // recency bonus/penalty
  variety_bonus +                     // subject diversity
  mock_boost +                        // from mock accuracy (keep if you have it)
  prelims_boost                       // mode-dependent (keep if you have it)

Where the MISSING components are:

weakness_boost:
  Query the weakness radar's 3 lists for this topic:
  - If topic is in false_security list: +5
  - If topic is in blind_spots list: +3
  - If topic is in over_revised list: -3
  - Else: 0

variety_bonus:
  For each topic being considered:
  - If this topic's subject is DIFFERENT from the previous item already in today's plan: +2
  - This ensures the plan isn't all one subject
  
  Also add this constraint:
  - Max 60% of daily topics from same subject
  - If a subject appeared in 3 of the last 4 daily plans: reduce its priority by 50%

Show me where in the code to:
1. Fetch the weakness radar lists (false_security, blind_spots, over_revised topic IDs)
2. Add weakness_boost to each topic's priority calculation
3. Implement variety_bonus during greedy selection
4. Add subject monotony constraint

Return: corrected planner.service.ts with these additions.
```

---

## RECT-8: Add 4-Strategy Recalibration Cascade

```
I'm building ExamPilot. My recalibration system only auto-tunes persona parameters. I'm missing the "4-strategy cascade" — the feature where the system presents 4 recovery options when the user falls behind.

Here are my current files:
[PASTE YOUR recalibration.service.ts HERE]
[PASTE YOUR velocity.service.ts and buffer.service.ts HERE]

KEEP the existing auto-recalibration (parameter tuning). But ADD a new service: recoveryStrategy.service.ts

This service provides:

1. Function getRecoveryStrategies(userId) that returns 4 strategies:

   STRATEGY 1: ABSORB
     Spread backlog over 7-14 days, increase daily target by 1-2
     Feasible: gap < 10 gravity units
     Impact: { new_daily_velocity, days_to_recover, stress_after }

   STRATEGY 2: CONSUME BUFFERS  
     Convert buffer days to study days
     Feasible: buffer_balance > buffer_initial × 0.25
     Impact: { buffer_after, new_daily_velocity, stress_after }
     On apply: create buffer_transaction(type="recalibration_adjustment", amount=-consumed)

   STRATEGY 3: INCREASE VELOCITY
     Suggest adding study hours
     Always feasible
     Impact: { extra_hours_per_day, new_daily_velocity, stress_after }

   STRATEGY 4: SCOPE REDUCTION
     Deprioritize low-importance + low-PYQ topics
     Feasible: depends on strategy_params.scope_reduction_threshold
     Conservative mode: NEVER feasible (scope_reduction_threshold = NEVER)
     Targets: untouched topics WHERE importance <= 2 AND pyq_weight <= 2
     Sort by (importance + pyq_weight) ASC, estimated_hours DESC
     On apply: SET status = 'deferred_scope' for selected topics
     Impact: { topics_removed, gravity_removed, hours_saved, new_velocity, stress_after }

2. Strategy ORDER is personalized:
   Read strategy_params.recalibration_order (array)
   Conservative: ["consume_buffers", "absorb", "increase_hours"] — NO reduce_scope
   Aggressive: ["absorb", "reduce_scope", "increase_hours"]
   Balanced: ["absorb", "consume_buffers", "increase_hours", "reduce_scope"]
   Working Professional: ["reduce_scope", "consume_buffers", "absorb"]

3. Trigger conditions (CHECK these, fire recalibration if any true):
   - velocity_ratio < 0.8 for 3 consecutive days
   - buffer_balance consumed > 50% of initial
   - stress_score < 45
   - buffer_balance < 0 (debt mode)

4. API:
   GET /api/recovery-strategies — returns ordered strategies with feasibility + impact
   POST /api/recovery-strategies/apply — body: {strategy, topic_ids?} — applies and logs

5. DB: recalibration_log table:
   id, user_id, triggered_at, triggered_by, gap_gravity,
   strategy_chosen, strategy_details JSONB,
   stress_before, stress_after, buffer_before, buffer_after

Return: recoveryStrategy.service.ts, route file, migration for recalibration_log (if not exists).
```

---

## RECT-9: Add Prelims/Mains mode_config

```
I'm building ExamPilot. My Prelims/Mains toggle is missing the mode_config table that defines which subjects are paused/boosted per mode.

Here is my current mode switch code:
[PASTE YOUR strategy.service.ts or mode-related code HERE]

Create and seed the mode_config table:

CREATE TABLE mode_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL,         -- 'mains', 'prelims', 'post_prelims'
  subject_id UUID REFERENCES subjects(id),
  is_active BOOLEAN DEFAULT true,
  importance_modifier INT DEFAULT 0,  -- +1 to boost, -1 to reduce
  revision_ratio FLOAT DEFAULT 0.30   -- what % of daily plan should be revision
);

Seed data for PRELIMS mode:
- Ethics → is_active=false
- Internal Security → is_active=false
- World History → is_active=false
- Environment → is_active=true, importance_modifier=+1
- Science & Tech → is_active=true, importance_modifier=+1
- Art & Culture → is_active=true, importance_modifier=+1
- Geography → is_active=true (high priority, no modifier needed — already important)
- Polity → is_active=true
- Economy → is_active=true
- All subjects: revision_ratio=0.70

Seed data for POST_PRELIMS mode:
- All subjects active
- Ethics, Internal Security, World History → importance_modifier=+1 (catch up)
- revision_ratio=0.40

Seed data for MAINS mode:
- All subjects active, no modifiers, revision_ratio=0.30

Then update the daily planner to read mode_config:
- Filter out topics from is_active=false subjects
- Apply importance_modifier to priority scoring
- Use revision_ratio from mode_config (not just strategy_params)

And update the velocity engine:
- Recalculate total_gravity excluding paused subjects' topics
- This means weighted_completion_pct changes in prelims mode

Return: migration SQL (table + seed), and show me the changes needed in planner.service.ts and velocity.service.ts.
```

---

## RECT-10: Flesh Out What If Simulator

```
I'm building ExamPilot. My simulator has a route (POST /api/simulator/run) but no algorithm implementation.

Here are my current velocity and stress services:
[PASTE YOUR velocity.service.ts HERE]
[PASTE YOUR stress.service.ts HERE]
[PASTE YOUR buffer service HERE]

Create simulator.service.ts that handles 5 scenarios. ALL are READ-ONLY — no data is written.

For each scenario, the function should:
1. Load the user's current metrics (velocity, stress, buffer, completion)
2. Create a COPY of the relevant parameters
3. Modify the copy based on the scenario
4. Recalculate velocity, stress, buffer with modified params
5. Return { current, simulated, delta, verdict }

SCENARIO 1: "Take N days off" (params: { days: 1-14 })
  modified_effective_days = effective_days - params.days
  new_required_velocity = remaining_gravity / modified_effective_days
  new_buffer_balance = buffer_balance - params.days  // each day off costs 1 buffer day
  Recalculate stress with new velocity and buffer.

SCENARIO 2: "Change daily hours" (params: { hours_delta: -3 to +3 })
  new_daily_hours = daily_hours + params.hours_delta
  // Estimate: each hour ≈ 0.5 topics (or use actual ratio from daily_logs)
  topics_per_hour = actual_velocity / current_daily_hours
  new_actual_velocity = topics_per_hour * new_daily_hours
  Recalculate ratio and stress.

SCENARIO 3: "Drop importance ≤ N topics" (params: { threshold: 1-3 })
  topics_to_drop = topics WHERE status='not_started' AND importance <= threshold AND pyq_weight <= threshold
  gravity_removed = SUM(pyq_weight) of dropped topics
  new_remaining_gravity = remaining_gravity - gravity_removed
  new_required_velocity = new_remaining_gravity / effective_days
  Recalculate ratio and stress.
  Return: topics_removed count, hours_saved, subjects affected.

SCENARIO 4: "Focus on subject X for N days" (params: { subject_id, days: 3-14 })
  // Calculate what happens to subject X
  subject_remaining = topics in subject WHERE not completed
  topics_coverable = days × daily_topic_rate
  new_subject_pct = (completed + topics_coverable) / total
  // Calculate side effect: other subjects decay
  For each OTHER subject: project confidence decline over N days using FSRS formula
  Return: subject progress before/after + other subjects' confidence impact.

SCENARIO 5: "Exam postponed by N days" (params: { extra_days: 7-90 })
  new_days_remaining = days_remaining + params.extra_days
  new_effective_days = new_days_remaining × (1 - buffer_pct - revision_pct)
  new_required_velocity = remaining_gravity / new_effective_days
  new_buffer_initial = new_days_remaining × buffer_capacity
  Recalculate everything.

API: POST /api/simulator/run
Body: { scenario: "days_off" | "hours_change" | "drop_topics" | "focus_subject" | "exam_postponed", params: {...} }
Returns: { current: {...}, simulated: {...}, delta: {...}, verdict: "green"|"yellow"|"red", recommendation: string }

Return: complete simulator.service.ts and route file.
```

---

## RECT-11: Enrich Weekly Review Response

```
I'm building ExamPilot. My weekly review returns basic data (topics, hours, velocity, stress, grade). It needs to be enriched with data from ALL features.

Here is my current weekly review service:
[PASTE YOUR weeklyReview.service.ts HERE]

Expand the generateWeeklyReview function to also query and include:

1. GRAVITY metrics: gravity_completed this week, gravity_target
2. CONFIDENCE trend: start-of-week vs end-of-week overall confidence, topics that improved, topics that decayed, subjects at risk (confidence < 40)
3. WEAKNESS RADAR changes: false_security count start vs end, blind_spots count start vs end, overall_health change
4. BUFFER BANK: start balance, end balance, total deposited, total withdrawn, net change
5. BURNOUT: average BRI this week, peak BRI, whether recovery was triggered, light days taken
6. GAMIFICATION: WES (or grade), streaks snapshot, badges earned this week, next milestone progress
7. SUBJECT COVERAGE: which subjects were touched, which untouched, which untouched >14 days
8. NEXT WEEK: recommended priority subjects (based on untouched >14d + low confidence), revision load estimate, new topic target, gravity target

The "wins" array should always be FIRST and include things like:
- "Gravity completed exceeded target by 15% 🎉"
- "Buffer bank grew +1.2 days 💰"
- "3 false-security topics resolved ✅"
- "Velocity improved 17% 📈"

The "areas_to_improve" should be gentle and actionable:
- "Geography confidence dropped to 38 — schedule 3 revision sessions"
- "2 overdue revisions — these accelerate decay"

This data comes from:
- velocity_snapshots (velocity, stress, buffer data for the week)
- confidence_snapshots (confidence start vs end)
- weakness radar cache/snapshots
- buffer_transactions (sum deposits/withdrawals for the week)
- burnout_snapshots (BRI data)
- gamification tables (XP, badges, streaks)
- daily_plans + user_progress (subject coverage)

Cache the result in weekly_reviews.data (JSONB). Don't regenerate if already cached.

Return: enriched weeklyReview.service.ts with all the additional queries.
```

---

## RECT-12: Add Cron Job Specification

```
I'm building ExamPilot with Supabase. I need to specify and implement the daily cron jobs that keep the system's computed data fresh.

Here is my project structure:
[PASTE YOUR supabase/functions/ directory listing or edge function setup]

Create a Supabase Edge Function called "daily-maintenance" that runs at 2:00 AM daily (or specify pg_cron setup).

The function should execute these steps IN ORDER for each active user:

STEP 1 (2:00 AM): CONFIDENCE RECALCULATION
  Call decayTrigger.recalculateAllConfidence(userId)
  This: recalculates FSRS retrievability for all topics, detects threshold crossings, auto-downgrades decayed topics, schedules decay revisions, updates subject confidence cache.

STEP 2 (2:05 AM): HEALTH SCORE RECALCULATION
  Call weakness.recalculateAllHealth(userId)
  This: recalculates health_score for all topics, updates zone distribution, refreshes false_security/blind_spots/over_revised lists.

STEP 3 (2:10 AM): VELOCITY SNAPSHOT
  Call velocity.createDailySnapshot(userId)
  This: calculates today's velocity metrics, creates velocity_snapshot row.

STEP 4 (2:15 AM): BUFFER TRANSACTION
  Call buffer.processDailyTransaction(userId)
  This: compares today's gravity_completed vs required_velocity, creates deposit/withdrawal/zero_day transaction.

STEP 5 (2:20 AM): BURNOUT SNAPSHOT
  Call burnout.createDailySnapshot(userId)
  This: calculates fatigue score + BRI, checks recovery trigger conditions.

STEP 6 (2:25 AM): BENCHMARK SNAPSHOT
  Call benchmark.createDailySnapshot(userId)
  This: calculates readiness score.

STEP 7 (Sundays 7:00 PM): WEEKLY REVIEW
  Call weeklyReview.generateIfNotExists(userId)
  Send push notification: "Your Weekly Review is ready 📊"

Requirements:
- Each step is idempotent (running twice on same day doesn't double-count)
- Each step uses UPSERT with (user_id, snapshot_date) unique constraint
- If a step fails, log error but continue to next step
- Track execution time for performance monitoring
- Should handle 1000+ users (batch processing, not sequential)

Also specify: how to set this up in Supabase (pg_cron extension? Edge Function with cron trigger? External scheduler?)

Return: the edge function code (or pg_cron SQL), and any helper functions needed.
```

---

## RECT-13: Add Notification Infrastructure

```
I'm building ExamPilot with React Native (Expo). I need push notification infrastructure.

Create:

1. DATABASE TABLE:
   notification_queue:
     id UUID PK, user_id UUID FK, type TEXT, title TEXT, body TEXT,
     data JSONB, status TEXT ('pending'|'sent'|'failed'), created_at, sent_at

2. NOTIFICATION TYPES (seed these):
   - recalibration_triggered: "Your plan needs a small adjustment" / "Tap to see recovery options 💪"
   - weekly_review_ready: "Your Weekly Review is ready 📊" / "5 minutes to review your week"
   - recovery_suggestion: "Your burnout risk is elevated" / "Consider activating a light week"
   - topic_decay_alert: "⚠️ {count} topics decayed" / "Quick revisions will restore them"
   - streak_milestone: "🔥 {count}-day streak!" / "New personal best!"
   - badge_unlocked: "🏅 Badge Unlocked: {name}" / "{description}"
   - mock_improvement: "📈 Mock score improved!" / "Your {subject} accuracy went up {pct}%"
   - buffer_debt: "🔴 Buffer in debt" / "Complete extra topics to recover"

3. SERVICE: notification.service.ts
   - queueNotification(userId, type, data) — inserts into queue
   - processQueue() — sends pending notifications via Expo Push API
   - Called from: decay triggers, weekly review cron, burnout checks, gamification events

4. EXPO PUSH SETUP:
   - expo-notifications package in the React Native app
   - Push token stored in user_profiles.push_token
   - Server sends via Expo Push API (https://exp.host/--/api/v2/push/send)

5. Wire up notification calls:
   - After recalibration trigger: queue "recalibration_triggered"
   - After weekly review generation: queue "weekly_review_ready"
   - After BRI > 50: queue "recovery_suggestion"
   - After decay downgrade: queue "topic_decay_alert"
   - After streak milestone: queue "streak_milestone"
   - After badge unlock: queue "badge_unlocked"

Return: migration SQL, notification.service.ts, Expo push setup instructions, and show me where to add queueNotification calls in existing services.
```

---

## RECT-14: Add Supabase RLS Policies

```
I'm building ExamPilot with Supabase. I need Row Level Security policies for all tables.

Here is my list of tables with user_id:
[PASTE YOUR table list — or I'll list them]

Tables needing user-scoped RLS:
user_profiles, user_progress, fsrs_cards, velocity_snapshots, daily_logs,
buffer_transactions, streaks, daily_plans, burnout_snapshots, persona_snapshots,
recalibration_log, weekly_reviews, xp_transactions, user_badges,
benchmark_snapshots, mock_tests, mock_subject_accuracy, mock_topic_accuracy,
ca_daily_logs, ca_streaks, user_targets, user_promises,
status_changes, confidence_snapshots, subject_confidence_cache, notification_queue

Tables that are read-only for all (no user_id):
subjects, chapters, topics, strategy_mode_defaults, badges, mode_config, pyq_data, pyq_subject_stats

Generate the complete RLS SQL:

For each user-scoped table:
  ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "{table}_select" ON {table} FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "{table}_insert" ON {table} FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "{table}_update" ON {table} FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "{table}_delete" ON {table} FOR DELETE USING (auth.uid() = user_id);

For read-only tables:
  ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "{table}_read" ON {table} FOR SELECT USING (true);

Special cases:
- user_profiles: the FK is `id` not `user_id` (id = auth.uid())
- mock_subject_accuracy and mock_topic_accuracy: join through mock_tests to get user_id

Return: complete migration SQL for all RLS policies.
```

---

## USAGE SUMMARY

| Prompt | Fixes | Priority |
|--------|-------|----------|
| RECT-1 | Gravity formula | 🔴 Do first — everything depends on it |
| RECT-2 | Buffer bank rates + debt mode | 🔴 Critical |
| RECT-3 | Decay trigger service | 🔴 Critical |
| RECT-4 | PYQ intelligence layer | 🔴 Critical |
| RECT-5 | Weakness radar formula | 🔴 Critical |
| RECT-6 | Stress interpolation | 🟡 Moderate |
| RECT-7 | Planner priority formula | 🟡 Moderate |
| RECT-8 | Recovery strategy cascade | 🟡 Moderate |
| RECT-9 | Prelims mode_config | 🟡 Moderate |
| RECT-10 | What If simulator | 🟡 Moderate |
| RECT-11 | Weekly review enrichment | 🟡 Moderate |
| RECT-12 | Cron jobs | 🟣 Structural |
| RECT-13 | Notifications | 🟣 Structural |
| RECT-14 | RLS policies | 🟣 Structural |

After applying all 14, re-run the Feature Coverage Audit. Every checkbox should pass.
