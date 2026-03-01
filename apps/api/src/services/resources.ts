import { supabase } from '../lib/supabase.js';

// ── INFRA-3 + T2-9: Resource guidance layer ──

export async function getResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data || [];
}

export async function getResourcesForTopic(topicId: string) {
  const { data, error } = await supabase
    .from('resource_topic_map')
    .select('*, resources!inner(id, title, author, resource_type, is_standard)')
    .eq('topic_id', topicId)
    .order('relevance', { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => {
    const res = r as unknown as {
      resource_id: string; topic_id: string; chapter_range: string | null;
      relevance: number; notes: string | null;
      resources: { id: string; title: string; author: string | null; resource_type: string; is_standard: boolean };
    };
    return {
      resource_id: res.resources.id,
      title: res.resources.title,
      author: res.resources.author,
      resource_type: res.resources.resource_type,
      is_standard: res.resources.is_standard,
      chapter_range: res.chapter_range,
      relevance: res.relevance,
      notes: res.notes,
    };
  });
}

// ── T4-2: Book-to-topic bridge (reading progress) ──

export async function getReadingProgress(userId: string) {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*, resources!inner(id, title, author, resource_type)')
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((p) => {
    const row = p as unknown as {
      id: string; resource_id: string; total_pages: number | null; pages_read: number;
      completion_pct: number; last_read_at: string | null; notes: string | null;
      resources: { id: string; title: string; author: string | null; resource_type: string };
    };
    return {
      id: row.id,
      resource_id: row.resource_id,
      title: row.resources.title,
      author: row.resources.author,
      total_pages: row.total_pages,
      pages_read: row.pages_read,
      completion_pct: row.completion_pct,
      last_read_at: row.last_read_at,
      notes: row.notes,
    };
  });
}

export async function updateReadingProgress(
  userId: string,
  resourceId: string,
  body: { pages_read?: number; total_pages?: number; notes?: string },
) {
  const pagesRead = body.pages_read ?? 0;
  const totalPages = body.total_pages ?? 0;
  const completionPct = totalPages > 0 ? Math.min(100, Math.round((pagesRead / totalPages) * 100)) : 0;

  const { data, error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: userId,
      resource_id: resourceId,
      pages_read: pagesRead,
      total_pages: totalPages,
      completion_pct: completionPct,
      last_read_at: new Date().toISOString(),
      notes: body.notes,
    }, { onConflict: 'user_id,resource_id' })
    .select()
    .single();

  if (error) throw error;
  return { ...data, completion_pct: completionPct };
}
