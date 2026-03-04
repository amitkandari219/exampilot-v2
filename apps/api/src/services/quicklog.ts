import { supabase } from '../lib/supabase.js';
import { appEvents } from './events.js';
import type { QuickLogPayload } from '../types/index.js';

export async function createQuickLog(userId: string, payload: QuickLogPayload) {
  const { data, error } = await supabase
    .from('quick_logs')
    .insert({
      user_id: userId,
      topic_id: payload.topic_id || null,
      hours: payload.hours,
      notes: payload.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  appEvents.emit('xp:award', {
    userId,
    triggerType: 'plan_item_new',
    topicId: payload.topic_id,
  });

  return data;
}

export async function getQuickLogs(userId: string, date?: string) {
  let query = supabase
    .from('quick_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (date) {
    query = query
      .gte('logged_at', `${date}T00:00:00Z`)
      .lt('logged_at', `${date}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}
