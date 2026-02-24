import { supabase } from '../lib/supabase.js';
import type { HealthCategory } from '../types/index.js';

function categorize(score: number): HealthCategory {
  if (score >= 80) return 'exam_ready';
  if (score >= 65) return 'strong';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'weak';
  return 'critical';
}

function recommend(category: HealthCategory, weakestComponent: string): string {
  if (category === 'critical') {
    return `Urgent: This topic needs immediate attention. Start with a focused study session.`;
  }
  if (category === 'weak') {
    switch (weakestComponent) {
      case 'confidence': return 'Low confidence — do a quick revision and attempt practice questions.';
      case 'revision': return 'Insufficient revisions — schedule a revision session soon.';
      case 'effort': return 'Not enough time spent — allocate more study hours to this topic.';
      case 'stability': return 'Memory decaying — review before it fades further.';
    }
  }
  if (category === 'moderate') {
    return 'Getting there — one more revision should push this into the strong zone.';
  }
  if (category === 'strong') {
    return 'Good shape — periodic revision will maintain your edge.';
  }
  return 'Exam ready — maintain with light periodic reviews.';
}

export async function calculateHealthScores(userId: string) {
  // Fetch all topics with their chapters and subjects
  const { data: topics } = await supabase
    .from('topics')
    .select(`
      id, name, difficulty, estimated_hours, pyq_weight,
      chapters!inner(id, name, subjects!inner(id, name))
    `);

  if (!topics || topics.length === 0) return { updated: 0 };

  // Fetch user progress for all topics
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  const progressMap = new Map(
    (progressRows || []).map((p: any) => [p.topic_id, p])
  );

  // Fetch FSRS cards for stability
  const { data: fsrsCards } = await supabase
    .from('fsrs_cards')
    .select('topic_id, stability')
    .eq('user_id', userId);

  const stabilityMap = new Map(
    (fsrsCards || []).map((c: any) => [c.topic_id, c.stability])
  );

  const snapshotDate = new Date().toISOString().split('T')[0];
  const results: any[] = [];

  for (const topic of topics) {
    const progress = progressMap.get(topic.id);
    const stability = stabilityMap.get(topic.id) || 0;

    // Confidence component (40%) — direct from confidence_score
    const confidenceRaw = progress?.confidence_score || 0;
    const confidenceComponent = Math.min(100, confidenceRaw);

    // Revision adequacy component (25%)
    const revisionCount = progress?.revision_count || 0;
    const recommendedRevisions = Math.max(1, Math.ceil((topic.difficulty * topic.pyq_weight) / 2));
    const revisionComponent = Math.min(100, (revisionCount / recommendedRevisions) * 100);

    // Effort component (20%)
    const actualHours = progress?.actual_hours_spent || 0;
    const estimatedHours = topic.estimated_hours || 1;
    const effortComponent = Math.min(100, (actualHours / estimatedHours) * 100);

    // Stability component (15%) — stability normalized (stability/50 * 100, capped)
    const stabilityComponent = Math.min(100, (stability / 50) * 100);

    // Weighted composite
    const healthScore = Math.round(
      confidenceComponent * 0.40 +
      revisionComponent * 0.25 +
      effortComponent * 0.20 +
      stabilityComponent * 0.15
    );
    const clampedScore = Math.max(0, Math.min(100, healthScore));
    const category = categorize(clampedScore);

    results.push({
      topic_id: topic.id,
      topic_name: topic.name,
      chapter: (topic as any).chapters,
      health_score: clampedScore,
      category,
      confidence_component: Math.round(confidenceComponent),
      revision_component: Math.round(revisionComponent),
      effort_component: Math.round(effortComponent),
      stability_component: Math.round(stabilityComponent),
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
        confidence_component: confidenceComponent,
        revision_component: revisionComponent,
        effort_component: effortComponent,
        stability_component: stabilityComponent,
      }, { onConflict: 'user_id,topic_id,snapshot_date' });
  }

  return { updated: results.length, snapshot_date: snapshotDate };
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
      summary: { critical: 0, weak: 0, moderate: 0, strong: 0, exam_ready: 0 },
      weakest_topics: [],
      by_subject: [],
    };
  }

  // Deduplicate — keep latest snapshot per topic
  const seen = new Set<string>();
  const latest: any[] = [];
  for (const s of snapshots) {
    if (!seen.has(s.topic_id)) {
      seen.add(s.topic_id);
      latest.push(s);
    }
  }

  // Summary counts
  const summary = { critical: 0, weak: 0, moderate: 0, strong: 0, exam_ready: 0 };
  for (const s of latest) {
    summary[s.category as keyof typeof summary]++;
  }

  // Build weak areas (critical + weak only)
  const weakAreas = latest
    .filter((s) => s.category === 'critical' || s.category === 'weak')
    .sort((a, b) => a.health_score - b.health_score)
    .map((s) => {
      const topic = (s as any).topics;
      const chapter = topic.chapters;
      const subject = chapter.subjects;
      const components = {
        confidence: s.confidence_component,
        revision: s.revision_component,
        effort: s.effort_component,
        stability: s.stability_component,
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

  return {
    summary,
    weakest_topics: weakAreas.slice(0, 10),
    by_subject: Array.from(subjectMap.values()).sort((a, b) => b.critical_count - a.critical_count),
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
      components: { confidence: 0, revision: 0, effort: 0, stability: 0 },
      recommendation: 'No data yet — start studying this topic to generate health insights.',
      trend: [],
    };
  }

  const components = {
    confidence: snapshot.confidence_component,
    revision: snapshot.revision_component,
    effort: snapshot.effort_component,
    stability: snapshot.stability_component,
  };
  const weakest = Object.entries(components).sort(([, a], [, b]) => a - b)[0][0];

  // Get 30-day trend
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: trend } = await supabase
    .from('weakness_snapshots')
    .select('snapshot_date, health_score')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .gte('snapshot_date', thirtyDaysAgo.toISOString().split('T')[0])
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
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: trend } = await supabase
    .from('weakness_snapshots')
    .select('snapshot_date, health_score, category')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .gte('snapshot_date', startDate.toISOString().split('T')[0])
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
