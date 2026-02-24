import { supabase } from '../lib/supabase.js';
import { getPersonaDefaults } from './strategy.js';
import type {
  SimulationScenario,
  SimulationSnapshot,
  SimulationDelta,
  SimulationResult,
  StrategyMode,
  VelocityStatus,
} from '../types/index.js';

// --- Data fetchers ---

async function getProfileData(userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('exam_date, buffer_capacity, buffer_balance, daily_hours, strategy_params, strategy_mode, current_mode, prelims_date')
    .eq('id', userId)
    .single();

  if (!profile || !profile.exam_date) {
    throw new Error('User profile or exam date not found');
  }
  return profile;
}

async function getGravityData(userId: string) {
  const { data: topics } = await supabase
    .from('topics')
    .select('id, pyq_weight, difficulty, estimated_hours');

  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  const progressMap = new Map((progress || []).map((p: any) => [p.topic_id, p.status]));
  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  let totalGravity = 0;
  let completedGravity = 0;

  for (const t of topics || []) {
    const gravity = t.pyq_weight * t.difficulty * t.estimated_hours;
    totalGravity += gravity;
    const status = progressMap.get(t.id) || 'untouched';
    if (completedStatuses.includes(status)) {
      completedGravity += gravity;
    }
  }

  return { totalGravity, completedGravity, remainingGravity: totalGravity - completedGravity };
}

async function getActualVelocity(userId: string) {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, gravity_completed')
    .eq('user_id', userId)
    .gte('log_date', fourteenDaysAgo.toISOString().split('T')[0])
    .order('log_date', { ascending: false });

  const sevenDayLogs = (logs || []).slice(0, 7);
  const fourteenDayLogs = logs || [];

  const avg7d = sevenDayLogs.length > 0
    ? sevenDayLogs.reduce((sum: number, l: any) => sum + l.gravity_completed, 0) / sevenDayLogs.length : 0;
  const avg14d = fourteenDayLogs.length > 0
    ? fourteenDayLogs.reduce((sum: number, l: any) => sum + l.gravity_completed, 0) / fourteenDayLogs.length : 0;

  return avg7d * 0.6 + avg14d * 0.4;
}

// --- Velocity math helpers ---

function getVelocityStatus(ratio: number): VelocityStatus {
  if (ratio >= 1.1) return 'ahead';
  if (ratio >= 0.9) return 'on_track';
  if (ratio >= 0.7) return 'behind';
  return 'at_risk';
}

function computeRequiredVelocity(remainingGravity: number, daysRemaining: number, bufferPct: number, revisionPct: number): number {
  const effectiveDays = daysRemaining * (1 - bufferPct - revisionPct);
  return effectiveDays > 0 ? remainingGravity / effectiveDays : 0;
}

function computeProjectedDate(remainingGravity: number, actualVelocity: number): string | null {
  if (actualVelocity <= 0) return null;
  const daysToComplete = remainingGravity / actualVelocity;
  const projected = new Date();
  projected.setDate(projected.getDate() + Math.ceil(daysToComplete));
  return projected.toISOString().split('T')[0];
}

function recalcSnapshot(snapshot: SimulationSnapshot, revisionPct: number): SimulationSnapshot {
  const requiredVelocity = computeRequiredVelocity(
    snapshot.remaining_gravity,
    snapshot.days_remaining,
    snapshot.buffer_capacity,
    revisionPct,
  );
  const velocityRatio = requiredVelocity > 0 ? snapshot.actual_velocity / requiredVelocity : 1;
  const projectedDate = computeProjectedDate(snapshot.remaining_gravity, snapshot.actual_velocity);
  const bufferMax = snapshot.days_remaining * snapshot.buffer_capacity;

  return {
    ...snapshot,
    required_velocity: requiredVelocity,
    velocity_ratio: velocityRatio,
    status: getVelocityStatus(velocityRatio),
    projected_completion_date: projectedDate,
    buffer_max: bufferMax,
    buffer_balance: Math.min(snapshot.buffer_balance, bufferMax),
  };
}

// --- Baseline computation ---

async function computeBaseline(userId: string): Promise<{ snapshot: SimulationSnapshot; revisionPct: number }> {
  const profile = await getProfileData(userId);
  const gravity = await getGravityData(userId);
  const actualVelocity = await getActualVelocity(userId);

  const now = new Date();
  const targetDate = (profile.current_mode === 'prelims' && profile.prelims_date)
    ? profile.prelims_date : profile.exam_date;
  const examDate = new Date(targetDate);
  const daysRemaining = Math.max(1, Math.ceil((examDate.getTime() - now.getTime()) / 86400000));

  const bufferPct = profile.buffer_capacity || 0.15;
  const revisionPct = (profile.strategy_params as any)?.revision_frequency
    ? 1 / (profile.strategy_params as any).revision_frequency : 0.25;

  const requiredVelocity = computeRequiredVelocity(gravity.remainingGravity, daysRemaining, bufferPct, revisionPct);
  const velocityRatio = requiredVelocity > 0 ? actualVelocity / requiredVelocity : 1;
  const projectedDate = computeProjectedDate(gravity.remainingGravity, actualVelocity);
  const bufferMax = daysRemaining * bufferPct;

  const snapshot: SimulationSnapshot = {
    velocity_ratio: velocityRatio,
    status: getVelocityStatus(velocityRatio),
    actual_velocity: actualVelocity,
    required_velocity: requiredVelocity,
    days_remaining: daysRemaining,
    projected_completion_date: projectedDate,
    weighted_completion_pct: gravity.totalGravity > 0 ? gravity.completedGravity / gravity.totalGravity : 0,
    buffer_balance: profile.buffer_balance || 0,
    buffer_capacity: bufferPct,
    buffer_max: bufferMax,
    daily_hours: profile.daily_hours,
    strategy_mode: profile.strategy_mode as StrategyMode,
    exam_date: targetDate,
    total_gravity: gravity.totalGravity,
    completed_gravity: gravity.completedGravity,
    remaining_gravity: gravity.remainingGravity,
  };

  return { snapshot, revisionPct };
}

// --- Scenario transforms (pure functions on snapshot copy) ---

function applySkipDays(snapshot: SimulationSnapshot, params: { days: number }, revisionPct: number): SimulationSnapshot {
  const days = Math.max(0, Math.min(params.days, snapshot.days_remaining - 1));
  const modified = { ...snapshot };
  modified.days_remaining -= days;
  // Zero-day penalty: -1.0 buffer per skipped day
  modified.buffer_balance = Math.max(0, modified.buffer_balance - days * 1.0);
  return recalcSnapshot(modified, revisionPct);
}

function applyChangeHours(snapshot: SimulationSnapshot, params: { daily_hours: number }, revisionPct: number): SimulationSnapshot {
  const newHours = Math.max(0.5, params.daily_hours);
  const modified = { ...snapshot };
  const ratio = snapshot.daily_hours > 0 ? newHours / snapshot.daily_hours : 1;
  modified.actual_velocity = snapshot.actual_velocity * ratio;
  modified.daily_hours = newHours;
  return recalcSnapshot(modified, revisionPct);
}

function applyChangeStrategy(snapshot: SimulationSnapshot, params: { strategy_mode: StrategyMode }, revisionPct: number): SimulationSnapshot {
  const persona = getPersonaDefaults(params.strategy_mode);
  const modified = { ...snapshot };
  modified.buffer_capacity = persona.buffer_capacity;
  modified.strategy_mode = params.strategy_mode;
  return recalcSnapshot(modified, revisionPct);
}

function applyChangeExamDate(snapshot: SimulationSnapshot, params: { exam_date: string }, revisionPct: number): SimulationSnapshot {
  const newExamDate = new Date(params.exam_date);
  const now = new Date();
  const newDaysRemaining = Math.max(1, Math.ceil((newExamDate.getTime() - now.getTime()) / 86400000));
  const modified = { ...snapshot };
  modified.days_remaining = newDaysRemaining;
  modified.exam_date = params.exam_date;
  return recalcSnapshot(modified, revisionPct);
}

async function applyDeferTopics(userId: string, snapshot: SimulationSnapshot, params: { count: number }, revisionPct: number): Promise<SimulationSnapshot> {
  const count = Math.max(0, params.count);
  if (count === 0) return snapshot;

  // Get untouched topics sorted by lowest pyq_weight (lowest priority first)
  const { data: topics } = await supabase
    .from('topics')
    .select('id, pyq_weight, difficulty, estimated_hours')
    .order('pyq_weight', { ascending: true });

  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  const progressMap = new Map((progress || []).map((p: any) => [p.topic_id, p.status]));

  const untouched = (topics || []).filter((t: any) => {
    const status = progressMap.get(t.id) || 'untouched';
    return status === 'untouched';
  });

  const toDefer = untouched.slice(0, count);
  let deferredGravity = 0;
  for (const t of toDefer) {
    deferredGravity += t.pyq_weight * t.difficulty * t.estimated_hours;
  }

  const modified = { ...snapshot };
  modified.remaining_gravity = Math.max(0, snapshot.remaining_gravity - deferredGravity);
  modified.total_gravity = Math.max(0, snapshot.total_gravity - deferredGravity);
  if (modified.total_gravity > 0) {
    modified.weighted_completion_pct = modified.completed_gravity / modified.total_gravity;
  }
  return recalcSnapshot(modified, revisionPct);
}

// --- Delta computation ---

function computeDelta(baseline: SimulationSnapshot, projected: SimulationSnapshot): SimulationDelta {
  let completionShift: number | null = null;
  if (baseline.projected_completion_date && projected.projected_completion_date) {
    const baseDate = new Date(baseline.projected_completion_date);
    const projDate = new Date(projected.projected_completion_date);
    completionShift = Math.round((projDate.getTime() - baseDate.getTime()) / 86400000);
  }

  const statusChanged = baseline.status !== projected.status;

  return {
    velocity_ratio_change: projected.velocity_ratio - baseline.velocity_ratio,
    status_change: statusChanged ? `${baseline.status} → ${projected.status}` : 'no change',
    days_remaining_change: projected.days_remaining - baseline.days_remaining,
    completion_date_shift_days: completionShift,
    buffer_balance_change: projected.buffer_balance - baseline.buffer_balance,
  };
}

// --- Main entry point ---

export async function runSimulation(userId: string, scenario: SimulationScenario): Promise<SimulationResult> {
  const { snapshot: baseline, revisionPct } = await computeBaseline(userId);

  let projected: SimulationSnapshot;

  switch (scenario.type) {
    case 'skip_days':
      projected = applySkipDays(baseline, scenario.params as { days: number }, revisionPct);
      break;
    case 'change_hours':
      projected = applyChangeHours(baseline, scenario.params as { daily_hours: number }, revisionPct);
      break;
    case 'change_strategy':
      projected = applyChangeStrategy(baseline, scenario.params as { strategy_mode: StrategyMode }, revisionPct);
      break;
    case 'change_exam_date':
      projected = applyChangeExamDate(baseline, scenario.params as { exam_date: string }, revisionPct);
      break;
    case 'defer_topics':
      projected = await applyDeferTopics(userId, baseline, scenario.params as { count: number }, revisionPct);
      break;
    default:
      throw new Error(`Unknown scenario type: ${(scenario as any).type}`);
  }

  const delta = computeDelta(baseline, projected);

  return { scenario, baseline, projected, delta };
}
