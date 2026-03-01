import { supabase } from '../lib/supabase.js';
import { appEvents } from './events.js';

// ── INFRA-4 + T2-7: Answer writing framework ──

export async function getTemplatesForTopic(topicId: string) {
  const { data, error } = await supabase
    .from('answer_templates')
    .select('*')
    .eq('topic_id', topicId)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

interface SubmissionBody {
  template_id: string;
  topic_id: string;
  word_count?: number;
  time_taken_minutes?: number;
  score_structure?: number;
  score_intro?: number;
  score_examples?: number;
  score_analysis?: number;
  score_conclusion?: number;
  notes?: string;
}

export async function submitAnswer(userId: string, body: SubmissionBody) {
  const scores = [
    body.score_structure, body.score_intro, body.score_examples,
    body.score_analysis, body.score_conclusion,
  ].filter((s): s is number => s != null);

  const totalScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : null;

  const { data, error } = await supabase
    .from('answer_submissions')
    .insert({
      user_id: userId,
      template_id: body.template_id,
      topic_id: body.topic_id,
      word_count: body.word_count,
      time_taken_minutes: body.time_taken_minutes,
      score_structure: body.score_structure,
      score_intro: body.score_intro,
      score_examples: body.score_examples,
      score_analysis: body.score_analysis,
      score_conclusion: body.score_conclusion,
      total_score: totalScore,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) throw error;

  // Award XP for answer practice
  appEvents.emit('xp:award', { userId, triggerType: 'plan_item_new', topicId: body.topic_id });

  return { submission: data, total_score: totalScore };
}

export async function getAnswerHistory(userId: string, topicId?: string) {
  let query = supabase
    .from('answer_submissions')
    .select('*, answer_templates!inner(prompt, question_type, word_limit)')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(50);

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((s) => {
    const row = s as unknown as {
      id: string; template_id: string; topic_id: string; word_count: number | null;
      time_taken_minutes: number | null; score_structure: number | null;
      score_intro: number | null; score_examples: number | null;
      score_analysis: number | null; score_conclusion: number | null;
      total_score: number | null; notes: string | null; submitted_at: string;
      answer_templates: { prompt: string; question_type: string; word_limit: number };
    };
    return {
      id: row.id,
      template_id: row.template_id,
      topic_id: row.topic_id,
      prompt: row.answer_templates.prompt,
      question_type: row.answer_templates.question_type,
      word_limit: row.answer_templates.word_limit,
      word_count: row.word_count,
      time_taken_minutes: row.time_taken_minutes,
      scores: {
        structure: row.score_structure,
        intro: row.score_intro,
        examples: row.score_examples,
        analysis: row.score_analysis,
        conclusion: row.score_conclusion,
      },
      total_score: row.total_score,
      notes: row.notes,
      submitted_at: row.submitted_at,
    };
  });
}

export async function getAnswerStats(userId: string) {
  const { data, error } = await supabase
    .from('answer_submissions')
    .select('topic_id, total_score, time_taken_minutes, submitted_at')
    .eq('user_id', userId);

  if (error) throw error;
  const submissions = data || [];
  if (submissions.length === 0) {
    return { total_submissions: 0, avg_score: 0, topics_practiced: 0, avg_time_minutes: 0 };
  }

  const scores = submissions.filter((s) => s.total_score != null).map((s) => s.total_score as number);
  const times = submissions.filter((s) => s.time_taken_minutes != null).map((s) => s.time_taken_minutes as number);
  const uniqueTopics = new Set(submissions.map((s) => s.topic_id));

  return {
    total_submissions: submissions.length,
    avg_score: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    topics_practiced: uniqueTopics.size,
    avg_time_minutes: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
  };
}
