import { supabase } from '../lib/supabase.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';
import { BRI_WEIGHTS, BURNOUT, FATIGUE_SENSITIVITY } from '../constants/thresholds.js';
import { appEvents } from './events.js';

export async function calculateFatigueScore(userId: string): Promise<number> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('daily_hours, fatigue_sensitivity')
    .eq('id', userId)
    .single();

  const targetHours = profile?.daily_hours || 6;
  interface ProfileWithSensitivity { daily_hours: number; fatigue_sensitivity?: number | null }
  const typedProfile = profile as unknown as ProfileWithSensitivity | null;
  const sensitivity = typedProfile?.fatigue_sensitivity ?? FATIGUE_SENSITIVITY.DEFAULT;

  // Get recent daily logs
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, hours_studied, avg_difficulty')
    .eq('user_id', userId)
    .gte('log_date', toDateString(daysAgo(7)))
    .order('log_date', { ascending: false });

  const recentLogs = logs || [];

  // Calculate consecutive study days
  let consecutiveDays = 0;
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const dateStr = toDateString(daysAgo(i, today));
    const log = recentLogs.find((l) => l.log_date === dateStr);
    if (log && log.hours_studied > 0) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  // Average difficulty last 3 days
  const last3 = recentLogs.slice(0, 3);
  const avgDifficulty3d = last3.length > 0
    ? last3.reduce((s, l) => s + l.avg_difficulty, 0) / last3.length : 0;

  // Total hours last 3 days
  const hours3d = last3.reduce((s, l) => s + l.hours_studied, 0);

  // Rest days in last 7
  const restDays7 = 7 - recentLogs.filter((l) => l.hours_studied > 0).length;

  // Fatigue formula — use max(targetHours, 6) to prevent false alerts for low-hour users (WPs at 3h/day)
  const effectiveTarget = Math.max(targetHours, BURNOUT.FATIGUE_MIN_TARGET_HOURS);
  const rawFatigue = (consecutiveDays * 10) + (avgDifficulty3d * 8) + (hours3d / effectiveTarget * 20) - (restDays7 * 15);
  const fatigue = rawFatigue * sensitivity;

  return Math.max(0, Math.min(100, Math.round(fatigue)));
}

export async function calculateBRI(userId: string) {
  // Get latest velocity snapshot for stress signals
  const { data: snapshot } = await supabase
    .from('velocity_snapshots')
    .select('stress_score, signal_velocity, signal_buffer, signal_confidence')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  // Get recent burnout snapshots for persistence
  // Note: Supabase column alias "stress_score: signal_stress" is used at the query boundary;
  // the returned type reflects the original column name, so we cast once here.
  interface BurnoutSnapshotRow { bri_score: number; stress_score: number }
  const { data: recentBurnout } = await supabase
    .from('burnout_snapshots')
    .select('bri_score, stress_score: signal_stress')
    .eq('user_id', userId)
    .gte('snapshot_date', toDateString(daysAgo(3)))
    .order('snapshot_date', { ascending: false });

  // Stress persistence: how long stress has been elevated
  const stressPersistence = ((recentBurnout || []) as unknown as BurnoutSnapshotRow[]).filter(
    (b) => b.stress_score > 0.5
  ).length * 33; // normalize to ~0-100

  // Buffer hemorrhage: rapid buffer decline
  const { data: recentTx } = await supabase
    .from('buffer_transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .order('valid_from', { ascending: false })
    .limit(7);

  const withdrawals = (recentTx || []).filter((t) => t.amount < 0);
  const bufferHemorrhage = Math.min(100, withdrawals.length * 20);

  // Velocity collapse
  const velocitySignal = snapshot?.signal_velocity || 70;
  const velocityCollapse = Math.max(0, 100 - velocitySignal);

  // Engagement decay: check for declining study hours
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('hours_studied')
    .eq('user_id', userId)
    .gte('log_date', toDateString(daysAgo(7)))
    .order('log_date', { ascending: false });

  const recent3 = (logs || []).slice(0, 3);
  const prior3 = (logs || []).slice(3, 6);
  const recentAvg = recent3.length > 0 ? recent3.reduce((s, l) => s + l.hours_studied, 0) / recent3.length : 0;
  const priorAvg = prior3.length > 0 ? prior3.reduce((s, l) => s + l.hours_studied, 0) / prior3.length : 0;
  const engagementDecay = priorAvg > 0 ? Math.max(0, (1 - recentAvg / priorAvg) * 100) : 0;

  // BRI = 100 - weighted signals
  const bri = 100 - (
    stressPersistence * BRI_WEIGHTS.STRESS +
    bufferHemorrhage * BRI_WEIGHTS.BUFFER +
    velocityCollapse * BRI_WEIGHTS.VELOCITY +
    engagementDecay * BRI_WEIGHTS.ENGAGEMENT
  );

  return {
    bri_score: Math.max(0, Math.min(100, Math.round(bri))),
    signals: {
      stress: stressPersistence,
      buffer: bufferHemorrhage,
      velocity: velocityCollapse,
      engagement: engagementDecay,
    },
  };
}

export async function checkRecoveryTrigger(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('burnout_threshold, recovery_mode_active')
    .eq('id', userId)
    .single();

  if (!profile || profile.recovery_mode_active) return false;

  const threshold = profile.burnout_threshold || 75;

  // Check last 2 days of BRI
  const { data: snapshots } = await supabase
    .from('burnout_snapshots')
    .select('bri_score')
    .eq('user_id', userId)
    .gte('snapshot_date', toDateString(daysAgo(2)))
    .order('snapshot_date', { ascending: false })
    .limit(2);

  if (!snapshots || snapshots.length < 2) return false;

  // Trigger if BRI > threshold for 2 consecutive days
  return snapshots.every((s) => s.bri_score < (100 - threshold));
}

export async function activateRecoveryMode(userId: string) {
  const { bri_score } = await calculateBRI(userId);

  // Recovery duration: 7 days for severe burnout (low BRI), 5 for moderate
  const recoveryDays = bri_score < 40 ? 7 : 5;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + recoveryDays);

  await supabase
    .from('user_profiles')
    .update({
      recovery_mode_active: true,
      recovery_mode_start: toDateString(new Date()),
      recovery_mode_end: toDateString(endDate),
    })
    .eq('id', userId);

  await supabase.from('recovery_log').insert({
    user_id: userId,
    trigger_bri: bri_score,
  });

  return {
    recovery_mode_active: true,
    recovery_mode_start: toDateString(new Date()),
    recovery_mode_end: toDateString(endDate),
  };
}

export async function exitRecoveryMode(userId: string, reason: string) {
  const { bri_score } = await calculateBRI(userId);

  await supabase
    .from('user_profiles')
    .update({
      recovery_mode_active: false,
      recovery_mode_start: null,
      recovery_mode_end: null,
    })
    .eq('id', userId);

  // Update recovery log
  const { data: log } = await supabase
    .from('recovery_log')
    .select('id')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (log) {
    await supabase
      .from('recovery_log')
      .update({
        ended_at: new Date().toISOString(),
        exit_reason: reason,
        bri_at_exit: bri_score,
      })
      .eq('id', log.id);
  }

  appEvents.emit('xp:award', { userId, triggerType: 'recovery_completion' });

  return {
    recovery_mode_active: false,
    ramp_up: { day1: 0.7, day2: 0.85, day3: 1.0 },
  };
}

export async function getBurnoutData(userId: string) {
  const fatigue = await calculateFatigueScore(userId);
  const { bri_score, signals } = await calculateBRI(userId);

  let status: string;
  if (bri_score >= 80) status = 'low';
  else if (bri_score >= 60) status = 'moderate';
  else if (bri_score >= 40) status = 'high';
  else status = 'critical';

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('recovery_mode_active, recovery_mode_start, recovery_mode_end')
    .eq('id', userId)
    .single();

  // Get recovery day number
  let recoveryDay: number | undefined;
  if (profile?.recovery_mode_active && profile.recovery_mode_start) {
    const start = new Date(profile.recovery_mode_start);
    recoveryDay = Math.ceil((Date.now() - start.getTime()) / 86400000) + 1;
  }

  // Save burnout snapshot
  const snapshotDate = toDateString(new Date());
  await supabase.from('burnout_snapshots').upsert({
    user_id: userId,
    snapshot_date: snapshotDate,
    bri_score,
    fatigue_score: fatigue,
    signal_stress: signals.stress,
    signal_buffer: signals.buffer,
    signal_velocity: signals.velocity,
    signal_engagement: signals.engagement,
    status,
    in_recovery: profile?.recovery_mode_active || false,
  }, { onConflict: 'user_id,snapshot_date' });

  // Check recovery trigger
  const shouldRecover = await checkRecoveryTrigger(userId);
  if (shouldRecover) {
    await activateRecoveryMode(userId);
  }

  if (bri_score > 50 && !shouldRecover && !(profile?.recovery_mode_active)) {
    appEvents.emit('notification:queue', { userId, type: 'recovery_suggestion' });
  }

  // Compute consecutive missed days (for EmotionalBanner comeback trigger)
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('log_date, hours_studied')
    .eq('user_id', userId)
    .gte('log_date', toDateString(daysAgo(7)))
    .order('log_date', { ascending: false });

  let consecutiveMissedDays = 0;
  const todayDate = new Date();
  for (let i = 1; i <= 7; i++) {
    const dateStr = toDateString(daysAgo(i, todayDate));
    const log = (recentLogs || []).find((l) => l.log_date === dateStr);
    if (!log || log.hours_studied === 0) consecutiveMissedDays++;
    else break;
  }

  // Get 7-day history
  const { data: history } = await supabase
    .from('burnout_snapshots')
    .select('snapshot_date, bri_score, fatigue_score')
    .eq('user_id', userId)
    .gte('snapshot_date', toDateString(daysAgo(7)))
    .order('snapshot_date', { ascending: true });

  return {
    bri_score,
    fatigue_score: fatigue,
    status,
    in_recovery: profile?.recovery_mode_active || false,
    recovery_day: recoveryDay,
    recovery_end: profile?.recovery_mode_end,
    signals,
    history: history || [],
    consecutive_missed_days: consecutiveMissedDays,
  };
}
