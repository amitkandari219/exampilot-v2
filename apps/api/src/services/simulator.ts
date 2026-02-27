import { supabase } from '../lib/supabase.js';
import { getPersonaDefaults } from './modeConfig.js';
import { toDateString, daysAgo, daysUntil } from '../utils/dateUtils.js';
import { VELOCITY, VELOCITY_WEIGHTING } from '../constants/thresholds.js';
import type {
  SimulationScenario,
  SimulationSnapshot,
  SimulationDelta,
  SimulationResult,
  StrategyMode,
  VelocityStatus,
} from '../types/index.js';

interface SimulatorProfile {
  exam_date: string;
  buffer_balance: number;
  buffer_capacity: number;
  buffer_initial: number | null;
  daily_hours: number;
  strategy_mode: string;
  strategy_params: { revision_frequency?: number; [key: string]: unknown };
  current_mode: string;
  prelims_date: string | null;
  velocity_target_multiplier: number;
  created_at: string;
}

interface FocusSubjectSnapshot extends SimulationSnapshot {
  subject_impact?: {
    subject_id: string;
    focus_days: number;
    topics_coverable: number;
    subject_completion_pct_before: number;
    subject_completion_pct_after: number;
    other_subjects_confidence_retention: number;
    avg_stability_other: number;
  };
}

// --- Data fetchers ---

async function getProfileData(userId: string): Promise<SimulatorProfile> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('exam_date, buffer_capacity, buffer_balance, buffer_initial, daily_hours, strategy_params, strategy_mode, current_mode, prelims_date, velocity_target_multiplier')
    .eq('id', userId)
    .single();

  if (!profile || !profile.exam_date) {
    throw new Error('User profile or exam date not found');
  }
  return profile as unknown as SimulatorProfile;
}

async function getGravityData(userId: string) {
  // CHANGED: gravity = pyq_weight only (no difficulty * estimated_hours)
  const { data: topics } = await supabase
    .from('topics')
    .select('id, pyq_weight');

  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  const progressMap = new Map((progress || []).map((p: any) => [p.topic_id, p.status]));
  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  let totalGravity = 0;
  let completedGravity = 0;

  for (const t of topics || []) {
    const gravity = t.pyq_weight; // CHANGED: gravity = pyq_weight only
    totalGravity += gravity;
    const status = progressMap.get(t.id) || 'untouched';
    if (completedStatuses.includes(status)) {
      completedGravity += gravity;
    }
  }

  return { totalGravity, completedGravity, remainingGravity: totalGravity - completedGravity };
}

async function getActualVelocity(userId: string) {
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, gravity_completed')
    .eq('user_id', userId)
    .gte('log_date', toDateString(daysAgo(14)))
    .order('log_date', { ascending: false });

  const sevenDayLogs = (logs || []).slice(0, 7);
  const fourteenDayLogs = logs || [];

  const avg7d = sevenDayLogs.length > 0
    ? sevenDayLogs.reduce((sum: number, l: any) => sum + l.gravity_completed, 0) / sevenDayLogs.length : 0;
  const avg14d = fourteenDayLogs.length > 0
    ? fourteenDayLogs.reduce((sum: number, l: any) => sum + l.gravity_completed, 0) / fourteenDayLogs.length : 0;

  return avg7d * VELOCITY_WEIGHTING.WEIGHT_7D + avg14d * VELOCITY_WEIGHTING.WEIGHT_14D;
}

// --- Velocity math helpers ---

function getVelocityStatus(ratio: number): VelocityStatus {
  if (ratio >= VELOCITY.AHEAD) return 'ahead';
  if (ratio >= VELOCITY.ON_TRACK) return 'on_track';
  if (ratio >= VELOCITY.BEHIND) return 'behind';
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
  return toDateString(projected);
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
  // buffer_max is carried from baseline (fixed at onboarding); only recalc for legacy fallback
  const bufferMax = snapshot.buffer_max || snapshot.days_remaining * snapshot.buffer_capacity;

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
  const daysRemaining = daysUntil(examDate, now);

  const bufferPct = profile.buffer_capacity || 0.15;
  const revisionPct = profile.strategy_params?.revision_frequency
    ? 1 / profile.strategy_params.revision_frequency : 0.25;

  const rawRequiredVelocity = computeRequiredVelocity(gravity.remainingGravity, daysRemaining, bufferPct, revisionPct);
  const requiredVelocity = rawRequiredVelocity * (profile.velocity_target_multiplier ?? 1.0);
  const velocityRatio = requiredVelocity > 0 ? actualVelocity / requiredVelocity : 1;
  const projectedDate = computeProjectedDate(gravity.remainingGravity, actualVelocity);
  // Use fixed buffer_initial set at onboarding; fall back to dynamic calc for legacy users
  const bufferMax = profile.buffer_initial ?? daysRemaining * bufferPct;

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
  const newDaysRemaining = daysUntil(newExamDate, now);
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
    .select('id, pyq_weight')
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
    deferredGravity += t.pyq_weight; // CHANGED: gravity = pyq_weight only
  }

  const modified = { ...snapshot };
  modified.remaining_gravity = Math.max(0, snapshot.remaining_gravity - deferredGravity);
  modified.total_gravity = Math.max(0, snapshot.total_gravity - deferredGravity);
  if (modified.total_gravity > 0) {
    modified.weighted_completion_pct = modified.completed_gravity / modified.total_gravity;
  }
  return recalcSnapshot(modified, revisionPct);
}

async function applyFocusSubject(
  userId: string,
  snapshot: SimulationSnapshot,
  params: { subject_id: string; days: number },
  revisionPct: number,
): Promise<FocusSubjectSnapshot> {
  const days = Math.max(3, Math.min(params.days, 14));

  // Fetch all topics for the focused subject (via chapters)
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id')
    .eq('subject_id', params.subject_id);

  const chapterIds = (chapters || []).map((c: any) => c.id);

  let subjectTopics: any[] = [];
  if (chapterIds.length > 0) {
    const { data: topics } = await supabase
      .from('topics')
      .select('id, pyq_weight, estimated_hours')
      .in('chapter_id', chapterIds);
    subjectTopics = topics || [];
  }

  // Fetch progress for subject topics
  const subjectTopicIds = subjectTopics.map((t: any) => t.id);

  let progressMap = new Map<string, string>();
  if (subjectTopicIds.length > 0) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('topic_id, status')
      .eq('user_id', userId)
      .in('topic_id', subjectTopicIds);
    progressMap = new Map((progress || []).map((p: any) => [p.topic_id, p.status]));
  }

  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  let subjectTotalGravity = 0;
  let subjectCompletedGravity = 0;
  let subjectRemainingTopics: any[] = [];

  for (const t of subjectTopics) {
    subjectTotalGravity += t.pyq_weight;
    const status = progressMap.get(t.id) || 'untouched';
    if (completedStatuses.includes(status)) {
      subjectCompletedGravity += t.pyq_weight;
    } else {
      subjectRemainingTopics.push(t);
    }
  }

  const subjectRemainingGravity = subjectTotalGravity - subjectCompletedGravity;
  const subjectCurrentCompletionPct = subjectTotalGravity > 0 ? subjectCompletedGravity / subjectTotalGravity : 0;

  // Estimate average topic weight for remaining topics
  const avgTopicWeight = subjectRemainingTopics.length > 0
    ? subjectRemainingTopics.reduce((sum: number, t: any) => sum + t.pyq_weight, 0) / subjectRemainingTopics.length
    : 1;

  // Topics coverable = days × (actual_velocity / avg_topic_weight)
  const topicsCoverable = avgTopicWeight > 0 ? days * (snapshot.actual_velocity / avgTopicWeight) : 0;
  const coverableGravity = Math.min(topicsCoverable * avgTopicWeight, subjectRemainingGravity);
  const newSubjectCompletedGravity = subjectCompletedGravity + coverableGravity;
  const projectedSubjectCompletionPct = subjectTotalGravity > 0 ? newSubjectCompletedGravity / subjectTotalGravity : 1;

  // Fetch FSRS cards for all other topics to project confidence decline
  const { data: allCards } = await supabase
    .from('fsrs_cards')
    .select('topic_id, stability')
    .eq('user_id', userId)
    .not('topic_id', 'in', `(${subjectTopicIds.length > 0 ? subjectTopicIds.join(',') : 'null'})`);

  const otherCards = allCards || [];
  const avgStability = otherCards.length > 0
    ? otherCards.reduce((sum: number, c: any) => sum + (c.stability || 1), 0) / otherCards.length
    : 1;

  // FSRS retrievability formula: R = (1 + N / (9 × S))^(-1)
  const confidenceDeclineFactor = Math.pow(1 + days / (9 * avgStability), -1);

  // During N days of focus, velocity on other topics is effectively 0.
  // Model this as the remaining gravity staying the same but losing N days of productive time.
  const modified = { ...snapshot };
  modified.days_remaining = Math.max(1, snapshot.days_remaining - days);
  // Buffer is untouched — focus days are intentional, not zero-days
  return {
    ...recalcSnapshot(modified, revisionPct),
    subject_impact: {
      subject_id: params.subject_id,
      focus_days: days,
      topics_coverable: Math.round(topicsCoverable),
      subject_completion_pct_before: subjectCurrentCompletionPct,
      subject_completion_pct_after: projectedSubjectCompletionPct,
      other_subjects_confidence_retention: confidenceDeclineFactor,
      avg_stability_other: avgStability,
    },
  };
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

  let projected: FocusSubjectSnapshot;

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
    case 'focus_subject':
      projected = await applyFocusSubject(userId, baseline, scenario.params as { subject_id: string; days: number }, revisionPct);
      break;
    default:
      throw new Error(`Unknown scenario type: ${(scenario as SimulationScenario).type}`);
  }

  const delta = computeDelta(baseline, projected);

  // Compute verdict based on projected status
  let verdict: 'green' | 'yellow' | 'red';
  if (projected.status === 'ahead' || projected.status === 'on_track') {
    verdict = 'green';
  } else if (projected.status === 'behind') {
    verdict = 'yellow';
  } else {
    verdict = 'red';
  }

  // Generate recommendation string based on scenario type and verdict
  let recommendation: string;
  switch (scenario.type) {
    case 'skip_days': {
      const days = scenario.params.days ?? 0;
      if (verdict === 'green') {
        recommendation = `Skipping ${days} day(s) keeps you on track. Buffer absorbs the gap — you can recover comfortably.`;
      } else if (verdict === 'yellow') {
        recommendation = `Skipping ${days} day(s) puts you behind. Plan to increase daily hours for a few days after your break to recover.`;
      } else {
        recommendation = `Skipping ${days} day(s) is risky. Consider reducing scope or switching to a more aggressive strategy to avoid falling behind.`;
      }
      break;
    }
    case 'change_hours': {
      const hours = scenario.params.daily_hours ?? 0;
      if (verdict === 'green') {
        recommendation = `Studying ${hours}h/day is sufficient. You'll stay on track without additional changes.`;
      } else if (verdict === 'yellow') {
        recommendation = `${hours}h/day will leave you slightly behind. Try to find at least one extra hour on weekends.`;
      } else {
        recommendation = `${hours}h/day is insufficient at this stage. Either increase study hours significantly or reduce scope.`;
      }
      break;
    }
    case 'change_strategy': {
      const mode = scenario.params.strategy_mode ?? '';
      if (verdict === 'green') {
        recommendation = `Switching to '${mode}' keeps you comfortably on track. This change is safe to make.`;
      } else if (verdict === 'yellow') {
        recommendation = `Switching to '${mode}' introduces some risk. Monitor your velocity closely for the first two weeks.`;
      } else {
        recommendation = `Switching to '${mode}' puts your exam prep at risk. Stick with your current strategy or choose a more aggressive mode.`;
      }
      break;
    }
    case 'change_exam_date': {
      const examDate = scenario.params.exam_date ?? '';
      if (verdict === 'green') {
        recommendation = `Moving your exam date to ${examDate} gives you a healthy runway. Your current pace is sustainable.`;
      } else if (verdict === 'yellow') {
        recommendation = `With the new exam date of ${examDate}, you're slightly behind. Tighten your daily plan to close the gap.`;
      } else {
        recommendation = `The exam date ${examDate} is very tight at your current velocity. Consider increasing daily hours or reducing scope.`;
      }
      break;
    }
    case 'defer_topics': {
      const count = scenario.params.count ?? 0;
      if (verdict === 'green') {
        recommendation = `Deferring ${count} low-priority topic(s) meaningfully improves your trajectory without sacrificing coverage.`;
      } else if (verdict === 'yellow') {
        recommendation = `Deferring ${count} topic(s) helps but you're still slightly behind. Consider deferring a few more low-weight topics.`;
      } else {
        recommendation = `Even after deferring ${count} topic(s), you're at risk. Revisit your daily hours and consider a more aggressive strategy.`;
      }
      break;
    }
    case 'focus_subject': {
      const focusDays = scenario.params.days ?? 0;
      const subjectImpact = projected.subject_impact;
      const afterPct = subjectImpact ? Math.round(subjectImpact.subject_completion_pct_after * 100) : 0;
      const retentionPct = subjectImpact ? Math.round(subjectImpact.other_subjects_confidence_retention * 100) : 0;
      if (verdict === 'green') {
        recommendation = `A ${focusDays}-day focus sprint can push subject completion to ~${afterPct}% while other subjects retain ~${retentionPct}% confidence. Safe to proceed.`;
      } else if (verdict === 'yellow') {
        recommendation = `A ${focusDays}-day focus sprint improves subject coverage to ~${afterPct}% but slightly delays overall progress. Consider a shorter sprint of 3–5 days instead.`;
      } else {
        recommendation = `A ${focusDays}-day focus sprint puts your overall prep at risk. Other subjects may drop to ~${retentionPct}% confidence. Limit the sprint to 3 days or interleave with lighter revision of other subjects.`;
      }
      break;
    }
    default:
      recommendation = verdict === 'green'
        ? 'Your study plan looks healthy after this change.'
        : verdict === 'yellow'
          ? 'This change introduces some risk — monitor progress closely.'
          : 'This change puts your exam prep at risk. Consider adjusting your approach.';
  }

  return { scenario, baseline, projected, delta, verdict, recommendation };
}
