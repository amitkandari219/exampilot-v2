import { supabase } from '../lib/supabase.js';
import type { HealthCategory } from '../types/index.js';
import { getActiveSubjectIds } from './modeConfig.js';
import { toDateString, daysAgo } from '../utils/dateUtils.js';
import { HEALTH_WEIGHTS } from '../constants/thresholds.js';

// Typed interfaces for Supabase join results
interface SubjectRow { id: string; name: string }
interface ChapterWithSubject { id: string; name: string; subjects: SubjectRow }
interface TopicWithChapter {
  id: string;
  name: string;
  importance: number;
  difficulty: number;
  estimated_hours: number;
  pyq_weight: number;
  chapters: ChapterWithSubject;
}
interface ProgressWithTopicJoin {
  topic_id: string;
  status: string;
  health_score: number;
  revision_count: number;
  topics: {
    name: string;
    importance: number;
    pyq_weight: number;
    chapters: { name: string; subjects: SubjectRow };
  };
}
interface SnapshotWithTopicJoin {
  topic_id: string;
  health_score: number;
  category: string;
  confidence_component: number;
  revision_component: number;
  effort_component: number;
  stability_component: number;
  topics: {
    id: string;
    name: string;
    chapters: { id: string; name: string; subjects: SubjectRow };
  };
}

// Health zone thresholds — single source of truth
// DB enum: critical | weak | moderate | strong | exam_ready
// Display: Critical | Weak | Vulnerable | Adequate | Strong
// Thresholds: <20 | 20-39 | 40-59 | 60-79 | 80+
const ZONE_THRESHOLDS: { min: number; db: HealthCategory; label: string }[] = [
  { min: 80, db: 'exam_ready', label: 'strong' },
  { min: 60, db: 'strong', label: 'adequate' },
  { min: 40, db: 'moderate', label: 'vulnerable' },
  { min: 20, db: 'weak', label: 'weak' },
  { min: 0, db: 'critical', label: 'critical' },
];

// For DB writes (weakness_snapshots.category)
function categorize(score: number): HealthCategory {
  for (const z of ZONE_THRESHOLDS) {
    if (score >= z.min) return z.db;
  }
  return 'critical';
}

// For API display labels
function categorizeZone(score: number): string {
  for (const z of ZONE_THRESHOLDS) {
    if (score >= z.min) return z.label;
  }
  return 'critical';
}

const ZONE_LABELS = ZONE_THRESHOLDS.map((z) => z.label);

function recommend(category: HealthCategory, weakestComponent: string): string {
  // critical (<20)
  if (category === 'critical') {
    return 'Urgent: This topic needs immediate attention. Start with a focused study session.';
  }
  // weak (20-39)
  if (category === 'weak') {
    switch (weakestComponent) {
      case 'completion': return 'Incomplete — do a full first pass or revision to solidify the basics.';
      case 'revision': return 'Insufficient revisions — schedule a revision session soon.';
      case 'accuracy': return 'Low accuracy — practice questions and review weak areas.';
      case 'recency': return 'Getting stale — revisit this topic before it fades further.';
    }
  }
  // moderate/vulnerable (40-59)
  if (category === 'moderate') {
    return 'Getting there — one more revision should push this into the adequate zone.';
  }
  // strong/adequate (60-79)
  if (category === 'strong') {
    return 'Good shape — periodic revision will maintain your edge.';
  }
  // exam_ready/strong (80+)
  return 'Strong — maintain with light periodic reviews.';
}

// ---- Completion base score (weight 0.25) ----
function completionScore(status: string): number {
  switch (status) {
    case 'in_progress': return 20;
    case 'first_pass': return 40;
    case 'revised': return 65;
    case 'exam_ready': return 85;
    default: return 0; // untouched, deferred_scope
  }
}

// ---- Revision score (weight 0.20) ----
function revisionScore(revisionCount: number, importance: number): number {
  const expected = importance >= 4 ? 4 : 3;
  return Math.min(100, (revisionCount / expected) * 100);
}

// ---- Accuracy score (weight 0.30) ----
// Mock accuracy takes priority over FSRS confidence
function accuracyScore(mockAccuracy: number | null, confidenceScore: number): number {
  if (mockAccuracy != null) return mockAccuracy * 100;
  if (confidenceScore > 0) return confidenceScore;
  return 50; // neutral default
}

// ---- Recency score (weight 0.25) ----
function recencyScore(daysSinceTouch: number): number {
  if (daysSinceTouch <= 7) return 100;
  if (daysSinceTouch <= 14) return 80;
  if (daysSinceTouch <= 30) return 60;
  if (daysSinceTouch <= 45) return 35;
  if (daysSinceTouch <= 60) return 15;
  return 0;
}

export async function calculateHealthScores(userId: string) {
  // Fetch all needed data in parallel
  const [topicsRes, progressRes, mockAccuracyRes] = await Promise.all([
    supabase
      .from('topics')
      .select('id, name, importance, difficulty, estimated_hours, pyq_weight, chapters!inner(id, name, subjects!inner(id, name))')
      .order('pyq_weight', { ascending: false }),
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('mock_topic_accuracy')
      .select('topic_id, accuracy, total_questions')
      .eq('user_id', userId),
  ]);

  // Filter by active subjects in current exam mode
  const activeSubjectIds = await getActiveSubjectIds(userId);
  const allTopicRows = (topicsRes.data || []) as unknown as TopicWithChapter[];
  const topics = activeSubjectIds
    ? allTopicRows.filter((t) => {
        const subjectId = t.chapters?.subjects?.id;
        return !subjectId || activeSubjectIds.has(subjectId);
      })
    : allTopicRows;
  if (topics.length === 0) return { updated: 0 };

  const progressMap = new Map((progressRes.data || []).map((p: any) => [p.topic_id, p]));
  const mockMap = new Map((mockAccuracyRes.data || []).map((m: any) => [m.topic_id, m]));

  const snapshotDate = toDateString(new Date());
  const now = Date.now();
  const results: any[] = [];

  for (const topic of topics) {
    const progress = progressMap.get(topic.id);
    const mock = mockMap.get(topic.id);
    const status = progress?.status || 'untouched';

    // 1. Completion (0.25)
    const completion = completionScore(status);

    // 2. Revision (0.20)
    const revision = revisionScore(progress?.revision_count || 0, topic.importance);

    // 3. Accuracy (0.30) — mock takes priority over FSRS
    const mockAcc = (mock && mock.total_questions > 0) ? mock.accuracy : null;
    const accuracy = accuracyScore(mockAcc, progress?.confidence_score || 0);

    // 4. Recency (0.25)
    const daysSinceTouch = progress?.last_touched
      ? Math.max(0, Math.floor((now - new Date(progress.last_touched).getTime()) / 86400000))
      : 999;
    const recency = recencyScore(daysSinceTouch);

    // Weighted composite
    const healthScore = Math.round(
      completion * HEALTH_WEIGHTS.COMPLETION +
      revision * HEALTH_WEIGHTS.REVISION +
      accuracy * HEALTH_WEIGHTS.ACCURACY +
      recency * HEALTH_WEIGHTS.RECENCY
    );
    const clampedScore = Math.max(0, Math.min(100, healthScore));
    const category = categorize(clampedScore);

    results.push({
      topic_id: topic.id,
      topic_name: topic.name,
      chapter: topic.chapters,
      health_score: clampedScore,
      category,
      completion_component: Math.round(completion),
      revision_component: Math.round(revision),
      accuracy_component: Math.round(accuracy),
      recency_component: Math.round(recency),
    });

    // Update user_progress.health_score
    if (progress) {
      await supabase
        .from('user_progress')
        .update({ health_score: clampedScore })
        .eq('id', progress.id);
    }

    // Upsert weakness snapshot
    await supabase
      .from('weakness_snapshots')
      .upsert({
        user_id: userId,
        topic_id: topic.id,
        snapshot_date: snapshotDate,
        health_score: clampedScore,
        category,
        confidence_component: completion,  // repurposed: completion
        revision_component: revision,
        effort_component: accuracy,        // repurposed: accuracy
        stability_component: recency,      // repurposed: recency
      }, { onConflict: 'user_id,topic_id,snapshot_date' });
  }

  return { updated: results.length, snapshot_date: snapshotDate };
}

// ---- RADAR INSIGHTS ----

export interface RadarInsight {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  chapter_name: string;
  importance: number;
  pyq_weight: number;
  health_score: number;
  status: string;
  revision_count: number;
  insight_type: 'false_security' | 'blind_spot' | 'over_revised';
}

export async function getRadarInsights(userId: string): Promise<{
  false_security: RadarInsight[];
  blind_spots: RadarInsight[];
  over_revised: RadarInsight[];
}> {
  // Fetch progress + topic metadata in one query
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('topic_id, status, health_score, revision_count, topics!inner(name, importance, pyq_weight, chapters!inner(name, subjects!inner(id, name)))')
    .eq('user_id', userId);

  // Filter by active subjects in current exam mode
  const activeSubjectIds = await getActiveSubjectIds(userId);
  const allProgressRows = (progressRows || []) as unknown as ProgressWithTopicJoin[];
  const rows = activeSubjectIds
    ? allProgressRows.filter((r) => {
        const subjectId = r.topics?.chapters?.subjects?.id;
        return !subjectId || activeSubjectIds.has(subjectId);
      })
    : allProgressRows;

  // False Security: thinks they know it but health says otherwise
  const falseSecurity = rows
    .filter((r) =>
      (r.status === 'first_pass' || r.status === 'revised') &&
      r.health_score < 40
    )
    .sort((a, b) => {
      const scoreA = a.topics.importance * a.topics.pyq_weight;
      const scoreB = b.topics.importance * b.topics.pyq_weight;
      return scoreB - scoreA;
    })
    .slice(0, 15)
    .map((r) => formatInsight(r, 'false_security'));

  // Blind Spots: high-importance topics not started at all
  // Need untouched topics — they won't be in user_progress, so query separately
  const { data: allTopics } = await supabase
    .from('topics')
    .select('id, name, importance, pyq_weight, chapters!inner(name, subjects!inner(id, name))')
    .gte('importance', 4);

  const progressTopicIds = new Set(rows.map((r) => r.topic_id));
  interface BlindSpotTopic {
    id: string; name: string; importance: number; pyq_weight: number;
    chapters: { name: string; subjects: { id: string; name: string } };
  }
  const allBlindTopics = (allTopics || []) as unknown as BlindSpotTopic[];
  const filteredTopics = activeSubjectIds
    ? allBlindTopics.filter((t) => {
        const subjectId = t.chapters?.subjects?.id;
        return !subjectId || activeSubjectIds.has(subjectId);
      })
    : allBlindTopics;
  const untouchedHighImportance = filteredTopics
    .filter((t) => !progressTopicIds.has(t.id))
    .sort((a, b) => (b.importance * b.pyq_weight) - (a.importance * a.pyq_weight))
    .slice(0, 10)
    .map((t) => ({
      topic_id: t.id,
      topic_name: t.name,
      subject_name: t.chapters?.subjects?.name || '',
      chapter_name: t.chapters?.name || '',
      importance: t.importance,
      pyq_weight: t.pyq_weight,
      health_score: 0,
      status: 'untouched',
      revision_count: 0,
      insight_type: 'blind_spot' as const,
    }));

  // Also include topics with status='untouched' that have a progress row
  const untouchedInProgress = rows
    .filter((r) => r.status === 'untouched' && r.topics.importance >= 4)
    .sort((a, b) => (b.topics.importance * b.topics.pyq_weight) - (a.topics.importance * a.topics.pyq_weight))
    .slice(0, 10)
    .map((r) => formatInsight(r, 'blind_spot'));

  const blindSpots = [...untouchedHighImportance, ...untouchedInProgress]
    .sort((a, b) => (b.importance * b.pyq_weight) - (a.importance * a.pyq_weight))
    .slice(0, 10);

  // Over-Revised: diminishing returns — too many revisions on low-importance topics
  const overRevised = rows
    .filter((r) =>
      r.revision_count >= 4 &&
      r.health_score >= 80 &&
      r.topics.importance <= 3
    )
    .sort((a, b) => b.revision_count - a.revision_count)
    .map((r) => formatInsight(r, 'over_revised'));

  return { false_security: falseSecurity, blind_spots: blindSpots, over_revised: overRevised };
}

function formatInsight(row: ProgressWithTopicJoin, type: RadarInsight['insight_type']): RadarInsight {
  return {
    topic_id: row.topic_id,
    topic_name: row.topics.name,
    subject_name: row.topics.chapters?.subjects?.name || '',
    chapter_name: row.topics.chapters?.name || '',
    importance: row.topics.importance,
    pyq_weight: row.topics.pyq_weight,
    health_score: row.health_score,
    status: row.status,
    revision_count: row.revision_count,
    insight_type: type,
  };
}

export async function getWeaknessOverview(userId: string) {
  // Get latest snapshots for this user
  const { data: snapshots } = await supabase
    .from('weakness_snapshots')
    .select(`
      topic_id, health_score, category,
      confidence_component, revision_component, effort_component, stability_component,
      topics!inner(id, name, chapters!inner(id, name, subjects!inner(id, name)))
    `)
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false });

  if (!snapshots || snapshots.length === 0) {
    return {
      overall_health: 0,
      zone_distribution: { strong: { count: 0, pct: 0 }, adequate: { count: 0, pct: 0 }, vulnerable: { count: 0, pct: 0 }, weak: { count: 0, pct: 0 }, critical: { count: 0, pct: 0 } },
      weakest_topics: [],
      by_subject: [],
      subject_health: [],
      insights: { false_security: [], blind_spots: [], over_revised: [] },
    };
  }

  // Filter by active subjects in current exam mode
  const activeSubjectIdsForOverview = await getActiveSubjectIds(userId);
  const typedSnapshots = snapshots as unknown as SnapshotWithTopicJoin[];
  const filteredSnapshots = activeSubjectIdsForOverview
    ? typedSnapshots.filter((s) => {
        const subjectId = s.topics?.chapters?.subjects?.id;
        return !subjectId || activeSubjectIdsForOverview.has(subjectId);
      })
    : typedSnapshots;

  // Deduplicate — keep latest snapshot per topic
  const seen = new Set<string>();
  const latest: any[] = [];
  for (const s of filteredSnapshots) {
    if (!seen.has(s.topic_id)) {
      seen.add(s.topic_id);
      latest.push(s);
    }
  }

  // Overall health (single number)
  const totalHealth = latest.reduce((sum, s) => sum + s.health_score, 0);
  const overallHealth = latest.length > 0 ? Math.round(totalHealth / latest.length) : 0;

  // Zone distribution using 6-zone spec thresholds
  const zones: Record<string, number> = { strong: 0, adequate: 0, vulnerable: 0, weak: 0, critical: 0 };
  for (const s of latest) {
    const zone = categorizeZone(s.health_score);
    zones[zone]++;
  }
  const zoneDistribution = Object.fromEntries(
    Object.entries(zones).map(([zone, count]) => [zone, { count, pct: latest.length > 0 ? Math.round((count / latest.length) * 1000) / 10 : 0 }])
  );

  // Build weak areas (critical + weak only)
  const weakAreas = latest
    .filter((s) => s.category === 'critical' || s.category === 'weak')
    .sort((a, b) => a.health_score - b.health_score)
    .map((s) => {
      const topic = s.topics;
      const chapter = topic.chapters;
      const subject = chapter.subjects;
      // Map DB columns to new component names
      const components = {
        completion: s.confidence_component,  // repurposed
        revision: s.revision_component,
        accuracy: s.effort_component,        // repurposed
        recency: s.stability_component,      // repurposed
      };
      const weakest = Object.entries(components).sort(([, a], [, b]) => (a as number) - (b as number))[0][0];
      return {
        subject_id: subject.id,
        subject_name: subject.name,
        chapter_id: chapter.id,
        chapter_name: chapter.name,
        topic_id: s.topic_id,
        topic_name: topic.name,
        health_score: s.health_score,
        category: s.category,
        components,
        recommendation: recommend(s.category as HealthCategory, weakest),
      };
    });

  // Group by subject
  const subjectMap = new Map<string, any>();
  for (const wa of weakAreas) {
    if (!subjectMap.has(wa.subject_id)) {
      subjectMap.set(wa.subject_id, {
        subject_id: wa.subject_id,
        subject_name: wa.subject_name,
        weak_count: 0,
        critical_count: 0,
        topics: [],
      });
    }
    const group = subjectMap.get(wa.subject_id)!;
    group.topics.push(wa);
    if (wa.category === 'critical') group.critical_count++;
    else group.weak_count++;
  }

  // Subject health: all subjects with avg health score
  const subjectHealthMap = new Map<string, { id: string; name: string; sum: number; count: number }>();
  for (const s of latest) {
    const topic = s.topics;
    const subject = topic?.chapters?.subjects;
    if (subject) {
      const existing = subjectHealthMap.get(subject.id) || { id: subject.id, name: subject.name, sum: 0, count: 0 };
      existing.sum += s.health_score;
      existing.count++;
      subjectHealthMap.set(subject.id, existing);
    }
  }
  const subjectHealth = Array.from(subjectHealthMap.values())
    .map((s) => ({
      subject_id: s.id,
      subject_name: s.name,
      avg_health: Math.round(s.sum / s.count),
      topic_count: s.count,
      zone: categorizeZone(Math.round(s.sum / s.count)),
    }))
    .sort((a, b) => a.avg_health - b.avg_health);

  // Get radar insights
  const insights = await getRadarInsights(userId);

  return {
    overall_health: overallHealth,
    zone_distribution: zoneDistribution,
    weakest_topics: weakAreas.slice(0, 10),
    by_subject: Array.from(subjectMap.values()).sort((a, b) => b.critical_count - a.critical_count),
    subject_health: subjectHealth,
    insights,
  };
}

export async function getTopicHealth(userId: string, topicId: string) {
  // Get latest snapshot for this topic
  const { data: snapshot } = await supabase
    .from('weakness_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  // Get topic name
  const { data: topic } = await supabase
    .from('topics')
    .select('name')
    .eq('id', topicId)
    .single();

  if (!snapshot) {
    return {
      topic_id: topicId,
      topic_name: topic?.name || 'Unknown',
      health_score: 0,
      category: 'critical' as HealthCategory,
      components: { completion: 0, revision: 0, accuracy: 0, recency: 0 },
      recommendation: 'No data yet — start studying this topic to generate health insights.',
      trend: [],
    };
  }

  const components = {
    completion: snapshot.confidence_component,  // repurposed
    revision: snapshot.revision_component,
    accuracy: snapshot.effort_component,        // repurposed
    recency: snapshot.stability_component,      // repurposed
  };
  const weakest = Object.entries(components).sort(([, a], [, b]) => a - b)[0][0];

  // Get 30-day trend
  const { data: trend } = await supabase
    .from('weakness_snapshots')
    .select('snapshot_date, health_score')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .gte('snapshot_date', toDateString(daysAgo(30)))
    .order('snapshot_date', { ascending: true });

  return {
    topic_id: topicId,
    topic_name: topic?.name || 'Unknown',
    health_score: snapshot.health_score,
    category: snapshot.category,
    components,
    recommendation: recommend(snapshot.category as HealthCategory, weakest),
    trend: (trend || []).map((t: any) => ({ date: t.snapshot_date, score: t.health_score })),
  };
}

export async function getHealthTrend(userId: string, topicId: string, days = 30) {
  const { data: trend } = await supabase
    .from('weakness_snapshots')
    .select('snapshot_date, health_score, category')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .gte('snapshot_date', toDateString(daysAgo(days)))
    .order('snapshot_date', { ascending: true });

  return {
    topic_id: topicId,
    days,
    data: (trend || []).map((t: any) => ({
      date: t.snapshot_date,
      score: t.health_score,
      category: t.category,
    })),
  };
}
