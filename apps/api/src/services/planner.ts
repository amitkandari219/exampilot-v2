import { supabase } from '../lib/supabase.js';
import { calculateFatigueScore } from './burnout.js';

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

  // Check consecutive study days for light day
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('log_date, hours_studied')
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

  // Calculate available hours
  let availableHours = profile.daily_hours || 6;
  if (profile.recovery_mode_active) {
    // Check ramp-up day
    if (profile.recovery_mode_end) {
      const endDate = new Date(profile.recovery_mode_end);
      const planDate = new Date(date);
      if (planDate > endDate) {
        // Ramp-up period
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

  // Get eligible topics
  const { data: allTopics } = await supabase
    .from('topics')
    .select('*, chapters!inner(subject_id, name, subjects!inner(name))')
    .order('pyq_weight', { ascending: false });

  const { data: userProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  const progressMap = new Map((userProgress || []).map((p) => [p.topic_id, p]));

  // Get revisions due
  const { data: revisionsDue } = await supabase
    .from('fsrs_cards')
    .select('topic_id')
    .eq('user_id', userId)
    .lte('due', new Date(date + 'T23:59:59').toISOString());

  const revisionTopicIds = new Set((revisionsDue || []).map((r) => r.topic_id));

  // Filter eligible topics
  const excludeStatuses = ['exam_ready', 'deferred_scope'];
  const eligibleNew = (allTopics || []).filter((t) => {
    const prog = progressMap.get(t.id);
    const status = prog?.status || 'untouched';
    if (excludeStatuses.includes(status)) return false;
    if (isLightDay && t.difficulty > 2) return false;
    if (revisionTopicIds.has(t.id)) return false;
    return true;
  });

  // Score topics
  const scoredTopics = eligibleNew.map((t) => {
    const prog = progressMap.get(t.id);
    const daysSinceTouch = prog?.last_touched
      ? Math.ceil((Date.now() - new Date(prog.last_touched).getTime()) / 86400000) : 999;

    const urgency = Math.min(10, daysSinceTouch / 7);
    const freshness = prog ? 0 : 2;
    const decayBoost = (prog?.confidence_status === 'decayed') ? 3
      : (prog?.confidence_status === 'stale') ? 2 : 0;

    const priority = (t.pyq_weight * 4) + (t.importance * 2) + (urgency * 2) + decayBoost + freshness;

    return { topic: t, priority, type: 'new' as const };
  });

  // Score revision topics
  const revisionItems = (allTopics || [])
    .filter((t) => revisionTopicIds.has(t.id))
    .map((t) => ({
      topic: t,
      priority: (t.pyq_weight * 4) + (t.importance * 2) + 5, // revision bonus
      type: 'revision' as const,
    }));

  // Combine and sort
  const allItems = [...revisionItems, ...scoredTopics].sort((a, b) => b.priority - a.priority);

  // Greedy fill
  let usedHours = 0;
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

  let order = 0;
  for (const item of allItems) {
    if (usedHours >= availableHours) break;

    const hours = Math.min(item.topic.estimated_hours, availableHours - usedHours);
    if (hours < 0.5) continue;

    if (item.type === 'revision' && revisionHours >= maxRevisionHours) continue;

    const subjectId = (item.topic as any).chapters?.subject_id;
    planItems.push({
      topic_id: item.topic.id,
      type: item.type,
      estimated_hours: hours,
      priority_score: item.priority,
      display_order: order++,
    });

    usedHours += hours;
    if (item.type === 'revision') revisionHours += hours;
    if (subjectId) subjectsUsed.add(subjectId);
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
