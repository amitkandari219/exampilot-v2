import { supabase } from '../lib/supabase.js';
import { runRecalibration } from './recalibration.js';
import { getActiveSubjectIds } from './mode.js';

export async function calculateVelocity(userId: string) {
  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('exam_date, buffer_capacity, daily_hours, strategy_params, current_mode, prelims_date, velocity_target_multiplier')
    .eq('id', userId)
    .single();

  if (!profile || !profile.exam_date) {
    throw new Error('User profile or exam date not found');
  }

  const now = new Date();
  const targetDate = (profile.current_mode === 'prelims' && profile.prelims_date)
    ? profile.prelims_date : profile.exam_date;
  const examDate = new Date(targetDate);
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - now.getTime()) / 86400000));

  // Get all topics — gravity = pyq_weight only
  const { data: topicsRaw } = await supabase
    .from('topics')
    .select('id, pyq_weight, chapters!inner(subject_id)');

  // Filter out paused subjects based on current exam mode
  const activeSubjectIds = await getActiveSubjectIds(userId);
  const topics = activeSubjectIds
    ? (topicsRaw || []).filter((t: any) => {
        const subjectId = t.chapters?.subject_id;
        return !subjectId || activeSubjectIds.has(subjectId);
      })
    : (topicsRaw || []);

  // Get user progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  const progressMap = new Map((progress || []).map((p) => [p.topic_id, p.status]));
  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  let totalGravity = 0;
  let completedGravity = 0;
  let totalTopics = 0;
  let completedTopicCount = 0;

  for (const t of topics || []) {
    const gravity = t.pyq_weight; // gravity = pyq_weight only (1-5 per topic)
    totalGravity += gravity;
    totalTopics++;
    const status = progressMap.get(t.id) || 'untouched';
    if (completedStatuses.includes(status)) {
      completedGravity += gravity;
      completedTopicCount++;
    }
  }

  const remainingGravity = totalGravity - completedGravity;
  const bufferPct = profile.buffer_capacity || 0.15;
  const revisionPct = (profile.strategy_params as any)?.revision_frequency
    ? 1 / (profile.strategy_params as any).revision_frequency : 0.25;
  const effectiveDays = daysRemaining * (1 - bufferPct - revisionPct);
  const rawRequiredVelocity = effectiveDays > 0 ? remainingGravity / effectiveDays : 0;
  const requiredVelocity = rawRequiredVelocity * ((profile as any).velocity_target_multiplier ?? 1.0);

  // Get last 14 days of daily logs
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, gravity_completed')
    .eq('user_id', userId)
    .gte('log_date', fourteenDaysAgo.toISOString().split('T')[0])
    .order('log_date', { ascending: false });

  // Calculate weighted velocity
  const sevenDayLogs = (logs || []).slice(0, 7);
  const fourteenDayLogs = logs || [];

  const avg7d = sevenDayLogs.length > 0
    ? sevenDayLogs.reduce((sum, l) => sum + l.gravity_completed, 0) / sevenDayLogs.length : 0;
  const avg14d = fourteenDayLogs.length > 0
    ? fourteenDayLogs.reduce((sum, l) => sum + l.gravity_completed, 0) / fourteenDayLogs.length : 0;

  const actualVelocity = avg7d * 0.6 + avg14d * 0.4;
  const velocityRatio = requiredVelocity > 0 ? actualVelocity / requiredVelocity : 1;

  let status: string;
  if (velocityRatio >= 1.1) status = 'ahead';
  else if (velocityRatio >= 0.9) status = 'on_track';
  else if (velocityRatio >= 0.7) status = 'behind';
  else status = 'at_risk';

  // CHANGED: trend detection — compare 7d avg vs 14d avg
  const trend = avg14d > 0 ? (avg7d > avg14d * 1.1 ? 'improving' : avg7d < avg14d * 0.9 ? 'declining' : 'stable') : 'stable';

  const weightedCompletion = totalGravity > 0 ? completedGravity / totalGravity : 0;

  // Project completion date
  let projectedDate: string | null = null;
  if (actualVelocity > 0) {
    const daysToComplete = remainingGravity / actualVelocity;
    const projected = new Date(now);
    projected.setDate(projected.getDate() + Math.ceil(daysToComplete));
    projectedDate = projected.toISOString().split('T')[0];
  }

  const snapshotDate = now.toISOString().split('T')[0];

  // Upsert velocity snapshot
  await supabase
    .from('velocity_snapshots')
    .upsert({
      user_id: userId,
      snapshot_date: snapshotDate,
      gravity_completed_today: sevenDayLogs.length > 0 ? sevenDayLogs[0].gravity_completed : 0,
      cumulative_gravity: completedGravity,
      required_velocity: requiredVelocity,
      actual_velocity_7d: avg7d,
      actual_velocity_14d: avg14d,
      velocity_ratio: velocityRatio,
      status,
      weighted_completion_pct: weightedCompletion,
      unweighted_completion_pct: totalTopics > 0 ? completedTopicCount / totalTopics : 0,
      trend,
      projected_completion_date: projectedDate,
    }, { onConflict: 'user_id,snapshot_date' });

  // ADDED: unweighted_completion_pct (topic count based)
  const unweightedCompletion = totalTopics > 0 ? completedTopicCount / totalTopics : 0;

  return {
    velocity_ratio: velocityRatio,
    status,
    actual_velocity_7d: avg7d,
    actual_velocity_14d: avg14d,
    required_velocity: requiredVelocity,
    weighted_completion_pct: weightedCompletion,
    unweighted_completion_pct: unweightedCompletion, // ADDED
    trend,
    projected_completion_date: projectedDate,
    days_remaining: daysRemaining,
    total_gravity: totalGravity, // ADDED: expose for consumers
    completed_gravity: completedGravity, // ADDED
    remaining_gravity: remainingGravity, // ADDED
  };
}

export async function updateBuffer(userId: string, date: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('buffer_balance, buffer_capacity, buffer_initial, exam_date, current_mode, prelims_date, buffer_deposit_rate, buffer_withdrawal_rate')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');

  const targetDate = (profile.current_mode === 'prelims' && profile.prelims_date)
    ? profile.prelims_date : profile.exam_date;
  const examDate = new Date(targetDate);
  const now = new Date(date);
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - now.getTime()) / 86400000));
  // Use fixed buffer_initial set at onboarding; fall back to dynamic calc for legacy users
  const maxBuffer = profile.buffer_initial ?? daysRemaining * (profile.buffer_capacity || 0.15);

  // Get today's log
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('gravity_completed')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();

  // Get velocity snapshot
  const { data: snapshot } = await supabase
    .from('velocity_snapshots')
    .select('required_velocity')
    .eq('user_id', userId)
    .eq('snapshot_date', date)
    .single();

  const gravityToday = todayLog?.gravity_completed || 0;
  const required = snapshot?.required_velocity || 0;
  const delta = gravityToday - required;

  // CHANGED: Read rates from profile with corrected defaults (deposit < withdrawal)
  const depositRate = (profile as any).buffer_deposit_rate ?? 0.30;   // CHANGED default from 0.8
  const withdrawalRate = (profile as any).buffer_withdrawal_rate ?? 0.50; // CHANGED default from 1.0

  let amount = 0;
  let type: string;
  let notes: string;

  if (gravityToday === 0) {
    // Zero-day penalty
    amount = -1.0;
    type = 'zero_day_penalty';
    notes = 'Zero study day penalty';
  } else if (delta > 0) {
    // Deposit: surplus × deposit_rate, capped at 20% of days_remaining
    amount = Math.min(delta * depositRate, daysRemaining * 0.2);
    type = 'deposit';
    notes = `Surplus gravity: ${delta.toFixed(2)}`;
  } else if (delta < 0) {
    // Withdrawal: deficit × withdrawal_rate, floored at -5
    amount = Math.max(delta * withdrawalRate, -5);
    type = 'withdrawal';
    notes = `Deficit gravity: ${delta.toFixed(2)}`;
  } else {
    // ADDED: delta === 0 means exact target hit — daily consistency reward
    amount = 0.1;
    type = 'consistency_reward';
    notes = 'Exact target hit bonus';
  }

  let newBalance = (profile.buffer_balance || 0) + amount;
  // CHANGED: floor is -5 (debt mode), not 0
  newBalance = Math.max(-5, Math.min(newBalance, maxBuffer));

  // Check streak-based consistency reward (7+ day streak milestone)
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_count')
    .eq('user_id', userId)
    .eq('streak_type', 'study')
    .single();

  if (streak && streak.current_count > 0 && streak.current_count % 7 === 0) {
    const bonus = 0.1;
    newBalance = Math.min(newBalance + bonus, maxBuffer);

    await supabase.from('buffer_transactions').insert({
      user_id: userId,
      transaction_date: date,
      type: 'consistency_reward',
      amount: bonus,
      balance_after: newBalance,
      notes: `7-day streak milestone (streak: ${streak.current_count})`,
      delta_gravity: 0,
    });
  }

  // Insert main transaction
  await supabase.from('buffer_transactions').insert({
    user_id: userId,
    transaction_date: date,
    type,
    amount,
    balance_after: newBalance,
    notes,
    delta_gravity: delta,  // ADDED: track the raw gravity delta
  });

  // Update profile balance
  await supabase
    .from('user_profiles')
    .update({ buffer_balance: newBalance })
    .eq('id', userId);

  // ADDED: Debt mode — trigger recalibration when balance goes negative
  if (newBalance < 0) {
    try {
      await runRecalibration(userId, 'buffer_debt');
    } catch {
      // Recalibration is non-critical
    }
  }

  return { balance: newBalance, transaction: { type, amount, balance_after: newBalance } };
}

export async function processEndOfDay(userId: string, date: string) {
  // Aggregate daily logs from completed plan items
  const { data: plan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .single();

  if (plan) {
    const { data: items } = await supabase
      .from('daily_plan_items')
      .select('*, topics!inner(pyq_weight, difficulty, chapter_id)')
      .eq('plan_id', plan.id)
      .eq('status', 'completed');

    const subjects = new Set<string>();
    let topicsCompleted = 0;
    let gravityCompleted = 0;
    let hoursStudied = 0;
    let difficultySum = 0;

    for (const item of items || []) {
      topicsCompleted++;
      const t = (item as any).topics;
      gravityCompleted += t.pyq_weight; // CHANGED: gravity = pyq_weight only
      hoursStudied += item.actual_hours || item.estimated_hours;
      difficultySum += t.difficulty;
      subjects.add(t.chapter_id);
    }

    await supabase.from('daily_logs').upsert({
      user_id: userId,
      log_date: date,
      topics_completed: topicsCompleted,
      gravity_completed: gravityCompleted,
      hours_studied: hoursStudied,
      subjects_touched: subjects.size,
      avg_difficulty: topicsCompleted > 0 ? difficultySum / topicsCompleted : 0,
    }, { onConflict: 'user_id,log_date' });
  }

  // Calculate velocity and update buffer
  await calculateVelocity(userId);
  await updateBuffer(userId, date);
  await updateStreaks(userId, date);

  // Auto-recalibrate persona params if enabled
  try {
    await runRecalibration(userId, 'auto_daily');
  } catch {
    // Recalibration is non-critical — don't fail end-of-day processing
  }

  // Calculate benchmark readiness score
  try {
    const { calculateBenchmark } = await import('./benchmark.js');
    await calculateBenchmark(userId);
  } catch {
    // Benchmark is non-critical
  }

  // Recalculate confidence decay and schedule revisions
  try {
    const { recalculateAllConfidence } = await import('./decayTrigger.js');
    await recalculateAllConfidence(userId);
  } catch {
    // Decay trigger is non-critical
  }
}

async function updateStreaks(userId: string, date: string) {
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('hours_studied')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();

  const studied = (todayLog?.hours_studied || 0) > 0;

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', 'study')
    .single();

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      streak_type: 'study',
      current_count: studied ? 1 : 0,
      best_count: studied ? 1 : 0,
      last_active_date: studied ? date : null,
    });
    return;
  }

  if (studied) {
    const lastDate = streak.last_active_date ? new Date(streak.last_active_date) : null;
    const today = new Date(date);
    const isConsecutive = lastDate && (today.getTime() - lastDate.getTime()) <= 86400000 * 1.5;

    const newCount = isConsecutive ? streak.current_count + 1 : 1;
    const bestCount = Math.max(streak.best_count, newCount);

    await supabase
      .from('streaks')
      .update({ current_count: newCount, best_count: bestCount, last_active_date: date })
      .eq('id', streak.id);

    // Award XP for streak milestones (non-critical)
    try {
      const milestones: Record<number, number> = { 7: 200, 14: 400, 30: 1000, 100: 2500 };
      if (milestones[newCount]) {
        const { awardXP } = await import('./gamification.js');
        await awardXP(userId, {
          triggerType: 'streak_milestone',
          xpAmount: milestones[newCount],
          metadata: { streak_days: newCount },
        });
      }
    } catch {
      // Gamification is non-critical
    }
  } else {
    await supabase
      .from('streaks')
      .update({ current_count: 0 })
      .eq('id', streak.id);
  }
}

export async function getVelocityHistory(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('velocity_snapshots')
    .select('snapshot_date, velocity_ratio, status, weighted_completion_pct, stress_score')
    .eq('user_id', userId)
    .gte('snapshot_date', since.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getBufferDetails(userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('buffer_balance, buffer_capacity, buffer_initial, exam_date, current_mode, prelims_date')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');

  const targetDate = (profile.current_mode === 'prelims' && profile.prelims_date)
    ? profile.prelims_date : profile.exam_date;
  const examDate = new Date(targetDate);
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - Date.now()) / 86400000));
  const balanceDays = profile.buffer_balance || 0;
  const maxBuffer = profile.buffer_initial ?? daysRemaining * (profile.buffer_capacity || 0.15);

  const { data: transactions } = await supabase
    .from('buffer_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('valid_from', { ascending: false })
    .limit(20);

  // ADDED: debt status when balance is negative
  const balance = profile.buffer_balance ?? 0;
  const status = balance < 0 ? 'debt' : balance <= 0 ? 'critical' : balance < maxBuffer * 0.2 ? 'critical' : balance < maxBuffer * 0.8 ? 'caution' : 'healthy';

  return {
    balance,
    capacity: profile.buffer_capacity || 0.15,
    buffer_initial: profile.buffer_initial ?? null,
    balance_days: balanceDays,
    max_buffer: maxBuffer,
    status,
    transactions: transactions || [],
  };
}
