import { supabase } from '../lib/supabase.js';
import type { StrategyMode } from '../types/index.js';
import { toDateString } from '../utils/dateUtils.js';

// Typed interface for strategy_params jsonb field
interface StrategyParams {
  scope_reduction_threshold?: number;
  daily_new_topics?: number;
  [key: string]: unknown;
}

// Strategy order per mode — personalized cascade
const STRATEGY_ORDER: Record<StrategyMode, string[]> = {
  conservative: ['consume_buffers', 'absorb', 'increase_hours'], // NEVER reduce_scope
  aggressive: ['absorb', 'reduce_scope', 'increase_hours'],
  balanced: ['absorb', 'consume_buffers', 'increase_hours', 'reduce_scope'],
  working_professional: ['reduce_scope', 'consume_buffers', 'absorb'],
};

interface CascadeTrigger {
  triggered: boolean;
  triggered_by: string | null;
  details: Record<string, any>;
}

interface StrategyImpact {
  before: Record<string, number>;
  after: Record<string, number>;
  description: string;
}

interface StrategyEvaluation {
  name: string;
  feasible: boolean;
  reason: string;
  impact: StrategyImpact;
  recommended: boolean;
}

export interface CascadeStatus {
  triggered: boolean;
  triggered_by: string | null;
  gap: number;
  strategies: StrategyEvaluation[];
}

// --- Trigger Detection ---

export async function checkCascadeTriggers(userId: string): Promise<CascadeTrigger> {
  const [profileRes, velocityRes] = await Promise.all([
    supabase.from('user_profiles').select('buffer_balance, buffer_initial').eq('id', userId).single(),
    supabase.from('velocity_snapshots').select('velocity_ratio, stress_score')
      .eq('user_id', userId).order('snapshot_date', { ascending: false }).limit(3),
  ]);

  const profile = profileRes.data;
  const velocityRows = velocityRes.data || [];
  const bufferInitial = profile?.buffer_initial || 0;
  const bufferBalance = profile?.buffer_balance || 0;

  // 1. velocity_ratio < 0.8 for 3 consecutive days
  if (velocityRows.length >= 3 && velocityRows.every((v) => v.velocity_ratio < 0.8)) {
    return { triggered: true, triggered_by: 'velocity_ratio_low_3d', details: { ratios: velocityRows.map((v) => v.velocity_ratio) } };
  }

  // 2. buffer_balance goes negative (debt)
  if (bufferBalance < 0) {
    return { triggered: true, triggered_by: 'buffer_debt', details: { buffer_balance: bufferBalance } };
  }

  // 3. buffer consumed > 50% of initial
  if (bufferInitial > 0 && (bufferInitial - bufferBalance) > bufferInitial * 0.5) {
    return { triggered: true, triggered_by: 'buffer_consumed_50pct', details: { consumed_pct: (bufferInitial - bufferBalance) / bufferInitial } };
  }

  // 4. stress_score < 45
  if (velocityRows.length > 0 && velocityRows[0].stress_score != null && velocityRows[0].stress_score < 45) {
    return { triggered: true, triggered_by: 'stress_high', details: { stress_score: velocityRows[0].stress_score } };
  }

  return { triggered: false, triggered_by: null, details: {} };
}

// --- Strategy Evaluation ---

export async function evaluateCascadeStrategies(userId: string, forceTrigger = false): Promise<CascadeStatus> {
  const trigger = await checkCascadeTriggers(userId);

  if (!trigger.triggered && !forceTrigger) {
    return { triggered: false, triggered_by: null, gap: 0, strategies: [] };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('strategy_mode, buffer_balance, buffer_initial, daily_hours, strategy_params')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');

  const mode = profile.strategy_mode as StrategyMode;
  const order = STRATEGY_ORDER[mode] || STRATEGY_ORDER.balanced;
  const bufferInitial = profile.buffer_initial || 0;
  const bufferBalance = profile.buffer_balance || 0;

  // Get latest velocity snapshot for gap calculation
  const { data: snapshot } = await supabase
    .from('velocity_snapshots')
    .select('required_velocity, actual_velocity_7d, velocity_ratio, stress_score')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const requiredVelocity = snapshot?.required_velocity || 0;
  const actualVelocity = snapshot?.actual_velocity_7d || 0;
  const dailyDeficit = Math.max(0, requiredVelocity - actualVelocity);
  const gap = dailyDeficit * 7; // week's backlog in gravity units

  const strategies: StrategyEvaluation[] = [];

  // --- Strategy 1: ABSORB ---
  const absorbFeasible = gap < 10;
  const absorbDays = Math.min(14, Math.max(7, Math.ceil(gap / 1.5)));
  const extraPerDay = gap > 0 ? Math.ceil(gap / absorbDays) : 0;
  strategies.push({
    name: 'absorb',
    feasible: absorbFeasible,
    reason: absorbFeasible
      ? `Gap of ${gap.toFixed(1)} gravity units can be spread over ${absorbDays} days`
      : `Gap of ${gap.toFixed(1)} exceeds 10 gravity units`,
    impact: {
      before: { daily_gravity: round2(actualVelocity), gap: round2(gap) },
      after: { daily_gravity: round2(actualVelocity + extraPerDay), gap: 0 },
      description: absorbFeasible ? `Add ~${extraPerDay} extra gravity/day for ${absorbDays} days` : 'Not feasible',
    },
    recommended: false,
  });

  // --- Strategy 2: CONSUME BUFFERS ---
  const consumeFeasible = bufferBalance > bufferInitial * 0.25;
  const convertDays = Math.max(0, Math.floor(bufferBalance * 0.5));
  const gravityFromBuffer = convertDays * requiredVelocity;
  strategies.push({
    name: 'consume_buffers',
    feasible: consumeFeasible,
    reason: consumeFeasible
      ? `Buffer at ${bufferInitial > 0 ? ((bufferBalance / bufferInitial) * 100).toFixed(0) : 0}% of initial`
      : `Buffer below 25% threshold`,
    impact: {
      before: { buffer_balance: round2(bufferBalance), gap: round2(gap) },
      after: { buffer_balance: round2(bufferBalance - convertDays), gap: round2(Math.max(0, gap - gravityFromBuffer)) },
      description: consumeFeasible ? `Convert ${convertDays} buffer days → ${round2(gravityFromBuffer)} gravity units` : 'Not feasible',
    },
    recommended: false,
  });

  // --- Strategy 3: INCREASE VELOCITY ---
  const currentHours = profile.daily_hours || 6;
  const suggestedIncrease = Math.min(2, Math.max(1, Math.ceil(dailyDeficit)));
  const projectedVelocity = currentHours > 0 ? actualVelocity * ((currentHours + suggestedIncrease) / currentHours) : actualVelocity;
  strategies.push({
    name: 'increase_hours',
    feasible: true,
    reason: 'Adding study hours increases daily velocity',
    impact: {
      before: { daily_hours: currentHours, daily_gravity: round2(actualVelocity) },
      after: { daily_hours: currentHours + suggestedIncrease, daily_gravity: round2(projectedVelocity) },
      description: `Add ${suggestedIncrease} hour${suggestedIncrease > 1 ? 's' : ''}/day → ~${round2(projectedVelocity)} gravity/day`,
    },
    recommended: false,
  });

  // --- Strategy 4: SCOPE REDUCTION ---
  const strategyParamsEval = (profile.strategy_params as StrategyParams) || {};
  const scopeThreshold = strategyParamsEval.scope_reduction_threshold ?? 0.1;

  const [topicsRes, progressRes, countRes] = await Promise.all([
    supabase.from('topics').select('id, importance, pyq_weight').lte('importance', 2).lte('pyq_weight', 2),
    supabase.from('user_progress').select('topic_id, status').eq('user_id', userId),
    supabase.from('topics').select('id', { count: 'exact', head: true }),
  ]);

  const progressMap = new Map((progressRes.data || []).map((p: any) => [p.topic_id, p.status]));
  const scopeTargets = (topicsRes.data || []).filter((t: any) => {
    const status = progressMap.get(t.id) || 'untouched';
    return status === 'untouched';
  });

  const totalTopicCount = countRes.count || 0;
  const reductionPct = totalTopicCount > 0 ? scopeTargets.length / totalTopicCount : 0;
  const scopeFeasible = mode !== 'conservative' && scopeTargets.length > 0 && reductionPct <= scopeThreshold;
  const gravityReduced = scopeTargets.reduce((sum: number, t: any) => sum + t.pyq_weight, 0);

  strategies.push({
    name: 'reduce_scope',
    feasible: scopeFeasible,
    reason: mode === 'conservative' ? 'Conservative mode never reduces scope'
      : scopeTargets.length === 0 ? 'No eligible topics to defer'
      : !scopeFeasible ? `Would reduce ${(reductionPct * 100).toFixed(1)}% (above ${(scopeThreshold * 100).toFixed(0)}% threshold)`
      : `${scopeTargets.length} low-priority topics eligible`,
    impact: {
      before: { total_topics: totalTopicCount, gap: round2(gap) },
      after: { total_topics: totalTopicCount - scopeTargets.length, gap: round2(Math.max(0, gap - gravityReduced)) },
      description: scopeFeasible ? `Defer ${scopeTargets.length} topics, reduce ${round2(gravityReduced)} gravity` : 'Not feasible',
    },
    recommended: false,
  });

  // Sort by personalized mode order
  const orderedStrategies: StrategyEvaluation[] = [];
  for (const name of order) {
    const s = strategies.find((st) => st.name === name);
    if (s) orderedStrategies.push(s);
  }
  // Append any remaining (strategies not in mode's order)
  for (const s of strategies) {
    if (!orderedStrategies.find((o) => o.name === s.name)) {
      orderedStrategies.push(s);
    }
  }

  // Mark first feasible as recommended
  const firstFeasible = orderedStrategies.find((s) => s.feasible);
  if (firstFeasible) firstFeasible.recommended = true;

  return {
    triggered: trigger.triggered || forceTrigger,
    triggered_by: trigger.triggered_by || 'manual',
    gap: round2(gap),
    strategies: orderedStrategies,
  };
}

// --- Strategy Application ---

export async function applyCascadeStrategy(userId: string, strategyName: string): Promise<{ success: boolean; details: Record<string, any> }> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('strategy_mode, buffer_balance, buffer_initial, daily_hours, strategy_params')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');

  // Pre-state
  const { data: preSnapshot } = await supabase
    .from('velocity_snapshots')
    .select('stress_score')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const stressBefore = preSnapshot?.stress_score ?? 50;
  const bufferBefore = profile.buffer_balance ?? 0;

  // Check trigger for logging
  const trigger = await checkCascadeTriggers(userId);

  const result: Record<string, any> = {};

  switch (strategyName) {
    case 'absorb': {
      // Absorb spreads backlog over 7-14 days — planner naturally picks up
      // We record the intent so the planner can boost daily_new_topics
      const strat: StrategyParams = (profile.strategy_params as StrategyParams) || {};
      const currentDailyNew = strat.daily_new_topics || 3;
      const boosted = currentDailyNew + 1;
      await supabase
        .from('user_profiles')
        .update({ strategy_params: { ...strat, daily_new_topics: boosted } })
        .eq('id', userId);

      result.action = 'backlog_spread';
      result.old_daily_new_topics = currentDailyNew;
      result.new_daily_new_topics = boosted;
      result.message = `Increased daily new topics from ${currentDailyNew} to ${boosted}`;
      break;
    }

    case 'consume_buffers': {
      const convertDays = Math.max(0, Math.floor((profile.buffer_balance || 0) * 0.5));
      const amount = -convertDays;
      const newBalance = (profile.buffer_balance || 0) + amount;

      await supabase.from('buffer_transactions').insert({
        user_id: userId,
        transaction_date: toDateString(new Date()),
        type: 'recalibration_adjustment',
        amount,
        balance_after: newBalance,
        notes: `Strategy cascade: converted ${convertDays} buffer days to study days`,
        delta_gravity: 0,
      });

      await supabase
        .from('user_profiles')
        .update({ buffer_balance: newBalance })
        .eq('id', userId);

      result.action = 'buffer_consumed';
      result.days_converted = convertDays;
      result.new_balance = newBalance;
      break;
    }

    case 'increase_hours': {
      const currentHours = profile.daily_hours || 6;
      const increase = Math.min(2, Math.max(1, currentHours < 4 ? 1 : 2));
      const newHours = currentHours + increase;

      await supabase
        .from('user_profiles')
        .update({ daily_hours: newHours })
        .eq('id', userId);

      result.action = 'hours_increased';
      result.old_hours = currentHours;
      result.new_hours = newHours;
      break;
    }

    case 'reduce_scope': {
      if (profile.strategy_mode === 'conservative') {
        throw new Error('Conservative mode does not allow scope reduction');
      }

      const [topicsRes, progressRes] = await Promise.all([
        supabase.from('topics').select('id, pyq_weight').lte('importance', 2).lte('pyq_weight', 2),
        supabase.from('user_progress').select('topic_id, status').eq('user_id', userId),
      ]);

      const progressMap = new Map((progressRes.data || []).map((p: any) => [p.topic_id, p.status]));
      const toDefer = (topicsRes.data || []).filter((t: any) => {
        const status = progressMap.get(t.id) || 'untouched';
        return status === 'untouched';
      });

      for (const t of toDefer) {
        const oldStatus = progressMap.get(t.id) || 'untouched';
        await supabase.from('user_progress').upsert({
          user_id: userId,
          topic_id: t.id,
          status: 'deferred_scope',
          last_touched: new Date().toISOString(),
        }, { onConflict: 'user_id,topic_id' });

        await supabase.from('status_changes').insert({
          user_id: userId,
          topic_id: t.id,
          old_status: oldStatus,
          new_status: 'deferred_scope',
          reason: 'strategy_cascade_scope_reduction',
        });
      }

      result.action = 'scope_reduced';
      result.topics_deferred = toDefer.length;
      result.gravity_reduced = toDefer.reduce((s: number, t: any) => s + t.pyq_weight, 0);
      break;
    }

    default:
      throw new Error(`Unknown strategy: ${strategyName}`);
  }

  // Recalculate velocity after applying strategy
  try {
    const { calculateVelocity } = await import('./velocity.js');
    await calculateVelocity(userId);
  } catch (e) { console.warn('[strategyCascade:velocity-recalc]', e);
    // Non-critical
  }

  // Post-state
  const { data: postProfile } = await supabase
    .from('user_profiles')
    .select('buffer_balance')
    .eq('id', userId)
    .single();

  const { data: postSnapshot } = await supabase
    .from('velocity_snapshots')
    .select('stress_score')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const stressAfter = postSnapshot?.stress_score ?? stressBefore;
  const bufferAfter = postProfile?.buffer_balance ?? bufferBefore;

  // Compute gap for log
  const { data: gapSnapshot } = await supabase
    .from('velocity_snapshots')
    .select('required_velocity, actual_velocity_7d')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const dailyDeficit = Math.max(0, (gapSnapshot?.required_velocity || 0) - (gapSnapshot?.actual_velocity_7d || 0));
  const gap = round2(dailyDeficit * 7);

  // Log cascade event
  await supabase.from('strategy_cascade_log').insert({
    user_id: userId,
    triggered_by: trigger.triggered_by || 'manual',
    strategy_chosen: strategyName,
    gap,
    stress_before: stressBefore,
    stress_after: stressAfter,
    buffer_before: bufferBefore,
    buffer_after: bufferAfter,
    details: result,
  });

  return { success: true, details: { ...result, stress_before: stressBefore, stress_after: stressAfter, buffer_before: bufferBefore, buffer_after: bufferAfter } };
}

// --- History ---

export async function getCascadeHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('strategy_cascade_log')
    .select('*')
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
