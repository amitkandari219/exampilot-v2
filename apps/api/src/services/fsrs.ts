import { createEmptyCard, generatorParameters, fsrs, Rating, State } from 'ts-fsrs';
import type { Card } from 'ts-fsrs';
import { supabase } from '../lib/supabase.js';
import { toDateString } from '../utils/dateUtils.js';
import { CONFIDENCE, FSRS as FSRS_CONSTANTS } from '../constants/thresholds.js';
import { appEvents } from './events.js';

interface FSRSCardWithTopic {
  id: string;
  user_id: string;
  topic_id: string;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
  topics: { name: string; pyq_weight: number; difficulty: number } | null;
}

interface UserProgressWithMockAccuracy {
  status: string;
  revision_count: number;
  mock_accuracy: number | null;
}

export function createFSRSInstance(targetRetention: number) {
  const params = generatorParameters({ request_retention: targetRetention });
  return fsrs(params);
}

export async function initializeFSRSCard(userId: string, topicId: string) {
  const card = createEmptyCard();

  const { data, error } = await supabase
    .from('fsrs_cards')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      due: card.due.toISOString(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      last_review: card.last_review ? new Date(card.last_review).toISOString() : null,
    }, { onConflict: 'user_id,topic_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function recordReview(userId: string, topicId: string, rating: number) {
  // Get user's target retention
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('fsrs_target_retention')
    .eq('id', userId)
    .single();

  const targetRetention = profile?.fsrs_target_retention || FSRS_CONSTANTS.TARGET_RETENTION;
  const f = createFSRSInstance(targetRetention);

  // Get current card
  let { data: cardData } = await supabase
    .from('fsrs_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  if (!cardData) {
    cardData = await initializeFSRSCard(userId, topicId);
  }

  // Reconstruct Card object
  const card = {
    due: new Date(cardData.due),
    stability: cardData.stability,
    difficulty: cardData.difficulty,
    elapsed_days: cardData.elapsed_days,
    scheduled_days: cardData.scheduled_days,
    reps: cardData.reps,
    lapses: cardData.lapses,
    learning_steps: 0,
    state: cardData.state as State,
    last_review: cardData.last_review ? new Date(cardData.last_review) : undefined,
  } as Card;

  const now = new Date();
  const scheduling = f.repeat(card, now);
  // @ts-expect-error ts-fsrs IPreview is indexed by Rating enum number, not plain number
  const result = scheduling[rating];
  const updatedCard = result.card;

  // Update card in DB
  const { error: updateErr } = await supabase
    .from('fsrs_cards')
    .update({
      due: updatedCard.due.toISOString(),
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      elapsed_days: updatedCard.elapsed_days,
      scheduled_days: updatedCard.scheduled_days,
      reps: updatedCard.reps,
      lapses: updatedCard.lapses,
      state: updatedCard.state,
      last_review: now.toISOString(),
    })
    .eq('id', cardData.id);

  if (updateErr) throw updateErr;

  // Append review log
  await supabase.from('fsrs_review_logs').insert({
    user_id: userId,
    topic_id: topicId,
    card_id: cardData.id,
    rating,
    state: updatedCard.state,
    due: updatedCard.due.toISOString(),
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
    elapsed_days: updatedCard.elapsed_days,
    scheduled_days: updatedCard.scheduled_days,
    review_at: now.toISOString(),
  });

  // Calculate retrievability and confidence
  const retrievability = calculateRetrievability({
    stability: updatedCard.stability,
    elapsed_days: 0, // Just reviewed
  });
  const confidenceScore = Math.round(retrievability * 100);

  // Append confidence snapshot
  await supabase.from('confidence_snapshots').insert({
    user_id: userId,
    topic_id: topicId,
    confidence_score: confidenceScore,
    raw_retention: retrievability,
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
    accuracy_factor: 1.0,
  });

  // Update user_progress confidence
  await supabase
    .from('user_progress')
    .update({
      confidence_score: confidenceScore,
      confidence_status: confidenceScore >= CONFIDENCE.FRESH ? 'fresh'
        : confidenceScore >= CONFIDENCE.FADING ? 'fading'
        : confidenceScore >= CONFIDENCE.STALE ? 'stale' : 'decayed',
      last_touched: now.toISOString(),
    })
    .eq('user_id', userId)
    .eq('topic_id', topicId);

  // Auto-upgrade topic status
  const { data: progressRaw } = await supabase
    .from('user_progress')
    .select('status, revision_count, mock_accuracy')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  const progress = progressRaw as UserProgressWithMockAccuracy | null;

  if (progress) {
    const revCount = (progress.revision_count || 0) + 1;
    const mockAcc = progress.mock_accuracy;
    let newStatus = progress.status;

    if (revCount >= 3 && confidenceScore >= 70) {
      newStatus = 'exam_ready';
    } else if (mockAcc != null && mockAcc >= 0.8 && revCount >= 2) {
      // Fast-track: high mock accuracy + adequate revisions
      newStatus = 'exam_ready';
    } else if (revCount >= 2) {
      newStatus = 'revised';
    }

    if (newStatus !== progress.status) {
      await supabase
        .from('user_progress')
        .update({ status: newStatus, revision_count: revCount })
        .eq('user_id', userId)
        .eq('topic_id', topicId);

      await supabase.from('status_changes').insert({
        user_id: userId,
        topic_id: topicId,
        old_status: progress.status,
        new_status: newStatus,
        reason: 'fsrs_auto_upgrade',
      });
    } else {
      await supabase
        .from('user_progress')
        .update({ revision_count: revCount })
        .eq('user_id', userId)
        .eq('topic_id', topicId);
    }
  }

  // Create next revision schedule entry
  await supabase.from('revision_schedule').insert({
    user_id: userId,
    topic_id: topicId,
    revision_number: (cardData.reps || 0) + 1,
    type: 'scheduled',
    scheduled_date: toDateString(updatedCard.due),
    status: 'pending',
  });

  const triggerType = rating >= 3 ? 'fsrs_review_correct' : 'fsrs_review_incorrect';
  appEvents.emit('xp:award', { userId, triggerType, topicId });

  return {
    card: updatedCard,
    next_due: updatedCard.due.toISOString(),
    confidence_score: confidenceScore,
  };
}

export function calculateRetrievability(card: { stability: number; elapsed_days: number }): number {
  if (card.stability <= 0) return 0;
  return Math.pow(1 + card.elapsed_days / (9 * card.stability), -1);
}

export async function batchRecalculateConfidence(userId: string) {
  const [cardsRes, mockRes] = await Promise.all([
    supabase.from('fsrs_cards').select('*').eq('user_id', userId),
    supabase.from('mock_topic_accuracy').select('topic_id, accuracy, total_questions').eq('user_id', userId),
  ]);

  if (cardsRes.error) throw cardsRes.error;

  const mockMap = new Map((mockRes.data || []).map((m: any) => [m.topic_id, m]));

  for (const card of cardsRes.data || []) {
    const now = new Date();
    const lastReview = card.last_review ? new Date(card.last_review) : now;
    const elapsedDays = Math.floor((now.getTime() - lastReview.getTime()) / 86400000);

    const retrievability = calculateRetrievability({
      stability: card.stability,
      elapsed_days: elapsedDays,
    });

    // Apply mock accuracy adjustment (consistent with decayTrigger.ts)
    const mock = mockMap.get(card.topic_id);
    const mockAccuracy = (mock && mock.total_questions > 0) ? mock.accuracy : null;
    const accuracyFactor = mockAccuracy != null ? (FSRS_CONSTANTS.ACCURACY_FLOOR + FSRS_CONSTANTS.ACCURACY_MULTIPLIER * mockAccuracy) : 1.0;
    const adjusted = retrievability * accuracyFactor;

    const confidenceScore = Math.round(Math.min(100, Math.max(0, adjusted * 100)));
    const confidenceStatus = confidenceScore >= CONFIDENCE.FRESH ? 'fresh'
      : confidenceScore >= CONFIDENCE.FADING ? 'fading'
      : confidenceScore >= CONFIDENCE.STALE ? 'stale' : 'decayed';

    await supabase
      .from('user_progress')
      .update({ confidence_score: confidenceScore, confidence_status: confidenceStatus })
      .eq('user_id', userId)
      .eq('topic_id', card.topic_id);

    // Auto-downgrade when decayed (score < 20) — consistent with decayTrigger.ts
    if (confidenceStatus === 'decayed') {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('topic_id', card.topic_id)
        .single();

      if (progress && (progress.status === 'exam_ready' || progress.status === 'revised')) {
        await supabase
          .from('user_progress')
          .update({ status: 'first_pass' })
          .eq('user_id', userId)
          .eq('topic_id', card.topic_id);

        await supabase.from('status_changes').insert({
          user_id: userId,
          topic_id: card.topic_id,
          old_status: progress.status,
          new_status: 'first_pass',
          reason: 'confidence_decay_auto_downgrade',
        });
      }
    }

    // Append confidence snapshot
    await supabase.from('confidence_snapshots').insert({
      user_id: userId,
      topic_id: card.topic_id,
      confidence_score: confidenceScore,
      raw_retention: retrievability,
      stability: card.stability,
      difficulty: card.difficulty,
      accuracy_factor: accuracyFactor,
    });
  }
}

export async function getRevisionsDue(userId: string, date: string) {
  const targetDate = new Date(date);
  const upcoming3 = new Date(targetDate);
  upcoming3.setDate(upcoming3.getDate() + 3);

  const { data: dueToday, error: e1 } = await supabase
    .from('fsrs_cards')
    .select('*, topics!inner(name, chapter_id, pyq_weight, difficulty)')
    .eq('user_id', userId)
    .lte('due', targetDate.toISOString());

  if (e1) throw e1;

  const { data: upcoming, error: e2 } = await supabase
    .from('fsrs_cards')
    .select('*, topics!inner(name, chapter_id, pyq_weight, difficulty)')
    .eq('user_id', userId)
    .gt('due', targetDate.toISOString())
    .lte('due', upcoming3.toISOString());

  if (e2) throw e2;

  // Split due today into overdue and today
  const todayStart = new Date(date + 'T00:00:00');
  const overdue = (dueToday || [])
    .filter((c) => new Date(c.due) < todayStart)
    .map((c) => ({
      ...c,
      overdue_by_days: Math.floor((todayStart.getTime() - new Date(c.due).getTime()) / 86400000),
    }));
  const today = (dueToday || []).filter((c) => new Date(c.due) >= todayStart);

  return { overdue, today, upcoming: upcoming || [] };
}

export async function getRevisionsCalendar(userId: string, month: string) {
  // month format: YYYY-MM
  const startDate = new Date(month + '-01');
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const { data: cardsRaw, error } = await supabase
    .from('fsrs_cards')
    .select('topic_id, due, topics!inner(name, pyq_weight, difficulty)')
    .eq('user_id', userId)
    .gte('due', startDate.toISOString())
    .lt('due', endDate.toISOString())
    .order('due', { ascending: true });

  if (error) throw error;

  const cards = (cardsRaw || []) as unknown as Pick<FSRSCardWithTopic, 'topic_id' | 'due' | 'topics'>[];

  // Group by date
  const calendar: Record<string, Array<{ topic_id: string; topic_name: string; pyq_weight: number; difficulty: number }>> = {};
  for (const card of cards) {
    const dateKey = toDateString(new Date(card.due));
    if (!calendar[dateKey]) calendar[dateKey] = [];
    calendar[dateKey].push({
      topic_id: card.topic_id,
      topic_name: card.topics?.name || '',
      pyq_weight: card.topics?.pyq_weight || 0,
      difficulty: card.topics?.difficulty || 0,
    });
  }

  return { month, calendar };
}

export async function getConfidenceOverview(userId: string) {
  const { data: progress, error } = await supabase
    .from('user_progress')
    .select('topic_id, confidence_score, confidence_status')
    .eq('user_id', userId);

  if (error) throw error;

  const distribution: Record<string, number> = { fresh: 0, fading: 0, stale: 0, decayed: 0 };
  for (const p of progress || []) {
    distribution[p.confidence_status] = (distribution[p.confidence_status] || 0) + 1;
  }

  // Get fastest decaying topics
  const { data: decayingRaw } = await supabase
    .from('fsrs_cards')
    .select('topic_id, stability, topics!inner(name)')
    .eq('user_id', userId)
    .order('stability', { ascending: true })
    .limit(5);

  const decaying = (decayingRaw || []) as unknown as Pick<FSRSCardWithTopic, 'topic_id' | 'stability' | 'topics'>[];

  const fastestDecaying = decaying.map((d) => {
    const p = (progress || []).find((pr) => pr.topic_id === d.topic_id);
    return {
      topic_id: d.topic_id,
      topic_name: d.topics?.name || '',
      confidence_score: p?.confidence_score || 0,
      stability: d.stability,
    };
  });

  return { distribution, fastest_decaying: fastestDecaying };
}
