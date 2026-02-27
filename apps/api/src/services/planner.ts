import { supabase } from '../lib/supabase.js';
import { calculateFatigueScore } from './burnout.js';
import { getActiveSubjectIds, getImportanceModifiers } from './modeConfig.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';
import { PLANNER, BURNOUT } from '../constants/thresholds.js';
import type { ExamMode, StrategyParams } from '../types/index.js';

// ── Types for internal planner context ──

interface TopicWithJoins {
  id: string;
  name: string;
  chapter_id: string;
  importance: number;
  difficulty: number;
  estimated_hours: number;
  pyq_weight: number;
  pyq_frequency: number;
  display_order: number;
  chapters: {
    subject_id: string;
    name: string;
    subjects: { name: string; papers: string[] };
  };
}

interface PlanItemWithJoins {
  id: string;
  plan_id: string;
  topic_id: string;
  type: string;
  estimated_hours: number;
  priority_score: number;
  display_order: number;
  status: string;
  completed_at: string | null;
  actual_hours: number | null;
  daily_plans: { user_id: string; plan_date: string };
}

interface ProgressEntry {
  topic_id: string;
  status: string;
  last_touched?: string | null;
  confidence_status?: string | null;
  actual_hours_spent?: number | null;
  mock_accuracy?: number | null;
}

interface PlannerProfile {
  daily_hours: number;
  strategy_mode: string;
  strategy_params: StrategyParams | null;
  current_mode: string;
  recovery_mode_active: boolean;
  recovery_mode_end: string | null;
  fatigue_threshold: number;
  pyq_weight_minimum: number;
}

interface DailyLogEntry {
  log_date: string;
  hours_studied: number;
  avg_difficulty: number;
}

interface ScoredCandidate {
  topic: TopicWithJoins;
  priority: number;
  type: 'new' | 'revision';
  subjectId: string | undefined;
}

interface PlanItem {
  topic_id: string;
  type: string;
  estimated_hours: number;
  priority_score: number;
  display_order: number;
}

interface PlannerContext {
  profile: PlannerProfile;
  fatigueScore: number;
  recentLogs: DailyLogEntry[];
  allTopics: TopicWithJoins[];
  progressMap: Map<string, ProgressEntry>;
  revisionTopicIds: Set<string>;
  deferredTopicIds: Set<string>;
  subjectPlanCount: Map<string, number>;
  subjectTopicCounts: Map<string, { total: number; done: number }>;
  importanceModifiers: Map<string, number>;
  falseSecurityIds: Set<string>;
  blindSpotIds: Set<string>;
  overRevisedIds: Set<string>;
  availableHours: number;
  isLightDay: boolean;
  isPostHeavy: boolean;
  energyLevel: string;
  maxTopics: number;
  maxAvgDifficulty: number;
  date: string;
  revisionRatio: number;
}

// ── 1. Data fetching ──

async function fetchPlannerData(userId: string, date: string): Promise<PlannerContext> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');
  const typedProfile = profile as unknown as PlannerProfile;

  const fatigueScore = await calculateFatigueScore(userId);

  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('log_date, hours_studied, avg_difficulty')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(PLANNER.RECENT_LOGS_LIMIT);

  // Get eligible topics filtered by active subjects
  const { data: allTopicsRaw } = await supabase
    .from('topics')
    .select('*, chapters!inner(subject_id, name, subjects!inner(name, papers))')
    .order('pyq_weight', { ascending: false });

  const activeSubjectIds = await getActiveSubjectIds(userId);
  const allTopics = (activeSubjectIds
    ? (allTopicsRaw || []).filter((t) => {
        const subjectId = (t as TopicWithJoins).chapters?.subject_id;
        return !subjectId || activeSubjectIds.has(subjectId);
      })
    : (allTopicsRaw || [])) as TopicWithJoins[];

  const currentMode = (profile.current_mode || 'mains') as ExamMode;
  const importanceModifiers = await getImportanceModifiers(currentMode);

  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  const progressMap = new Map((userProgress || []).map((p) => [p.topic_id, p as ProgressEntry]));

  // Subject-level completion gaps
  const subjectTopicCounts = new Map<string, { total: number; done: number }>();
  for (const t of allTopics || []) {
    const subjectId = t.chapters?.subject_id;
    if (!subjectId) continue;
    const entry = subjectTopicCounts.get(subjectId) || { total: 0, done: 0 };
    entry.total++;
    const prog = progressMap.get(t.id);
    if (prog && ['first_pass', 'revised', 'exam_ready'].includes(prog.status)) {
      entry.done++;
    }
    subjectTopicCounts.set(subjectId, entry);
  }

  // Yesterday's deferred items
  const yesterdayStr = toDateString(daysAgo(1, new Date(date)));
  const { data: yesterdayPlan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', yesterdayStr)
    .single();

  const deferredTopicIds = new Set<string>();
  if (yesterdayPlan) {
    const { data: deferredItems } = await supabase
      .from('daily_plan_items')
      .select('topic_id')
      .eq('plan_id', yesterdayPlan.id)
      .eq('status', 'deferred');
    for (const d of deferredItems || []) deferredTopicIds.add(d.topic_id);
  }

  // Subject frequency from last 4 plans
  const { data: recentPlans } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .lt('plan_date', date)
    .order('plan_date', { ascending: false })
    .limit(PLANNER.RECENT_PLANS_LIMIT);

  const subjectPlanCount = new Map<string, number>();
  if (recentPlans && recentPlans.length > 0) {
    const planIds = recentPlans.map((p) => p.id);
    const { data: recentPlanItems } = await supabase
      .from('daily_plan_items')
      .select('topic_id')
      .in('plan_id', planIds);

    for (const item of recentPlanItems || []) {
      const topic = (allTopics || []).find((t) => t.id === item.topic_id);
      const subjectId = topic?.chapters?.subject_id;
      if (subjectId) {
        subjectPlanCount.set(subjectId, (subjectPlanCount.get(subjectId) || 0) + 1);
      }
    }
  }

  // Radar insights
  const falseSecurityIds = new Set<string>();
  const blindSpotIds = new Set<string>();
  const overRevisedIds = new Set<string>();
  try {
    const { getRadarInsights } = await import('./weakness.js');
    const insights = await getRadarInsights(userId);
    for (const t of insights.false_security) falseSecurityIds.add(t.topic_id);
    for (const t of insights.blind_spots) blindSpotIds.add(t.topic_id);
    for (const t of insights.over_revised) overRevisedIds.add(t.topic_id);
  } catch (e) { console.warn('[planner:radar-insights]', e);
    // Radar insights are non-critical for plan generation
  }

  // Revisions due
  const { data: revisionsDue } = await supabase
    .from('fsrs_cards')
    .select('topic_id')
    .eq('user_id', userId)
    .lte('due', new Date(date + 'T23:59:59').toISOString());

  const revisionTopicIds = new Set((revisionsDue || []).map((r) => r.topic_id));

  // Assess capacity
  const typedLogs = (recentLogs || []) as unknown as DailyLogEntry[];
  const capacity = assessCapacity(typedProfile, fatigueScore, typedLogs, date);

  // Compute revision ratio
  const revisionRatio = typedProfile.strategy_params?.revision_frequency
    ? 1 / typedProfile.strategy_params.revision_frequency : PLANNER.DEFAULT_REVISION_RATIO;

  return {
    profile: typedProfile, fatigueScore, recentLogs: typedLogs, allTopics,
    progressMap, revisionTopicIds, deferredTopicIds, subjectPlanCount,
    subjectTopicCounts, importanceModifiers, falseSecurityIds, blindSpotIds, overRevisedIds,
    ...capacity, date, revisionRatio,
  };
}

// ── Capacity assessment (private helper) ──

function assessCapacity(
  profile: PlannerProfile, fatigueScore: number, recentLogs: DailyLogEntry[], date: string,
): { availableHours: number; isLightDay: boolean; isPostHeavy: boolean; energyLevel: string; maxTopics: number; maxAvgDifficulty: number } {
  const fatigueThreshold = profile.fatigue_threshold || BURNOUT.FATIGUE_DEFAULT;

  let consecutiveDays = 0;
  const today = new Date(date);
  for (let i = 1; i <= 7; i++) {
    const dateStr = toDateString(daysAgo(i, today));
    const log = recentLogs.find((l) => l.log_date === dateStr);
    if (log && log.hours_studied > 0) consecutiveDays++;
    else break;
  }

  const isLightDay = fatigueScore > fatigueThreshold || consecutiveDays >= PLANNER.CONSECUTIVE_DAYS_LIGHT;

  const last2Logs = recentLogs.slice(0, 2);
  const isPostHeavy = last2Logs.length >= 2 && last2Logs.every((l) => (l.avg_difficulty || 0) >= PLANNER.POST_HEAVY_DIFFICULTY);

  let availableHours = profile.daily_hours || PLANNER.DEFAULT_DAILY_HOURS;
  if (profile.recovery_mode_active) {
    availableHours *= BURNOUT.RECOVERY_HALF;
  } else if (profile.recovery_mode_end) {
    const endDate = new Date(profile.recovery_mode_end);
    const planDate = new Date(date);
    const daysSinceEnd = Math.ceil((planDate.getTime() - endDate.getTime()) / 86400000);
    if (daysSinceEnd === 1) availableHours *= BURNOUT.RAMP_DAY1;
    else if (daysSinceEnd === 2) availableHours *= BURNOUT.RAMP_DAY2;
  }
  if (isLightDay) availableHours *= BURNOUT.LIGHT_DAY_MULTIPLIER;

  let energyLevel: string;
  if (fatigueScore < PLANNER.FATIGUE_ENERGY_FULL) energyLevel = 'full';
  else if (fatigueScore < PLANNER.FATIGUE_ENERGY_MODERATE) energyLevel = 'moderate';
  else if (fatigueScore < PLANNER.FATIGUE_ENERGY_LOW) energyLevel = 'low';
  else energyLevel = 'empty';

  let maxTopics = Infinity;
  let maxAvgDifficulty = Infinity;
  if (isPostHeavy) {
    maxTopics = PLANNER.POST_HEAVY_MAX_TOPICS;
    maxAvgDifficulty = PLANNER.POST_HEAVY_MAX_DIFFICULTY;
  }
  if (fatigueScore > PLANNER.FATIGUE_TOPIC_LIMIT && !isLightDay) {
    const defaultTopicCount = Math.floor(availableHours / PLANNER.HOURS_PER_TOPIC_ESTIMATE);
    maxTopics = Math.min(maxTopics, Math.max(1, defaultTopicCount - 1));
  }

  return { availableHours, isLightDay, isPostHeavy, energyLevel, maxTopics, maxAvgDifficulty };
}

// ── 2. Topic scoring (pure functions, no DB calls) ──

function scoreTopic(t: TopicWithJoins, ctx: PlannerContext): number {
  const { profile, progressMap, deferredTopicIds, subjectPlanCount, subjectTopicCounts,
    importanceModifiers, falseSecurityIds, blindSpotIds, overRevisedIds } = ctx;

  const prog = progressMap.get(t.id);
  const subjectId: string | undefined = t.chapters?.subject_id;
  const daysSinceTouch = prog?.last_touched
    ? Math.ceil((Date.now() - new Date(prog.last_touched).getTime()) / 86400000) : Infinity;

  // Urgency: subject-level completion gap (0–10)
  const subjectStats = subjectId ? subjectTopicCounts.get(subjectId) : null;
  const completionGap = subjectStats ? 1 - (subjectStats.done / subjectStats.total) : 1;
  const urgency = Math.min(10, completionGap * 10);

  // Freshness
  let freshness: number;
  if (!prog) freshness = PLANNER.FRESHNESS_SCORE_NEW;
  else if (daysSinceTouch > PLANNER.FRESHNESS_STALE_DAYS) freshness = PLANNER.FRESHNESS_SCORE_NEW;
  else if (daysSinceTouch >= PLANNER.FRESHNESS_MODERATE_DAYS) freshness = PLANNER.FRESHNESS_SCORE_MODERATE;
  else freshness = PLANNER.FRESHNESS_SCORE_RECENT;

  const decayBoost = (prog?.confidence_status === 'decayed') ? PLANNER.DECAY_BOOST_DECAYED
    : (prog?.confidence_status === 'stale') ? PLANNER.DECAY_BOOST_STALE : 0;

  const mockAccuracy = prog?.mock_accuracy;
  const mockBoost = (mockAccuracy != null && mockAccuracy < PLANNER.MOCK_ACCURACY_LOW) ? PLANNER.MOCK_BOOST_LOW
    : (mockAccuracy != null && mockAccuracy < PLANNER.MOCK_ACCURACY_MED) ? PLANNER.MOCK_BOOST_MED : 0;

  const subjectPapers: string[] = t.chapters?.subjects?.papers || [];
  const prelimsBoost = (profile.current_mode === 'prelims' && subjectPapers.includes('Prelims')) ? PLANNER.PRELIMS_BOOST : 0;

  const insightBoost = falseSecurityIds.has(t.id) ? PLANNER.INSIGHT_FALSE_SECURITY
    : blindSpotIds.has(t.id) ? PLANNER.INSIGHT_BLIND_SPOT
    : overRevisedIds.has(t.id) ? PLANNER.INSIGHT_OVER_REVISED : 0;

  const deferredBoost = deferredTopicIds.has(t.id) ? PLANNER.DEFERRED_BOOST : 0;

  const planDate = new Date(ctx.date);
  const isWorkingProfessional = profile.strategy_mode === 'working_professional';
  const isWeekend = planDate.getDay() === 0 || planDate.getDay() === 6;
  const weekendBoost = (isWorkingProfessional && isWeekend && t.pyq_weight >= 3) ? PLANNER.WEEKEND_BOOST : 0;

  const modeImportanceBoost = subjectId ? (importanceModifiers.get(subjectId) || 0) : 0;
  const effectiveImportance = t.importance + modeImportanceBoost;

  let priority = (t.pyq_weight * PLANNER.PYQ_FACTOR) + (effectiveImportance * PLANNER.IMPORTANCE_FACTOR) + (urgency * PLANNER.URGENCY_FACTOR)
    + decayBoost + freshness + mockBoost + prelimsBoost + insightBoost + deferredBoost + weekendBoost;

  if (subjectId && (subjectPlanCount.get(subjectId) || 0) >= PLANNER.SUBJECT_REPEAT_LIMIT) {
    priority *= PLANNER.SUBJECT_REPEAT_PENALTY;
  }

  return priority;
}

function scoreRevisionTopic(t: TopicWithJoins, ctx: PlannerContext): number {
  const { profile, importanceModifiers } = ctx;
  const subjectPapers: string[] = t.chapters?.subjects?.papers || [];
  const prelimsBoost = (profile.current_mode === 'prelims' && subjectPapers.includes('Prelims')) ? PLANNER.PRELIMS_BOOST : 0;
  const subjectId: string | undefined = t.chapters?.subject_id;
  const modeBoost = subjectId ? (importanceModifiers.get(subjectId) || 0) : 0;
  return (t.pyq_weight * PLANNER.PYQ_FACTOR) + ((t.importance + modeBoost) * PLANNER.IMPORTANCE_FACTOR) + PLANNER.REVISION_BASE_BOOST + prelimsBoost;
}

// ── 3. Constraint filtering ──

function applyConstraints(candidates: ScoredCandidate[], ctx: PlannerContext): ScoredCandidate[] {
  const isWP = ctx.profile.strategy_mode === 'working_professional';
  const pyqMin = isWP ? (ctx.profile.pyq_weight_minimum ?? 0.3) : 0;

  return candidates.filter((c) => {
    const prog = ctx.progressMap.get(c.topic.id);
    const status = prog?.status || 'untouched';
    if (['exam_ready', 'deferred_scope'].includes(status)) return false;
    if (ctx.isLightDay && c.topic.difficulty > 2) return false;
    if (c.type === 'new' && ctx.revisionTopicIds.has(c.topic.id)) return false;
    if (isWP && c.topic.pyq_weight < pyqMin) return false;
    return true;
  });
}

// ── 4. Greedy allocation ──

function allocateGreedy(candidates: ScoredCandidate[], ctx: PlannerContext): PlanItem[] {
  const { availableHours, maxTopics, maxAvgDifficulty, revisionRatio } = ctx;
  let usedHours = 0;
  const subjectHours = new Map<string, number>();
  const subjectsUsed = new Set<string>();
  const planItems: PlanItem[] = [];

  const maxRevisionHours = availableHours * revisionRatio;
  let revisionHours = 0;
  const remaining = [...candidates];
  let lastSubjectId: string | null = null;
  let order = 0;

  while (usedHours < availableHours && remaining.length > 0 && planItems.length < maxTopics) {
    let bestIdx = -1;
    let bestEffective = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const hours = Math.min(item.topic.estimated_hours, availableHours - usedHours);
      if (hours < PLANNER.MIN_HOURS_PER_TOPIC) continue;
      if (item.type === 'revision' && revisionHours >= maxRevisionHours) continue;

      const subjectId = item.subjectId;
      if (subjectId) {
        const currentSubjectHours = subjectHours.get(subjectId) || 0;
        if (currentSubjectHours + hours > availableHours * PLANNER.MAX_SAME_SUBJECT_PCT) continue;
      }

      if (maxAvgDifficulty < Infinity && planItems.length > 0) {
        const currentDiffSum = planItems.reduce((s, p) => {
          const t = candidates.find(c => c.topic.id === p.topic_id);
          return s + (t?.topic.difficulty || 3);
        }, 0);
        const projectedAvg = (currentDiffSum + (item.topic.difficulty || 3)) / (planItems.length + 1);
        if (projectedAvg > maxAvgDifficulty) continue;
      }

      const varietyBonus = (lastSubjectId && subjectId && subjectId !== lastSubjectId) ? PLANNER.VARIETY_BONUS : 0;
      const effective = item.priority + varietyBonus;

      if (effective > bestEffective) {
        bestEffective = effective;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;

    const item = remaining[bestIdx];
    const hours = Math.min(item.topic.estimated_hours, availableHours - usedHours);
    const subjectId = item.subjectId;

    planItems.push({
      topic_id: item.topic.id,
      type: item.type,
      estimated_hours: hours,
      priority_score: item.priority,
      display_order: order++,
    });

    usedHours += hours;
    if (item.type === 'revision') revisionHours += hours;
    if (subjectId) {
      subjectsUsed.add(subjectId);
      subjectHours.set(subjectId, (subjectHours.get(subjectId) || 0) + hours);
    }
    lastSubjectId = subjectId || null;
    remaining.splice(bestIdx, 1);
  }

  // Ensure min 2 subjects
  ensureDualSubject(planItems, remaining, subjectsUsed);

  return planItems;
}

function ensureDualSubject(
  planItems: PlanItem[],
  remaining: ScoredCandidate[],
  subjectsUsed: Set<string>,
) {
  if (subjectsUsed.size !== 1 || planItems.length < 2) return;

  const currentSubject = [...subjectsUsed][0];
  const altCandidate = remaining
    .filter((c) => c.subjectId && c.subjectId !== currentSubject)
    .sort((a, b) => b.priority - a.priority)[0];

  if (altCandidate) {
    const lastItem = planItems[planItems.length - 1];
    const hours = Math.min(altCandidate.topic.estimated_hours, lastItem.estimated_hours);
    planItems[planItems.length - 1] = {
      topic_id: altCandidate.topic.id,
      type: altCandidate.type,
      estimated_hours: hours,
      priority_score: altCandidate.priority,
      display_order: lastItem.display_order,
    };
    subjectsUsed.add(altCandidate.subjectId!);
  }
}

// ── Main orchestrator ──

export async function generateDailyPlan(userId: string, date: string) {
  const { data: existing } = await supabase
    .from('daily_plans')
    .select('*, daily_plan_items(*, topics(name, chapter_id, pyq_weight, difficulty, chapters(name, subjects(name))))')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .single();

  if (existing) return formatPlan(existing);

  const ctx = await fetchPlannerData(userId, date);

  const newCandidates: ScoredCandidate[] = ctx.allTopics.map((t) => ({
    topic: t, priority: scoreTopic(t, ctx), type: 'new', subjectId: t.chapters?.subject_id,
  }));
  const revCandidates: ScoredCandidate[] = ctx.allTopics
    .filter((t) => ctx.revisionTopicIds.has(t.id))
    .map((t) => ({ topic: t, priority: scoreRevisionTopic(t, ctx), type: 'revision', subjectId: t.chapters?.subject_id }));

  const constrained = applyConstraints([...revCandidates, ...newCandidates], ctx);
  constrained.sort((a, b) => b.priority - a.priority);
  const planItems = allocateGreedy(constrained, ctx);

  const { data: plan, error: planErr } = await supabase
    .from('daily_plans')
    .insert({
      user_id: userId, plan_date: date, available_hours: ctx.availableHours,
      is_light_day: ctx.isLightDay, fatigue_score: ctx.fatigueScore, energy_level: ctx.energyLevel,
    })
    .select()
    .single();

  if (planErr) throw planErr;

  if (planItems.length > 0) {
    const { error: itemsErr } = await supabase
      .from('daily_plan_items')
      .insert(planItems.map((item) => ({ ...item, plan_id: plan.id })));
    if (itemsErr) throw itemsErr;
  }

  const { data: completePlan } = await supabase
    .from('daily_plans')
    .select('*, daily_plan_items(*, topics(name, chapter_id, pyq_weight, difficulty, chapters(name, subjects(name))))')
    .eq('id', plan.id)
    .single();

  return formatPlan(completePlan);
}

function formatPlan(plan: any) {
  if (!plan) return null;

  const items = (plan.daily_plan_items || []).map((item: any) => ({
    id: item.id,
    plan_id: item.plan_id,
    topic_id: item.topic_id,
    type: item.type,
    estimated_hours: item.estimated_hours,
    priority_score: item.priority_score,
    display_order: item.display_order,
    status: item.status,
    completed_at: item.completed_at,
    actual_hours: item.actual_hours,
    topic: item.topics ? {
      name: item.topics.name,
      chapter_id: item.topics.chapter_id,
      pyq_weight: item.topics.pyq_weight,
      difficulty: item.topics.difficulty,
    } : undefined,
    chapter_name: item.topics?.chapters?.name,
    subject_name: item.topics?.chapters?.subjects?.name,
  })).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order);

  const fs = plan.fatigue_score || 0;
  const fatigueStatus = fs > PLANNER.FATIGUE_STATUS_CRITICAL ? 'critical' : fs > PLANNER.FATIGUE_STATUS_HIGH ? 'high' : fs > PLANNER.FATIGUE_STATUS_MODERATE ? 'moderate' : 'low';

  return {
    id: plan.id,
    plan_date: plan.plan_date,
    available_hours: plan.available_hours,
    is_light_day: plan.is_light_day,
    fatigue_score: plan.fatigue_score,
    fatigue_status: fatigueStatus,
    energy_level: plan.energy_level,
    items,
  };
}

// Re-export mutation functions from planActions
export { completePlanItem, deferPlanItem, skipPlanItem, regeneratePlan, scheduleImmediateRevision } from './planActions.js';
