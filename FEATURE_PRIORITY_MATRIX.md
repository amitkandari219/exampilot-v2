# ExamPilot V2 -- Feature Priority Matrix

> Extracted from 8-persona UX review. Every feature request, improvement, and gap catalogued and classified.

---

## Summary

| Tier | Count | Description |
|------|-------|-------------|
| Tier 1: Must-Have (Critical) | 15 | Ship before launch or risk abandonment |
| Tier 2: Essential (High Priority) | 24 | Needed within first 2-3 months |
| Tier 3: Low-Hanging Fruit | 12 | Small effort, big perception impact |
| Tier 4: Good-to-Have | 24 | Plan for v2.1-v2.3 |
| Tier 5: Not Must / Niche | 16 | Only if segment becomes priority |
| Tier 6: Overkill / Over-Engineering | 7 | Deprioritize or skip |
| **Total** | **98** | |

---

## Tier 1: Must-Have (Critical)

Without these, the app fails its core promise. Multiple personas flagged these. Ship before launch or risk user abandonment.

| # | Feature | Persona(s) | Effort | Justification |
|---|---------|------------|--------|---------------|
| 1 | **Reorder dashboard: Today's Plan and Velocity above the fold** | Beginner, WP, Burnout, Hindi-medium | S | 4+ personas flagged this as P0; actionable info buried below vanity metrics -- users close the app before reaching the planner |
| 2 | **Replace jargon with plain language labels** (Velocity -> "Padhai ki raftaar", Buffer Bank -> "Backup Days", FSRS -> "Smart revision", etc.) | Beginner, Hindi-medium, Low-discipline, Burnout | S | 4+ personas flagged jargon as P0; terms from data science and SRS research leaked into student-facing UI |
| 3 | **Add contextual tooltips / "What is this?" links for every metric** | Hindi-medium, Beginner | S | Dashboard comprehension scored 2/10 for Hindi-medium; zero explanatory text anywhere |
| 4 | **Fix "Stress Level" label inversion** (higher = calmer reads as "very stressed") | Burnout | S | Semantically inverted label causes opposite emotional reaction to what's intended |
| 5 | **Add days-remaining countdown on dashboard** | Burnout | S | days_remaining is calculated in velocity.ts but never rendered; for 90-day users this number IS the dashboard |
| 6 | **Emotional messaging layer for key states** (comeback after absence, post-bad-mock, recovery, light day) | Beginner, Low-discipline, Hindi-medium, Burnout | M | 4+ personas flagged this as P0; backend computes nuanced states but UI shows bare numbers with no human encouragement |
| 7 | **Cold restart detection: cap plan at 60% after 2+ missed days** | Low-discipline, WP | M | After 2 zero-days, fatigue is low so system generates full-capacity plan; psychologically devastating for returning users |
| 8 | **Fix fatigue formula for low-hour users** (replace hours3d/targetHours with hours3d/max(targetHours,6)) | WP, Burnout | M | WPs studying a sustainable 3 hrs/day get false fatigue alerts by Day 4; formula designed for full-time aspirants only |
| 9 | **Progressive disclosure: simplified dashboard for first 2 weeks** (show only Today's Plan, hide advanced metrics, reveal gradually) | Beginner, Hindi-medium | M | Beginner anxiety INCREASED after seeing dashboard (6/10 -> 9/10); app needs to hide complexity from new users |
| 10 | **Allow actual hours input on task completion** (replace auto-fill with quick input modal) | WP | S | Auto-fill with estimated hours creates 10-17% daily accuracy loss in velocity model; 2-second interaction per completion |
| 11 | **Hide internal algorithm parameters from user-facing Settings** (FSRS retention, fatigue threshold, buffer capacity) | Hindi-medium, Beginner | S | Students seeing persona parameters, FSRS settings, and burnout thresholds lose trust; expose only user-meaningful controls |
| 12 | **Fix HealthDetailSheet weight mismatch** (UI shows 40/25/20/15 vs actual backend 25/20/30/25) | Repeat | S | Factual inconsistency between frontend display and backend logic erodes trust for analytical users |
| 13 | **Streak freeze: allow 1 free miss per week** instead of binary reset | Low-discipline | M | Missing one day resets streak to 0; losing a streak at day 6 before the 7-day milestone is devastating and causes guilt spirals |
| 14 | **"What do I do on Day 1?" guided orientation** -- bridge onboarding to first 72 hours of concrete study steps | Beginner | M | Single biggest missing piece per beginner persona; app hands them a strategy mode and planner without walking through what the next 72 hours look like |
| 15 | **Previous attempt autopsy / onboarding intake** -- accept Prelims score, Mains marks, interview feedback to rebuild priorities around actual failure data | Repeat | M | Without ingesting past attempt data, every recommendation is generic; repeaters see through this immediately; the app has no memory of who they were |

---

## Tier 2: Essential (High Priority)

Strong need validated by 2+ personas. Not blocking launch but needed within first 2-3 months.

| # | Feature | Persona(s) | Effort | Justification |
|---|---------|------------|--------|---------------|
| 1 | **Priority visual encoding on plan items** (HIGH PRIORITY badge, urgency gradient based on priority_score) | Burnout, Topper | S | priority_score is calculated but never displayed; all plan items have equal visual weight despite wildly different importance |
| 2 | **"Post-Pre" label clarification** (rename to "After Prelims" or equivalent) | Beginner | S | First-timers have no idea what "Post-Pre" means in the exam mode toggle |
| 3 | **Mode-adaptive dashboard layout** (detect working_professional and reorder cards) | WP | M | WPs would ignore dashboard entirely and jump to planner tab; mode-aware layout solves this without separate UI |
| 4 | **Deep mock analysis: question-type breakdown, negative marking patterns, time-per-question** | Repeat, Topper, Coaching | L | Mock analysis returns 4 static template strings; a 74-scorer needs "You lose 8 marks in Polity from combined-article questions" |
| 5 | **Dynamic revision ratio that ramps toward exam date** (25% -> 35-45% in last 30 days) | Topper, Burnout | M | Static 25% revision ratio doesn't reflect the coverage-to-consolidation shift needed as exam approaches |
| 6 | **Proactive scope triage at low days-remaining** ("You have 90 days and 400 topics. At your pace, cover 270. Here are the 130 lowest-yield to defer.") | Burnout | M | Scope reduction is reactive only; system waits for user to fall behind before cutting, rather than proactively advising |
| 7 | **Answer writing framework / scaffolding** (structure templates per topic, intro-body-conclusion with UPSC conventions, practice prompts) | Repeat, Topper, Coaching, Beginner | L | Mains is where most aspirants fail; zero answer writing features; coaching scores 8/10 vs ExamPilot 0/10 on this dimension |
| 8 | **Peer benchmarking (anonymized cohort comparisons)** ("You're in top 30% of Prelims-phase users by coverage") | Coaching, Repeat, Beginner | L | Coaching's single biggest advantage (9/10 vs 1/10); aspirants have no calibration for whether their progress is competitive |
| 9 | **Resource guidance layer / curated resource stack per topic** (link syllabus nodes to standard books and sources) | Beginner | L | First-timers waste 3 months figuring out which books to read; planner tells WHEN to study but not WHAT to open |
| 10 | **Micro-session architecture** (tag tasks by duration: 5/15/30/60+ min, "I have 12 minutes" quick suggestions) | WP | L | Single highest-value missing feature for WP segment; they study in stolen moments but planner thinks in hour-blocks |
| 11 | **Improved mock data ingestion** (CSV import, image/OCR upload for coaching mock results) | Coaching | M | Analytical engine is excellent but data ingestion pipeline is the bottleneck; manual-only mock entry limits adoption |
| 12 | **"Returning after a break" re-entry flow** (reactivate without shame, acknowledge gap, provide gentle ramp-up) | WP, Low-discipline | M | Extended disengagement + shame about the gap makes restarting harder; no "welcome back" flow exists |
| 13 | **Hindi language support (at minimum for key UI labels)** | Hindi-medium | L | Entire app is English-only; signals "this app is not for people like me" to Hindi-medium users; 85-90% drop-off risk |
| 14 | **Reduce onboarding decision fatigue** (auto-set strategy instead of presenting 4 choices + 6 sliders) | Beginner | M | Strategy selection and 6 adjustable sliders transfer the app's uncertainty onto a user who doesn't know what reasonable values are |
| 15 | **Use fatigue_sensitivity persona parameter** (currently stored but never referenced in calculateFatigueScore) | Topper | S | Dead parameter -- stored in aggressive persona but fatigue calculation ignores it; easy fix, meaningful behavioral difference |
| 16 | **CSAT-specific handling** (exam modes exist but no CSAT-specific logic) | Repeat | M | System has exam modes but zero CSAT-specific features; Paper 2 is a distinct challenge many repeaters struggle with |
| 17 | **Marks-based weak zone mapping** (accept official UPSC scorecard, treat marks as ground truth over self-assessed confidence) | Repeat | L | If someone scored 68/250 in GS2, that's a structural gap, not a confidence issue; most credible signal available |
| 18 | **Selective revision mode for repeaters** (deprioritize historically strong topics, front-load weakest subject-paper combos) | Repeat | M | Uniform FSRS revision is counterproductive; repeaters need surgical revision of what actually failed them |
| 19 | **Strategy delta tracking** (track how this attempt's approach differs from last, make strategic evolution visible) | Repeat | M | Repeaters change something between attempts but can't articulate what changed or if it helped |
| 20 | **Mock test percentile calibration against cutoff** ("this puts you X marks above last year's cutoff") | Repeat, Coaching | M | Raw score tracking without competitive context is significantly less useful for someone with a known benchmark to beat |
| 21 | **Inverse confidence testing** (challenge 90%+ topics with hard PYQs; plummet FSRS confidence if failed) | Repeat | M | Attacks "Illusion of Knowledge" -- the repeater's biggest risk; passive recognition ≠ exam readiness |
| 22 | **"Mains Delta" layer** (per-topic: 20-word definition + Committee/Judgment + Data Point to upgrade from "Completed" to "Mains-Ready") | Repeat | L | Repeaters keep reading Prelims facts instead of deepening Mains value-addition; no mechanism to track enrichment depth |
| 23 | **Silent quit detection** (early warning when session frequency drops 60%+ over 18 days, login gaps increase) | Repeat+WP | M | Unique failure mode of compound persona; they don't quit dramatically, they gradually disengage until psychologically gone |
| 24 | **"Last Attempt" mode** (shift entire app: max score-improvement-per-hour, less gamification, more signal, acknowledge weight) | Repeat+WP | M | Final attempt users need ruthless clarity, not badges; emotional register of app should change |

---

## Tier 3: Low-Hanging Fruit

Small effort, big impact. Can be done in 1-2 days. Quick wins that improve perception immediately.

| # | Feature | Persona(s) | Effort | Justification |
|---|---------|------------|--------|---------------|
| 1 | **Rename "DEBT" in Buffer Bank to neutral language** ("Behind schedule" or "X din peeche") | Low-discipline, Hindi-medium | S | "DEBT" carries financial shame connotation; already-behind users feel they owe something |
| 2 | **Rename DECAY plan item type to "REVISE" / "DOHRA LO"** | Hindi-medium, Beginner | S | "DECAY" sounds alarming and technical; "Revise" communicates the same thing without anxiety |
| 3 | **Rename STRETCH plan item type to "BONUS"** | Hindi-medium, Beginner | S | "STRETCH" is gym jargon; "Bonus" frames extra work as opportunity, not obligation |
| 4 | **Spell out XP/Lv as "Points"/"Level" in UI** | Hindi-medium | S | Gaming abbreviations meaningless to non-gamers; trivial text change |
| 5 | **Remove "FSRS-powered" from onboarding value proposition** (replace with "Smart revision schedule") | Beginner, Hindi-medium | S | "FSRS" makes first-timers feel stupid; no YouTube topper or coaching institute uses this term |
| 6 | **Remove advertising copy from UI** ("Optimized for peak performance" and similar) | Hindi-medium | S | Empty marketing language undermines trust; remove or replace with specific benefit statements |
| 7 | **Add "why this topic today?" one-line explanation on plan items** | Beginner | S | Planner is a black box; simple explanation like "High PYQ frequency + last reviewed 12 days ago" builds trust |
| 8 | **Rename Conservative/Aggressive to friendlier labels** ("Slow & Steady" / "Fast Track") | Hindi-medium, Beginner | S | Military terminology feels intimidating; friendlier labels reduce strategy selection anxiety |
| 9 | **Rename recall rating options** (Again/Hard/Good/Easy -> "Don't remember / Barely remember / Remember well / Easy recall") | Hindi-medium, Beginner | S | SRS-specific terminology meaningless to users unfamiliar with Anki-style tools |
| 10 | **Show % coverage of high-PYQ topics on dashboard** ("65% of high-PYQ topics covered") | Burnout | S | More actionable than generic completion percentage; directly answers "am I covering what matters?" |
| 11 | **Add RecoveryBanner-style messaging to light days** (not just recovery mode) | Low-discipline | S | RecoveryBanner is the best-received emotional feature; extend same pattern to all reduced-load states |
| 12 | **Replace "Plan Adherence" with "Plan follow kiya" / "How well you followed your plan"** | Hindi-medium | S | Technical term for a simple concept; one label change, immediate comprehension gain |

---

## Tier 4: Good-to-Have

Nice features that add value but users won't churn without them. Plan for v2.1-v2.3.

| # | Feature | Persona(s) | Effort | Justification |
|---|---------|------------|--------|---------------|
| 1 | **Energy-aware scheduling** (tag topics by cognitive load; post-work = lighter tasks, weekends = deep intake) | WP | M | Genuine insight but requires new data model for cognitive load tagging across entire syllabus |
| 2 | **Book-to-topic bridge** (log progress by chapters of standard books, auto-update syllabus completion) | Beginner | M | "60% of Laxmikanth" is more motivating than "12% of GS2" but requires curated book-to-syllabus mapping |
| 3 | **Micro-mock trigger after topic completion** (5-question PYQ quiz when marking a sub-topic complete) | Beginner, Topper | M | Shatters illusion of competence early; builds real confidence instead of self-reported confidence |
| 4 | **Weekend-heavy plan templates** (front-load harder topics on weekends, weekdays for reinforcement) | WP | M | Weekends carry 60-70% of WP study load; current weekend boost is a start but not template-level planning |
| 5 | **PYQ correlation analysis** ("12 questions in last 5 years came from topics you score below 40% in") | Repeat, Topper | M | Directly connects weakness data to exam risk; high analytical value for serious aspirants |
| 6 | **Benchmark calibration against actual UPSC outcomes** (what does "65" mean in terms of real results?) | Repeat, Topper | L | Current benchmark is a process metric, not an outcome predictor; needs historical data to calibrate |
| 7 | **Calendar integration** (Google/Outlook sync for blocked days, revision reminders alongside meetings) | WP | L | Auto-recalibration is flying blind without knowing WHY someone fell behind; calendar context would help |
| 8 | **Focus mode / "The Blinder"** (UI toggle hiding 90% of untouched syllabus, show only current 2-3 weeks) | Beginner | M | Addresses paralysis from seeing entire syllabus; deliberate cognitive load reduction |
| 9 | **Contextual glossary / concept bank** (wiki-style definitions of UPSC terms tied to syllabus topics) | Beginner | M | First-timers hit jargon walls constantly; contextual definitions reduce dropout during early months |
| 10 | **Triage mode for returning after work crisis** (hide low-gravity topics, focus only on high-weightage PYQs) | WP | M | More sophisticated than cold-restart detection; specifically designed for professional crisis recovery |
| 11 | **Urgency signal improvement: topic-level not just subject-level** | Topper | M | If 90% of Polity is done but remaining 10% is Articles 19-21 (most asked), urgency signal is near zero |
| 12 | **Active recall prompts instead of self-reported confidence** (3 rapid-fire questions to test confidence) | Beginner, Topper | M | Self-reported confidence is unreliable; even brief quizzes provide more accurate signal |
| 13 | **Paper 1 vs Paper 2 separate mock analysis** | Repeat | M | No distinction in mock analysis between GS papers; repeaters need granular per-paper diagnostics |
| 14 | **Recalibration cooldown reduction for final sprint** (3-day cooldown may be too slow for last 30 days) | Burnout | S | Small parameter change but needs careful testing; final sprint requires faster adaptation cycles |
| 15 | **Widen recalibration drift limits for repeaters** (10% max deviation too tight for course correction) | Repeat | S |
| 16 | **Diminishing returns detection** ("40 hours on Polity, confidence 90 -- this is now low-ROI time") | Repeat, Topper | M | Repeaters over-prepare strong areas; no signal when additional effort stops translating into score improvement |
| 17 | **Answer writing quality tracking** (self-assessment rubric: structure, intro, examples, conclusion, word economy) | Repeat | M | Repeaters know they need to write answers but don't know WHY their answers aren't scoring; quality not just quantity |
| 18 | **Examiner psychology layer** (high-scoring answer pattern library per GS paper) | Repeat | L | What UPSC rewards is tacit knowledge; PYQ captures frequency but not HOW questions are answered well |
| 19 | **PYQ Option Analysis Mode** (study why the other 3 options were wrong, not just the right answer) | Repeat | M | Repeaters need elimination skill, not just recall; transforms PYQ from answer-checking to deep learning |
| 20 | **Trend-Volatility Index for PYQ Intelligence** (high gravity + high volatility = cap hours, redirect to stable high-gravity topics) | Repeat, Topper | M | UPSC topic patterns are volatile; forward-looking strategy vs backward-looking frequency counting |
| 21 | **Subject Swap on stress** (when high stress + low velocity detected, suggest novelty pivot to break monotony) | Repeat | S | Novelty resets cognitive fatigue in ways rest alone cannot; addresses May/June anxiety specifically |
| 22 | **Maintenance mode per topic** (lower-intensity, higher-frequency micro-touches for already-learned content vs deep-work for improvement areas) | Repeat+WP | M | 20 min maintenance vs 2 hr re-study is everything at 3 hrs/day; current system treats all topics as same depth |
| 23 | **Honest readiness ceiling estimation** ("given your hours, schedule, history, months remaining, here's your realistic max readiness") | Repeat+WP | L | Working professional repeaters deserve to know if the math works before spending another year finding out |
| 24 | **Work-pressure signal in Stress Thermometer** (5th composite input for job cognitive load, not just study-pattern signals) | Repeat+WP | M | A brutal work quarter degrades retention quality even during study hours; current stress model is blind to this |

---

## Tier 5: Not Must / Niche

Only relevant to a specific sub-segment. Build only if that segment becomes a priority.

| # | Feature | Persona(s) | Effort | Justification |
|---|---------|------------|--------|---------------|
| 1 | **Commute mode** (audio-friendly content suggestions, concept recall prompts for hands-busy contexts) | WP | L | Only relevant to commuting professionals; requires content format beyond current text-based system |
| 2 | **Audio-first integration** (convert CA summaries and weakness reports to AI-generated audio briefs) | WP | L | High-value for commuters but technically complex and only serves one sub-segment |
| 3 | **Leave planning optimizer** ("I have 8 days leave in April, how should I deploy them for maximum impact?") | WP | M | Niche feature for professionals strategically deploying leave before exams |
| 4 | **Quit-or-stay decision modeling** ("If I quit in 3 months, here's my readiness trajectory vs. continuing part-time") | WP | M | Significant subset making this decision but highly niche scenario modeling |
| 5 | **Workplace current affairs credit** (log "engaged with this topic through work" for CA preparation) | WP | S | Missed opportunity for professionals but very narrow use case |
| 6 | **Peer-review micro-community** (upload handwritten answer photo, get AI or peer 3-point critique) | Beginner, Repeat | XL | Community features are an entirely different product surface; high moderation overhead |
| 7 | **"Big Picture" video hub** (5-min primers per GS paper explaining why the subject is in the syllabus) | Beginner | L | Content creation / curation challenge more than a product feature; could link to external resources instead |
| 8 | **Offline cache for daily targets and PYQs** (for low-connectivity contexts) | WP (commuter sub-type) | M | Only relevant for subway/rural commuters; adds significant sync complexity |
| 9 | **Resume-point marker / deep link** (opens exact sub-topic where user left off) | WP (parent sub-type) | S | Nice for interrupted sessions but narrow use case |
| 10 | **Executive dashboard** (bird's-eye ROI view: time spent vs marks expected) | WP (senior exec sub-type) | M | Very small sub-segment; interesting but low user count |
| 11 | **Psychological baggage check-ins for repeaters** (surface sunk cost pressure, family expectations, identity crisis with reframing prompts) | Repeat | M | Stress Thermometer measures study-pattern stress, not deeper psychological weight that dominates repeater's inner life |
| 12 | **Interview stage preparation awareness** (DAF narrative, personality development, optional grounding) | Repeat | L | Non-trivial number of 3rd-attempt aspirants failed at Personality Test; zero acknowledgment interview exists as prep domain |
| 13 | **Attempt budget consciousness in What-If Simulator** (model attempt-limit constraints in scenario projections) | Repeat | M | 3rd-attempt general category has 3 attempts left; creates different risk calculus the simulator currently ignores |
| 14 | **"Should I Continue?" decision framework** (structured cost-benefit modelling: readiness trajectory vs attempt budget vs opportunity cost) | Repeat+WP | L | The elephant in the room; no app touches this; done with honesty, it creates deep loyalty |
| 15 | **Compounded failure pattern recognition** (track work interference patterns + downstream prep damage across attempts) | Repeat+WP | L | "Weak in GS3 because Feb work deadlines always collapse revision" -- root cause analysis, not symptom fixing |
| 16 | **Two-speed weekly architecture** (explicit weekday=retrieval/maintenance, weekend=deep work/answer writing, with honesty when math doesn't work) | Repeat+WP | M | More extreme split than regular WPs; weekend-only deep work creates retention gaps |

---

## Tier 6: Overkill / Over-Engineering

Sounds impressive but adds complexity without proportional value. Deprioritize or skip entirely.

| # | Feature | Persona(s) | Effort | Justification |
|---|---------|------------|--------|---------------|
| 1 | **Coaching API integration** (direct data feed from Vision IAS, Forum IAS, etc.) | Coaching | XL | Coaching institutes have zero incentive to share data; API access unlikely; manual entry + CSV import covers 90% of need |
| 2 | **Quiet hours / auto-silence notifications during work hours** | WP | M | Phone-level Do Not Disturb already exists; app-level implementation adds complexity for negligible value |
| 3 | **Difficulty-adjusted mock accuracy** (normalizing scores by question difficulty) | Repeat, Topper | L | Requires question-level difficulty metadata that doesn't exist in current data model; marginal analytical improvement |
| 4 | **Static vs Dynamic topic toggle** (distinguish what stays the same vs what changes yearly) | Beginner | M | Interesting pedagogical concept but adds UI complexity; syllabus structure already implies this distinction |
| 5 | **Cutoff trajectory comparison** (plot user's mock trend against historical UPSC cutoffs) | Repeat | L | Historical cutoffs are publicly available but noisy; false precision creates more anxiety than clarity |
| 6 | **Topper comparison in mock analysis** (compare section-wise performance to top scorers) | Coaching | L | Requires topper data that the app doesn't have; coaching institutes own this data exclusively |
| 7 | **FSRS backlog cap / burndown logic** (prevent 200-card review backlog after missed days) | WP | M | Cold restart detection (Tier 1) solves the root cause more elegantly; backlog cap is a band-aid |

---

## Priority Implementation Roadmap

Sequences Tier 1 and Tier 2 items into sprints based on dependencies and effort.

### Sprint 1 (Week 1-2): Foundation -- Stop the Bleeding

Focus: Fix the issues that make users close the app on Day 1. All S-effort items from Tier 1 + critical Tier 3 renames.

| Day | Items | Effort |
|-----|-------|--------|
| 1 | Reorder dashboard: Today's Plan and Velocity above the fold | S |
| 1 | Add days-remaining countdown on dashboard | S |
| 1 | Fix "Stress Level" label inversion | S |
| 2 | Replace jargon with plain language labels (full label pass) | S |
| 2 | Rename DEBT/DECAY/STRETCH to neutral terms | S |
| 2 | Remove "FSRS-powered" from onboarding, rename Conservative/Aggressive | S |
| 3 | Add contextual tooltips / "What is this?" for every metric | S |
| 3 | Hide internal algorithm parameters from Settings | S |
| 4 | Fix HealthDetailSheet weight mismatch (UI vs backend) | S |
| 4 | Allow actual hours input on task completion | S |
| 5 | Priority visual encoding on plan items (urgency badges) | S |
| 5 | Rename "Post-Pre" label, spell out XP/Lv, rename recall ratings | S |
| 6 | Add "why this topic today?" one-line explanation on plan items | S |
| 6 | Show % coverage of high-PYQ topics on dashboard | S |
| 7 | Use fatigue_sensitivity persona parameter (currently dead code) | S |
| 7 | Add RecoveryBanner-style messaging to light days | S |
| 8-10 | Fix fatigue formula for low-hour users | M |

**Sprint 1 Deliverable:** Dashboard is comprehensible, plan items are meaningful, language is human, fatigue works for all users.

> **Note:** Previous Attempt Autopsy (Tier 1 #15) is Sprint 2 — requires onboarding flow redesign.

---

### Sprint 2 (Week 3-4): Emotional Intelligence + Behavioral Fixes

Focus: Make the app feel like it understands the user. Address behavioral gaps that cause churn.

| Day | Items | Effort |
|-----|-------|--------|
| 1-3 | Emotional messaging layer (comeback, post-mock, recovery, light day messages) | M |
| 3-4 | Cold restart detection: cap plan at 60% after 2+ missed days | M |
| 4-5 | Streak freeze: allow 1 free miss per week | M |
| 5-7 | "What do I do on Day 1?" guided orientation for first-timers | M |
| 7-8 | Progressive disclosure: simplified dashboard for first 2 weeks | M |
| 8-9 | Reduce onboarding decision fatigue (auto-set strategy, fewer sliders) | M |
| 9-10 | "Returning after a break" re-entry flow | M |
| 10 | Previous attempt autopsy / onboarding intake for repeaters | M |

**Sprint 2 Deliverable:** App speaks to users emotionally, handles absence gracefully, onboards beginners without overwhelming them, and repeaters get a personalized starting point.

---

### Sprint 3 (Week 5-8): Depth + Differentiation

Focus: Build the features that make ExamPilot categorically better than alternatives. Tier 2 L-effort items.

| Week | Items | Effort |
|------|-------|--------|
| 5 | Mode-adaptive dashboard layout (WP-specific card ordering) | M |
| 5 | Dynamic revision ratio that ramps toward exam date | M |
| 5 | Proactive scope triage at low days-remaining | M |
| 5 | CSAT-specific handling | M |
| 5 | Improved mock data ingestion (CSV import) | M |
| 6-7 | Deep mock analysis: question-type breakdown, negative marking, time analysis | L |
| 7-8 | Answer writing framework / scaffolding | L |
| 7-8 | Resource guidance layer / curated resource stack per topic | L |
| 8 | Peer benchmarking (anonymized cohort comparisons) | L |
| 8 | Micro-session architecture (duration-tagged tasks) | L |
| 8 | Hindi language support (key UI labels) | L |
| 5 | Selective revision mode for repeaters | M |
| 5 | Strategy delta tracking (this attempt vs last) | M |
| 6 | Marks-based weak zone mapping (official scorecard import) | L |
| 8 | Mock test percentile calibration against cutoff | M |

**Sprint 3 Deliverable:** Mock analysis is diagnostic-grade, answer writing exists, WPs get micro-sessions, repeaters get personalized weak zone mapping and selective revision, Hindi-medium users can navigate core flows.

---

### Post-Sprint 3: Tier 4 Prioritization

After Sprint 3, re-evaluate based on user data. Recommended next batch (v2.1):
1. Focus mode / "The Blinder" (M)
2. Micro-mock trigger after topic completion (M)
3. Energy-aware scheduling (M)
4. Book-to-topic bridge (M)
5. PYQ correlation analysis (M)

---

## Key Insight

The pattern across all 8 personas is consistent: **the engine is excellent, the interface is not.** The highest-ROI work is not building new algorithms -- it is translating existing computational intelligence into language, layout, and emotional design that scared, tired, confused aspirants can actually absorb. Sprint 1 and Sprint 2 (pure UX and messaging) will move trust scores more than any new algorithm could.
