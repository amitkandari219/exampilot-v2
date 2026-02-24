import { supabase } from '../lib/supabase.js';

export async function getPyqStats(userId: string) {
  // Get all topics with their PYQ weights
  const { data: topics, error: topicsErr } = await supabase
    .from('topics')
    .select('id, name, chapter_id, pyq_weight, difficulty, estimated_hours, pyq_trend, importance');

  if (topicsErr) throw topicsErr;

  // Get user progress
  const { data: progress, error: progErr } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  if (progErr) throw progErr;

  const progressMap = new Map(
    (progress || []).map((p) => [p.topic_id, p.status])
  );

  let totalGravity = 0;
  let completedGravity = 0;
  let highGravityUntouched = 0;
  const trendingTopics: typeof topics = [];

  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  for (const topic of topics || []) {
    const gravity = topic.pyq_weight * topic.difficulty * topic.estimated_hours;
    totalGravity += gravity;

    const status = progressMap.get(topic.id) || 'untouched';
    if (completedStatuses.includes(status)) {
      completedGravity += gravity;
    }

    if (status === 'untouched' && topic.pyq_weight >= 3.0) {
      highGravityUntouched++;
    }

    if (topic.pyq_trend === 'rising') {
      trendingTopics.push(topic);
    }
  }

  // Sort trending by pyq_weight desc, take top 10
  trendingTopics.sort((a, b) => b.pyq_weight - a.pyq_weight);

  return {
    total_gravity: totalGravity,
    completed_gravity: completedGravity,
    remaining_gravity: totalGravity - completedGravity,
    high_gravity_untouched: highGravityUntouched,
    trending_topics: trendingTopics.slice(0, 10),
  };
}

export async function getTopicPyqDetail(topicId: string) {
  const { data, error } = await supabase
    .from('pyq_data')
    .select('*')
    .eq('topic_id', topicId)
    .order('year', { ascending: false });

  if (error) throw error;
  return data;
}

export async function recalculatePyqWeights() {
  // Get all PYQ data grouped by topic
  const { data: pyqData, error } = await supabase
    .from('pyq_data')
    .select('topic_id, year, question_count');

  if (error) throw error;

  const topicWeights = new Map<string, number>();

  for (const row of pyqData || []) {
    let recencyMultiplier = 0.6;
    if (row.year >= 2024) recencyMultiplier = 1.5;
    else if (row.year >= 2022) recencyMultiplier = 1.2;
    else if (row.year >= 2020) recencyMultiplier = 1.0;
    else if (row.year >= 2018) recencyMultiplier = 0.8;

    const weighted = row.question_count * recencyMultiplier;
    const current = topicWeights.get(row.topic_id) || 0;
    topicWeights.set(row.topic_id, current + weighted);
  }

  // Normalize to 1.0-5.0 scale
  const values = Array.from(topicWeights.values());
  const maxWeight = Math.max(...values, 1);

  for (const [topicId, rawWeight] of topicWeights) {
    const normalized = 1.0 + (rawWeight / maxWeight) * 4.0;
    const clamped = Math.min(5.0, Math.max(1.0, Math.round(normalized * 10) / 10));

    await supabase
      .from('topics')
      .update({ pyq_weight: clamped })
      .eq('id', topicId);
  }
}
