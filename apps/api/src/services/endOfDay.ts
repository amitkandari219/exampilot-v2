import { supabase } from '../lib/supabase.js';
import { calculateVelocity, updateBuffer } from './velocity.js';
import { runRecalibration } from './recalibration.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';
import { GAMIFICATION, ENGAGEMENT } from '../constants/thresholds.js';
import { appEvents } from './events.js';

// Typed interface for daily_plan_items joined with topics
interface PlanItemWithTopic {
  actual_hours?: number;
  estimated_hours: number;
  topics: {
    pyq_weight: number;
    difficulty: number;
    chapter_id: string;
  };
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

    for (const item of (items || []) as PlanItemWithTopic[]) {
      topicsCompleted++;
      const t = item.topics;
      gravityCompleted += t.pyq_weight; // gravity = pyq_weight only
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
  } catch (e) { console.warn('[endOfDay:recalibration]', e);
    // Recalibration is non-critical — don't fail end-of-day processing
  }

  // Calculate benchmark readiness score
  try {
    const { calculateBenchmark } = await import('./benchmark.js');
    await calculateBenchmark(userId);
  } catch (e) { console.warn('[endOfDay:benchmark]', e);
    // Benchmark is non-critical
  }

  // Recalculate confidence decay and schedule revisions
  try {
    const { recalculateAllConfidence } = await import('./decayTrigger.js');
    await recalculateAllConfidence(userId);
  } catch (e) { console.warn('[endOfDay:decay]', e);
    // Decay trigger is non-critical
  }

  // Silent quit detection: check for gradual disengagement
  try {
    await detectSilentQuit(userId, date);
  } catch (e) { console.warn('[endOfDay:silent-quit]', e); }

  // Psychological baggage check-in for repeaters (every 7 days)
  try {
    await repeaterCheckIn(userId, date);
  } catch (e) { console.warn('[endOfDay:repeater-checkin]', e); }
}

async function detectSilentQuit(userId: string, date: string) {
  // Compare recent week sessions vs prior week sessions
  const today = new Date(date);
  const recentStart = toDateString(daysAgo(7, today));
  const priorStart = toDateString(daysAgo(ENGAGEMENT.LOOKBACK_DAYS, today));
  const priorEnd = toDateString(daysAgo(7, today));

  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('hours_studied')
    .eq('user_id', userId)
    .gte('log_date', recentStart)
    .gt('hours_studied', 0);

  const { data: priorLogs } = await supabase
    .from('daily_logs')
    .select('hours_studied')
    .eq('user_id', userId)
    .gte('log_date', priorStart)
    .lt('log_date', priorEnd)
    .gt('hours_studied', 0);

  const recentSessions = (recentLogs || []).length;
  const priorSessions = (priorLogs || []).length;

  if (priorSessions < ENGAGEMENT.MIN_PRIOR_SESSIONS) return;

  const dropRatio = 1 - (recentSessions / priorSessions);
  if (dropRatio >= ENGAGEMENT.DROP_THRESHOLD) {
    appEvents.emit('notification:queue', {
      userId,
      type: 'silent_quit_warning',
      metadata: { recentSessions, priorSessions, dropRatio: Math.round(dropRatio * 100) },
    });
  }
}

async function repeaterCheckIn(userId: string, date: string) {
  // Only for repeater users
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('attempt_number, created_at')
    .eq('id', userId)
    .single();

  if (!profile || !profile.attempt_number || profile.attempt_number === 'first') return;

  // Check if 7 days since account creation or last check-in
  const daysSinceCreation = Math.floor((new Date(date).getTime() - new Date(profile.created_at).getTime()) / 86400000);
  if (daysSinceCreation % 7 !== 0 || daysSinceCreation === 0) return;

  const messages = [
    'How are you feeling about your preparation? Remember — each attempt teaches something valuable.',
    'Take a moment to acknowledge your progress this week. Repeating shows resilience, not failure.',
    'Your experience from previous attempts is an advantage. Are you channeling it into better strategy?',
    'Check in with yourself: are you studying with purpose, or just logging hours? Quality over quantity.',
    'Past results don\'t define this attempt. Focus on what you can control today.',
  ];

  const messageIndex = Math.floor(daysSinceCreation / 7) % messages.length;

  appEvents.emit('notification:queue', {
    userId,
    type: 'repeater_checkin',
    metadata: { message: messages[messageIndex], week_number: Math.floor(daysSinceCreation / 7) },
  });
}

async function updateStreaks(userId: string, date: string) {
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('hours_studied')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();

  const studied = (todayLog?.hours_studied || 0) > 0;

  // Get today's plan
  const { data: todayPlan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .single();

  // Check if any revision was completed today
  let revisionCount = 0;
  if (todayPlan) {
    const { count } = await supabase
      .from('daily_plan_items')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', todayPlan.id)
      .eq('status', 'completed')
      .in('type', ['revision', 'decay_revision']);
    revisionCount = count || 0;
  }

  // Check if plan was fully completed today
  let planFullyCompleted = false;
  if (todayPlan) {
    const { data: planItems } = await supabase
      .from('daily_plan_items')
      .select('status')
      .eq('plan_id', todayPlan.id);

    if (planItems && planItems.length > 0) {
      planFullyCompleted = planItems.every((item: any) => item.status === 'completed');
    }
  }

  // Update all 3 streak types
  await upsertStreak(userId, 'study', studied, date);
  await upsertStreak(userId, 'revision', (revisionCount || 0) > 0, date);
  await upsertStreak(userId, 'plan_completion', planFullyCompleted, date);
}

async function upsertStreak(userId: string, streakType: string, isActive: boolean, date: string) {
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', streakType)
    .single();

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      streak_type: streakType,
      current_count: isActive ? 1 : 0,
      best_count: isActive ? 1 : 0,
      last_active_date: isActive ? date : null,
    });
    return;
  }

  if (isActive) {
    const lastDate = streak.last_active_date ? new Date(streak.last_active_date) : null;
    const today = new Date(date);
    const isConsecutive = lastDate && (today.getTime() - lastDate.getTime()) <= 86400000 * 1.5;

    const newCount = isConsecutive ? streak.current_count + 1 : 1;
    const bestCount = Math.max(streak.best_count, newCount);
    // Reset weekly freeze at every 7-day boundary
    const resetFreeze = newCount % 7 === 0;

    await supabase
      .from('streaks')
      .update({
        current_count: newCount,
        best_count: bestCount,
        last_active_date: date,
        ...(resetFreeze ? { freeze_used_this_week: false } : {}),
      })
      .eq('id', streak.id);

    const milestones = GAMIFICATION.STREAK_MILESTONES;
    if (milestones[newCount]) {
      appEvents.emit('xp:award', { userId, triggerType: 'streak_milestone' });
      appEvents.emit('notification:queue', { userId, type: 'streak_milestone', metadata: { count: newCount } });
    }
  } else {
    // Streak freeze: allow 1 free miss per 7-day window before resetting
    const lastDate = streak.last_active_date ? new Date(streak.last_active_date) : null;
    const today = new Date(date);
    const daysSinceLast = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / 86400000) : 999;

    // Only freeze on first missed day (daysSinceLast === 1 means yesterday was active, today is the first miss)
    // and only if streak is at least 2 days (no point freezing a 1-day streak)
    if (daysSinceLast <= 1 && streak.current_count >= 2 && !streak.freeze_used_this_week) {
      // Use the freeze — don't reset, mark freeze as used
      await supabase
        .from('streaks')
        .update({ freeze_used_this_week: true })
        .eq('id', streak.id);
    } else {
      // No freeze available or second miss — reset streak
      await supabase
        .from('streaks')
        .update({ current_count: 0, freeze_used_this_week: false })
        .eq('id', streak.id);
    }
  }
}
