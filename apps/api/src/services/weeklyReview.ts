import { supabase } from '../lib/supabase.js';
import type { WeeklyReviewSummary, SubjectCoverage } from '../types/index.js';
import { toDateString } from '../utils/dateUtils.js';
import { WEEKLY_REVIEW } from '../constants/thresholds.js';

// Typed interfaces for Supabase join results
interface StrategyParams {
  daily_new_topics?: number;
  revision_frequency?: number;
  [key: string]: unknown;
}
interface UserProfileRow {
  strategy_params: StrategyParams | null;
  daily_hours: number | null;
}
interface PlanWithItems {
  id: string;
  daily_plan_items: Array<{ id: string; type: string; status: string }>;
}
interface PlanItemWithSubject {
  topics: { id: string; chapters: { subject_id: string } } | null;
}
interface ProgressWithSubject {
  topic_id: string;
  last_touched: string | null;
  topics: { chapters: { subject_id: string } } | null;
}

// --- Week Boundary Helpers ---

function getMostRecentSunday(from?: string): Date {
  const d = from ? new Date(from + 'T00:00:00Z') : new Date();
  const day = d.getUTCDay(); // 0=Sun
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  return toDateString(d);
}

function addDerived(row: any): WeeklyReviewSummary {
  return {
    ...row,
    highlights: row.highlights || [],
    confidence_distribution: row.confidence_distribution || {},
    avg_confidence: row.avg_confidence || 0,
    weakness_distribution: row.weakness_distribution || {},
    badges_unlocked: row.badges_unlocked || [],
    xp_earned: row.xp_earned || 0,
    level_start: row.level_start || 1,
    level_end: row.level_end || 1,
    benchmark_score_start: row.benchmark_score_start ?? null,
    benchmark_score_end: row.benchmark_score_end ?? null,
    benchmark_status: row.benchmark_status ?? null,
    benchmark_trend: row.benchmark_trend ?? null,
    completion_pct_change: (row.completion_pct_end || 0) - (row.completion_pct_start || 0),
    buffer_balance_change: (row.buffer_balance_end || 0) - (row.buffer_balance_start || 0),
    // New enriched fields — safe defaults for cached rows that pre-date enrichment
    hours_target: row.hours_target || 0,
    topics_target: row.topics_target || 0,
    gravity_target: row.gravity_target || 0,
    peak_bri: row.peak_bri || 0,
    subject_coverage: row.subject_coverage || { touched: [], untouched: [], untouched_over_14d: [] },
    wins: row.wins || [],
    areas_to_improve: row.areas_to_improve || [],
    next_week_recommendations: row.next_week_recommendations || [],
  };
}

// --- Main Functions ---

export async function getWeeklyReview(userId: string, weekEnd?: string): Promise<WeeklyReviewSummary> {
  const weekEndDate = getMostRecentSunday(weekEnd);
  const weekEndStr = toDateStr(weekEndDate);

  // Check if this is the current (in-progress) week
  const todaySunday = getMostRecentSunday();
  const isCurrentWeek = weekEndStr === toDateStr(todaySunday);

  // Try cached
  const { data: cached } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('week_end_date', weekEndStr)
    .single();

  // Return cached if past week; regenerate if current week
  if (cached && !isCurrentWeek) {
    return addDerived(cached);
  }

  return generateWeeklyReview(userId, weekEnd);
}

export async function getWeeklyReviewHistory(userId: string, limit = 8): Promise<WeeklyReviewSummary[]> {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('week_end_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(addDerived);
}

export async function generateWeeklyReview(userId: string, weekEnd?: string): Promise<WeeklyReviewSummary> {
  const weekEndDate = getMostRecentSunday(weekEnd);
  const weekStartDate = new Date(weekEndDate);
  weekStartDate.setUTCDate(weekStartDate.getUTCDate() - 6);

  const weekEndStr = toDateStr(weekEndDate);
  const weekStartStr = toDateStr(weekStartDate);

  // Aggregate data in parallel
  const [
    dailyLogs,
    velocitySnapshots,
    burnoutSnapshots,
    planData,
    weaknessFirst,
    weaknessLast,
    bufferTx,
    confidenceDist,
    streakData,
    xpData,
    badgesData,
    strategyProfile,
    allSubjects,
    subjectConfidence,
    planItemsWithSubjects,
    userProgressLastTouched,
  ] = await Promise.all([
    // daily_logs
    supabase
      .from('daily_logs')
      .select('hours_studied, topics_completed, gravity_completed, subjects_touched')
      .eq('user_id', userId)
      .gte('log_date', weekStartStr)
      .lte('log_date', weekEndStr),

    // velocity_snapshots
    supabase
      .from('velocity_snapshots')
      .select('velocity_ratio, trend, weighted_completion_pct, stress_score, required_velocity')
      .eq('user_id', userId)
      .gte('snapshot_date', weekStartStr)
      .lte('snapshot_date', weekEndStr)
      .order('snapshot_date', { ascending: true }),

    // burnout_snapshots
    supabase
      .from('burnout_snapshots')
      .select('bri_score, fatigue_score, in_recovery')
      .eq('user_id', userId)
      .gte('snapshot_date', weekStartStr)
      .lte('snapshot_date', weekEndStr)
      .order('snapshot_date', { ascending: true }),

    // daily_plans + items
    supabase
      .from('daily_plans')
      .select('id, daily_plan_items(id, type, status)')
      .eq('user_id', userId)
      .gte('plan_date', weekStartStr)
      .lte('plan_date', weekEndStr),

    // weakness_snapshots — earliest day in range
    supabase
      .from('weakness_snapshots')
      .select('category')
      .eq('user_id', userId)
      .eq('snapshot_date', weekStartStr),

    // weakness_snapshots — latest day in range
    supabase
      .from('weakness_snapshots')
      .select('category')
      .eq('user_id', userId)
      .eq('snapshot_date', weekEndStr),

    // buffer_transactions
    supabase
      .from('buffer_transactions')
      .select('type, amount, balance_after, transaction_date')
      .eq('user_id', userId)
      .gte('transaction_date', weekStartStr)
      .lte('transaction_date', weekEndStr)
      .order('transaction_date', { ascending: true }),

    // user_progress — current confidence
    supabase
      .from('user_progress')
      .select('confidence_status')
      .eq('user_id', userId)
      .gt('confidence_score', 0),

    // streaks
    supabase
      .from('streaks')
      .select('current_count, best_count')
      .eq('user_id', userId)
      .eq('streak_type', 'study')
      .single(),

    // xp_transactions — sum XP earned this week
    supabase
      .from('xp_transactions')
      .select('xp_amount')
      .eq('user_id', userId)
      .gte('created_at', weekStartStr)
      .lte('created_at', weekEndStr + 'T23:59:59Z'),

    // user_badges — badges unlocked this week
    supabase
      .from('user_badges')
      .select('badge_slug, badge_definitions(name, icon_name)')
      .eq('user_id', userId)
      .gte('unlocked_at', weekStartStr)
      .lte('unlocked_at', weekEndStr + 'T23:59:59Z'),

    // user_profiles — strategy_params + daily_hours for targets
    supabase
      .from('user_profiles')
      .select('strategy_params, daily_hours')
      .eq('id', userId)
      .single(),

    // all subjects — for untouched calculation
    supabase
      .from('subjects')
      .select('id, name')
      .order('display_order', { ascending: true }),

    // subject_confidence_cache — for low-confidence subject recommendations
    supabase
      .from('subject_confidence_cache')
      .select('subject_id, avg_confidence')
      .eq('user_id', userId),

    // daily_plan_items this week joined to topics→chapters→subjects
    // to determine which subjects were actually touched in plan items
    // Supabase query builder subquery type not compatible with .in() filter type
    supabase
      .from('daily_plan_items')
      .select('topics(id, chapters(subject_id))')
      .in(
        'plan_id',
        supabase
          .from('daily_plans')
          .select('id')
          .eq('user_id', userId)
          .gte('plan_date', weekStartStr)
          .lte('plan_date', weekEndStr) as unknown as string[]
      ),

    // user_progress — last_touched per topic (for 14-day untouched detection)
    supabase
      .from('user_progress')
      .select('topic_id, last_touched, topics(chapters(subject_id))')
      .eq('user_id', userId)
      .gt('confidence_score', 0),
  ]);

  // --- Compute Study Metrics ---
  const logs = dailyLogs.data || [];
  const daysActive = logs.length;
  const total_hours = logs.reduce((s: number, r: any) => s + (r.hours_studied || 0), 0);
  const topics_completed = logs.reduce((s: number, r: any) => s + (r.topics_completed || 0), 0);
  const gravity_completed = logs.reduce((s: number, r: any) => s + (r.gravity_completed || 0), 0);
  const avg_hours_per_day = daysActive > 0 ? Math.round((total_hours / WEEKLY_REVIEW.DAYS_IN_WEEK) * 10) / 10 : 0;
  const subjectSet = new Set<number>();
  logs.forEach((r: any) => { if (r.subjects_touched) subjectSet.add(r.subjects_touched); });
  const subjects_touched = logs.reduce((max: number, r: any) => Math.max(max, r.subjects_touched || 0), 0);

  // --- Velocity ---
  const vRows = velocitySnapshots.data || [];
  const avg_velocity_ratio = vRows.length > 0
    ? Math.round((vRows.reduce((s: number, r: any) => s + (r.velocity_ratio || 0), 0) / vRows.length) * 100) / 100
    : 0;
  const velocity_trend = vRows.length > 0 ? vRows[vRows.length - 1].trend : null;
  const completion_pct_start = vRows.length > 0 ? vRows[0].weighted_completion_pct || 0 : 0;
  const completion_pct_end = vRows.length > 0 ? vRows[vRows.length - 1].weighted_completion_pct || 0 : 0;
  const avg_stress = vRows.length > 0
    ? Math.round(vRows.reduce((s: number, r: any) => s + (r.stress_score || 0), 0) / vRows.length)
    : 0;

  // --- Targets ---
  const profileData = strategyProfile.data as UserProfileRow | null;
  const strategyParams: StrategyParams = profileData?.strategy_params || {};
  const daily_new_topics_param: number = strategyParams.daily_new_topics || 0;
  const topics_target = daily_new_topics_param * WEEKLY_REVIEW.DAYS_IN_WEEK;
  const daily_hours_target: number = profileData?.daily_hours || 0;
  const hours_target = Math.round(daily_hours_target * WEEKLY_REVIEW.DAYS_IN_WEEK * 10) / 10;
  // gravity_target = avg required_velocity over the week × 7
  const avg_required_velocity = vRows.length > 0
    ? vRows.reduce((s: number, r: any) => s + (r.required_velocity || 0), 0) / vRows.length
    : 0;
  const gravity_target = Math.round(avg_required_velocity * WEEKLY_REVIEW.DAYS_IN_WEEK * 100) / 100;

  // --- Burnout ---
  const bRows = burnoutSnapshots.data || [];
  const avg_bri = bRows.length > 0
    ? Math.round(bRows.reduce((s: number, r: any) => s + (r.bri_score || 0), 0) / bRows.length)
    : 0;
  const peak_bri = bRows.length > 0
    ? Math.max(...bRows.map((r: any) => r.bri_score || 0))
    : 0;
  const fatigue_first = bRows.length > 0 ? bRows[0].fatigue_score || 0 : 0;
  const fatigue_last = bRows.length > 0 ? bRows[bRows.length - 1].fatigue_score || 0 : 0;
  const fatigue_trend = fatigue_last > fatigue_first + WEEKLY_REVIEW.FATIGUE_TREND_DELTA ? 'worsening' : fatigue_last < fatigue_first - WEEKLY_REVIEW.FATIGUE_TREND_DELTA ? 'improving' : 'stable';
  const recovery_days = bRows.filter((r: any) => r.in_recovery).length;

  // --- Planner ---
  const plans = (planData.data || []) as PlanWithItems[];
  let plan_total_items = 0;
  let plan_completed_items = 0;
  let plan_new_count = 0;
  let plan_revision_count = 0;
  for (const plan of plans) {
    const items = plan.daily_plan_items || [];
    for (const item of items) {
      plan_total_items++;
      if (item.status === 'completed') plan_completed_items++;
      if (item.type === 'new') plan_new_count++;
      if (item.type === 'revision' || item.type === 'decay_revision') plan_revision_count++;
    }
  }
  const plan_completion_rate = plan_total_items > 0
    ? Math.round((plan_completed_items / plan_total_items) * 100)
    : 0;

  // --- Weakness ---
  const wFirst = weaknessFirst.data || [];
  const wLast = weaknessLast.data || [];
  const countByCategory = (rows: any[]) => {
    const counts: Record<string, number> = { critical: 0, weak: 0, moderate: 0, strong: 0, exam_ready: 0 };
    for (const r of rows) { counts[r.category] = (counts[r.category] || 0) + 1; }
    return counts;
  };
  const weakness_distribution = countByCategory(wLast);
  const wFirstCounts = countByCategory(wFirst);
  const critical_count_change = (weakness_distribution.critical || 0) - (wFirstCounts.critical || 0);
  const weak_count_change = (weakness_distribution.weak || 0) - (wFirstCounts.weak || 0);

  // --- Topics improved/decayed ---
  // Approximation from confidence distribution
  const cRows = confidenceDist.data || [];
  const confDist: Record<string, number> = { fresh: 0, fading: 0, stale: 0, decayed: 0 };
  for (const r of cRows) { confDist[r.confidence_status] = (confDist[r.confidence_status] || 0) + 1; }
  const topics_improved = confDist.fresh || 0;
  const topics_decayed = (confDist.stale || 0) + (confDist.decayed || 0);

  // Compute avg_confidence from subject_confidence_cache
  const avgConfValues = (subjectConfidence.data || []).filter((r: any) => r.avg_confidence > 0);
  const avg_confidence = avgConfValues.length > 0
    ? Math.round(avgConfValues.reduce((s: number, r: any) => s + r.avg_confidence, 0) / avgConfValues.length)
    : 0;

  // --- Buffer ---
  const bTx = bufferTx.data || [];
  const buffer_balance_start = bTx.length > 0 ? (bTx[0].balance_after || 0) - (bTx[0].amount || 0) : 0;
  const buffer_balance_end = bTx.length > 0 ? bTx[bTx.length - 1].balance_after || 0 : 0;
  const zero_day_count = bTx.filter((r: any) => r.type === 'zero_day_penalty').length;

  // --- Subject Coverage ---
  const allSubjectRows = allSubjects.data || [];
  // Build a set of subject_ids touched via daily_plan_items this week
  const touchedSubjectIds = new Set<string>();
  for (const item of (planItemsWithSubjects.data || []) as unknown as PlanItemWithSubject[]) {
    const subjectId = item.topics?.chapters?.subject_id;
    if (subjectId) touchedSubjectIds.add(subjectId);
  }
  // Build a map of subject_id → days since last touch (from user_progress)
  const subjectLastTouchedMap: Record<string, Date | null> = {};
  for (const row of (userProgressLastTouched.data || []) as unknown as ProgressWithSubject[]) {
    const subjectId = row.topics?.chapters?.subject_id;
    if (!subjectId) continue;
    const lastTouched = row.last_touched ? new Date(row.last_touched) : null;
    const existing = subjectLastTouchedMap[subjectId];
    // Keep the most recent last_touched date per subject
    if (lastTouched && (!existing || lastTouched > existing)) {
      subjectLastTouchedMap[subjectId] = lastTouched;
    } else if (!existing) {
      subjectLastTouchedMap[subjectId] = null;
    }
  }
  const weekEndMs = weekEndDate.getTime();
  const ms14Days = WEEKLY_REVIEW.UNTOUCHED_DAYS * 24 * 60 * 60 * 1000;
  const touchedSubjectNames: string[] = [];
  const untouchedSubjectNames: string[] = [];
  const untouchedOver14dNames: string[] = [];
  for (const subject of allSubjectRows) {
    if (touchedSubjectIds.has(subject.id)) {
      touchedSubjectNames.push(subject.name);
    } else {
      untouchedSubjectNames.push(subject.name);
      const lastTouched = subjectLastTouchedMap[subject.id];
      // Untouched over 14d: either never touched, or last touch was > 14 days before week end
      if (!lastTouched || (weekEndMs - lastTouched.getTime()) > ms14Days) {
        untouchedOver14dNames.push(subject.name);
      }
    }
  }
  const subject_coverage: SubjectCoverage = {
    touched: touchedSubjectNames,
    untouched: untouchedSubjectNames,
    untouched_over_14d: untouchedOver14dNames,
  };

  // --- Subject Confidence for Recommendations ---
  const subjectConfRows = subjectConfidence.data || [];
  // Build a map of subject_id → {name, avg_confidence}
  const subjectNameMap: Record<string, string> = {};
  for (const s of allSubjectRows) subjectNameMap[s.id] = s.name;
  // Low-confidence subjects: avg_confidence < 50 and subject has been touched (has entries)
  const lowConfidenceSubjects = subjectConfRows
    .filter((r: any) => r.avg_confidence < WEEKLY_REVIEW.LOW_CONFIDENCE_THRESHOLD && r.avg_confidence > 0)
    .map((r: any) => ({ name: subjectNameMap[r.subject_id] || r.subject_id, confidence: Math.round(r.avg_confidence) }))
    .filter((r: any) => r.name);

  // --- Streak ---
  const current_streak = streakData.data?.current_count || 0;
  const best_streak = streakData.data?.best_count || 0;

  // --- Gamification ---
  const xpRows = xpData.data || [];
  const xp_earned = xpRows.reduce((s: number, r: any) => s + (r.xp_amount || 0), 0);

  const badgeRows = badgesData.data || [];
  const badges_unlocked = badgeRows.map((b: any) => ({
    slug: b.badge_slug,
    name: b.badge_definitions?.name || b.badge_slug,
    icon_name: b.badge_definitions?.icon_name || 'star',
  }));

  // Level: query user_profiles for current level
  const { data: userProfile } = await supabase
    .from('user_profiles').select('current_level, xp_total').eq('id', userId).single();
  const level_end = userProfile?.current_level || 1;
  // Approximate level_start by reverse-calculating from xp_total - xp_earned
  const xpAtStart = (userProfile?.xp_total || 0) - xp_earned;
  const level_start = Math.max(1, Math.floor(Math.sqrt(2 * xpAtStart / WEEKLY_REVIEW.XP_PER_LEVEL_DIVISOR)) + 1);

  // --- Benchmark ---
  const [benchmarkStart, benchmarkEnd] = await Promise.all([
    supabase.from('benchmark_snapshots')
      .select('composite_score, status')
      .eq('user_id', userId)
      .lte('snapshot_date', weekStartStr)
      .order('snapshot_date', { ascending: false })
      .limit(1).single(),
    supabase.from('benchmark_snapshots')
      .select('composite_score, status')
      .eq('user_id', userId)
      .lte('snapshot_date', weekEndStr)
      .order('snapshot_date', { ascending: false })
      .limit(1).single(),
  ]);

  const benchmark_score_start = benchmarkStart.data?.composite_score ?? null;
  const benchmark_score_end = benchmarkEnd.data?.composite_score ?? null;
  const benchmark_status = benchmarkEnd.data?.status ?? null;
  const benchmark_trend = (benchmark_score_start != null && benchmark_score_end != null)
    ? (benchmark_score_end - benchmark_score_start > WEEKLY_REVIEW.BENCHMARK_TREND_DELTA ? 'improving' : benchmark_score_end - benchmark_score_start < -WEEKLY_REVIEW.BENCHMARK_TREND_DELTA ? 'declining' : 'stable')
    : null;

  // --- Wins ---
  const wins: string[] = [];
  if (topics_completed > 0) {
    wins.push(`Completed ${topics_completed} topic${topics_completed !== 1 ? 's' : ''} this week`);
  }
  if (gravity_target > 0 && gravity_completed > gravity_target) {
    const overPct = Math.round(((gravity_completed - gravity_target) / gravity_target) * 100);
    wins.push(`Gravity completed exceeded target by ${overPct}%`);
  }
  const buffer_balance_change_val = buffer_balance_end - buffer_balance_start;
  if (buffer_balance_change_val > 0) {
    wins.push(`Buffer bank grew +${Math.round(buffer_balance_change_val * 10) / 10} days`);
  }
  // Velocity improved if the week ended with a higher ratio than it started
  if (vRows.length >= 2) {
    const velocityFirst = vRows[0].velocity_ratio || 0;
    const velocityLast = vRows[vRows.length - 1].velocity_ratio || 0;
    if (velocityLast > velocityFirst + WEEKLY_REVIEW.VELOCITY_IMPROVEMENT_THRESHOLD) {
      const improvePct = Math.round(((velocityLast - velocityFirst) / Math.max(velocityFirst, 0.01)) * 100);
      wins.push(`Velocity improved ${improvePct}% over the week`);
    }
  }
  if (plan_completion_rate >= WEEKLY_REVIEW.PLAN_ADHERENCE_STRONG) {
    wins.push(`Strong plan adherence at ${plan_completion_rate}%`);
  }
  if (current_streak >= WEEKLY_REVIEW.STREAK_WIN_THRESHOLD) {
    wins.push(`${current_streak}-day study streak maintained`);
  }

  // --- Areas to Improve ---
  const areas_to_improve: string[] = [];
  for (const { name, confidence } of lowConfidenceSubjects.slice(0, WEEKLY_REVIEW.MAX_LOW_CONF_SUBJECTS)) {
    areas_to_improve.push(`${name} confidence dropped to ${confidence} — schedule 3 revision sessions`);
  }
  if (topics_decayed > 0) {
    areas_to_improve.push(`${topics_decayed} overdue revision${topics_decayed !== 1 ? 's' : ''} — these accelerate decay`);
  }
  if (zero_day_count >= WEEKLY_REVIEW.ZERO_DAY_WARNING) {
    areas_to_improve.push(`${zero_day_count} zero-study day${zero_day_count !== 1 ? 's' : ''} — try to maintain consistency`);
  }

  // --- Next Week Recommendations ---
  const next_week_recommendations: string[] = [];
  // Untouched-over-14d subjects first (up to 2)
  for (const subjectName of untouchedOver14dNames.slice(0, WEEKLY_REVIEW.MAX_UNTOUCHED_RECOMMENDATIONS)) {
    const lastTouched = Object.entries(subjectLastTouchedMap).find(
      ([sid]) => subjectNameMap[sid] === subjectName
    )?.[1];
    const daysSince = lastTouched
      ? Math.round((weekEndMs - lastTouched.getTime()) / (24 * 60 * 60 * 1000))
      : null;
    const suffix = daysSince != null ? ` — untouched for ${daysSince} days` : ' — not yet started';
    next_week_recommendations.push(`Schedule ${subjectName}${suffix}`);
  }
  // Low-confidence subjects (up to 2, not already mentioned above)
  const alreadyScheduled = new Set(untouchedOver14dNames.slice(0, WEEKLY_REVIEW.MAX_UNTOUCHED_RECOMMENDATIONS));
  for (const { name, confidence } of lowConfidenceSubjects.slice(0, WEEKLY_REVIEW.MAX_LOW_CONF_RECOMMENDATIONS)) {
    if (!alreadyScheduled.has(name)) {
      next_week_recommendations.push(`Revise ${name} — confidence dropped to ${confidence}`);
    }
  }
  // Always include topic target and revision load
  if (topics_target > 0) {
    next_week_recommendations.push(`Aim to complete ${topics_target} new topics next week (${daily_new_topics_param}/day)`);
  }
  if (plan_revision_count > 0) {
    next_week_recommendations.push(`Carry over ${plan_revision_count} revision tasks — prioritise decayed items first`);
  }
  // Trim to max 5
  const next_week_recommendations_final = next_week_recommendations.slice(0, WEEKLY_REVIEW.MAX_RECOMMENDATIONS);

  // --- Highlights ---
  const highlights = generateHighlights({
    topics_completed, avg_velocity_ratio, avg_bri, plan_completion_rate,
    current_streak, zero_day_count,
    xp_earned, badges_unlocked, benchmark_score_end, benchmark_status, benchmark_trend,
  });

  // --- Build Row ---
  const row = {
    user_id: userId,
    week_end_date: weekEndStr,
    week_start_date: weekStartStr,
    generated_at: new Date().toISOString(),
    total_hours: Math.round(total_hours * 10) / 10,
    hours_target,
    topics_completed,
    gravity_completed: Math.round(gravity_completed * 100) / 100,
    avg_hours_per_day,
    subjects_touched,
    avg_velocity_ratio,
    velocity_trend,
    completion_pct_start: Math.round(completion_pct_start * 10000) / 10000,
    completion_pct_end: Math.round(completion_pct_end * 10000) / 10000,
    topics_target,
    gravity_target,
    confidence_distribution: confDist,
    avg_confidence,
    topics_improved,
    topics_decayed,
    avg_stress,
    avg_bri,
    peak_bri,
    fatigue_trend,
    recovery_days,
    plan_completion_rate,
    plan_total_items,
    plan_completed_items,
    plan_new_count,
    plan_revision_count,
    weakness_distribution,
    critical_count_change,
    weak_count_change,
    subject_coverage,
    buffer_balance_start: Math.round(buffer_balance_start * 10) / 10,
    buffer_balance_end: Math.round(buffer_balance_end * 10) / 10,
    zero_day_count,
    current_streak,
    best_streak,
    wins,
    areas_to_improve,
    next_week_recommendations: next_week_recommendations_final,
    highlights,
    xp_earned,
    badges_unlocked,
    level_start,
    level_end,
    benchmark_score_start,
    benchmark_score_end,
    benchmark_status,
    benchmark_trend,
  };

  // Upsert
  const { data: upserted, error } = await supabase
    .from('weekly_reviews')
    .upsert(row, { onConflict: 'user_id,week_end_date' })
    .select('*')
    .single();

  if (error) throw error;
  return addDerived(upserted);
}

// --- Highlights Engine ---

interface HighlightInput {
  topics_completed: number;
  avg_velocity_ratio: number;
  avg_bri: number;
  plan_completion_rate: number;
  current_streak: number;
  zero_day_count: number;
  xp_earned: number;
  badges_unlocked: Array<{ slug: string; name: string; icon_name: string }>;
  benchmark_score_end: number | null;
  benchmark_status: string | null;
  benchmark_trend: string | null;
}

function generateHighlights(input: HighlightInput): string[] {
  const highlights: { priority: number; text: string }[] = [];

  if (input.topics_completed > 0) {
    highlights.push({ priority: 1, text: `Completed ${input.topics_completed} topics this week` });
  }

  if (input.avg_velocity_ratio >= WEEKLY_REVIEW.ON_TRACK_VELOCITY) {
    highlights.push({ priority: 2, text: `On-track velocity at ${input.avg_velocity_ratio.toFixed(2)}x` });
  } else if (input.avg_velocity_ratio > 0) {
    highlights.push({ priority: 2, text: `Velocity dipped to ${input.avg_velocity_ratio.toFixed(2)}x — consider lighter revision load` });
  }

  if (input.avg_bri >= WEEKLY_REVIEW.BRI_LOW_RISK) {
    highlights.push({ priority: 3, text: `Low burnout risk — BRI avg ${input.avg_bri}` });
  } else if (input.avg_bri > 0 && input.avg_bri < WEEKLY_REVIEW.BRI_ELEVATED) {
    highlights.push({ priority: 3, text: `Burnout risk elevated — BRI avg ${input.avg_bri}` });
  }

  if (input.plan_completion_rate >= WEEKLY_REVIEW.PLAN_ADHERENCE_STRONG) {
    highlights.push({ priority: 4, text: `Strong plan adherence at ${input.plan_completion_rate}%` });
  }

  if (input.current_streak >= WEEKLY_REVIEW.STREAK_WIN_THRESHOLD) {
    highlights.push({ priority: 5, text: `${input.current_streak}-day study streak — keep it up!` });
  }

  if (input.zero_day_count >= WEEKLY_REVIEW.ZERO_DAY_HIGHLIGHT) {
    highlights.push({ priority: 6, text: `${input.zero_day_count} zero-study days — try to maintain consistency` });
  }

  if (input.xp_earned > 0) {
    highlights.push({ priority: 7, text: `Earned ${input.xp_earned.toLocaleString()} XP this week` });
  }

  if (input.badges_unlocked.length > 0) {
    const names = input.badges_unlocked.map((b) => b.name).join(', ');
    highlights.push({ priority: 5, text: `Unlocked ${input.badges_unlocked.length} badge(s): ${names}` });
  }

  if (input.benchmark_score_end != null && input.benchmark_trend === 'improving') {
    highlights.push({ priority: 4, text: `Readiness score improved to ${input.benchmark_score_end} (${input.benchmark_status})` });
  }

  // Sort by priority and take top 3
  highlights.sort((a, b) => a.priority - b.priority);
  return highlights.slice(0, WEEKLY_REVIEW.MAX_HIGHLIGHTS).map((h) => h.text);
}
