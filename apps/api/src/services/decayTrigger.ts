import { supabase } from '../lib/supabase.js';
import { calculateRetrievability } from './fsrs.js';
import { toDateString } from '../utils/dateUtils.js';
import { CONFIDENCE, FSRS as FSRS_CONSTANTS } from '../constants/thresholds.js';
import { appEvents } from './events.js';

// Confidence status thresholds (same as fsrs.ts)
function toConfidenceStatus(score: number): 'fresh' | 'fading' | 'stale' | 'decayed' {
  if (score >= CONFIDENCE.FRESH) return 'fresh';
  if (score >= CONFIDENCE.FADING) return 'fading';
  if (score >= CONFIDENCE.STALE) return 'stale';
  return 'decayed';
}

// Priority level for threshold crossings
const TRANSITION_SEVERITY: Record<string, number> = {
  'fresh->fading': 1,
  'fresh->stale': 2,
  'fresh->decayed': 3,
  'fading->stale': 2,
  'fading->decayed': 3,
  'stale->decayed': 3,
};

export async function recalculateAllConfidence(userId: string) {
  const now = new Date();
  const today = toDateString(now);

  // Fetch all needed data in parallel
  const [progressRes, cardsRes, mockAccuracyRes, topicsRes] = await Promise.all([
    supabase
      .from('user_progress')
      .select('topic_id, status, confidence_score, confidence_status')
      .eq('user_id', userId)
      .neq('status', 'untouched'),
    supabase
      .from('fsrs_cards')
      .select('topic_id, stability, last_review')
      .eq('user_id', userId),
    supabase
      .from('mock_topic_accuracy')
      .select('topic_id, accuracy')
      .eq('user_id', userId),
    supabase
      .from('topics')
      .select('id, pyq_weight, chapters!inner(subject_id)'),
  ]);

  const progressRows = progressRes.data || [];
  const cards = cardsRes.data || [];
  const mockAccuracies = mockAccuracyRes.data || [];
  const topics = topicsRes.data || [];

  // Typed interface for topics joined with chapters
  interface TopicWithSubjectJoin {
    id: string;
    pyq_weight: number;
    chapters: { subject_id: string };
  }

  // Build lookup maps
  const cardMap = new Map(cards.map((c) => [c.topic_id, c]));
  const mockMap = new Map(mockAccuracies.map((m) => [m.topic_id, m.accuracy]));
  const topicMap = new Map((topics as unknown as TopicWithSubjectJoin[]).map((t) => [t.id, t]));

  // Tracking
  const downgrades: Array<{ topic_id: string; old_status: string; new_status: string }> = [];
  const decayRevisionTopics: string[] = [];
  const subjectAgg = new Map<string, {
    sumWeighted: number; sumWeight: number; sumScore: number; count: number;
    fresh: number; fading: number; stale: number; decayed: number;
  }>();
  const confidenceSnapshots: Array<{
    user_id: string; topic_id: string; snapshot_date: string;
    confidence_score: number; raw_retention: number;
    stability: number; difficulty: number; accuracy_factor: number;
  }> = [];
  const progressUpdates: Array<{
    user_id: string; topic_id: string;
    confidence_score: number; confidence_status: string;
  }> = [];
  const statusChangeInserts: Array<{
    user_id: string; topic_id: string;
    old_status: string; new_status: string; reason: string;
  }> = [];
  const statusDowngradeUpdates: Array<{ topic_id: string }> = [];

  let topicsRecalculated = 0;

  for (const prog of progressRows) {
    const card = cardMap.get(prog.topic_id);
    if (!card) continue;

    // Calculate elapsed days since last review
    const lastReview = card.last_review ? new Date(card.last_review) : now;
    const elapsedDays = Math.max(0, Math.floor((now.getTime() - lastReview.getTime()) / 86400000));

    // FSRS retrievability
    const R = calculateRetrievability({ stability: card.stability, elapsed_days: elapsedDays });

    // Mock accuracy adjustment
    const mockAccuracy = mockMap.get(prog.topic_id);
    const accuracyFactor = mockAccuracy != null ? (FSRS_CONSTANTS.ACCURACY_FLOOR + FSRS_CONSTANTS.ACCURACY_MULTIPLIER * mockAccuracy) : 1.0;
    const adjusted = R * accuracyFactor;
    const confidenceScore = Math.round(Math.min(100, Math.max(0, adjusted * 100)));

    const oldStatus = prog.confidence_status as string;
    const newStatus = toConfidenceStatus(confidenceScore);

    topicsRecalculated++;

    // Queue progress update
    progressUpdates.push({
      user_id: userId,
      topic_id: prog.topic_id,
      confidence_score: confidenceScore,
      confidence_status: newStatus,
    });

    // Queue confidence snapshot
    confidenceSnapshots.push({
      user_id: userId,
      topic_id: prog.topic_id,
      snapshot_date: today,
      confidence_score: confidenceScore,
      raw_retention: R,
      stability: card.stability,
      difficulty: 0, // not stored on card select
      accuracy_factor: accuracyFactor,
    });

    // ---- THRESHOLD CROSSING DETECTION ----
    const transitionKey = `${oldStatus}->${newStatus}`;
    const severity = TRANSITION_SEVERITY[transitionKey];

    if (severity) {
      // FRESH → FADING: schedule decay_revision for next 1-3 days
      if (oldStatus === 'fresh' && newStatus === 'fading') {
        decayRevisionTopics.push(prog.topic_id);
      }

      // Any → STALE: planner reads confidence_status directly for +4 priority boost

      // Any → DECAYED (transition): auto-downgrade to first_pass
      if (newStatus === 'decayed') {
        if (prog.status === 'exam_ready' || prog.status === 'revised') {
          downgrades.push({
            topic_id: prog.topic_id,
            old_status: prog.status,
            new_status: 'first_pass',
          });
          statusDowngradeUpdates.push({ topic_id: prog.topic_id });
          statusChangeInserts.push({
            user_id: userId,
            topic_id: prog.topic_id,
            old_status: prog.status,
            new_status: 'first_pass',
            reason: 'confidence_decay_auto_downgrade',
          });
        }
        decayRevisionTopics.push(prog.topic_id);
      }
    }

    // Already decayed (no transition) but status still needs downgrade
    if (!severity && newStatus === 'decayed' && (prog.status === 'exam_ready' || prog.status === 'revised')) {
      downgrades.push({
        topic_id: prog.topic_id,
        old_status: prog.status,
        new_status: 'first_pass',
      });
      statusDowngradeUpdates.push({ topic_id: prog.topic_id });
      statusChangeInserts.push({
        user_id: userId,
        topic_id: prog.topic_id,
        old_status: prog.status,
        new_status: 'first_pass',
        reason: 'confidence_decay_auto_downgrade',
      });
    }

    // ---- SUBJECT AGGREGATION ----
    const topic = topicMap.get(prog.topic_id);
    if (topic) {
      const subjectId = topic.chapters?.subject_id;
      if (subjectId) {
        const agg = subjectAgg.get(subjectId) || {
          sumWeighted: 0, sumWeight: 0, sumScore: 0, count: 0,
          fresh: 0, fading: 0, stale: 0, decayed: 0,
        };
        const w = topic.pyq_weight || 1;
        agg.sumWeighted += confidenceScore * w;
        agg.sumWeight += w;
        agg.sumScore += confidenceScore;
        agg.count++;
        agg[newStatus]++;
        subjectAgg.set(subjectId, agg);
      }
    }
  }

  // ---- BATCH WRITES ----

  // 1. Update confidence on user_progress (batch in chunks of 50)
  for (let i = 0; i < progressUpdates.length; i += 50) {
    const batch = progressUpdates.slice(i, i + 50);
    await Promise.all(batch.map((u) =>
      supabase
        .from('user_progress')
        .update({ confidence_score: u.confidence_score, confidence_status: u.confidence_status })
        .eq('user_id', u.user_id)
        .eq('topic_id', u.topic_id)
    ));
  }

  // 2. Status downgrades
  if (statusDowngradeUpdates.length > 0) {
    await Promise.all(statusDowngradeUpdates.map((d) =>
      supabase
        .from('user_progress')
        .update({ status: 'first_pass' })
        .eq('user_id', userId)
        .eq('topic_id', d.topic_id)
    ));
  }

  // 3. Status change audit log
  if (statusChangeInserts.length > 0) {
    await supabase.from('status_changes').insert(statusChangeInserts);
  }

  // 4. Confidence snapshots (append-only)
  if (confidenceSnapshots.length > 0) {
    await supabase.from('confidence_snapshots').insert(confidenceSnapshots);
  }

  // 5. Schedule decay_revision items into upcoming daily plans
  const decayRevisionsScheduled = await scheduleDecayRevisions(userId, decayRevisionTopics, today);

  // 6. Subject-level confidence cache
  const subjectsAtRisk: string[] = [];
  const subjectRows = Array.from(subjectAgg.entries()).map(([subjectId, agg]) => {
    const pyqWeighted = agg.sumWeight > 0 ? agg.sumWeighted / agg.sumWeight : 0;
    const avg = agg.count > 0 ? agg.sumScore / agg.count : 0;
    if (pyqWeighted < 40) subjectsAtRisk.push(subjectId);
    return {
      user_id: userId,
      subject_id: subjectId,
      avg_confidence: Math.round(avg * 10) / 10,
      pyq_weighted_confidence: Math.round(pyqWeighted * 10) / 10,
      topics_fresh: agg.fresh,
      topics_fading: agg.fading,
      topics_stale: agg.stale,
      topics_decayed: agg.decayed,
      updated_at: now.toISOString(),
    };
  });

  if (subjectRows.length > 0) {
    await supabase
      .from('subject_confidence_cache')
      .upsert(subjectRows, { onConflict: 'user_id,subject_id' });
  }

  if (downgrades.length > 0) {
    appEvents.emit('notification:queue', { userId, type: 'topic_decay_alert', metadata: { count: downgrades.length } });
  }

  return {
    topics_recalculated: topicsRecalculated,
    downgrades,
    decay_revisions_scheduled: decayRevisionsScheduled,
    subjects_at_risk: subjectsAtRisk,
  };
}

/**
 * Schedule decay_revision items into daily plans for the next 1-3 days.
 * If a plan doesn't exist yet for that day, inserts into revision_schedule instead.
 */
async function scheduleDecayRevisions(userId: string, topicIds: string[], today: string): Promise<number> {
  if (topicIds.length === 0) return 0;

  // De-duplicate
  const uniqueTopics = [...new Set(topicIds)];

  // Get topic estimated hours for scheduling
  const { data: topicData } = await supabase
    .from('topics')
    .select('id, estimated_hours, pyq_weight')
    .in('id', uniqueTopics);

  const topicHoursMap = new Map((topicData || []).map((t) => [t.id, t]));

  // Spread across next 1-3 days
  const dates: string[] = [];
  for (let d = 1; d <= 3; d++) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + d);
    dates.push(toDateString(dt));
  }

  // Check which plans already exist
  const { data: existingPlans } = await supabase
    .from('daily_plans')
    .select('id, plan_date')
    .eq('user_id', userId)
    .in('plan_date', dates);

  const planMap = new Map((existingPlans || []).map((p) => [p.plan_date, p.id]));

  let scheduled = 0;

  for (let i = 0; i < uniqueTopics.length; i++) {
    const topicId = uniqueTopics[i];
    const topicInfo = topicHoursMap.get(topicId);
    const targetDate = dates[i % dates.length]; // round-robin across days
    const planId = planMap.get(targetDate);

    if (planId) {
      // Check if decay_revision already exists for this topic in this plan
      const { data: existing } = await supabase
        .from('daily_plan_items')
        .select('id')
        .eq('plan_id', planId)
        .eq('topic_id', topicId)
        .eq('type', 'decay_revision')
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from('daily_plan_items').insert({
          plan_id: planId,
          topic_id: topicId,
          type: 'decay_revision',
          estimated_hours: Math.min(topicInfo?.estimated_hours || 1, 1.5), // cap at 1.5h
          priority_score: (topicInfo?.pyq_weight || 1) * 4 + 4, // base + decay boost
          display_order: 999, // appended at end
        });
        scheduled++;
      }
    } else {
      // No plan yet — insert into revision_schedule so planner picks it up
      await supabase.from('revision_schedule').upsert({
        user_id: userId,
        topic_id: topicId,
        revision_number: 0, // decay-triggered, not FSRS-scheduled
        type: 'scheduled',
        scheduled_date: targetDate,
        status: 'pending',
      }, { onConflict: 'user_id,topic_id' });
      scheduled++;
    }
  }

  return scheduled;
}

/**
 * Get confidence overview: overall distribution + per-subject breakdown + fastest decaying.
 */
export async function getConfidenceOverviewEnhanced(userId: string) {
  const [progressRes, subjectCacheRes, decayingRes] = await Promise.all([
    supabase
      .from('user_progress')
      .select('topic_id, confidence_score, confidence_status')
      .eq('user_id', userId),
    supabase
      .from('subject_confidence_cache')
      .select('*, subjects!inner(name)')
      .eq('user_id', userId)
      .order('pyq_weighted_confidence', { ascending: true }),
    supabase
      .from('fsrs_cards')
      .select('topic_id, stability, last_review, topics!inner(name)')
      .eq('user_id', userId)
      .order('stability', { ascending: true })
      .limit(10),
  ]);

  const progress = progressRes.data || [];

  // Overall distribution
  const distribution: Record<string, number> = { fresh: 0, fading: 0, stale: 0, decayed: 0 };
  let totalScore = 0;
  let counted = 0;
  for (const p of progress) {
    if (p.confidence_status) {
      distribution[p.confidence_status] = (distribution[p.confidence_status] || 0) + 1;
    }
    if (p.confidence_score > 0) {
      totalScore += p.confidence_score;
      counted++;
    }
  }

  // Per-subject
  const subjects = (subjectCacheRes.data || []).map((s: any) => ({
    subject_id: s.subject_id,
    subject_name: s.subjects?.name || '',
    avg_confidence: s.avg_confidence,
    pyq_weighted_confidence: s.pyq_weighted_confidence,
    distribution: {
      fresh: s.topics_fresh,
      fading: s.topics_fading,
      stale: s.topics_stale,
      decayed: s.topics_decayed,
    },
    at_risk: s.pyq_weighted_confidence < 40,
  }));

  // Fastest decaying (lowest stability = forgets fastest)
  const now = new Date();
  const fastestDecaying = (decayingRes.data || []).map((d: any) => {
    const lastReview = d.last_review ? new Date(d.last_review) : now;
    const elapsedDays = Math.floor((now.getTime() - lastReview.getTime()) / 86400000);
    const currentR = calculateRetrievability({ stability: d.stability, elapsed_days: elapsedDays });
    const p = progress.find((pr) => pr.topic_id === d.topic_id);
    return {
      topic_id: d.topic_id,
      topic_name: d.topics?.name || '',
      stability: d.stability,
      current_retrievability: Math.round(currentR * 100) / 100,
      confidence_score: p?.confidence_score || 0,
      days_until_fading: estimateDaysToThreshold(d.stability, 0.70),
      days_until_stale: estimateDaysToThreshold(d.stability, 0.45),
    };
  });

  return {
    overall_avg: counted > 0 ? Math.round(totalScore / counted) : 0,
    total_topics: progress.length,
    distribution,
    subjects,
    fastest_decaying: fastestDecaying,
  };
}

/**
 * Project the forgetting curve for a specific topic.
 * Returns points: [{ day, retrievability, confidence_score }] for 0..90 days.
 */
export async function getTopicForgettingCurve(userId: string, topicId: string) {
  const [cardRes, mockRes, snapshotsRes] = await Promise.all([
    supabase
      .from('fsrs_cards')
      .select('stability, last_review')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single(),
    supabase
      .from('mock_topic_accuracy')
      .select('accuracy')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single(),
    supabase
      .from('confidence_snapshots')
      .select('snapshot_date, confidence_score, raw_retention, accuracy_factor')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('snapshot_date', { ascending: true })
      .limit(30),
  ]);

  const card = cardRes.data;
  if (!card) return { curve: [], history: [], thresholds: {} };

  const stability = card.stability;
  const mockAccuracy = mockRes.data?.accuracy;
  const accuracyFactor = mockAccuracy != null ? (FSRS_CONSTANTS.ACCURACY_FLOOR + FSRS_CONSTANTS.ACCURACY_MULTIPLIER * mockAccuracy) : 1.0;

  // Project 90 days from last review
  const curve: Array<{ day: number; retrievability: number; confidence_score: number }> = [];
  for (let day = 0; day <= 90; day++) {
    const R = calculateRetrievability({ stability, elapsed_days: day });
    const adjusted = R * accuracyFactor;
    curve.push({
      day,
      retrievability: Math.round(R * 1000) / 1000,
      confidence_score: Math.round(Math.min(100, adjusted * 100)),
    });
  }

  // Threshold crossing days
  const thresholds = {
    days_to_fading: estimateDaysToThreshold(stability, 0.70 / accuracyFactor),
    days_to_stale: estimateDaysToThreshold(stability, 0.45 / accuracyFactor),
    days_to_decayed: estimateDaysToThreshold(stability, 0.20 / accuracyFactor),
  };

  // Historical actuals
  const history = (snapshotsRes.data || []).map((s: any) => ({
    date: s.snapshot_date,
    confidence_score: s.confidence_score,
    retrievability: s.raw_retention,
    accuracy_factor: s.accuracy_factor,
  }));

  return { curve, history, thresholds, stability, accuracy_factor: accuracyFactor };
}

/**
 * Estimate days until retrievability drops to a given threshold.
 * R = (1 + d / (9 * S))^(-1) → d = 9 * S * (1/R - 1)
 */
function estimateDaysToThreshold(stability: number, threshold: number): number | null {
  if (stability <= 0 || threshold <= 0 || threshold >= 1) return null;
  return Math.round(9 * stability * (1 / threshold - 1));
}
