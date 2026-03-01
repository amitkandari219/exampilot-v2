import { supabase } from '../lib/supabase.js';
import type { StrategyMode } from '../types/index.js';
import { toDateString, daysAgo, daysUntil } from '../utils/dateUtils.js';
import { RECALIBRATION as RECAL_CONSTANTS } from '../constants/thresholds.js';
import { getPersonaDefaults } from './modeConfig.js';
import { appEvents } from './events.js';

// Tunable persona params (subset of full TunableParams)
interface TunableParams {
  fatigue_threshold: number;
  buffer_capacity: number;
  fsrs_target_retention: number;
  burnout_threshold: number;
}

// --- Constants ---

const BOUNDS = RECAL_CONSTANTS.BOUNDS;
const STEPS = RECAL_CONSTANTS.STEPS;
const SIG = RECAL_CONSTANTS.SIGNALS;

function getModeDefaults(mode: StrategyMode): TunableParams {
  const persona = getPersonaDefaults(mode);
  return {
    fatigue_threshold: persona.fatigue_threshold,
    buffer_capacity: persona.buffer_capacity,
    fsrs_target_retention: persona.fsrs_target_retention,
    burnout_threshold: persona.burnout_threshold,
  };
}

// --- Types ---

export interface RecalibrationSignals {
  velocityRatio: number;
  velocityTrend: string;
  briScore: number;
  fatigueAvg: number;
  stressAvg: number;
  confidenceAvg: number;
  criticalWeaknessPct: number;
  dataPoints: number;
  windowDays: number;
}

interface ParamAdjustment {
  param: keyof TunableParams;
  oldValue: number;
  newValue: number;
  step: number;
  reason: string;
}

export interface RecalibrationResult {
  status: 'applied' | 'no_change' | 'skipped';
  skipped_reason?: string;
  signals?: RecalibrationSignals;
  adjustments?: ParamAdjustment[];
  newParams?: TunableParams;
}

export interface RecalibrationLogEntry {
  id: string;
  user_id: string;
  recalibrated_at: string;
  trigger_type: string;
  window_days: number;
  old_fatigue_threshold: number | null;
  old_buffer_capacity: number | null;
  old_fsrs_target_retention: number | null;
  old_burnout_threshold: number | null;
  new_fatigue_threshold: number | null;
  new_buffer_capacity: number | null;
  new_fsrs_target_retention: number | null;
  new_burnout_threshold: number | null;
  input_velocity_ratio: number | null;
  input_velocity_trend: string | null;
  input_bri_score: number | null;
  input_fatigue_avg: number | null;
  input_stress_avg: number | null;
  input_confidence_avg: number | null;
  input_weakness_critical_pct: number | null;
  reason_fatigue: string | null;
  reason_buffer: string | null;
  reason_retention: string | null;
  reason_burnout: string | null;
  params_changed: boolean;
}

// --- Signal Gathering ---

export async function gatherSignals(userId: string, windowDays: number = RECAL_CONSTANTS.DEFAULT_WINDOW_DAYS): Promise<RecalibrationSignals> {
  const sinceStr = toDateString(daysAgo(windowDays));

  // Query velocity snapshots
  const { data: velocityRows } = await supabase
    .from('velocity_snapshots')
    .select('velocity_ratio, trend, stress_score')
    .eq('user_id', userId)
    .gte('snapshot_date', sinceStr)
    .order('snapshot_date', { ascending: false });

  // Query burnout snapshots
  const { data: burnoutRows } = await supabase
    .from('burnout_snapshots')
    .select('bri_score, fatigue_score')
    .eq('user_id', userId)
    .gte('snapshot_date', sinceStr);

  // Query user_progress for confidence
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('confidence_score')
    .eq('user_id', userId)
    .gt('confidence_score', 0);

  // Query weakness snapshots for critical/weak %
  const latestDate = toDateString(new Date());
  const { data: weaknessRows } = await supabase
    .from('weakness_snapshots')
    .select('category')
    .eq('user_id', userId)
    .eq('snapshot_date', latestDate);

  const vRows = velocityRows || [];
  const bRows = burnoutRows || [];
  const dataPoints = Math.max(vRows.length, bRows.length);

  if (dataPoints < RECAL_CONSTANTS.MIN_DATA_POINTS && windowDays === RECAL_CONSTANTS.DEFAULT_WINDOW_DAYS) {
    return gatherSignals(userId, RECAL_CONSTANTS.EXTENDED_WINDOW_DAYS);
  }

  const avgVelocityRatio = vRows.length > 0
    ? vRows.reduce((s, r) => s + (r.velocity_ratio || 0), 0) / vRows.length : 1.0;
  const latestTrend = vRows.length > 0 ? (vRows[0].trend || 'stable') : 'stable';
  const avgStress = vRows.length > 0
    ? vRows.reduce((s, r) => s + (r.stress_score || 0), 0) / vRows.length : 50;

  const avgBri = bRows.length > 0
    ? bRows.reduce((s, r) => s + (r.bri_score || 0), 0) / bRows.length : 50;
  const avgFatigue = bRows.length > 0
    ? bRows.reduce((s, r) => s + (r.fatigue_score || 0), 0) / bRows.length : 30;

  const pRows = progressRows || [];
  const avgConfidence = pRows.length > 0
    ? pRows.reduce((s, r) => s + r.confidence_score, 0) / pRows.length : 50;

  const wRows = weaknessRows || [];
  const totalWeakness = wRows.length;
  const criticalWeakCount = wRows.filter((w: any) => w.category === 'critical' || w.category === 'weak').length;
  const criticalWeaknessPct = totalWeakness > 0 ? (criticalWeakCount / totalWeakness) * 100 : 0;

  return {
    velocityRatio: avgVelocityRatio,
    velocityTrend: latestTrend,
    briScore: Math.round(avgBri),
    fatigueAvg: avgFatigue,
    stressAvg: avgStress,
    confidenceAvg: avgConfidence,
    criticalWeaknessPct,
    dataPoints,
    windowDays: dataPoints < RECAL_CONSTANTS.MIN_DATA_POINTS && windowDays === RECAL_CONSTANTS.DEFAULT_WINDOW_DAYS ? RECAL_CONSTANTS.EXTENDED_WINDOW_DAYS : windowDays,
  };
}

// --- Pure Adjustment Computation ---

export function computeAdjustments(
  current: TunableParams,
  signals: RecalibrationSignals,
  mode: StrategyMode,
  options?: { driftLimit?: number }
): { newParams: TunableParams; adjustments: ParamAdjustment[] } {
  const defaults = getModeDefaults(mode);
  const adjustments: ParamAdjustment[] = [];
  const newParams = { ...current };
  const driftLimit = options?.driftLimit ?? RECAL_CONSTANTS.DRIFT_LIMIT;

  const { velocityRatio, velocityTrend, briScore, fatigueAvg, stressAvg, confidenceAvg, criticalWeaknessPct } = signals;

  // --- fsrs_target_retention ---
  let retStep = 0;
  let retReason = '';
  if (velocityRatio >= SIG.VELOCITY_THRIVING && confidenceAvg >= SIG.CONFIDENCE_GOOD && briScore >= SIG.BRI_GOOD) {
    retStep = STEPS.RETENTION_BIG; retReason = 'Ahead, healthy — tighten retention';
  } else if (velocityRatio >= SIG.VELOCITY_OK && confidenceAvg >= SIG.CONFIDENCE_OK && briScore >= SIG.BRI_OK) {
    retStep = STEPS.RETENTION_SMALL; retReason = 'Moderately ahead';
  } else if (velocityRatio < SIG.VELOCITY_STRUGGLING || briScore < SIG.BRI_STRUGGLING) {
    retStep = -STEPS.RETENTION_BIG; retReason = 'Struggling/burnout — reduce revision pressure';
  } else if (velocityRatio < SIG.VELOCITY_FALLING && velocityTrend === 'declining') {
    retStep = -STEPS.RETENTION_SMALL; retReason = 'Falling behind';
  }
  if (retStep === 0 && criticalWeaknessPct > SIG.WEAKNESS_CRITICAL_PCT) {
    retStep = -STEPS.RETENTION_SMALL; retReason = 'Too many weak topics';
  }
  if (retStep !== 0) {
    const raw = current.fsrs_target_retention + retStep;
    const clamped = clampWithDrift(raw, 'fsrs_target_retention', defaults.fsrs_target_retention, driftLimit);
    if (clamped !== current.fsrs_target_retention) {
      adjustments.push({ param: 'fsrs_target_retention', oldValue: current.fsrs_target_retention, newValue: clamped, step: retStep, reason: retReason });
      newParams.fsrs_target_retention = clamped;
    }
  }

  // --- burnout_threshold ---
  let burnStep = 0;
  let burnReason = '';
  if (briScore < SIG.BRI_CONCERN && fatigueAvg > SIG.FATIGUE_HIGH) {
    burnStep = STEPS.BURNOUT_BIG; burnReason = 'High burnout — trigger recovery sooner';
  } else if (briScore < SIG.BRI_MODERATE && fatigueAvg > SIG.FATIGUE_MODERATE) {
    burnStep = STEPS.BURNOUT_SMALL; burnReason = 'Moderate concern';
  } else if (velocityRatio >= SIG.VELOCITY_THRIVING && briScore >= SIG.BRI_THRIVING && fatigueAvg < SIG.FATIGUE_MODERATE_LOW) {
    burnStep = -STEPS.BURNOUT_BIG; burnReason = 'Thriving — can push harder';
  } else if (velocityRatio >= SIG.VELOCITY_OK && briScore >= SIG.BRI_GOOD && fatigueAvg < SIG.FATIGUE_MODERATE_HIGH) {
    burnStep = -STEPS.BURNOUT_SMALL; burnReason = 'Doing well';
  }
  if (burnStep !== 0) {
    const raw = current.burnout_threshold + burnStep;
    const clamped = clampWithDrift(raw, 'burnout_threshold', defaults.burnout_threshold, driftLimit);
    if (clamped !== current.burnout_threshold) {
      adjustments.push({ param: 'burnout_threshold', oldValue: current.burnout_threshold, newValue: clamped, step: burnStep, reason: burnReason });
      newParams.burnout_threshold = clamped;
    }
  }

  // --- fatigue_threshold ---
  let fatStep = 0;
  let fatReason = '';
  if (fatigueAvg > SIG.FATIGUE_CHRONIC && briScore < SIG.BRI_MODERATE) {
    fatStep = -STEPS.FATIGUE_BIG; fatReason = 'Chronically fatigued — protect user';
  } else if (fatigueAvg > SIG.FATIGUE_ELEVATED && briScore < SIG.BRI_GOOD) {
    fatStep = -STEPS.FATIGUE_SMALL; fatReason = 'Moderate fatigue concern';
  } else if (velocityRatio >= SIG.VELOCITY_GOOD && fatigueAvg < SIG.FATIGUE_LOW && briScore >= SIG.BRI_HEALTHY) {
    fatStep = STEPS.FATIGUE_BIG; fatReason = 'Energized — can handle more';
  } else if (velocityRatio >= SIG.VELOCITY_OK && fatigueAvg < SIG.FATIGUE_OK && briScore >= SIG.BRI_GOOD) {
    fatStep = STEPS.FATIGUE_SMALL; fatReason = 'Healthy and productive';
  }
  if (fatStep !== 0) {
    const raw = current.fatigue_threshold + fatStep;
    const clamped = clampWithDrift(raw, 'fatigue_threshold', defaults.fatigue_threshold, driftLimit);
    if (clamped !== current.fatigue_threshold) {
      adjustments.push({ param: 'fatigue_threshold', oldValue: current.fatigue_threshold, newValue: clamped, step: fatStep, reason: fatReason });
      newParams.fatigue_threshold = clamped;
    }
  }

  // --- buffer_capacity ---
  let bufStep = 0;
  let bufReason = '';
  if (velocityRatio >= 1.20 && briScore >= SIG.BRI_HEALTHY) {
    bufStep = -STEPS.BUFFER_BIG; bufReason = 'Far ahead — less buffer needed';
  } else if (velocityRatio >= SIG.VELOCITY_GOOD && briScore >= SIG.BRI_OK) {
    bufStep = -STEPS.BUFFER_SMALL; bufReason = 'Moderately ahead';
  } else if (velocityRatio < SIG.VELOCITY_STRUGGLING && stressAvg < SIG.BRI_STRUGGLING) {
    bufStep = STEPS.BUFFER_BIG; bufReason = 'Far behind — more cushion';
  } else if (velocityRatio < SIG.VELOCITY_BEHIND && stressAvg < SIG.FATIGUE_MODERATE) {
    bufStep = STEPS.BUFFER_SMALL; bufReason = 'Behind with stress';
  }
  if (bufStep === 0 && briScore < SIG.BRI_CONCERN) {
    bufStep = STEPS.BUFFER_SMALL; bufReason = 'Burnout risk — breathing room';
  }
  if (bufStep !== 0) {
    const raw = current.buffer_capacity + bufStep;
    const clamped = clampWithDrift(raw, 'buffer_capacity', defaults.buffer_capacity, driftLimit);
    if (clamped !== current.buffer_capacity) {
      adjustments.push({ param: 'buffer_capacity', oldValue: current.buffer_capacity, newValue: clamped, step: bufStep, reason: bufReason });
      newParams.buffer_capacity = clamped;
    }
  }

  return { newParams, adjustments };
}

// --- Guardrail: clamp within absolute bounds AND ±20% of mode default ---

function clampWithDrift(value: number, param: keyof TunableParams, modeDefault: number, driftLimit: number = RECAL_CONSTANTS.DRIFT_LIMIT): number {
  const [min, max] = BOUNDS[param];
  const driftMin = modeDefault * (1 - driftLimit);
  const driftMax = modeDefault * (1 + driftLimit);
  const effectiveMin = Math.max(min, driftMin);
  const effectiveMax = Math.min(max, driftMax);
  // Round to avoid floating point noise
  const clamped = Math.max(effectiveMin, Math.min(effectiveMax, value));
  return param === 'buffer_capacity' || param === 'fsrs_target_retention'
    ? Math.round(clamped * 100) / 100
    : Math.round(clamped);
}

// --- Main Recalibration Runner ---

export async function runRecalibration(userId: string, triggerType: 'auto_daily' | 'manual' | 'buffer_debt'): Promise<RecalibrationResult> {
  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('strategy_mode, fatigue_threshold, buffer_capacity, fsrs_target_retention, burnout_threshold, auto_recalibrate, last_recalibrated_at, recovery_mode_active, exam_date, attempt_number')
    .eq('id', userId)
    .single();

  if (!profile) return { status: 'skipped', skipped_reason: 'profile_not_found' };

  // 2. Skip if auto_recalibrate disabled (for auto triggers)
  if (triggerType === 'auto_daily' && profile.auto_recalibrate === false) {
    return { status: 'skipped', skipped_reason: 'auto_recalibrate_disabled' };
  }

  // 3. Skip during recovery
  if (profile.recovery_mode_active) {
    return { status: 'skipped', skipped_reason: 'recovery_mode_active' };
  }

  // 4. Cooldown check — reduced to 1 day during final sprint (≤30 days to exam)
  const daysToExam = profile.exam_date ? daysUntil(new Date(profile.exam_date)) : Infinity;
  const cooldownDays = daysToExam <= RECAL_CONSTANTS.FINAL_SPRINT_DAYS
    ? RECAL_CONSTANTS.FINAL_SPRINT_COOLDOWN_DAYS
    : RECAL_CONSTANTS.COOLDOWN_DAYS;

  const { data: lastChanged } = await supabase
    .from('recalibration_log')
    .select('recalibrated_at')
    .eq('user_id', userId)
    .eq('params_changed', true)
    .order('recalibrated_at', { ascending: false })
    .limit(1)
    .single();

  if (lastChanged) {
    const daysSince = (Date.now() - new Date(lastChanged.recalibrated_at).getTime()) / 86400000;
    if (daysSince < cooldownDays) {
      return { status: 'skipped', skipped_reason: 'cooldown' };
    }
  }

  // 5. Gather signals
  const signals = await gatherSignals(userId);

  // 6. Need >=5 data points
  if (signals.dataPoints < RECAL_CONSTANTS.MIN_DATA_POINTS) {
    return { status: 'skipped', skipped_reason: 'insufficient_data' };
  }

  const current: TunableParams = {
    fatigue_threshold: profile.fatigue_threshold,
    buffer_capacity: profile.buffer_capacity,
    fsrs_target_retention: profile.fsrs_target_retention,
    burnout_threshold: profile.burnout_threshold,
  };

  // 7. Compute adjustments — repeaters (attempt_number ≥ 2) get wider drift
  const mode = profile.strategy_mode as StrategyMode;
  const isRepeater = (profile.attempt_number ?? 1) >= 2;
  const driftLimit = isRepeater ? RECAL_CONSTANTS.REPEATER_DRIFT_LIMIT : RECAL_CONSTANTS.DRIFT_LIMIT;
  const { newParams, adjustments } = computeAdjustments(current, signals, mode, { driftLimit });
  const paramsChanged = adjustments.length > 0;

  // 8. Persist
  if (paramsChanged) {
    // Update user_profiles
    await supabase
      .from('user_profiles')
      .update({
        fatigue_threshold: newParams.fatigue_threshold,
        buffer_capacity: newParams.buffer_capacity,
        fsrs_target_retention: newParams.fsrs_target_retention,
        burnout_threshold: newParams.burnout_threshold,
        last_recalibrated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Close previous persona_snapshots
    await supabase
      .from('persona_snapshots')
      .update({ valid_to: new Date().toISOString() })
      .eq('user_id', userId)
      .is('valid_to', null);

    // Insert new persona_snapshots
    await supabase
      .from('persona_snapshots')
      .insert({
        user_id: userId,
        strategy_mode: mode,
        fatigue_threshold: newParams.fatigue_threshold,
        buffer_capacity: newParams.buffer_capacity,
        fsrs_target_retention: newParams.fsrs_target_retention,
        burnout_threshold: newParams.burnout_threshold,
        change_reason: `recalibration_${triggerType}`,
      });
  }

  // Find reasons per param
  const reasonMap: Record<string, string | null> = {
    fatigue: null, buffer: null, retention: null, burnout: null,
  };
  for (const adj of adjustments) {
    if (adj.param === 'fatigue_threshold') reasonMap.fatigue = adj.reason;
    if (adj.param === 'buffer_capacity') reasonMap.buffer = adj.reason;
    if (adj.param === 'fsrs_target_retention') reasonMap.retention = adj.reason;
    if (adj.param === 'burnout_threshold') reasonMap.burnout = adj.reason;
  }

  // Insert recalibration_log
  await supabase.from('recalibration_log').insert({
    user_id: userId,
    trigger_type: triggerType,
    window_days: signals.windowDays,
    old_fatigue_threshold: current.fatigue_threshold,
    old_buffer_capacity: current.buffer_capacity,
    old_fsrs_target_retention: current.fsrs_target_retention,
    old_burnout_threshold: current.burnout_threshold,
    new_fatigue_threshold: newParams.fatigue_threshold,
    new_buffer_capacity: newParams.buffer_capacity,
    new_fsrs_target_retention: newParams.fsrs_target_retention,
    new_burnout_threshold: newParams.burnout_threshold,
    input_velocity_ratio: signals.velocityRatio,
    input_velocity_trend: signals.velocityTrend,
    input_bri_score: signals.briScore,
    input_fatigue_avg: signals.fatigueAvg,
    input_stress_avg: signals.stressAvg,
    input_confidence_avg: signals.confidenceAvg,
    input_weakness_critical_pct: signals.criticalWeaknessPct,
    reason_fatigue: reasonMap.fatigue,
    reason_buffer: reasonMap.buffer,
    reason_retention: reasonMap.retention,
    reason_burnout: reasonMap.burnout,
    params_changed: paramsChanged,
  });

  if (paramsChanged) {
    appEvents.emit('notification:queue', { userId, type: 'recalibration_triggered' });
  }

  return {
    status: paramsChanged ? 'applied' : 'no_change',
    signals,
    adjustments,
    newParams,
  };
}

// --- Status & History ---

export async function getRecalibrationStatus(userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('auto_recalibrate, last_recalibrated_at')
    .eq('id', userId)
    .single();

  const { data: lastEntry } = await supabase
    .from('recalibration_log')
    .select('*')
    .eq('user_id', userId)
    .order('recalibrated_at', { ascending: false })
    .limit(1)
    .single();

  return {
    auto_recalibrate: profile?.auto_recalibrate ?? true,
    last_recalibrated_at: profile?.last_recalibrated_at || null,
    last_entry: lastEntry || null,
  };
}

export async function getRecalibrationHistory(userId: string, limit = 20): Promise<RecalibrationLogEntry[]> {
  const { data, error } = await supabase
    .from('recalibration_log')
    .select('*')
    .eq('user_id', userId)
    .order('recalibrated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as RecalibrationLogEntry[];
}

export async function setAutoRecalibrate(userId: string, enabled: boolean) {
  await supabase
    .from('user_profiles')
    .update({ auto_recalibrate: enabled })
    .eq('id', userId);
}
