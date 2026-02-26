import { supabase } from '../lib/supabase.js';
import { calculateFatigueScore } from './burnout.js';
import { getActiveSubjectIds, getImportanceModifiers } from './mode.js';
import type { ExamMode } from '../types/index.js';

export async function generateDailyPlan(userId: string, date: string) {
  // Check if plan already exists
  const { data: existing } = await supabase
    .from('daily_plans')
    .select('*, daily_plan_items(*)')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .single();

  if (existing) return formatPlan(existing);

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('Profile not found');

  // Check fatigue
  const fatigueScore = await calculateFatigueScore(userId);
  const fatigue_threshold = profile.fatigue_threshold || 85;

  // Get recent daily logs (include avg_difficulty for heavy-day check)
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('log_date, hours_studied, avg_difficulty')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(7);

  let consecutiveDays = 0;
  const today = new Date(date);
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const log = (recentLogs || []).find((l) => l.log_date === dateStr);
    if (log && log.hours_studied > 0) consecutiveDays++;
    else break;
  }

  const isLightDay = fatigueScore > fatigue_threshold || consecutiveDays >= 6;

  // Heavy-day constraint: 2 consecutive heavy days (avg_difficulty ≥ 4) → max 3 topics
  const last2Logs = (recentLogs || []).slice(0, 2);
  const isPostHeavy = last2Logs.length >= 2 && last2Logs.every((l) => (l.avg_difficulty || 0) >= 4);

  // Calculate available hours
  let availableHours = profile.daily_hours || 6;
  if (profile.recovery_mode_active) {
    if (profile.recovery_mode_end) {
      const endDate = new Date(profile.recovery_mode_end);
      const planDate = new Date(date);
      if (planDate > endDate) {
        const rampDay = Math.ceil((planDate.getTime() - endDate.getTime()) / 86400000);
        if (rampDay === 1) availableHours *= 0.7;
        else if (rampDay === 2) availableHours *= 0.85;
      } else {
        availableHours *= 0.5;
      }
    } else {
      availableHours *= 0.5;
    }
  }
  if (isLightDay) availableHours *= 0.6;

  // Determine energy level
  let energyLevel: string;
  if (fatigueScore < 30) energyLevel = 'full';
  else if (fatigueScore < 55) energyLevel = 'moderate';
  else if (fatigueScore < 80) energyLevel = 'low';
  else energyLevel = 'empty';

  // Determine max topic count based on fatigue and heavy days
  let maxTopics = Infinity;
  if (isPostHeavy) maxTopics = 3;
  if (fatigueScore > 70 && !isLightDay) {
    const defaultTopicCount = Math.floor(availableHours / 1.5);
    maxTopics = Math.min(maxTopics, Math.max(1, defaultTopicCount - 1));
  }

  // Get eligible topics
  const { data: allTopicsRaw } = await supabase
    .from('topics')
    .select('*, chapters!inner(subject_id, name, subjects!inner(name, papers))')
    .order('pyq_weight', { ascending: false });

  // Filter out paused subjects based on current exam mode
  const activeSubjectIds = await getActiveSubjectIds(userId);
  const allTopics = activeSubjectIds
    ? (allTopicsRaw || []).filter((t) => {
        const subjectId = (t as any).chapters?.subject_id;
        return !subjectId || activeSubjectIds.has(subjectId);
      })
    : (allTopicsRaw || []);

  // Get importance modifiers for current mode
  const currentMode = (profile.current_mode || 'mains') as ExamMode;
  const importanceModifiers = await getImportanceModifiers(currentMode);

  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  const progressMap = new Map((userProgress || []).map((p) => [p.topic_id, p]));

  // Compute subject-level completion gaps (only active subjects)
  const subjectTopicCounts = new Map<string, { total: number; done: number }>();
  for (const t of allTopics || []) {
    const subjectId = (t as any).chapters?.subject_id;
    if (!subjectId) continue;
    const entry = subjectTopicCounts.get(subjectId) || { total: 0, done: 0 };
    entry.total++;
    const prog = progressMap.get(t.id);
    if (prog && ['first_pass', 'revised', 'exam_ready'].includes(prog.status)) {
      entry.done++;
    }
    subjectTopicCounts.set(subjectId, entry);
  }

  // Get yesterday's deferred items for +1 priority boost
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
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

  // Get subject frequency from last 4 plans (for repetition penalty)
  const { data: recentPlans } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .lt('plan_date', date)
    .order('plan_date', { ascending: false })
    .limit(4);

  const subjectPlanCount = new Map<string, number>();
  if (recentPlans && recentPlans.length > 0) {
    const planIds = recentPlans.map((p: any) => p.id);
    const { data: recentPlanItems } = await supabase
      .from('daily_plan_items')
      .select('topic_id')
      .in('plan_id', planIds);

    for (const item of recentPlanItems || []) {
      const topic = (allTopics || []).find((t) => t.id === item.topic_id);
      const subjectId = (topic as any)?.chapters?.subject_id;
      if (subjectId) {
        subjectPlanCount.set(subjectId, (subjectPlanCount.get(subjectId) || 0) + 1);
      }
    }
  }

  // Build radar insight sets for priority adjustments
  const falseSecurityIds = new Set<string>();
  const blindSpotIds = new Set<string>();
  const overRevisedIds = new Set<string>();
  try {
    const { getRadarInsights } = await import('./weakness.js');
    const insights = await getRadarInsights(userId);
    for (const t of insights.false_security) falseSecurityIds.add(t.topic_id);
    for (const t of insights.blind_spots) blindSpotIds.add(t.topic_id);
    for (const t of insights.over_revised) overRevisedIds.add(t.topic_id);
  } catch {
    // Radar insights are non-critical for plan generation
  }

  // Get revisions due
  const { data: revisionsDue } = await supabase
    .from('fsrs_cards')
    .select('topic_id')
    .eq('user_id', userId)
    .lte('due', new Date(date + 'T23:59:59').toISOString());

  const revisionTopicIds = new Set((revisionsDue || []).map((r) => r.topic_id));

  // Working Professional filters
  const isWorkingProfessional = profile.strategy_mode === 'working_professional';
  const pyqWeightMinimum = isWorkingProfessional
    ? ((profile.strategy_params as any)?.pyq_weight_minimum ?? 0.3) : 0;
  const planDate = new Date(date);
  const isWeekend = planDate.getDay() === 0 || planDate.getDay() === 6;

  // Filter eligible topics
  const excludeStatuses = ['exam_ready', 'deferred_scope'];
  const eligibleNew = (allTopics || []).filter((t) => {
    const prog = progressMap.get(t.id);
    const status = prog?.status || 'untouched';
    if (excludeStatuses.includes(status)) return false;
    if (isLightDay && t.difficulty > 2) return false;
    if (revisionTopicIds.has(t.id)) return false;
    if (isWorkingProfessional && t.pyq_weight < pyqWeightMinimum) return false;
    return true;
  });

  // Score topics
  const scoredTopics = eligibleNew.map((t) => {
    const prog = progressMap.get(t.id);
    const subjectId: string | undefined = (t as any).chapters?.subject_id;
    const daysSinceTouch = prog?.last_touched
      ? Math.ceil((Date.now() - new Date(prog.last_touched).getTime()) / 86400000) : 999;

    // Urgency: subject-level completion gap (0–10)
    const subjectStats = subjectId ? subjectTopicCounts.get(subjectId) : null;
    const completionGap = subjectStats ? 1 - (subjectStats.done / subjectStats.total) : 1;
    const urgency = Math.min(10, completionGap * 10);

    // Freshness: +3 if >7d or never touched, +1 if 3–7d, -2 if <3d
    let freshness: number;
    if (!prog) {
      freshness = 3;
    } else if (daysSinceTouch > 7) {
      freshness = 3;
    } else if (daysSinceTouch >= 3) {
      freshness = 1;
    } else {
      freshness = -2;
    }

    // Decay boost: +6 decayed, +4 stale
    const decayBoost = (prog?.confidence_status === 'decayed') ? 6
      : (prog?.confidence_status === 'stale') ? 4 : 0;

    const mockAccuracy = (prog as any)?.mock_accuracy;
    const mockBoost = (mockAccuracy != null && mockAccuracy < 0.3) ? 3
      : (mockAccuracy != null && mockAccuracy < 0.5) ? 2 : 0;

    const subjectPapers: string[] = (t as any).chapters?.subjects?.papers || [];
    const prelimsBoost = (profile.current_mode === 'prelims' && subjectPapers.includes('Prelims')) ? 3 : 0;

    // Radar insight adjustments
    const insightBoost = falseSecurityIds.has(t.id) ? 5
      : blindSpotIds.has(t.id) ? 3
      : overRevisedIds.has(t.id) ? -3 : 0;

    // Deferred from yesterday: +1
    const deferredBoost = deferredTopicIds.has(t.id) ? 1 : 0;

    // Working Professional weekend boost: +3 for high-pyq on weekends
    const weekendBoost = (isWorkingProfessional && isWeekend && t.pyq_weight >= 3) ? 3 : 0;

    // Apply mode importance modifier (e.g., +1 for boosted prelims subjects)
    const modeImportanceBoost = subjectId ? (importanceModifiers.get(subjectId) || 0) : 0;
    const effectiveImportance = t.importance + modeImportanceBoost;

    let priority = (t.pyq_weight * 4) + (effectiveImportance * 2) + (urgency * 2)
      + decayBoost + freshness + mockBoost + prelimsBoost + insightBoost + deferredBoost + weekendBoost;

    // Subject frequency penalty: if subject in 3+ of last 4 plans, reduce by 50%
    if (subjectId && (subjectPlanCount.get(subjectId) || 0) >= 3) {
      priority *= 0.5;
    }

    return { topic: t, priority, type: 'new' as const, subjectId };
  });

  // Score revision topics
  const revisionItems = (allTopics || [])
    .filter((t) => revisionTopicIds.has(t.id))
    .map((t) => {
      const subjectPapers: string[] = (t as any).chapters?.subjects?.papers || [];
      const prelimsBoost = (profile.current_mode === 'prelims' && subjectPapers.includes('Prelims')) ? 3 : 0;
      const subjectId: string | undefined = (t as any).chapters?.subject_id;
      return {
        topic: t,
        priority: (t.pyq_weight * 4) + ((t.importance + (subjectId ? (importanceModifiers.get(subjectId) || 0) : 0)) * 2) + 5 + prelimsBoost,
        type: 'revision' as const,
        subjectId,
      };
    });

  // Combine candidates
  const allCandidates = [...revisionItems, ...scoredTopics];

  // Greedy fill with variety bonus, subject cap (60%), and fatigue/heavy-day limits
  let usedHours = 0;
  const subjectHours = new Map<string, number>();
  const subjectsUsed = new Set<string>();
  const planItems: Array<{
    topic_id: string;
    type: string;
    estimated_hours: number;
    priority_score: number;
    display_order: number;
  }> = [];

  const revisionRatio = (profile.strategy_params as any)?.revision_frequency
    ? 1 / (profile.strategy_params as any).revision_frequency : 0.25;
  const maxRevisionHours = availableHours * revisionRatio;
  let revisionHours = 0;

  const remaining = [...allCandidates];
  let lastSubjectId: string | null = null;
  let order = 0;

  while (usedHours < availableHours && remaining.length > 0 && planItems.length < maxTopics) {
    let bestIdx = -1;
    let bestEffective = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      const hours = Math.min(item.topic.estimated_hours, availableHours - usedHours);
      if (hours < 0.5) continue;
      if (item.type === 'revision' && revisionHours >= maxRevisionHours) continue;

      // Max 60% same subject enforcement
      const subjectId = item.subjectId;
      if (subjectId) {
        const currentSubjectHours = subjectHours.get(subjectId) || 0;
        if (currentSubjectHours + hours > availableHours * 0.6) continue;
      }

      // Variety bonus: +2 if different subject from last added item
      const varietyBonus = (lastSubjectId && subjectId && subjectId !== lastSubjectId) ? 2 : 0;
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

  // Enforce min 2 subjects: swap lowest-priority item with best from another subject
  if (subjectsUsed.size === 1 && planItems.length >= 2) {
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

  // Create daily plan
  const { data: plan, error: planErr } = await supabase
    .from('daily_plans')
    .insert({
      user_id: userId,
      plan_date: date,
      available_hours: availableHours,
      is_light_day: isLightDay,
      fatigue_score: fatigueScore,
      energy_level: energyLevel,
    })
    .select()
    .single();

  if (planErr) throw planErr;

  // Insert plan items
  if (planItems.length > 0) {
    const { error: itemsErr } = await supabase
      .from('daily_plan_items')
      .insert(planItems.map((item) => ({ ...item, plan_id: plan.id })));

    if (itemsErr) throw itemsErr;
  }

  // Fetch complete plan
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
  })).sort((a: any, b: any) => a.display_order - b.display_order);

  return {
    id: plan.id,
    plan_date: plan.plan_date,
    available_hours: plan.available_hours,
    is_light_day: plan.is_light_day,
    fatigue_score: plan.fatigue_score,
    energy_level: plan.energy_level,
    items,
  };
}

export async function completePlanItem(userId: string, itemId: string, actualHours: number) {
  // Get the item with plan info
  const { data: item } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id, plan_date)')
    .eq('id', itemId)
    .single();

  if (!item || (item as any).daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  // Update item
  const { error } = await supabase
    .from('daily_plan_items')
    .update({ status: 'completed', completed_at: new Date().toISOString(), actual_hours: actualHours })
    .eq('id', itemId);

  if (error) throw error;

  // Update user progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', item.topic_id)
    .single();

  const currentHours = progress?.actual_hours_spent || 0;
  let newStatus = progress?.status || 'untouched';

  if (item.type === 'new' && (newStatus === 'untouched' || newStatus === 'in_progress')) {
    newStatus = 'first_pass';

    // Initialize FSRS card when topic reaches first_pass
    try {
      const { initializeFSRSCard } = await import('./fsrs.js');
      await initializeFSRSCard(userId, item.topic_id);
    } catch {
      // FSRS card init is non-critical — recordReview also creates lazily
    }
  }

  await supabase.from('user_progress').upsert({
    user_id: userId,
    topic_id: item.topic_id,
    status: newStatus,
    actual_hours_spent: currentHours + actualHours,
    last_touched: new Date().toISOString(),
  }, { onConflict: 'user_id,topic_id' });

  // Log status change if changed
  if (progress && newStatus !== progress.status) {
    await supabase.from('status_changes').insert({
      user_id: userId,
      topic_id: item.topic_id,
      old_status: progress.status,
      new_status: newStatus,
      reason: 'plan_item_completed',
    });
  }

  // Mark revision complete if it was a revision item
  if (item.type === 'revision' || item.type === 'decay_revision') {
    await supabase
      .from('revision_schedule')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('topic_id', item.topic_id)
      .eq('status', 'pending')
      .order('scheduled_date', { ascending: true })
      .limit(1);
  }

  // Award XP for plan item completion (non-critical)
  try {
    const { awardXP } = await import('./gamification.js');
    const triggerType = `plan_item_${item.type}` as any;
    await awardXP(userId, { triggerType, topicId: item.topic_id });
  } catch {
    // Gamification is non-critical
  }

  return { status: 'completed', new_topic_status: newStatus };
}

export async function deferPlanItem(userId: string, itemId: string) {
  const { data: item } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id)')
    .eq('id', itemId)
    .single();

  if (!item || (item as any).daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  await supabase
    .from('daily_plan_items')
    .update({ status: 'deferred' })
    .eq('id', itemId);

  return { status: 'deferred' };
}

export async function regeneratePlan(userId: string, date: string, newHours?: number) {
  // Delete existing plan
  const { data: existing } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .single();

  if (existing) {
    await supabase.from('daily_plans').delete().eq('id', existing.id);
  }

  // Generate new plan
  const plan = await generateDailyPlan(userId, date);

  if (newHours && plan) {
    await supabase
      .from('daily_plans')
      .update({ available_hours: newHours, is_regenerated: true })
      .eq('user_id', userId)
      .eq('plan_date', date);
  }

  return plan;
}
