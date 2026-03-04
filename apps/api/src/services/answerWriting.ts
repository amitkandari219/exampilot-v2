import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';

interface LogAnswerPayload {
  topic_id?: string;
  question_text?: string;
  word_count?: number;
  time_taken_minutes?: number;
  self_score?: number;
  practice_date?: string;
}

export async function logAnswer(userId: string, data: LogAnswerPayload) {
  const { data: row, error } = await supabase
    .from('answer_practice')
    .insert({
      user_id: userId,
      topic_id: data.topic_id || null,
      question_text: data.question_text || null,
      word_count: data.word_count || null,
      time_taken_minutes: data.time_taken_minutes || null,
      self_score: data.self_score || null,
      practice_date: data.practice_date || toDateString(new Date()),
    })
    .select()
    .single();

  if (error) throw error;
  return row;
}

export async function getAnswerStats(userId: string) {
  const today = toDateString(new Date());

  const { data: allRows, error } = await supabase
    .from('answer_practice')
    .select('practice_date, self_score, word_count')
    .eq('user_id', userId);

  if (error) throw error;

  const rows = allRows || [];
  const todayRows = rows.filter(r => r.practice_date === today);
  const scores = rows.filter(r => r.self_score != null).map(r => r.self_score as number);
  const wordCounts = rows.filter(r => r.word_count != null).map(r => r.word_count as number);

  return {
    today_count: todayRows.length,
    total_count: rows.length,
    avg_self_score: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    avg_word_count: wordCounts.length > 0 ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0,
  };
}
