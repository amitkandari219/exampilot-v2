import { supabase } from '../lib/supabase.js';
import { toDateString, daysUntil } from '../utils/dateUtils.js';

interface TopicRow {
  id: string;
  name: string;
  pyq_weight: number;
  chapters: {
    subject_id: string;
    name: string;
    subjects: { name: string };
  };
}

interface ProgressRow {
  topic_id: string;
  status: string;
}

interface FsrsCardRow {
  topic_id: string;
  due: string;
  topics: { name: string; chapters: { subjects: { name: string } } };
}

export async function getStudyPlanOverview(userId: string) {
  // 1. Profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('exam_date')
    .eq('id', userId)
    .single();

  if (!profile?.exam_date) throw new Error('Exam date not set');

  const examDate = profile.exam_date;
  const daysRemaining = daysUntil(examDate);

  // 2. Velocity snapshot
  const { data: velocitySnap } = await supabase
    .from('velocity_snapshots')
    .select('velocity_ratio, projected_completion_date, weighted_completion_pct')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const velocityRatio = velocitySnap?.velocity_ratio ?? 0;
  const projectedDate = velocitySnap?.projected_completion_date ?? null;
  const overallCompletionPct = velocitySnap?.weighted_completion_pct ?? 0;

  // 3. All topics with subjects + progress
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, pyq_weight, chapters!inner(subject_id, name, subjects!inner(name))');

  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  const progressMap = new Map((progress || []).map((p: ProgressRow) => [p.topic_id, p]));
  const completedStatuses = new Set(['first_pass', 'revised', 'exam_ready']);

  // 4. Group by subject
  const subjectMap = new Map<string, {
    subject_name: string;
    topics: TopicRow[];
    completed: TopicRow[];
  }>();

  for (const t of (topics || []) as unknown as TopicRow[]) {
    const subjectId = t.chapters?.subject_id;
    if (!subjectId) continue;
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        subject_name: t.chapters.subjects.name,
        topics: [],
        completed: [],
      });
    }
    const entry = subjectMap.get(subjectId)!;
    entry.topics.push(t);
    const prog = progressMap.get(t.id);
    if (prog && completedStatuses.has(prog.status)) {
      entry.completed.push(t);
    }
  }

  const subjects = [...subjectMap.entries()].map(([subjectId, s]) => {
    const totalTopics = s.topics.length;
    const completedTopics = s.completed.length;
    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const totalGravity = s.topics.reduce((sum, t) => sum + (t.pyq_weight || 0), 0);
    const completedGravity = s.completed.reduce((sum, t) => sum + (t.pyq_weight || 0), 0);

    const remainingTopics = totalTopics - completedTopics;
    const dailyRate = velocityRatio > 0 ? velocityRatio : 0;
    const projectedFinish = dailyRate > 0 && remainingTopics > 0
      ? toDateString(new Date(Date.now() + (remainingTopics / dailyRate) * 86400000))
      : null;

    let status: 'completed' | 'on_track' | 'behind' | 'at_risk';
    if (completionPct >= 100) status = 'completed';
    else if (projectedFinish && projectedFinish <= examDate) status = 'on_track';
    else if (completionPct >= 30) status = 'behind';
    else status = 'at_risk';

    return {
      subject_id: subjectId,
      subject_name: s.subject_name,
      total_topics: totalTopics,
      completed_topics: completedTopics,
      completion_pct: completionPct,
      total_gravity: totalGravity,
      completed_gravity: completedGravity,
      projected_finish_date: projectedFinish,
      status,
    };
  });

  // 5. Revision preview — next 7 days
  const today = new Date();
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const { data: fsrsCards } = await supabase
    .from('fsrs_cards')
    .select('topic_id, due, topics(name, chapters(subjects(name)))')
    .eq('user_id', userId)
    .gte('due', today.toISOString())
    .lte('due', in7Days.toISOString())
    .order('due', { ascending: true });

  const revisionByDay = new Map<string, { name: string; subject_name: string }[]>();
  for (const card of (fsrsCards || []) as unknown as FsrsCardRow[]) {
    const dayStr = toDateString(new Date(card.due));
    if (!revisionByDay.has(dayStr)) revisionByDay.set(dayStr, []);
    revisionByDay.get(dayStr)!.push({
      name: card.topics?.name || 'Unknown',
      subject_name: card.topics?.chapters?.subjects?.name || 'Unknown',
    });
  }

  const revisionPreview = [...revisionByDay.entries()].map(([date, topicsList]) => ({
    date,
    count: topicsList.length,
    topics: topicsList,
  }));

  return {
    exam_date: examDate,
    days_remaining: daysRemaining,
    overall_projected_date: projectedDate,
    overall_completion_pct: overallCompletionPct,
    velocity_ratio: velocityRatio,
    subjects,
    revision_preview: revisionPreview,
  };
}
