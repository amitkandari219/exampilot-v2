import { supabase } from '../lib/supabase.js';
import type { StrategyMode, PersonaParams } from '../types/index.js';

// --- Constants ---

const COOLDOWN_DAYS = 3;
const MODE_DRIFT_LIMIT = 0.20;

const BOUNDS = {
  fatigue_threshold: [60, 95] as const,
  buffer_capacity: [0.05, 0.35] as const,
  fsrs_target_retention: [0.80, 0.98] as const,
  burnout_threshold: [50, 90] as const,
};

const MODE_DEFAULTS: Record<StrategyMode, PersonaParams> = {
  conservative: { fatigue_threshold: 85, buffer_capacity: 0.20, fsrs_target_retention: 0.85, burnout_threshold: 65 },
  balanced: { fatigue_threshold: 85, buffer_capacity: 0.15, fsrs_target_retention: 0.90, burnout_threshold: 75 },
  aggressive: { fatigue_threshold: 85, buffer_capacity: 0.10, fsrs_target_retention: 0.95, burnout_threshold: 80 },
  working_professional: { fatigue_threshold: 85, buffer_capacity: 0.25, fsrs_target_retention: 0.85, burnout_threshold: 65 },
};

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
  param: keyof PersonaParams;
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
  newParams?: PersonaParams;
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

export async function gatherSignals(userId: string, windowDays = 7): Promise<RecalibrationSignals> {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  const sinceStr = since.toISOString().split('T')[0];

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
  const latestDate = new Date().toISOString().split('T')[0];
  const { data: weaknessRows } = await supabase
    .from('weakness_snapshots')
    .select('category')
    .eq('user_id', userId)
    .eq('snapshot_date', latestDate);

  const vRows = velocityRows || [];
  const bRows = burnoutRows || [];
  const dataPoints = Math.max(vRows.length, bRows.length);

  // If <5 data points and window is 7, extend to 14
  if (dataPoints < 5 && windowDays === 7) {
    return gatherSignals(userId, 14);
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
    windowDays: dataPoints < 5 && windowDays === 7 ? 14 : windowDays,
  };
}

// --- Pure Adjustment Computation ---

export function computeAdjustments(
  current: PersonaParams,
  signals: RecalibrationSignals,
  mode: StrategyMode
): { newParams: PersonaParams; adjustments: ParamAdjustment[] } {
  const defaults = MODE_DEFAULTS[mode] || MODE_DEFAULTS.balanced;
  const adjustments: ParamAdjustment[] = [];
  const newParams = { ...current };

  const { velocityRatio, velocityTrend, briScore, fatigueAvg, stressAvg, confidenceAvg, criticalWeaknessPct } = signals;

  // --- fsrs_target_retention ---
  let retStep = 0;
  let retReason = '';
  if (velocityRatio >= 1.15 && confidenceAvg >= 65 && briScore >= 65) {
    retStep = 0.02; retReason = 'Ahead, healthy — tighten retention';
  } else if (velocityRatio >= 1.05 && confidenceAvg >= 55 && briScore >= 60) {
    retStep = 0.01; retReason = 'Moderately ahead';
  } else if (velocityRatio < 0.75 || briScore < 40) {
    retStep = -0.02; retReason = 'Struggling/burnout — reduce revision pressure';
  } else if (velocityRatio < 0.90 && velocityTrend === 'declining') {
    retStep = -0.01; retReason = 'Falling behind';
  }
  if (retStep === 0 && criticalWeaknessPct > 30) {
    retStep = -0.01; retReason = 'Too many weak topics';
  }
  if (retStep !== 0) {
    const raw = current.fsrs_target_retention + retStep;
    const clamped = clampWithDrift(raw, 'fsrs_target_retention', defaults.fsrs_target_retention);
    if (clamped !== current.fsrs_target_retention) {
      adjustments.push({ param: 'fsrs_target_retention', oldValue: current.fsrs_target_retention, newValue: clamped, step: retStep, reason: retReason });
      newParams.fsrs_target_retention = clamped;
    }
  }

  // --- burnout_threshold ---
  let burnStep = 0;
  let burnReason = '';
  if (briScore < 45 && fatigueAvg > 60) {
    burnStep = 3; burnReason = 'High burnout — trigger recovery sooner';
  } else if (briScore < 55 && fatigueAvg > 50) {
    burnStep = 2; burnReason = 'Moderate concern';
  } else if (velocityRatio >= 1.15 && briScore >= 75 && fatigueAvg < 35) {
    burnStep = -3; burnReason = 'Thriving — can push harder';
  } else if (velocityRatio >= 1.05 && briScore >= 65 && fatigueAvg < 45) {
    burnStep = -2; burnReason = 'Doing well';
  }
  if (burnStep !== 0) {
    const raw = current.burnout_threshold + burnStep;
    const clamped = clampWithDrift(raw, 'burnout_threshold', defaults.burnout_threshold);
    if (clamped !== current.burnout_threshold) {
      adjustments.push({ param: 'burnout_threshold', oldValue: current.burnout_threshold, newValue: clamped, step: burnStep, reason: burnReason });
      newParams.burnout_threshold = clamped;
    }
  }

  // --- fatigue_threshold ---
  let fatStep = 0;
  let fatReason = '';
  if (fatigueAvg > 70 && briScore < 55) {
    fatStep = -3; fatReason = 'Chronically fatigued — protect user';
  } else if (fatigueAvg > 55 && briScore < 65) {
    fatStep = -2; fatReason = 'Moderate fatigue concern';
  } else if (velocityRatio >= 1.10 && fatigueAvg < 30 && briScore >= 70) {
    fatStep = 3; fatReason = 'Energized — can handle more';
  } else if (velocityRatio >= 1.05 && fatigueAvg < 40 && briScore >= 65) {
    fatStep = 2; fatReason = 'Healthy and productive';
  }
  if (fatStep !== 0) {
    const raw = current.fatigue_threshold + fatStep;
    const clamped = clampWithDrift(raw, 'fatigue_threshold', defaults.fatigue_threshold);
    if (clamped !== current.fatigue_threshold) {
      adjustments.push({ param: 'fatigue_threshold', oldValue: current.fatigue_threshold, newValue: clamped, step: fatStep, reason: fatReason });
      newParams.fatigue_threshold = clamped;
    }
  }

  // --- buffer_capacity ---
  let bufStep = 0;
  let bufReason = '';
  if (velocityRatio >= 1.20 && briScore >= 70) {
    bufStep = -0.02; bufReason = 'Far ahead — less buffer needed';
  } else if (velocityRatio >= 1.10 && briScore >= 60) {
    bufStep = -0.01; bufReason = 'Moderately ahead';
  } else if (velocityRatio < 0.75 && stressAvg < 40) {
    bufStep = 0.02; bufReason = 'Far behind — more cushion';
  } else if (velocityRatio < 0.85 && stressAvg < 50) {
    bufStep = 0.01; bufReason = 'Behind with stress';
  }
  if (bufStep === 0 && briScore < 45) {
    bufStep = 0.01; bufReason = 'Burnout risk — breathing room';
  }
  if (bufStep !== 0) {
    const raw = current.buffer_capacity + bufStep;
    const clamped = clampWithDrift(raw, 'buffer_capacity', defaults.buffer_capacity);
    if (clamped !== current.buffer_capacity) {
      adjustments.push({ param: 'buffer_capacity', oldValue: current.buffer_capacity, newValue: clamped, step: bufStep, reason: bufReason });
      newParams.buffer_capacity = clamped;
    }
  }

  return { newParams, adjustments };
}

// --- Guardrail: clamp within absolute bounds AND ±20% of mode default ---

function clampWithDrift(value: number, param: keyof PersonaParams, modeDefault: number): number {
  const [min, max] = BOUNDS[param];
  const driftMin = modeDefault * (1 - MODE_DRIFT_LIMIT);
  const driftMax = modeDefault * (1 + MODE_DRIFT_LIMIT);
  const effectiveMin = Math.max(min, driftMin);
  const effectiveMax = Math.min(max, driftMax);
  // Round to avoid floating point noise
  const clamped = Math.max(effectiveMin, Math.min(effectiveMax, value));
  return param === 'buffer_capacity' || param === 'fsrs_target_retention'
    ? Math.round(clamped * 100) / 100
    : Math.round(clamped);
}

// --- Main Recalibration Runner ---

export async function runRecalibration(userId: string, triggerType: 'auto_daily' | 'manual'): Promise<RecalibrationResult> {
  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('strategy_mode, fatigue_threshold, buffer_capacity, fsrs_target_retention, burnout_threshold, auto_recalibrate, last_recalibrated_at, recovery_mode_active')
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

  // 4. Cooldown check: skip if last params_changed recalibration was <3 days ago
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
    if (daysSince < COOLDOWN_DAYS) {
      return { status: 'skipped', skipped_reason: 'cooldown' };
    }
  }

  // 5. Gather signals
  const signals = await gatherSignals(userId);

  // 6. Need >=5 data points
  if (signals.dataPoints < 5) {
    return { status: 'skipped', skipped_reason: 'insufficient_data' };
  }

  const current: PersonaParams = {
    fatigue_threshold: profile.fatigue_threshold,
    buffer_capacity: profile.buffer_capacity,
    fsrs_target_retention: profile.fsrs_target_retention,
    burnout_threshold: profile.burnout_threshold,
  };

  // 7. Compute adjustments
  const mode = profile.strategy_mode as StrategyMode;
  const { newParams, adjustments } = computeAdjustments(current, signals, mode);
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
