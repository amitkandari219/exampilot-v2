import { supabase } from '../lib/supabase.js';

// Typed interface for topics joined with chapters and subjects
interface TopicWithChapterJoin {
  id: string;
  name: string;
  chapter_id: string;
  pyq_weight: number;
  difficulty: number;
  estimated_hours: number;
  pyq_trend: string;
  importance: number;
  chapters: {
    subject_id: string;
    subjects: { id: string; name: string };
  };
}

export async function getPyqStats(userId: string) {
  // Get all topics with their PYQ weights + subject info
  const { data: topics, error: topicsErr } = await supabase
    .from('topics')
    .select('id, name, chapter_id, pyq_weight, difficulty, estimated_hours, pyq_trend, importance, chapters!inner(subject_id, subjects!inner(id, name))');

  if (topicsErr) throw topicsErr;

  // Get user progress
  const { data: progress, error: progErr } = await supabase
    .from('user_progress')
    .select('topic_id, status')
    .eq('user_id', userId);

  if (progErr) throw progErr;

  const progressMap = new Map(
    (progress || []).map((p: any) => [p.topic_id, p.status])
  );

  let totalGravity = 0;
  let completedGravity = 0;
  let totalTopics = 0;
  let completedTopics = 0;
  const highGravityUntouched: any[] = [];
  const trendingUp: any[] = [];
  const trendingDown: any[] = [];

  // Subject-level aggregation
  const subjectMap = new Map<string, { subject_id: string; name: string; total_gravity: number; completed_gravity: number }>();

  const completedStatuses = ['first_pass', 'revised', 'exam_ready'];

  for (const topic of (topics || []) as unknown as TopicWithChapterJoin[]) {
    const gravity = topic.pyq_weight; // CHANGED: gravity = pyq_weight only (1-5 per topic)
    totalGravity += gravity;
    totalTopics++;

    const chapter = topic.chapters;
    const subject = chapter?.subjects;
    const subjectId = subject?.id;
    const subjectName = subject?.name;

    if (subjectId) {
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, { subject_id: subjectId, name: subjectName, total_gravity: 0, completed_gravity: 0 });
      }
      const entry = subjectMap.get(subjectId)!;
      entry.total_gravity += gravity;
    }

    const status = progressMap.get(topic.id) || 'untouched';
    if (completedStatuses.includes(status)) {
      completedGravity += gravity;
      completedTopics++;
      if (subjectId) {
        subjectMap.get(subjectId)!.completed_gravity += gravity;
      }
    }

    if (status === 'untouched' && topic.pyq_weight >= 3.0) {
      highGravityUntouched.push({
        id: topic.id,
        name: topic.name,
        pyq_weight: topic.pyq_weight,
        gravity,
      });
    }

    if (topic.pyq_trend === 'rising') {
      trendingUp.push({ id: topic.id, name: topic.name, pyq_weight: topic.pyq_weight, pyq_trend: topic.pyq_trend });
    } else if (topic.pyq_trend === 'declining') {
      trendingDown.push({ id: topic.id, name: topic.name, pyq_weight: topic.pyq_weight, pyq_trend: topic.pyq_trend });
    }
  }

  // Sort high gravity untouched by gravity desc
  highGravityUntouched.sort((a, b) => b.gravity - a.gravity);
  trendingUp.sort((a, b) => b.pyq_weight - a.pyq_weight);
  trendingDown.sort((a, b) => b.pyq_weight - a.pyq_weight);

  const subjectGravity = Array.from(subjectMap.values()).map((s) => ({
    ...s,
    pct: s.total_gravity > 0 ? Math.round((s.completed_gravity / s.total_gravity) * 1000) / 10 : 0,
  }));

  return {
    total_gravity: totalGravity,
    completed_gravity: completedGravity,
    remaining_gravity: totalGravity - completedGravity,
    weighted_completion_pct: totalGravity > 0 ? Math.round((completedGravity / totalGravity) * 1000) / 10 : 0,
    unweighted_completion_pct: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 1000) / 10 : 0,
    high_gravity_untouched: highGravityUntouched,
    subject_gravity: subjectGravity,
    trending_up: trendingUp,
    trending_down: trendingDown,
  };
}

export async function getTopicPyqDetail(topicId: string) {
  // Get topic metadata
  const { data: topic, error: topicErr } = await supabase
    .from('topics')
    .select('id, name, pyq_weight, pyq_trend, pyq_frequency, last_pyq_year, pyq_years')
    .eq('id', topicId)
    .single();

  if (topicErr) throw topicErr;

  // Get pyq_data rows
  const { data, error } = await supabase
    .from('pyq_data')
    .select('*')
    .eq('topic_id', topicId)
    .order('year', { ascending: false });

  if (error) throw error;

  // Aggregate question types
  const questionTypes: Record<string, number> = {};
  let totalQuestions = 0;

  for (const row of data || []) {
    const qType = row.question_type || 'unknown';
    questionTypes[qType] = (questionTypes[qType] || 0) + row.question_count;
    totalQuestions += row.question_count;
  }

  return {
    topic: {
      id: topic.id,
      name: topic.name,
      pyq_weight: topic.pyq_weight,
      pyq_trend: topic.pyq_trend,
      pyq_frequency: topic.pyq_frequency,
      last_pyq_year: topic.last_pyq_year,
      pyq_years: topic.pyq_years,
    },
    year_breakdown: data,
    question_types: questionTypes,
    total_questions: totalQuestions,
  };
}

export async function recalculatePyqWeights() {
  // Get all PYQ data grouped by topic
  const { data: pyqData, error } = await supabase
    .from('pyq_data')
    .select('topic_id, year, question_count');

  if (error) throw error;

  // Get all topics for percentile calculation (including those without pyq_data)
  const { data: allTopics, error: topicsErr } = await supabase
    .from('topics')
    .select('id, chapter_id');

  if (topicsErr) throw topicsErr;

  // Build raw weighted scores per topic
  const topicScores = new Map<string, number>();
  const topicYearCounts = new Map<string, { recent: number[]; older: number[] }>();

  for (const row of pyqData || []) {
    let recencyMultiplier = 0.6;
    if (row.year >= 2024) recencyMultiplier = 1.5;
    else if (row.year >= 2022) recencyMultiplier = 1.2;
    else if (row.year >= 2020) recencyMultiplier = 1.0;
    else if (row.year >= 2018) recencyMultiplier = 0.8;

    const weighted = row.question_count * recencyMultiplier;
    topicScores.set(row.topic_id, (topicScores.get(row.topic_id) || 0) + weighted);

    // Track year counts for trend
    if (!topicYearCounts.has(row.topic_id)) {
      topicYearCounts.set(row.topic_id, { recent: [], older: [] });
    }
    const counts = topicYearCounts.get(row.topic_id)!;
    if (row.year >= 2022) {
      counts.recent.push(row.question_count);
    } else {
      counts.older.push(row.question_count);
    }
  }

  // Ensure all topics have a score (0 for those without pyq_data)
  for (const t of allTopics || []) {
    if (!topicScores.has(t.id)) {
      topicScores.set(t.id, 0);
    }
  }

  // Sort by score for percentile bucketing
  const sorted = Array.from(topicScores.entries()).sort((a, b) => a[1] - b[1]);
  const n = sorted.length;

  // Compute pyq_frequency, last_pyq_year, and pyq_years per topic
  const topicFreq = new Map<string, number>();
  const topicLastYear = new Map<string, number>();
  const topicYears = new Map<string, Set<number>>();
  for (const row of pyqData || []) {
    topicFreq.set(row.topic_id, (topicFreq.get(row.topic_id) || 0) + row.question_count);
    const cur = topicLastYear.get(row.topic_id) || 0;
    if (row.year > cur) topicLastYear.set(row.topic_id, row.year);
    if (!topicYears.has(row.topic_id)) topicYears.set(row.topic_id, new Set());
    topicYears.get(row.topic_id)!.add(row.year);
  }

  for (let i = 0; i < n; i++) {
    const [topicId, _score] = sorted[i];
    const percentile = n > 1 ? i / (n - 1) : 0.5;

    // Percentile bucketing
    let pyqWeight: number;
    if (percentile >= 0.9) pyqWeight = 5;
    else if (percentile >= 0.7) pyqWeight = 4;
    else if (percentile >= 0.4) pyqWeight = 3;
    else if (percentile >= 0.1) pyqWeight = 2;
    else pyqWeight = 1;

    // Trend
    const counts = topicYearCounts.get(topicId);
    let trend: 'rising' | 'stable' | 'declining' = 'stable';
    if (counts) {
      const recentAvg = counts.recent.length > 0 ? counts.recent.reduce((a, b) => a + b, 0) / counts.recent.length : 0;
      const olderAvg = counts.older.length > 0 ? counts.older.reduce((a, b) => a + b, 0) / counts.older.length : 0.1;
      if (recentAvg > olderAvg * 1.3) trend = 'rising';
      else if (recentAvg < olderAvg * 0.7) trend = 'declining';
    }

    await supabase
      .from('topics')
      .update({
        pyq_weight: pyqWeight,
        pyq_trend: trend,
        pyq_frequency: topicFreq.get(topicId) || 0,
        last_pyq_year: topicLastYear.get(topicId) || null,
        pyq_years: topicYears.has(topicId) ? Array.from(topicYears.get(topicId)!).sort((a, b) => a - b) : [],
      })
      .eq('id', topicId);
  }

  // Upsert pyq_subject_stats
  // Get chapters for subject mapping
  const { data: chapters, error: chapErr } = await supabase
    .from('chapters')
    .select('id, subject_id');

  if (chapErr) throw chapErr;

  const chapterSubjectMap = new Map<string, string>();
  for (const ch of chapters || []) {
    chapterSubjectMap.set(ch.id, ch.subject_id);
  }

  // Map topic → subject
  const topicSubjectMap = new Map<string, string>();
  for (const t of allTopics || []) {
    const subjectId = chapterSubjectMap.get(t.chapter_id);
    if (subjectId) topicSubjectMap.set(t.id, subjectId);
  }

  // Aggregate per subject
  const subjectAgg = new Map<string, { yearCounts: Map<number, number>; totalQ: number; recent: number[]; older: number[] }>();

  for (const row of pyqData || []) {
    const subjectId = topicSubjectMap.get(row.topic_id);
    if (!subjectId) continue;

    if (!subjectAgg.has(subjectId)) {
      subjectAgg.set(subjectId, { yearCounts: new Map(), totalQ: 0, recent: [], older: [] });
    }
    const agg = subjectAgg.get(subjectId)!;
    agg.totalQ += row.question_count;
    agg.yearCounts.set(row.year, (agg.yearCounts.get(row.year) || 0) + row.question_count);
    if (row.year >= 2022) agg.recent.push(row.question_count);
    else agg.older.push(row.question_count);
  }

  for (const [subjectId, agg] of subjectAgg) {
    const recentAvg = agg.recent.length > 0 ? agg.recent.reduce((a, b) => a + b, 0) / agg.recent.length : 0;
    const olderAvg = agg.older.length > 0 ? agg.older.reduce((a, b) => a + b, 0) / agg.older.length : 0.1;
    let trend: 'rising' | 'stable' | 'declining' = 'stable';
    if (recentAvg > olderAvg * 1.3) trend = 'rising';
    else if (recentAvg < olderAvg * 0.7) trend = 'declining';

    // Find highest year
    let highestYear: number | null = null;
    let highestCount = 0;
    for (const [yr, cnt] of agg.yearCounts) {
      if (cnt > highestCount || (cnt === highestCount && yr > (highestYear || 0))) {
        highestCount = cnt;
        highestYear = yr;
      }
    }

    const avgPerYear = Math.round((agg.totalQ / 11) * 100) / 100; // 2015-2025 = 11 years

    await supabase
      .from('pyq_subject_stats')
      .upsert({
        subject_id: subjectId,
        avg_questions_per_year: avgPerYear,
        total_questions_10yr: agg.totalQ,
        trend,
        highest_year: highestYear,
        highest_count: highestCount,
      }, { onConflict: 'subject_id' });
  }
}
