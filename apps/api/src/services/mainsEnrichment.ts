import { supabase } from '../lib/supabase.js';

interface MainsEnrichmentRow {
  id: string;
  topic_id: string;
  is_answer_writing_topic: boolean;
  is_essay_relevant: boolean;
  mains_importance: number;
  typical_question_type: string | null;
  word_limit_typical: number | null;
}

export async function getMainsDelta(userId: string) {
  // Get all mains enrichment data joined with topics
  const { data: enrichments } = await supabase
    .from('mains_topic_enrichment')
    .select('*, topics!inner(name, importance, pyq_weight, chapters!inner(name, subjects!inner(name)))')
    .order('mains_importance', { ascending: false });

  // Get user progress for these topics
  const topicIds = (enrichments || []).map((e: { topic_id: string }) => e.topic_id);
  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, status, confidence_score, health_score')
    .eq('user_id', userId)
    .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__']);

  const progressMap = new Map((progress || []).map((p: { topic_id: string; status: string; confidence_score: number; health_score: number }) => [p.topic_id, p]));

  interface EnrichmentWithTopic extends MainsEnrichmentRow {
    topics: { name: string; importance: number; pyq_weight: number; chapters: { name: string; subjects: { name: string } } };
  }
  const rows = (enrichments || []) as unknown as EnrichmentWithTopic[];

  const answerWritingTopics = rows.filter((r) => r.is_answer_writing_topic);
  const essayTopics = rows.filter((r) => r.is_essay_relevant);

  // Gap analysis: high mains_importance but low health/confidence
  const gaps = rows
    .filter((r) => r.mains_importance >= 4)
    .map((r) => {
      const prog = progressMap.get(r.topic_id);
      return {
        topic_id: r.topic_id,
        topic_name: r.topics.name,
        subject_name: r.topics.chapters?.subjects?.name,
        mains_importance: r.mains_importance,
        is_answer_writing: r.is_answer_writing_topic,
        typical_question_type: r.typical_question_type,
        status: prog?.status || 'untouched',
        health_score: prog?.health_score ?? 0,
        confidence_score: prog?.confidence_score ?? 0,
      };
    })
    .filter((t) => t.health_score < 50 || t.status === 'untouched')
    .sort((a, b) => b.mains_importance - a.mains_importance);

  return {
    total_enriched: rows.length,
    answer_writing_count: answerWritingTopics.length,
    essay_relevant_count: essayTopics.length,
    mains_gaps: gaps.slice(0, 20),
    question_type_distribution: countQuestionTypes(rows),
  };
}

function countQuestionTypes(rows: Array<{ typical_question_type: string | null }>) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const type = r.typical_question_type || 'unclassified';
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

export async function upsertMainsEnrichment(
  topicId: string,
  data: {
    is_answer_writing_topic?: boolean;
    is_essay_relevant?: boolean;
    mains_importance?: number;
    typical_question_type?: string;
    word_limit_typical?: number;
  }
) {
  const { error } = await supabase
    .from('mains_topic_enrichment')
    .upsert({ topic_id: topicId, ...data }, { onConflict: 'topic_id' });

  if (error) throw error;
  return { success: true };
}
