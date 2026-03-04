import { supabase } from '../lib/supabase.js';
import { toDateString, todayInTimezone } from '../utils/dateUtils.js';
import { PLANNER } from '../constants/thresholds.js';
import type { XPTriggerType } from '../types/index.js';
import { generateDailyPlan } from './planner.js';
import { initializeFSRSCard } from './fsrs.js';
import { appEvents } from './events.js';
import { logSystemEvent } from './systemEvents.js';

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

export async function completePlanItem(userId: string, itemId: string, actualHours: number, timezone?: string) {
  const { data: itemRaw } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id, plan_date)')
    .eq('id', itemId)
    .single();

  const item = itemRaw as PlanItemWithJoins | null;

  if (!item || item.daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  const { error } = await supabase
    .from('daily_plan_items')
    .update({ status: 'completed', completed_at: new Date().toISOString(), actual_hours: actualHours })
    .eq('id', itemId);

  if (error) throw error;

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

    try {
      await initializeFSRSCard(userId, item.topic_id);
    } catch (e) { console.warn('[planner:fsrs-init]', e); }
  }

  await supabase.from('user_progress').upsert({
    user_id: userId,
    topic_id: item.topic_id,
    status: newStatus,
    actual_hours_spent: currentHours + actualHours,
    last_touched: new Date().toISOString(),
  }, { onConflict: 'user_id,topic_id' });

  if (progress && newStatus !== progress.status) {
    await supabase.from('status_changes').insert({
      user_id: userId,
      topic_id: item.topic_id,
      old_status: progress.status,
      new_status: newStatus,
      reason: 'plan_item_completed',
    });
  }

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

  const triggerType = `plan_item_${item.type}` as XPTriggerType;
  appEvents.emit('xp:award', { userId, triggerType, topicId: item.topic_id });

  try {
    const { scheduleEndOfDay } = await import('./endOfDay.js');
    const today = timezone ? todayInTimezone(timezone) : toDateString(new Date());
    scheduleEndOfDay(userId, today);
  } catch (e) { console.warn('[planner:end-of-day]', e); }

  return { status: 'completed', new_topic_status: newStatus };
}

export async function movePlanItem(
  userId: string,
  itemId: string,
  targetDate: string,
  timezone?: string
) {
  // Validate targetDate is not in the past
  const today = timezone ? todayInTimezone(timezone) : toDateString(new Date());
  if (targetDate < today) {
    throw Object.assign(new Error('Cannot move to a past date'), { statusCode: 400 });
  }

  const { data: itemRaw } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id, plan_date)')
    .eq('id', itemId)
    .single();

  const item = itemRaw as PlanItemWithJoins | null;

  if (!item || item.daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  // Find or create target day's plan
  let { data: targetPlan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', targetDate)
    .single();

  if (!targetPlan) {
    const created = await generateDailyPlan(userId, targetDate);
    if (created) {
      targetPlan = { id: created.id };
    }
  }

  if (!targetPlan) {
    throw new Error('Could not create plan for target date');
  }

  // Get next display order in target plan
  const { data: lastItems } = await supabase
    .from('daily_plan_items')
    .select('display_order')
    .eq('plan_id', targetPlan.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = (lastItems?.[0]?.display_order || 0) + 1;

  // Move item to target plan
  const { error } = await supabase
    .from('daily_plan_items')
    .update({ plan_id: targetPlan.id, display_order: nextOrder })
    .eq('id', itemId);

  if (error) throw error;

  // Check if target day exceeds capacity
  const { data: targetItems } = await supabase
    .from('daily_plan_items')
    .select('estimated_hours')
    .eq('plan_id', targetPlan.id)
    .neq('status', 'skipped');

  const totalHours = (targetItems || []).reduce(
    (sum: number, i: { estimated_hours: number }) => sum + (i.estimated_hours || 0), 0
  );

  const { data: planData } = await supabase
    .from('daily_plans')
    .select('available_hours')
    .eq('id', targetPlan.id)
    .single();

  const targetHours = planData?.available_hours || PLANNER.DEFAULT_DAILY_HOURS;
  const overCapacity = totalHours > targetHours + 1;

  // Log override as system event
  logSystemEvent({
    userId,
    eventType: 'plan_override',
    title: 'Plan item moved',
    description: `Moved to ${targetDate}`,
    metadata: { itemId, targetDate, overCapacity },
  });

  return { success: true, overCapacity, totalHours, targetHours };
}

export async function deferPlanItem(userId: string, itemId: string, timezone?: string) {
  const { data: itemRaw } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id, plan_date)')
    .eq('id', itemId)
    .single();

  const item = itemRaw as PlanItemWithJoins | null;

  if (!item || item.daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  // Find next available day with capacity below target
  const today = timezone ? todayInTimezone(timezone) : toDateString(new Date());
  const startDate = new Date(today);
  let targetDate: string | null = null;

  for (let d = 1; d <= 7; d++) {
    const candidate = new Date(startDate);
    candidate.setDate(candidate.getDate() + d);
    const candidateStr = toDateString(candidate);

    const { data: dayPlan } = await supabase
      .from('daily_plans')
      .select('id, available_hours')
      .eq('user_id', userId)
      .eq('plan_date', candidateStr)
      .single();

    if (!dayPlan) {
      targetDate = candidateStr;
      break;
    }

    const { data: dayItems } = await supabase
      .from('daily_plan_items')
      .select('estimated_hours')
      .eq('plan_id', dayPlan.id)
      .not('status', 'in', '("skipped","deferred")');

    const usedHours = (dayItems || []).reduce(
      (sum: number, i: { estimated_hours: number }) => sum + (i.estimated_hours || 0), 0
    );

    if (usedHours < (dayPlan.available_hours || PLANNER.DEFAULT_DAILY_HOURS)) {
      targetDate = candidateStr;
      break;
    }
  }

  // Mark original item as deferred
  await supabase
    .from('daily_plan_items')
    .update({ status: 'deferred' })
    .eq('id', itemId);

  if (!targetDate) {
    // Fallback to tomorrow if no capacity found in 7 days
    const tomorrow = new Date(startDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    targetDate = toDateString(tomorrow);
  }

  // Create new item on target date
  let { data: targetPlan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', targetDate)
    .single();

  if (!targetPlan) {
    const created = await generateDailyPlan(userId, targetDate);
    if (created) targetPlan = { id: created.id };
  }

  if (targetPlan) {
    const { data: lastItems } = await supabase
      .from('daily_plan_items')
      .select('display_order')
      .eq('plan_id', targetPlan.id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (lastItems?.[0]?.display_order || 0) + 1;

    await supabase.from('daily_plan_items').insert({
      plan_id: targetPlan.id,
      topic_id: item.topic_id,
      type: item.type,
      estimated_hours: item.estimated_hours,
      priority_score: item.priority_score + PLANNER.DEFERRED_BOOST,
      display_order: nextOrder,
      status: 'pending',
      reason: 'Deferred from ' + item.daily_plans.plan_date + ' — picking up where you left off.',
    });
  }

  logSystemEvent({
    userId,
    eventType: 'plan_override',
    title: 'Plan item deferred',
    description: `Deferred to ${targetDate}`,
    metadata: { itemId, targetDate },
  });

  return { status: 'deferred', movedTo: targetDate };
}

export async function skipPlanItem(userId: string, itemId: string) {
  const { data: itemRaw } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id)')
    .eq('id', itemId)
    .single();

  const item = itemRaw as PlanItemWithJoins | null;

  if (!item || item.daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  await supabase
    .from('daily_plan_items')
    .update({ status: 'skipped' })
    .eq('id', itemId);

  return { status: 'skipped' };
}

export async function regeneratePlan(userId: string, date: string, newHours?: number) {
  const { data: existing } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', date)
    .single();

  if (existing) {
    // Collect completed items before touching anything
    const { data: completedItems } = await supabase
      .from('daily_plan_items')
      .select('topic_id, type, estimated_hours, actual_hours, priority_score, status, completed_at')
      .eq('plan_id', existing.id)
      .eq('status', 'completed');

    // Delete old plan entirely (cascades items)
    await supabase.from('daily_plans').delete().eq('id', existing.id);

    // Generate fresh plan
    const plan = await generateDailyPlan(userId, date);

    if (!plan) {
      console.warn('[regeneratePlan] generation failed after delete', { userId, date });
      return null;
    }

    // Re-attach completed items to the new plan
    if (completedItems && completedItems.length > 0) {
      const { data: lastItems } = await supabase
        .from('daily_plan_items')
        .select('display_order')
        .eq('plan_id', plan.id)
        .order('display_order', { ascending: false })
        .limit(1);

      let order = (lastItems?.[0]?.display_order || 0) + 1;

      for (const item of completedItems) {
        await supabase.from('daily_plan_items').insert({
          plan_id: plan.id,
          topic_id: item.topic_id,
          type: item.type,
          estimated_hours: item.estimated_hours,
          actual_hours: item.actual_hours,
          priority_score: item.priority_score,
          display_order: order++,
          status: 'completed',
          completed_at: item.completed_at,
        });
      }
    }

    if (newHours) {
      await supabase
        .from('daily_plans')
        .update({ available_hours: newHours, is_regenerated: true })
        .eq('id', plan.id);
    }

    return plan;
  }

  // No existing plan — just generate
  const plan = await generateDailyPlan(userId, date);

  if (newHours && plan) {
    await supabase
      .from('daily_plans')
      .update({ available_hours: newHours, is_regenerated: true })
      .eq('id', plan.id);
  }

  return plan;
}

export async function scheduleImmediateRevision(userId: string, topicIds: string[]) {
  if (topicIds.length === 0) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  let { data: plan } = await supabase
    .from('daily_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', tomorrowStr)
    .single();

  if (!plan) {
    const created = await generateDailyPlan(userId, tomorrowStr);
    if (created) {
      plan = { id: created.id };
    }
  }

  if (!plan) return;

  const { data: items } = await supabase
    .from('daily_plan_items')
    .select('display_order')
    .eq('plan_id', plan.id)
    .order('display_order', { ascending: false })
    .limit(1);

  let order = (items?.[0]?.display_order || 0) + 1;

  for (const topicId of topicIds.slice(0, PLANNER.MAX_IMMEDIATE_REVISIONS)) {
    await supabase.from('daily_plan_items').insert({
      plan_id: plan.id,
      topic_id: topicId,
      type: 'decay_revision',
      estimated_hours: PLANNER.DECAY_REVISION_HOURS,
      priority_score: PLANNER.DECAY_REVISION_PRIORITY,
      display_order: order++,
      status: 'pending',
    });
  }
}

export async function updatePlanItemEstimate(userId: string, itemId: string, estimatedHours: number) {
  const { data: itemRaw } = await supabase
    .from('daily_plan_items')
    .select('*, daily_plans!inner(user_id)')
    .eq('id', itemId)
    .single();

  const item = itemRaw as PlanItemWithJoins | null;
  if (!item || item.daily_plans.user_id !== userId) {
    throw new Error('Plan item not found');
  }

  await supabase
    .from('daily_plan_items')
    .update({ estimated_hours: estimatedHours })
    .eq('id', itemId);

  logSystemEvent({
    userId,
    eventType: 'plan_override',
    title: 'Time allocation changed',
    description: `Changed from ${item.estimated_hours}h to ${estimatedHours}h`,
    metadata: { itemId, oldHours: item.estimated_hours, newHours: estimatedHours },
  });

  return { success: true, estimated_hours: estimatedHours };
}

export async function strategyLockTopic(userId: string, topicId: string, lockDays: number) {
  // lockDays === 0 means unlock
  const lockUntilStr = lockDays > 0
    ? (() => { const d = new Date(); d.setDate(d.getDate() + lockDays); return toDateString(d); })()
    : null;

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      strategy_locked_until: lockUntilStr,
    }, { onConflict: 'user_id,topic_id' });

  if (error) throw error;

  logSystemEvent({
    userId,
    eventType: lockDays > 0 ? 'strategy_lock' : 'strategy_unlock',
    title: lockDays > 0 ? 'Strategy Lock applied' : 'Strategy Lock removed',
    description: lockDays > 0
      ? `Topic locked for ${lockDays} days (until ${lockUntilStr})`
      : 'Topic unlocked — returning to normal priority scoring',
    metadata: { topicId, lockDays, lockUntil: lockUntilStr },
  });

  return { locked: lockDays > 0, lock_until: lockUntilStr };
}
