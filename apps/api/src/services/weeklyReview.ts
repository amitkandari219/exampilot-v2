import { supabase } from '../lib/supabase.js';
import type { WeeklyReviewSummary } from '../types/index.js';

// --- Week Boundary Helpers ---

function getMostRecentSunday(from?: string): Date {
  const d = from ? new Date(from + 'T00:00:00Z') : new Date();
  const day = d.getUTCDay(); // 0=Sun
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDerived(row: any): WeeklyReviewSummary {
  return {
    ...row,
    highlights: row.highlights || [],
    confidence_distribution: row.confidence_distribution || {},
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
      .select('velocity_ratio, trend, weighted_completion_pct, stress_score')
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
      .eq('streak_type', 'daily_study')
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
  ]);

  // --- Compute Study Metrics ---
  const logs = dailyLogs.data || [];
  const daysActive = logs.length;
  const total_hours = logs.reduce((s: number, r: any) => s + (r.hours_studied || 0), 0);
  const topics_completed = logs.reduce((s: number, r: any) => s + (r.topics_completed || 0), 0);
  const gravity_completed = logs.reduce((s: number, r: any) => s + (r.gravity_completed || 0), 0);
  const avg_hours_per_day = daysActive > 0 ? Math.round((total_hours / 7) * 10) / 10 : 0;
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

  // --- Burnout ---
  const bRows = burnoutSnapshots.data || [];
  const avg_bri = bRows.length > 0
    ? Math.round(bRows.reduce((s: number, r: any) => s + (r.bri_score || 0), 0) / bRows.length)
    : 0;
  const fatigue_first = bRows.length > 0 ? bRows[0].fatigue_score || 0 : 0;
  const fatigue_last = bRows.length > 0 ? bRows[bRows.length - 1].fatigue_score || 0 : 0;
  const fatigue_trend = fatigue_last > fatigue_first + 5 ? 'worsening' : fatigue_last < fatigue_first - 5 ? 'improving' : 'stable';
  const recovery_days = bRows.filter((r: any) => r.in_recovery).length;

  // --- Planner ---
  const plans = planData.data || [];
  let plan_total_items = 0;
  let plan_completed_items = 0;
  let plan_new_count = 0;
  let plan_revision_count = 0;
  for (const plan of plans) {
    const items = (plan as any).daily_plan_items || [];
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

  // --- Buffer ---
  const bTx = bufferTx.data || [];
  const buffer_balance_start = bTx.length > 0 ? (bTx[0].balance_after || 0) - (bTx[0].amount || 0) : 0;
  const buffer_balance_end = bTx.length > 0 ? bTx[bTx.length - 1].balance_after || 0 : 0;
  const zero_day_count = bTx.filter((r: any) => r.type === 'zero_day_penalty').length;

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
  const level_start = Math.max(1, Math.floor(Math.sqrt(2 * xpAtStart / 500)) + 1);

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
    ? (benchmark_score_end - benchmark_score_start > 2 ? 'improving' : benchmark_score_end - benchmark_score_start < -2 ? 'declining' : 'stable')
    : null;

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
    topics_completed,
    gravity_completed: Math.round(gravity_completed * 100) / 100,
    avg_hours_per_day,
    subjects_touched,
    avg_velocity_ratio,
    velocity_trend,
    completion_pct_start: Math.round(completion_pct_start * 10000) / 10000,
    completion_pct_end: Math.round(completion_pct_end * 10000) / 10000,
    confidence_distribution: confDist,
    topics_improved,
    topics_decayed,
    avg_stress,
    avg_bri,
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
    buffer_balance_start: Math.round(buffer_balance_start * 10) / 10,
    buffer_balance_end: Math.round(buffer_balance_end * 10) / 10,
    zero_day_count,
    current_streak,
    best_streak,
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

  if (input.avg_velocity_ratio >= 0.9) {
    highlights.push({ priority: 2, text: `On-track velocity at ${input.avg_velocity_ratio.toFixed(2)}x` });
  } else if (input.avg_velocity_ratio > 0) {
    highlights.push({ priority: 2, text: `Velocity dipped to ${input.avg_velocity_ratio.toFixed(2)}x — consider lighter revision load` });
  }

  if (input.avg_bri >= 60) {
    highlights.push({ priority: 3, text: `Low burnout risk — BRI avg ${input.avg_bri}` });
  } else if (input.avg_bri > 0 && input.avg_bri < 40) {
    highlights.push({ priority: 3, text: `Burnout risk elevated — BRI avg ${input.avg_bri}` });
  }

  if (input.plan_completion_rate >= 80) {
    highlights.push({ priority: 4, text: `Strong plan adherence at ${input.plan_completion_rate}%` });
  }

  if (input.current_streak >= 7) {
    highlights.push({ priority: 5, text: `${input.current_streak}-day study streak — keep it up!` });
  }

  if (input.zero_day_count >= 3) {
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
  return highlights.slice(0, 3).map((h) => h.text);
}
