import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';
import { PLANNER, MICRO_SESSION } from '../constants/thresholds.js';
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

export async function getResumePoint(userId: string) {
  // Find most recently touched topic with its context
  const { data: recent } = await supabase
    .from('user_progress')
    .select('topic_id, status, last_touched, confidence_score, actual_hours_spent')
    .eq('user_id', userId)
    .not('last_touched', 'is', null)
    .order('last_touched', { ascending: false })
    .limit(1)
    .single();

  if (!recent || !recent.topic_id) return null;

  const { data: topic } = await supabase
    .from('topics')
    .select('name, chapter_id, difficulty, pyq_weight, chapters(name, subjects(name))')
    .eq('id', recent.topic_id)
    .single();

  if (!topic) return null;

  const topicData = topic as unknown as {
    name: string; chapter_id: string; difficulty: number; pyq_weight: number;
    chapters: { name: string; subjects: { name: string } };
  };

  return {
    topic_id: recent.topic_id,
    topic_name: topicData.name,
    chapter_name: topicData.chapters?.name,
    subject_name: topicData.chapters?.subjects?.name,
    status: recent.status,
    last_touched: recent.last_touched,
    confidence_score: recent.confidence_score,
    hours_spent: recent.actual_hours_spent,
  };
}

export async function getMicroSessionPlan(userId: string, availableMinutes: number) {
  const minutes = Math.max(5, availableMinutes);

  // Get revision topics due that fit the time window
  const { data: revisionsDue } = await supabase
    .from('fsrs_cards')
    .select('topic_id')
    .eq('user_id', userId)
    .lte('due', new Date().toISOString());

  const revisionTopicIds = new Set((revisionsDue || []).map((r) => r.topic_id));

  // Fetch topics that fit within the available time
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, difficulty, pyq_weight, estimated_micro_minutes, estimated_hours, chapters!inner(name, subject_id, subjects!inner(name))')
    .lte('estimated_micro_minutes', minutes)
    .order('pyq_weight', { ascending: false });

  if (!topics || topics.length === 0) return { items: [], available_minutes: minutes };

  // Get user progress to filter out exam_ready / deferred
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('topic_id, status, confidence_status')
    .eq('user_id', userId);

  const progressMap = new Map((progressRows || []).map((p) => [p.topic_id, p]));

  interface MicroCandidate {
    topic_id: string;
    topic_name: string;
    subject_name: string;
    chapter_name: string;
    estimated_minutes: number;
    type: 'revision' | 'new';
    score: number;
    difficulty: number;
    pyq_weight: number;
  }

  const candidates: MicroCandidate[] = [];
  for (const t of topics) {
    const prog = progressMap.get(t.id);
    const status = prog?.status || 'untouched';
    if (['exam_ready', 'deferred_scope'].includes(status)) continue;

    const topicData = t as unknown as {
      id: string; name: string; difficulty: number; pyq_weight: number;
      estimated_micro_minutes: number; estimated_hours: number;
      chapters: { name: string; subject_id: string; subjects: { name: string } };
    };

    const isRevision = revisionTopicIds.has(t.id);
    const revBoost = isRevision ? MICRO_SESSION.REVISION_BOOST : 0;
    const decayBoost = (prog?.confidence_status === 'decayed' || prog?.confidence_status === 'stale') ? MICRO_SESSION.URGENCY_BOOST : 0;
    const score = topicData.pyq_weight * 2 + revBoost + decayBoost;

    candidates.push({
      topic_id: topicData.id,
      topic_name: topicData.name,
      subject_name: topicData.chapters?.subjects?.name || '',
      chapter_name: topicData.chapters?.name || '',
      estimated_minutes: topicData.estimated_micro_minutes,
      type: isRevision ? 'revision' : 'new',
      score,
      difficulty: topicData.difficulty,
      pyq_weight: topicData.pyq_weight,
    });
  }

  // Sort by score descending, pick top N that fit within total time
  candidates.sort((a, b) => b.score - a.score);

  const selected: MicroCandidate[] = [];
  let totalMinutes = 0;
  for (const c of candidates) {
    if (selected.length >= MICRO_SESSION.MAX_ITEMS) break;
    if (totalMinutes + c.estimated_minutes > minutes) continue;
    selected.push(c);
    totalMinutes += c.estimated_minutes;
  }

  return { items: selected, available_minutes: minutes, total_minutes: totalMinutes };
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
