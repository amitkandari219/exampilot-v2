import { supabase } from '../lib/supabase.js';

interface LogEventParams {
  userId: string;
  eventType: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export async function logSystemEvent(params: LogEventParams) {
  const { error } = await supabase.from('system_events').insert({
    user_id: params.userId,
    event_type: params.eventType,
    title: params.title,
    description: params.description || null,
    metadata: params.metadata || {},
  });
  if (error) console.warn('[systemEvents:log]', error.message);
}

export async function getRecentEvents(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
