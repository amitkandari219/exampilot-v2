import { supabase } from '../lib/supabase.js';
import { TopicStatus } from '../types/index.js';

export async function getSyllabusTree() {
  const { data: subjects, error: subErr } = await supabase
    .from('subjects')
    .select('*')
    .order('display_order');
  if (subErr) throw subErr;

  const { data: chapters, error: chapErr } = await supabase
    .from('chapters')
    .select('*')
    .order('display_order');
  if (chapErr) throw chapErr;

  const { data: topics, error: topErr } = await supabase
    .from('topics')
    .select('*')
    .order('display_order');
  if (topErr) throw topErr;

  // Build tree
  const chapterMap = new Map<string, typeof chapters>();
  for (const ch of chapters || []) {
    const list = chapterMap.get(ch.subject_id) || [];
    list.push(ch);
    chapterMap.set(ch.subject_id, list);
  }

  const topicMap = new Map<string, typeof topics>();
  for (const t of topics || []) {
    const list = topicMap.get(t.chapter_id) || [];
    list.push(t);
    topicMap.set(t.chapter_id, list);
  }

  return (subjects || []).map((s) => ({
    ...s,
    chapters: (chapterMap.get(s.id) || []).map((ch) => ({
      ...ch,
      topics: topicMap.get(ch.id) || [],
    })),
  }));
}

export async function getUserProgress(userId: string) {
  const tree = await getSyllabusTree();

  const { data: progress, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;

  const progressMap = new Map(
    (progress || []).map((p) => [p.topic_id, p])
  );

  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  return tree.map((subject) => {
    let subTotalTopics = 0;
    let subCompletedTopics = 0;
    let subWeightedTotal = 0;
    let subWeightedCompleted = 0;
    let subConfidenceSum = 0;
    let subConfidenceCount = 0;

    const chapters = subject.chapters.map((chapter: any) => {
      let chTotalTopics = 0;
      let chCompletedTopics = 0;
      let chWeightedTotal = 0;
      let chWeightedCompleted = 0;
      let chConfidenceSum = 0;
      let chConfidenceCount = 0;

      const topics = chapter.topics.map((topic: any) => {
        const userProg = progressMap.get(topic.id) || null;
        const weight = topic.pyq_weight * topic.difficulty;

        chTotalTopics++;
        chWeightedTotal += weight;

        if (userProg && completedStatuses.includes(userProg.status)) {
          chCompletedTopics++;
          chWeightedCompleted += weight;
        }

        if (userProg && userProg.confidence_score > 0) {
          chConfidenceSum += userProg.confidence_score;
          chConfidenceCount++;
        }

        return { ...topic, user_progress: userProg };
      });

      subTotalTopics += chTotalTopics;
      subCompletedTopics += chCompletedTopics;
      subWeightedTotal += chWeightedTotal;
      subWeightedCompleted += chWeightedCompleted;
      subConfidenceSum += chConfidenceSum;
      subConfidenceCount += chConfidenceCount;

      return {
        ...chapter,
        topics,
        progress: {
          total_topics: chTotalTopics,
          completed_topics: chCompletedTopics,
          weighted_completion: chWeightedTotal > 0 ? chWeightedCompleted / chWeightedTotal : 0,
          avg_confidence: chConfidenceCount > 0 ? chConfidenceSum / chConfidenceCount : 0,
        },
      };
    });

    return {
      ...subject,
      chapters,
      progress: {
        total_topics: subTotalTopics,
        completed_topics: subCompletedTopics,
        weighted_completion: subWeightedTotal > 0 ? subWeightedCompleted / subWeightedTotal : 0,
        avg_confidence: subConfidenceCount > 0 ? subConfidenceSum / subConfidenceCount : 0,
      },
    };
  });
}

export async function updateTopicProgress(
  userId: string,
  topicId: string,
  updates: {
    status?: TopicStatus;
    actual_hours_spent?: number;
    confidence_score?: number;
    notes?: string;
  }
) {
  // Get current progress
  const { data: current } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  const oldStatus = current?.status || 'untouched';
  const newStatus = updates.status || oldStatus;

  const upsertData: Record<string, unknown> = {
    user_id: userId,
    topic_id: topicId,
    last_touched: new Date().toISOString(),
  };

  if (updates.status) upsertData.status = updates.status;
  if (updates.actual_hours_spent !== undefined) upsertData.actual_hours_spent = updates.actual_hours_spent;
  if (updates.confidence_score !== undefined) upsertData.confidence_score = updates.confidence_score;
  if (updates.notes !== undefined) upsertData.notes = updates.notes;

  // Determine confidence_status from score
  if (updates.confidence_score !== undefined) {
    const score = updates.confidence_score;
    if (score >= 70) upsertData.confidence_status = 'fresh';
    else if (score >= 45) upsertData.confidence_status = 'fading';
    else if (score >= 20) upsertData.confidence_status = 'stale';
    else upsertData.confidence_status = 'decayed';
  }

  if (updates.status === 'revised' || updates.status === 'exam_ready') {
    upsertData.revision_count = (current?.revision_count || 0) + 1;
  }

  const { data, error } = await supabase
    .from('user_progress')
    .upsert(upsertData, { onConflict: 'user_id,topic_id' })
    .select()
    .single();

  if (error) throw error;

  // Log status change
  if (newStatus !== oldStatus) {
    await supabase.from('status_changes').insert({
      user_id: userId,
      topic_id: topicId,
      old_status: oldStatus === 'untouched' && !current ? null : oldStatus,
      new_status: newStatus,
      reason: 'manual_update',
    });
  }

  return data;
}
