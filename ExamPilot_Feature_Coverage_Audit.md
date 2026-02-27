# ExamPilot V2 — Feature Coverage Audit

> **What this is:** A verification checklist to run against your BUILT application. For each of the 18 features, it lists every algorithm, API endpoint, database table, UI component, and edge case that must exist in working code. Paste the relevant section into Claude along with your actual code files to verify coverage.
>
> **How to use:** After building each feature, paste the audit section + your code into Claude and ask: "Does this code satisfy every check? List what's missing."

---

## AUDIT METHOD

For each feature, verification happens at 4 layers:

| Layer | What to check | How to check |
|-------|--------------|-------------|
| **DB** | Tables exist, columns correct, constraints present | Run `\dt` and `\d table_name` in Supabase SQL editor |
| **API** | Endpoints exist, return correct shape, handle edge cases | curl/Postman each endpoint, verify response JSON |
| **Algorithm** | Math is correct, thresholds match spec | Unit tests with known inputs → expected outputs |
| **UI** | Components render, interactions work, states display | Manual walkthrough on device/simulator |

---

## F1: ONBOARDING & STRATEGY MODE

### DB Checks
```
□ user_profiles table exists with ALL columns:
  □ strategy_mode (enum: balanced/aggressive/conservative/working_professional)
  □ strategy_params (JSONB with 12+ keys)
  □ current_mode (enum: mains/prelims/post_prelims)
  □ buffer_balance (FLOAT)
  □ buffer_initial (FLOAT)
  □ recovery_mode_active (BOOLEAN)
  □ onboarding_completed (BOOLEAN)
  □ exam_date, prelims_date, daily_hours
□ strategy_mode_defaults table seeded with all 4 modes × all params
□ user_targets table exists (daily_hours, daily_new_topics, weekly_revisions, etc.)
□ persona_snapshots table exists with valid_from/valid_to (SCD Type 2)
```

### API Checks
```
□ POST /api/onboarding — accepts questionnaire answers, returns classified mode + params
□ GET /api/strategy — returns current mode + all active params
□ POST /api/strategy/switch — changes mode, repopulates params, triggers recalculation
□ POST /api/strategy/customize — overrides individual params
□ POST /api/strategy/switch triggers:
  □ Velocity recalculation
  □ Buffer reinitialization
  □ Daily plan regeneration
```

### Algorithm Checks
```
□ Classification logic:
  □ Working professional input → WORKING_PROFESSIONAL mode
  □ 7+ hours + re-attempter → AGGRESSIVE
  □ "Cover everything" OR first attempt → CONSERVATIVE
  □ Otherwise → BALANCED
□ Each mode populates ALL these params (no nulls):
  □ buffer_deposit_rate, buffer_withdrawal_rate
  □ revision_ratio_in_plan
  □ fatigue_sensitivity (or fatigue_threshold)
  □ burnout_threshold (or burnout_bri_threshold)
  □ scope_reduction_threshold
  □ velocity_target_multiplier
  □ recalibration_order (array of strategy names)
  □ pyq_weight_minimum (working_professional only)
  □ weekend_boost (working_professional only)
```

### UI Checks
```
□ Onboarding flow: 5+ screens, one question each, swipeable
□ Mode recommendation card shown after classification
□ "Choose different" option shows all 4 modes
□ Settings screen shows current mode with "Change Mode" button
□ Mode switch shows confirmation dialog before applying
```

### Edge Cases
```
□ Skipping onboarding defaults to BALANCED
□ Re-doing onboarding preserves existing progress data
□ Custom param overrides survive mode switches (or are explicitly reset)
```

---

## F2: PYQ INTELLIGENCE LAYER

### DB Checks
```
□ topics table has: pyq_weight (FLOAT), pyq_frequency (INT), pyq_trend (TEXT), pyq_years (INT[]), last_pyq_year (INT)
□ pyq_data table exists: topic_id, year, paper, question_count, question_type
  □ Has data for all 466 topics (at minimum importance-based seed)
  □ Years span 2015-2025
□ pyq_subject_stats table exists: subject_id, avg_questions_per_year, total_questions_10yr, trend
  □ Has rows for all 16 subjects
```

### Algorithm Checks
```
□ Recency weighting applied:
  □ 2024-2025 questions weighted 1.5x
  □ 2022-2023 weighted 1.2x
  □ 2020-2021 weighted 1.0x
  □ 2018-2019 weighted 0.8x
  □ 2015-2017 weighted 0.6x
□ pyq_weight normalized to 1-5 scale via percentile buckets:
  □ Top 10% = 5, 70-90th = 4, 40-70th = 3, 10-40th = 2, bottom 10% = 1
□ Trend calculation:
  □ recent_avg (2022-25) > older_avg (2015-21) * 1.3 → "rising"
  □ recent_avg < older_avg * 0.7 → "declining"
  □ Otherwise → "stable"
□ total_gravity = SUM(pyq_weight) for all 466 topics (should be ≈ 1420, NOT 15000+)
```

### API Checks
```
□ GET /api/pyq-stats returns:
  □ total_gravity, completed_gravity, remaining_gravity
  □ weighted_completion_pct AND unweighted_completion_pct (both present, different values)
  □ high_gravity_untouched[] (top 10 untouched high-weight topics)
  □ subject_gravity[] (per-subject breakdown)
  □ trending_up[] and trending_down[] (topics with rising/declining trend)
□ GET /api/pyq/:topicId returns:
  □ Year-by-year breakdown with papers
  □ Question type distribution
```

### UI Checks
```
□ PYQ flame badges visible on topic rows in syllabus map (1-5 intensity)
□ Tapping flame shows "Asked X times" detail
□ Dashboard toggle: topic count ↔ exam-weighted progress (weighted is default)
□ Trending topics card on dashboard shows 3-5 "rising" topics
□ Syllabus map has a view mode to color by PYQ weight
```

---

## F3: LIVING SYLLABUS MAP

### DB Checks
```
□ subjects (16 rows), chapters (93 rows), topics (466 rows) — all seeded
□ FK chain intact: topics → chapters → subjects
□ user_progress table: status, confidence_score, confidence_status, health_score, mock_accuracy, actual_hours, revision_count, notes
□ Unique constraint on (user_id, topic_id) in user_progress
```

### UI Checks
```
□ Top summary bar always visible: "187/466 topics (40%) · Weighted: 680/1420 (48%)"
□ 3 view modes: Progress / PYQ Weight / Health — toggle works
□ 16 subject cards render with:
  □ Name, paper badges, progress ring
  □ Weighted gravity progress (separate from topic count)
  □ Status distribution bar (gray/blue/yellow/orange/green segments)
  □ Confidence indicator (colored dot from decay engine)
□ Tapping subject expands chapters (accordion)
□ Tapping chapter shows topic list
□ Each topic row shows:
  □ Status pill (tappable to cycle)
  □ PYQ flame badge
  □ Confidence meter (colored bar + number)
  □ Last touched ("3d ago" / "⚠️ 45d ago" in amber if >30 days)
□ Long-press topic → bottom sheet:
  □ Status selector (5 pills)
  □ Hours input (+0.5 increment)
  □ Self-confidence (1-5 stars or similar)
  □ Notes text input
  □ Save → optimistic UI update
□ Search bar: filter by name
□ Filter: by status, subject, PYQ weight range, health zone, confidence status
□ Sort: by default order, PYQ weight, health score, last touched
```

### Edge Cases
```
□ New user: all topics "untouched", only Blind Spots visible in radar
□ Completing a topic cascades: progress ring updates → chapter → subject → overall
□ "deferred_scope" topics render grayed out (not hidden)
```

---

## F4: WEIGHTED VELOCITY ENGINE + DYNAMIC BUFFER BANK

### Algorithm Checks — Velocity
```
□ gravity(topic) = pyq_weight (NOT pyq_weight × difficulty × estimated_hours)
□ total_gravity ≈ 1420 (verify with: SELECT SUM(pyq_weight) FROM topics)
□ required_velocity = remaining_gravity / effective_study_days
□ effective_study_days = days_remaining × (1 - buffer_pct - revision_pct)
  □ buffer_pct and revision_pct read from strategy_params (NOT hardcoded)
□ actual_velocity = 0.6 × velocity_7d + 0.4 × velocity_14d
□ velocity_ratio = actual / required
□ Status thresholds: >=1.0 green, >=0.8 yellow, >=0.6 orange, <0.6 red
  (OR >=1.1 ahead, >=0.9 on_track, >=0.7 behind, else at_risk — either is fine, just be consistent)
□ Projected completion date calculated and returned
□ Both weighted_pct AND unweighted_pct in response
□ Trend: 7d > 14d*1.1 → improving, < 14d*0.9 → declining, else stable
```

### Algorithm Checks — Buffer Bank
```
□ Deposit rate reads from strategy_params.buffer_deposit_rate (NOT hardcoded 0.8)
  □ Typical values: 0.25-0.35 depending on mode
□ Withdrawal rate reads from strategy_params.buffer_withdrawal_rate
  □ Typical values: 0.4-0.5
□ CRITICAL: withdrawal_rate > deposit_rate (asymmetric — losing is harsher)
□ Zero day penalty = exactly -1.0
□ Exact target reward = +0.1 daily (not streak-based)
□ Cap: 20% of remaining days
□ Floor: -5 (NOT 0 — debt mode must exist)
□ Buffer debt (balance < 0):
  □ Status = "debt"
  □ Stress signal_buffer = 0
  □ Auto-triggers recalibration
  □ UI shows red card with negative number
□ Buffer status thresholds use initial balance as reference:
  □ > initial*0.8 → healthy, > initial*0.4 → moderate, > 0 → low, ≤ 0 → debt
```

### DB Checks
```
□ velocity_snapshots: includes weighted_completion_pct, unweighted_completion_pct, trend, projected_completion_date
□ buffer_transactions: includes delta_gravity, notes columns
□ user_profiles: has BOTH buffer_balance AND buffer_initial
□ daily_logs: includes gravity_completed (not just topics_completed)
□ streaks: study, revision, plan_completion types all tracked
```

### API Checks
```
□ GET /api/velocity returns ALL: ratio, status, required, actual, weighted_pct, unweighted_pct, projected date, trend, streak
□ GET /api/velocity/history?days=30 returns daily snapshots (plottable array)
□ POST /api/velocity/recalculate works after topic status change
□ GET /api/buffer returns: balance, initial, status, trend, last 7 transactions, totals
```

### Unit Test Cases
```
□ Day 1 (no history): returns required velocity only, ratio = null or 0, streak = 0
□ 0 topics ever: projected_completion = null, not division-by-zero
□ Exam < 30 days: buffer_pct and revision_pct reduce automatically
□ Buffer at -5: further underperformance doesn't go below -5
□ Buffer at max (20% of remaining): further deposits are capped
```

---

## F5: CONFIDENCE DECAY ENGINE

### DB Checks
```
□ fsrs_cards table exists with: stability, difficulty, due, state, reps, lapses, etc.
□ status_changes table exists: user_id, topic_id, old_status, new_status, reason, changed_at
□ confidence_snapshots table exists: user_id, topic_id, snapshot_date, confidence_score, fsrs_retrievability, mock_accuracy_factor
□ subject_confidence_cache (or equivalent): user_id, subject_id, pyq_weighted_confidence
```

### Algorithm Checks
```
□ Confidence uses FSRS retrievability: R = (1 + elapsed_days / (9 × stability))^(-1)
□ Mock accuracy adjusts confidence:
  □ adjusted = fsrs_confidence × (0.7 + 0.3 × mock_accuracy)
  □ This means: topic with 80% FSRS + 30% mock accuracy → ~63 (FADING, not FRESH)
□ Thresholds: >=70 fresh, >=45 fading (or 50-69), >=20 stale (or 30-49), <20 decayed (or <30)
  □ Verify: which thresholds does YOUR build use? Must be consistent everywhere.
□ Auto-downgrade: confidence < threshold → status reverts to "first_pass"
  □ This ACTUALLY CHANGES the status in user_progress
  □ The old status is logged in status_changes
□ Subject-level confidence = PYQ-weighted average:
  □ SUM(confidence × pyq_weight) / SUM(pyq_weight) for all non-untouched topics in subject
```

### Behavioral Trigger Checks
```
□ Daily cron job runs and recalculates ALL confidence scores
□ When topic crosses FRESH → FADING:
  □ A decay_revision is auto-scheduled in the daily plan
□ When topic drops to STALE:
  □ Priority boost of +4 in daily planner
□ When topic drops to DECAYED:
  □ Status auto-downgrades to first_pass
  □ status_changes row is inserted
  □ Notification/alert is generated
□ When subject confidence < 40:
  □ Alert appears in weekly review
```

### API Checks
```
□ POST /api/decay/recalculate (or /api/fsrs/recalculate) — triggers full recalc, returns summary
□ GET /api/confidence/overview — returns overall confidence + per-subject + distribution (fresh/fading/stale/decayed counts)
□ GET /api/confidence/topic/:id/curve — returns projected forgetting curve points + optimal revision date
```

### UI Checks
```
□ Confidence meter visible on topic rows (colored bar + number)
□ Subject confidence cards on dashboard (16 cards, sortable by worst-first)
□ Forgetting curve chart on topic detail (line chart with projected decline)
□ Decay alert banner on daily plan: "⚠️ 3 topics decayed overnight"
```

---

## F6: SPACED REPETITION SCHEDULER

### Algorithm Checks
```
□ Uses FSRS (ts-fsrs) for scheduling — NOT hand-rolled +3/+10/+30
□ After first_pass: FSRS card created, first review scheduled
□ Rating system: 1=Again, 2=Hard, 3=Good, 4=Easy
□ FSRS calculates next due date based on rating + stability
□ Decay-aware: when confidence crosses FADING, extra decay_revision is auto-inserted
  □ This is SEPARATE from the FSRS-scheduled revision
□ Auto-upgrade: revision_count >= 3 AND confidence >= 70 → "exam_ready"
□ Auto-downgrade: confidence < decay_threshold → "first_pass" (from F5)
□ Fast-track: mock_accuracy >= 0.8 AND revision_count >= 2 → "exam_ready"
```

### DB Checks
```
□ fsrs_cards: all FSRS fields present (stability, difficulty, due, state, reps, lapses, etc.)
□ daily_plans has item_type values: 'revision' (FSRS-scheduled) AND 'decay_revision' (decay-triggered)
```

### API Checks
```
□ POST /api/fsrs/review/:topicId — accepts rating (1-4), returns updated card + next due
□ GET /api/revisions — returns: due today, overdue, upcoming 3 days, decay-triggered
  □ Overdue items flagged with overdue_by_days
□ GET /api/revisions/calendar?month=YYYY-MM — calendar view data
```

### UI Checks
```
□ Revision widget in daily plan: collapsible section "📖 Revisions Due (N)"
□ Each revision card: topic name, subject badge, "Rev N · ~15 min", quick-complete button
□ Rating modal after completing revision: Again/Hard/Good/Easy buttons
□ Overdue items: amber border + "X days overdue" badge
□ Decay-triggered items: red indicator + "Confidence dropping" label
```

---

## F7: STRESS THERMOMETER

### Algorithm Checks
```
□ 4 signals (NOT 3):
  □ signal_velocity (weight 0.35): from velocity_ratio
  □ signal_buffer (weight 0.25): from dynamic buffer_balance / buffer_initial
  □ signal_time (weight 0.20): from weighted completion gap
  □ signal_confidence (weight 0.20): from overall confidence score
□ Interpolation uses piecewise-linear with multiple anchor points (NOT simple 2-point lerp):
  □ Velocity: ratio 1.2→100, 1.0→80, 0.8→55, 0.6→30, 0.4→10, ≤0.2→0
  □ OR: the LLD's simpler lerp is acceptable IF the thresholds produce similar results
□ Composite: stress_score = SUM(signal × weight)
□ Status: >=70 green, >=45 yellow, >=25 orange, <25 red
□ Buffer signal uses DYNAMIC buffer (not static percentage)
□ Confidence signal pulls from decay engine's overall_confidence
```

### API Checks
```
□ GET /api/stress returns: score, status, label, 4 signal breakdowns, recommendation (if not green), 7-day history
□ Recommendation text is context-aware: mentions the WEAKEST signal specifically
  □ Not generic "you're behind" but "Buffer consumed 60% + 8 topics decayed"
```

### UI Checks
```
□ Semi-circular or vertical gauge (0-100) with color gradient
□ Score number + status label ("On Track" / "At Risk")
□ 4 mini signal bars (velocity, buffer, time, confidence)
□ 7-day sparkline
□ Recommendation card (yellow/orange/red only) with CTA to recalibration
□ This is the FIRST thing on the dashboard
```

---

## F8: SMART DAILY PLANNER

### Algorithm Checks — Priority Scoring
```
□ pyq_weight × 4 (PYQ is dominant factor — verify it has highest coefficient)
□ importance × 2
□ urgency × 2 (subject-level, based on completion gap)
□ weakness_boost: +5 for false_security, +3 for blind_spots, -3 for over_revised
  □ Verify: planner actually queries weakness radar results
□ decay_boost: +4 for stale, +6 for decayed confidence_status
□ freshness: +3 if >7 days, +1 if 3-7 days, -2 if <3 days
□ variety_bonus: +2 if different subject from previous item in today's plan
□ mock_boost (if implemented): +3 for accuracy < 0.3, +2 for < 0.5
□ prelims_boost (if prelims mode): +3 for prelims-relevant subjects
```

### Algorithm Checks — Fatigue Constraints
```
□ Fatigue score calculated:
  (consecutive_study_days × 10) + (avg_difficulty_3d × 8) + (hours_3d / target × 20) - (rest_days_7d × 15)
□ Fatigue > 85: FORCES light day (only revision + 1 easy topic)
□ Fatigue > 70: reduces topic count by 1
□ After 2 consecutive heavy days (avg difficulty >= 4): Day 3 must be <= 3 avg difficulty
□ Every 6th consecutive study day: auto light day
□ Max 60% of daily topics from same subject
□ Subject in 3+ of last 4 plans: priority reduced by 50%
```

### Algorithm Checks — Plan Construction
```
□ Greedy fill: sort by priority DESC, pick until hours exhausted
□ Minimum 2 different subjects per plan
□ Revision ratio follows strategy_params.revision_ratio_in_plan
  □ e.g., BALANCED = 30% revision, PRELIMS = 70% revision
□ Working Professional: pyq_weight_minimum filter applied (only weight >= 3)
□ Working Professional: weekend_boost doubles capacity on Sat/Sun
□ Deferred items from yesterday appear with +1 priority boost
□ Decay revisions from F5 included with type = "decay_revision"
□ FSRS revisions from F6 included with type = "revision"
```

### API Checks
```
□ GET /api/daily-plan?date=YYYY-MM-DD — returns plan (auto-generates if not exists)
  □ Response includes: items[], fatigue_score, fatigue_status, is_light_day, energy_level
□ PATCH /api/daily-plan/items/:id — updates status
  □ On "completed": updates user_progress + triggers velocity recalc + checks badges
  □ On "deferred": adds to tomorrow with +1 priority
□ POST /api/daily-plan/regenerate — manual regen
□ Plan is deterministic: opening app multiple times on same day returns same plan
```

### UI Checks
```
□ Header: "Today's Mission" + date + available hours (tappable) + energy battery + stress dot
□ Topic cards: checkbox + name + chapter + subject badge + type badge (NEW/REVISION/DECAY) + PYQ flames + time
□ Swipe actions: Skip / Tomorrow
□ Completed items → green check, move to bottom
□ Light day banner: "Recovery Day 🌿"
□ Progress footer: "3/5 done" + progress bar + streak
□ Stretch goals section (collapsed by default)
□ All-done celebration (haptic + subtle animation)
```

---

## F9: WEAKNESS RADAR

### Algorithm Checks — Health Score
```
□ 4 components with correct weights:
  □ completion_base (0.25): in_progress→20, first_pass→40, revised→65, exam_ready→85
  □ revision_score (0.20): min(revision_count / expected × 100, 100)
  □ accuracy_score (0.30): mock_accuracy × 100 (or confidence_score if no mock data)
    □ CRITICAL: mock_accuracy must be a separate signal from FSRS confidence
  □ recency_score (0.25): 0-7d→100, 8-14d→80, 15-30d→60, 31-45d→35, 46-60d→15, 60+→0
□ Health zones: >=80 strong, >=60 adequate, >=40 vulnerable, >=20 weak, <20 critical
```

### Algorithm Checks — 3 Radar Insights
```
□ "False Security": status IN (first_pass, revised) AND health_score < 40
  □ Sorted by (importance × pyq_weight) DESC
  □ This list EXISTS and is QUERYABLE
□ "Blind Spots": status = untouched AND importance >= 4
  □ Sorted by (importance × pyq_weight) DESC
□ "Over-Revised": revision_count >= 4 AND health_score >= 80 AND importance <= 3
□ These 3 lists feed INTO the daily planner:
  □ false_security → priority += 5
  □ blind_spots → priority += 3
  □ over_revised → priority -= 3
  □ Verify: planner ACTUALLY reads these lists (not just theoretically)
```

### API Checks
```
□ GET /api/weakness returns:
  □ overall_health (single number)
  □ zone_distribution (count + pct for each of 6 zones)
  □ false_security[] (top 15)
  □ blind_spots[] (top 10)
  □ over_revised[] (all matching)
  □ subject_health[] (16 subjects with avg health)
□ GET /api/weakness/topic/:id — health score detail for one topic
□ POST /api/weakness/recalculate — daily recalc
```

### UI Checks
```
□ Overall health ring/gauge (0-100)
□ Zone distribution bar (6 colored segments, tappable)
□ 3 insight tabs: False Security / Blind Spots / Over-Revised
□ Each topic in insights: name, health score, reason tag, "Add to plan" CTA
□ Subject heatmap: 4×4 grid colored by avg health
□ "Apply to Plan" button that actually boosts priorities in planner
```

---

## F10: RECALIBRATION ENGINE

### Algorithm Checks — 4-Strategy Cascade
```
□ Strategy 1: ABSORB — spread backlog over 7-14 days
  □ Feasible only if gap < 10 gravity units
□ Strategy 2: CONSUME BUFFERS — convert buffer days to study days
  □ Feasible only if buffer_balance > 25% of initial
  □ Creates a buffer_transaction with type "recalibration_adjustment"
□ Strategy 3: INCREASE VELOCITY — suggest adding study hours
  □ Always feasible
□ Strategy 4: SCOPE REDUCTION — deprioritize low-weight topics
  □ Targets: untouched topics with importance <= 2 AND pyq_weight <= 2
  □ Sets status = "deferred_scope"
  □ Feasibility depends on strategy_params.scope_reduction_threshold
□ Strategy ORDER is personalized per mode:
  □ Conservative: consume_buffers → absorb → increase_hours (NEVER reduce_scope)
  □ Aggressive: absorb → reduce_scope → increase_hours
  □ Balanced: absorb → consume_buffers → increase_hours → reduce_scope
  □ Working Professional: reduce_scope → consume_buffers → absorb
□ Each strategy shows before/after impact numbers
```

### Trigger Checks
```
□ Triggers on: velocity_ratio < 0.8 for 3 consecutive days
□ Triggers on: buffer_balance consumed > 50% of initial
□ Triggers on: stress_score < 45
□ Triggers on: buffer_balance goes negative (from F4)
□ Triggers on: manual request
□ Auto-recalibration (LLD addition): tunes params with ±10% clamps, 3-day cooldown — SEPARATE from strategy cascade
```

### API Checks
```
□ GET /api/recalibration returns: triggered_by, gap, 4 strategies with feasibility + impact + recommended flag
□ POST /api/recalibration/apply — applies strategy, logs event, recalculates velocity/stress/buffer
□ recalibration_log table: triggered_at, triggered_by, strategy_chosen, stress_before/after, buffer_before/after
```

---

## F11: FATIGUE & BURNOUT GUARDIAN

### Algorithm Checks — Fatigue (daily)
```
□ Formula: (consecutive_days × 10) + (avg_diff_3d × 8) + (hours_3d / target × 20) - (rest_7d × 15)
□ > 85: force light day
□ > 70: reduce topic count
□ < 30: can handle heavy day
□ Light day: revisions + 1 easy topic, 60% hours, "Recovery Day 🌿"
□ Heavy day limit: max 2 consecutive days with avg difficulty >= 4
```

### Algorithm Checks — Burnout Risk Index (multi-day)
```
□ BRI calculated from 4 signals:
  □ Stress persistence (0.30)
  □ Buffer hemorrhage (0.25)
  □ Velocity collapse (0.25)
  □ Engagement decay (0.20)
□ BRI thresholds adjusted by strategy_params.burnout_threshold:
  □ Conservative: triggers at 65 (earlier)
  □ Aggressive: triggers at 80 (later)
□ Recovery Mode triggers: BRI > threshold for 2 consecutive days
```

### Recovery Mode Checks
```
□ Duration: 5-7 days
□ During recovery:
  □ Daily plan reduced to 50% (only revision + 1 easy)
  □ Buffer consumption PAUSED (no withdrawals)
  □ Velocity target FROZEN (no "falling behind")
  □ Stress thermometer shows special recovery state
□ Exit: 5 days + BRI below 50, OR 7 days auto, OR manual (with warning)
□ Post-recovery ramp-up: Day 1 = 70%, Day 2 = 85%, Day 3 = 100%
```

### API Checks
```
□ GET /api/burnout returns: bri, status, 4 signal scores, recommendation, 7-day history
□ POST /api/burnout/recovery/start — activates recovery
□ POST /api/burnout/recovery/end — exits with ramp-up schedule
□ burnout_snapshots table records daily BRI
□ recovery_log table records start/end/trigger/exit_reason
```

### UI Checks
```
□ BRI indicator on dashboard (heart-rate icon, colored)
□ Recovery banner: "🌿 Recovery Mode — Day 3/5" with "Exit Early" button
□ Early warning modal (BRI 50-75): "Stressed? Activate light week?" (max once/day)
□ Energy battery icon on daily plan header
```

---

## F12: WEEKLY REVIEW RITUAL

### Content Checks (response must include ALL of these)
```
□ Performance: topics done vs target, hours vs target, days active/missed
□ Gravity: gravity completed vs target (weighted metric)
□ Velocity trend: this week vs last, % change, direction
□ Confidence trend: start vs end, topics improved vs decayed, subjects at risk
□ Weakness radar changes: false_security count change, overall_health change
□ Buffer bank: start vs end balance, net deposited/withdrawn
□ Burnout: avg BRI, peak BRI, recovery triggered (yes/no), light days taken
□ Subject coverage: touched, untouched this week, untouched >14 days
□ Stress trend: start vs end, status
□ Gamification: WES or grade, streaks, badges earned, next milestone
□ Next week recommendation: priority subjects, revision load, topic target, reason
□ Wins (always listed FIRST, never start with negatives)
□ Areas to improve (gentle language, with actionable CTAs)
```

### API/DB Checks
```
□ GET /api/weekly-review?week_start=YYYY-MM-DD — returns complete review
□ weekly_reviews table caches the review (JSONB) — not regenerated on repeat access
□ Push notification on Sunday at configured time
□ "Accept Plan" button pre-loads priorities into next week's planner
```

---

## F13: MOCK TEST INTEGRATION

### DB Checks
```
□ mock_tests: user_id, test_name, test_date, total_questions, correct, incorrect, score, source
□ mock_questions (optional for detailed entry): mock_test_id, topic_id, subject_id, is_correct, difficulty
□ mock_topic_accuracy: user_id, topic_id, total_questions, correct, accuracy, trend
  □ UNIQUE on (user_id, topic_id)
□ mock_subject_accuracy: user_id, subject_id, total/correct/accuracy, tests_count, trend
□ topic_keyword_mappings (for CSV fuzzy matching cache)
```

### Feedback Loop Checks (CRITICAL — this closes the intelligence loop)
```
□ After mock import: mock_accuracy is written to user_progress for affected topics
□ After mock import: confidence recalculation triggered (F5)
□ After mock import: health scores recalculated (F9)
□ Low subject accuracy (< 0.5): urgency boost +2 in daily planner
□ Low topic accuracy (< 0.3): added to false_security list in weakness radar
□ Low topic accuracy (< 0.3): immediate revision scheduled (overrides FSRS)
□ Score trend calculation: linear regression across last 5+ mocks
```

### API/UI Checks
```
□ POST /api/mocks — create mock (quick or detailed entry)
□ GET /api/mocks/analytics — score trends, subject accuracy, weakest topics
□ Mock entry: quick (just scores) + detailed (per question) + CSV import
□ Score trend chart: line over time with green/yellow/red zones
□ Subject accuracy grid: 16 tiles, colored by accuracy
□ Weakest topics alert with "Add to plan" CTA
```

---

## F14: PRELIMS/MAINS MODE TOGGLE

### DB Checks
```
□ mode_config table exists (seeded): mode, subject_id, is_active, importance_modifier, revision_ratio
  □ Prelims mode: Ethics/Internal Security/World History → is_active = false
  □ Prelims mode: Environment/Science/Art & Culture → importance_modifier = +1
  □ Prelims mode: revision_ratio = 0.70
□ user_profiles.current_mode: mains/prelims/post_prelims
```

### Behavior Checks
```
□ Switching to Prelims:
  □ Paused subjects are grayed out in syllabus map (NOT deleted)
  □ Daily planner filters out paused subjects
  □ Boosted subjects get importance +1
  □ Revision ratio shifts to 70/30
  □ Mock test slots appear (2/week)
□ Switching to Post-Prelims:
  □ Paused subjects reactivated
  □ Answer writing focus (if tracked)
□ Switching back to Mains: everything returns to normal
□ Velocity engine recalculates with reduced scope in Prelims mode
□ Weakness radar only shows active subjects
```

### API Checks
```
□ POST /api/mode/switch — changes mode, logs, regenerates plan
□ GET /api/mode/preview?mode=prelims — shows diff WITHOUT applying
```

---

## F15: "WHAT IF" SIMULATOR

### Algorithm Checks — ALL 5 Scenarios Must Work
```
□ Scenario 1: "Take N days off" (N = 1-14)
  □ Calculates: new effective days, new required velocity, new stress, buffer consumed
□ Scenario 2: "Change hours by X" (X = -3 to +3)
  □ Calculates: new daily capacity, new velocity ratio, new projected date
□ Scenario 3: "Drop importance ≤ N topics" (N = 1-3)
  □ Calculates: topics removed, gravity removed, new velocity, hours saved
□ Scenario 4: "Focus only on subject X for N days"
  □ Calculates: subject progress projection, other subjects' confidence decay
□ Scenario 5: "Exam postponed by N days" (N = 7-90)
  □ Calculates: new pace, new buffer, new stress

□ ALL scenarios are READ-ONLY (no data written)
□ Each returns: current metrics, simulated metrics, delta, verdict (green/yellow/red)
```

### API Check
```
□ POST /api/simulator/run — body: {scenario, params} — returns simulation_result
```

### UI Check
```
□ 5 scenario cards to choose from
□ Parameter input (slider/number) for each
□ Before/after comparison cards (color-coded)
□ Verdict banner: "Safe to take 5 days off 🟢"
```

---

## F16: CURRENT AFFAIRS TRACKER

### Checks
```
□ ca_daily_logs: user_id, log_date, hours_spent, completed, subject_ids[]
□ ca_streaks: current/best streak tracking
□ Daily toggle: "Did you read today?" Yes/No → log hours + subject tags
□ Subject distribution: pie chart of which subjects CA covers
□ Alert for undercovered subjects
□ Monthly heatmap: calendar grid (green=done, gray=missed)
□ Prelims mode: shows "Cover 12 months of CA. Done: X hrs of Y hrs"
```

---

## F17: GAMIFICATION LAYER

### Checks
```
□ Weekly Execution Score (WES) calculated from 4 components:
  □ plan_adherence (0.35), velocity_factor (0.25), revision_consistency (0.20), consistency_factor (0.20)
  □ Grades: 90-100=S, 80-89=A, 70-79=B, 60-69=C, <60=D
□ OR XP system from LLD — either approach is fine, but ONE must exist
□ 3 streak types tracked: study, revision, plan_completion
□ 15+ badge definitions seeded
□ Badge unlock conditions actually checked on relevant events
□ Badges fire exactly once (no duplicate unlocks)
□ Celebrations: haptic on plan complete, slide-up card on badge, no sound/confetti
□ UI is premium/dashboard aesthetic (NOT childish gamification)
□ WES or XP level visible on dashboard
□ Badge gallery in settings/profile (earned = color, locked = gray)
```

---

## F18: STRATEGIC BENCHMARK LAYER

### Current State Check (LLD has self-benchmark, prompts have peer benchmark)
```
For MVP (self-benchmark — what LLD implements):
□ Composite readiness score calculated from: coverage, confidence, weakness, consistency, velocity
□ Status: exam_ready / on_track / needs_work / at_risk
□ History tracked over time

For Phase 2 (peer benchmark — from prompts):
□ benchmark_cohorts table: exam_year, creation_month
□ benchmark_snapshots: aggregated percentiles (p25/p50/p75/p90)
□ Opt-in/opt-out mechanism
□ Minimum 20 users per cohort
□ "Successful aspirant" reference line (seeded even without users)
□ Percentile radar chart (6 axes)
□ Anti-toxic: never "bottom 10%", always paired with action
□ > 5 checks/day: "Focus on your plan today"

□ DECISION: Document clearly which version is built and which is deferred
```

---

## STRUCTURAL CHECKS (Cross-Cutting)

### Cron Jobs
```
□ Daily 2:00 AM: Confidence recalculation (F5 decay triggers)
□ Daily 2:15 AM: Health score recalculation (F9 weakness radar)
□ Daily 2:30 AM: Velocity snapshot + buffer transaction (F4)
□ Daily 2:45 AM: Burnout snapshot + BRI calculation (F11)
□ Daily 3:00 AM: Benchmark snapshot (F18)
□ Sunday 7:00 PM: Weekly review generation + push notification (F12)
□ Implementation: Supabase Edge Functions with pg_cron OR external scheduler
□ Each cron is idempotent (running twice doesn't double-count)
```

### Notification Events
```
□ Notification infrastructure exists (table or service)
□ These events generate notifications:
  □ Recalibration triggered (F10)
  □ Weekly review ready — Sunday (F12)
  □ Recovery mode suggestion — BRI high (F11)
  □ Topic decay alert — "3 topics decayed" (F5)
  □ Streak milestone — 7/14/30/100 days (F17)
  □ Badge unlocked (F17)
  □ Mock score improvement (F13)
```

### Supabase RLS Policies
```
□ Every table with user_id has RLS enabled
□ Policy: users can only SELECT/INSERT/UPDATE/DELETE their own rows
□ auth.uid() = user_id pattern on all policies
□ Seeded tables (strategy_mode_defaults, badges, mode_config) are read-only for all
```

### Data Cascade on Topic Completion
```
When a topic is marked "completed" (first_pass or higher):
□ user_progress updated
□ FSRS card created (if first time)
□ Velocity recalculated
□ Buffer transaction processed
□ Streak updated
□ Daily plan item marked complete
□ Gamification check (XP/badge)
□ Progress aggregation cascades up (chapter → subject → overall)
□ Health score will update on next cron
□ Confidence score will update on next cron

Verify: ALL of these actually happen in your completion handler (not just some).
```

---

## RUNNING THE AUDIT

### Step 1: DB Audit
```sql
-- Run in Supabase SQL editor
-- Lists all tables and their columns
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```
Compare output against every DB Check above.

### Step 2: API Audit
```bash
# Run against your backend
# Replace BASE_URL and TOKEN
for endpoint in \
  "GET /api/velocity" \
  "GET /api/buffer" \
  "GET /api/stress" \
  "GET /api/daily-plan" \
  "GET /api/weakness" \
  "GET /api/confidence/overview" \
  "GET /api/pyq-stats" \
  "GET /api/burnout" \
  "GET /api/weekly-review" \
  "GET /api/gamification" \
  "GET /api/benchmark" \
  "GET /api/mocks/analytics" \
  "GET /api/ca/stats"; do
  echo "--- $endpoint ---"
  curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL$endpoint" | jq 'keys'
done
```
Compare response keys against every API Check above.

### Step 3: Algorithm Audit
Paste each algorithm check section + your service code into Claude:
"Here is my velocity.service.ts. Does it satisfy every algorithm check in this list? Show me what's missing."

### Step 4: UI Audit
Walk through each screen on your device/simulator with the UI Checks open. Screenshot each screen and verify every element exists.
