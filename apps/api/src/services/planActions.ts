import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';
import { PLANNER } from '../constants/thresholds.js';
import type { XPTriggerType } from '../types/index.js';
import { generateDailyPlan } from './planner.js';
import { appEvents } from './events.js';

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

export async function completePlanItem(userId: string, itemId: string, actualHours: number) {
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
      const { initializeFSRSCard } = await import('./fsrs.js');
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
    const { processEndOfDay } = await import('./endOfDay.js');
    const today = toDateString(new Date());
    await processEndOfDay(userId, today);
  } catch (e) { console.warn('[planner:end-of-day]', e); }

  return { status: 'completed', new_topic_status: newStatus };
}

export async function deferPlanItem(userId: string, itemId: string) {
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
    .update({ status: 'deferred' })
    .eq('id', itemId);

  return { status: 'deferred' };
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
    await supabase.from('daily_plans').delete().eq('id', existing.id);
  }

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
