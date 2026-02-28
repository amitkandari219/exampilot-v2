import { supabase } from '../lib/supabase.js';
import type { MockTest, MockAnalytics, MockTopicHistory, MockTrend, MockCSVResult } from '../types/index.js';
import { toDateString } from '../utils/dateUtils.js';
import { appEvents } from './events.js';
import { MOCK_CUTOFFS } from '../constants/thresholds.js';

interface SubjectBreakdown {
  subject_id: string;
  total: number;
  correct: number;
}

// Typed interface for mock_questions joined with mock_tests
interface MockQuestionWithTest {
  is_correct: boolean;
  mock_tests: { test_date: string } | null;
}

interface QuestionEntry {
  subject_id: string;
  topic_id?: string | null;
  is_correct: boolean;
  is_attempted?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
}

interface CreateMockPayload {
  test_name: string;
  test_date?: string;
  total_questions: number;
  correct: number;
  incorrect: number;
  percentile?: number | null;
  subject_breakdown?: SubjectBreakdown[];
  questions?: QuestionEntry[];
}

export async function createMockTest(userId: string, payload: CreateMockPayload): Promise<MockTest> {
  let { correct, incorrect } = payload;
  const { total_questions, test_name, test_date, percentile, questions, subject_breakdown } = payload;

  // If detailed entry, derive correct/incorrect from questions
  if (questions && questions.length > 0) {
    correct = questions.filter((q: QuestionEntry) => q.is_correct).length;
    const attempted = questions.filter((q: QuestionEntry) => q.is_attempted !== false).length;
    incorrect = attempted - correct;
  }

  const attempted = correct + incorrect;
  const unattempted = total_questions - attempted;
  const score = (correct * 2) - (incorrect * 0.66);
  const max_score = total_questions * 2;

  // Insert mock test
  const { data: mockTest, error: insertErr } = await supabase
    .from('mock_tests')
    .insert({
      user_id: userId,
      test_name,
      test_date: test_date || toDateString(new Date()),
      total_questions,
      attempted,
      correct,
      incorrect,
      unattempted,
      score,
      max_score,
      percentile: percentile || null,
      source: 'manual',
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  // Insert questions if detailed entry
  if (questions && questions.length > 0) {
    const questionRows = questions.map((q: QuestionEntry, i: number) => ({
      mock_test_id: mockTest.id,
      question_number: i + 1,
      topic_id: q.topic_id || null,
      subject_id: q.subject_id,
      is_correct: q.is_correct,
      is_attempted: q.is_attempted !== false,
      difficulty: q.difficulty || null,
    }));

    const { error: qErr } = await supabase.from('mock_questions').insert(questionRows);
    if (qErr) throw qErr;
  }

  // Aggregate accuracy
  await aggregateAccuracy(userId, mockTest.id, mockTest.test_date, subject_breakdown, !!questions);

  appEvents.emit('xp:award', { userId, triggerType: 'mock_completion' });

  // Recalculate confidence with updated mock accuracy (non-critical)
  try {
    const { recalculateAllConfidence } = await import('./decayTrigger.js');
    await recalculateAllConfidence(userId);
  } catch (e) { console.warn('[mockTest:decay-trigger]', e);
    // Decay trigger is non-critical
  }

  // Check for mock score improvement and notify
  try {
    const { data: prevTests } = await supabase
      .from('mock_tests')
      .select('score, max_score')
      .eq('user_id', userId)
      .order('test_date', { ascending: false })
      .limit(2);

    if (prevTests && prevTests.length >= 2) {
      const currentPct = prevTests[0].max_score > 0 ? (prevTests[0].score / prevTests[0].max_score) * 100 : 0;
      const prevPct = prevTests[1].max_score > 0 ? (prevTests[1].score / prevTests[1].max_score) * 100 : 0;
      if (currentPct > prevPct + 2) {
        appEvents.emit('notification:queue', { userId, type: 'mock_improvement', metadata: { subject: test_name, pct: Math.round(currentPct - prevPct) } });
      }
    }
  } catch (e) { console.warn('[mockTest:notification]', e); }

  // Recalculate health scores after mock import (non-critical)
  try {
    const { calculateHealthScores } = await import('./weakness.js');
    await calculateHealthScores(userId);
  } catch (e) { console.warn('[mockTest:health-scores]', e);
    // Health recalc is non-critical
  }

  // Schedule immediate revision for very low accuracy topics (non-critical)
  try {
    if (questions && questions.length > 0) {
      const { scheduleImmediateRevision } = await import('./planner.js');
      // Find topics with accuracy < 0.3 from this mock
      const topicCorrect = new Map<string, { correct: number; total: number }>();
      for (const q of questions) {
        if (q.topic_id) {
          const entry = topicCorrect.get(q.topic_id) || { correct: 0, total: 0 };
          entry.total++;
          if (q.is_correct) entry.correct++;
          topicCorrect.set(q.topic_id, entry);
        }
      }
      const lowAccuracyTopics = Array.from(topicCorrect.entries())
        .filter(([, v]) => v.total >= 2 && v.correct / v.total < 0.3)
        .map(([topicId]) => topicId);

      if (lowAccuracyTopics.length > 0 && typeof scheduleImmediateRevision === 'function') {
        await scheduleImmediateRevision(userId, lowAccuracyTopics);
      }
    }
  } catch (e) { console.warn('[mockTest:immediate-revision]', e);
    // Immediate revision is non-critical
  }

  return mockTest as MockTest;
}

async function aggregateAccuracy(
  userId: string,
  mockId: string,
  testDate: string,
  subjectBreakdown?: SubjectBreakdown[],
  hasQuestions = false,
) {
  if (subjectBreakdown && subjectBreakdown.length > 0 && !hasQuestions) {
    // Quick Entry with subject breakdown
    for (const sb of subjectBreakdown) {
      const accuracy = sb.total > 0 ? sb.correct / sb.total : 0;
      await upsertSubjectAccuracy(userId, sb.subject_id, sb.total, sb.correct, accuracy, testDate);

      // Update mock_accuracy on user_progress for all topics in this subject
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('subject_id', sb.subject_id);
      if (chapters && chapters.length > 0) {
        const chapterIds = chapters.map((c: any) => c.id);
        const { data: topics } = await supabase
          .from('topics')
          .select('id')
          .in('chapter_id', chapterIds);
        if (topics && topics.length > 0) {
          const topicIds = topics.map((t: any) => t.id);
          await supabase
            .from('user_progress')
            .update({ mock_accuracy: accuracy })
            .eq('user_id', userId)
            .in('topic_id', topicIds);
        }
      }
    }
  }

  if (hasQuestions) {
    // Detailed Entry: aggregate from mock_questions
    const { data: questions } = await supabase
      .from('mock_questions')
      .select('*')
      .eq('mock_test_id', mockId);

    if (!questions || questions.length === 0) return;

    // Group by topic
    const topicMap = new Map<string, { total: number; correct: number }>();
    const subjectMap = new Map<string, { total: number; correct: number }>();

    for (const q of questions) {
      if (q.topic_id) {
        const t = topicMap.get(q.topic_id) || { total: 0, correct: 0 };
        t.total++;
        if (q.is_correct) t.correct++;
        topicMap.set(q.topic_id, t);
      }

      const s = subjectMap.get(q.subject_id) || { total: 0, correct: 0 };
      s.total++;
      if (q.is_correct) s.correct++;
      subjectMap.set(q.subject_id, s);
    }

    // Upsert topic accuracy
    for (const [topicId, data] of topicMap) {
      const accuracy = data.total > 0 ? data.correct / data.total : 0;
      await upsertTopicAccuracy(userId, topicId, data.total, data.correct, accuracy, testDate);
    }

    // Upsert subject accuracy
    for (const [subjectId, data] of subjectMap) {
      const accuracy = data.total > 0 ? data.correct / data.total : 0;
      await upsertSubjectAccuracy(userId, subjectId, data.total, data.correct, accuracy, testDate);
    }

    // Update user_progress.mock_accuracy for affected topics
    for (const [topicId, data] of topicMap) {
      const accuracy = data.total > 0 ? data.correct / data.total : 0;
      await supabase
        .from('user_progress')
        .update({ mock_accuracy: accuracy })
        .eq('user_id', userId)
        .eq('topic_id', topicId);
    }
  }

  // Confidence recalc handled by recalculateAllConfidence in createMockTest
}

async function upsertTopicAccuracy(
  userId: string, topicId: string, newTotal: number, newCorrect: number, _accuracy: number, testDate: string,
) {
  const { data: existing } = await supabase
    .from('mock_topic_accuracy')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  if (existing) {
    const totalQ = existing.total_questions + newTotal;
    const correctQ = existing.correct_questions + newCorrect;
    const acc = totalQ > 0 ? correctQ / totalQ : 0;
    const trend = computeTrend(existing.accuracy, acc);

    await supabase
      .from('mock_topic_accuracy')
      .update({ total_questions: totalQ, correct_questions: correctQ, accuracy: acc, last_mock_date: testDate, trend })
      .eq('id', existing.id);
  } else {
    const acc = newTotal > 0 ? newCorrect / newTotal : 0;
    await supabase.from('mock_topic_accuracy').insert({
      user_id: userId, topic_id: topicId, total_questions: newTotal, correct_questions: newCorrect,
      accuracy: acc, last_mock_date: testDate, trend: 'stable',
    });
  }
}

async function upsertSubjectAccuracy(
  userId: string, subjectId: string, newTotal: number, newCorrect: number, _accuracy: number, testDate: string,
) {
  // Get this user's mock tests for the subject to compute avg/best
  const { data: tests } = await supabase
    .from('mock_tests')
    .select('score, max_score')
    .eq('user_id', userId);

  const scorePcts = (tests || [])
    .filter((t: any) => t.max_score > 0)
    .map((t: any) => (t.score / t.max_score) * 100);

  const mockScorePct = scorePcts.length > 0
    ? scorePcts[scorePcts.length - 1] : 0;

  const { data: existing } = await supabase
    .from('mock_subject_accuracy')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .single();

  if (existing) {
    const totalQ = existing.total_questions + newTotal;
    const correctQ = existing.correct + newCorrect;
    const acc = totalQ > 0 ? correctQ / totalQ : 0;
    const testsCount = existing.tests_count + 1;
    const avgPct = scorePcts.length > 0 ? scorePcts.reduce((a: number, b: number) => a + b, 0) / scorePcts.length : 0;
    const bestPct = scorePcts.length > 0 ? Math.max(...scorePcts) : mockScorePct;
    const trend = computeTrend(existing.accuracy, acc);

    await supabase
      .from('mock_subject_accuracy')
      .update({ total_questions: totalQ, correct: correctQ, accuracy: acc, tests_count: testsCount, avg_score_pct: avgPct, best_score_pct: bestPct, trend })
      .eq('id', existing.id);
  } else {
    const acc = newTotal > 0 ? newCorrect / newTotal : 0;
    await supabase.from('mock_subject_accuracy').insert({
      user_id: userId, subject_id: subjectId, total_questions: newTotal, correct: newCorrect,
      accuracy: acc, tests_count: 1, avg_score_pct: mockScorePct, best_score_pct: mockScorePct, trend: 'stable',
    });
  }
}

function computeTrend(oldAccuracy: number, newAccuracy: number): MockTrend {
  const diff = newAccuracy - oldAccuracy;
  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

export async function getMockAnalytics(userId: string): Promise<MockAnalytics> {
  // Score trend
  const { data: tests } = await supabase
    .from('mock_tests')
    .select('test_date, score, max_score, test_name')
    .eq('user_id', userId)
    .order('test_date', { ascending: true });

  const score_trend = (tests || []).map((t: any) => ({
    test_date: t.test_date,
    score_pct: t.max_score > 0 ? (t.score / t.max_score) * 100 : 0,
    test_name: t.test_name,
  }));

  // Subject accuracy with names
  const { data: subjectAccRows } = await supabase
    .from('mock_subject_accuracy')
    .select('*, subjects(name)')
    .eq('user_id', userId);

  const subject_accuracy = (subjectAccRows || []).map((r: any) => ({
    ...r,
    subject_name: r.subjects?.name || 'Unknown',
    subjects: undefined,
  }));

  // Weakest topics (accuracy < 0.5)
  const { data: weakRows } = await supabase
    .from('mock_topic_accuracy')
    .select('topic_id, accuracy, total_questions, trend, topics(name)')
    .eq('user_id', userId)
    .lt('accuracy', 0.5)
    .order('accuracy', { ascending: true })
    .limit(10);

  const weakest_topics = (weakRows || []).map((r: any) => ({
    topic_id: r.topic_id,
    topic_name: r.topics?.name || 'Unknown',
    accuracy: r.accuracy,
    total_questions: r.total_questions,
    trend: r.trend,
  }));

  // Strongest topics (accuracy >= 0.7)
  const { data: strongRows } = await supabase
    .from('mock_topic_accuracy')
    .select('topic_id, accuracy, total_questions, topics(name)')
    .eq('user_id', userId)
    .gte('accuracy', 0.7)
    .order('accuracy', { ascending: false })
    .limit(5);

  const strongest_topics = (strongRows || []).map((r: any) => ({
    topic_id: r.topic_id,
    topic_name: r.topics?.name || 'Unknown',
    accuracy: r.accuracy,
    total_questions: r.total_questions,
  }));

  // Aggregates
  const testsCount = (tests || []).length;
  const avgScorePct = score_trend.length > 0
    ? score_trend.reduce((sum: number, t: any) => sum + t.score_pct, 0) / score_trend.length : 0;
  const bestScorePct = score_trend.length > 0
    ? Math.max(...score_trend.map((t: any) => t.score_pct)) : 0;

  // Generate recommendation
  let recommendation = '';
  if (testsCount === 0) {
    recommendation = 'Record your first mock test to get personalized insights.';
  } else if (avgScorePct < 40) {
    recommendation = 'Focus on building fundamentals. Review weak subjects before attempting more mocks.';
  } else if (avgScorePct < 60) {
    recommendation = 'Good progress. Target your weakest topics to push above 60%.';
  } else if (weakest_topics.length > 3) {
    recommendation = 'Strong overall, but some weak areas remain. Prioritize topics below 50% accuracy.';
  } else {
    recommendation = 'Excellent performance! Maintain consistency and focus on timed practice.';
  }

  // Compute cutoff delta for latest mock
  const latestCutoff = MOCK_CUTOFFS.prelims_2024;
  const scoreTrendWithCutoff = score_trend.map((t: { test_date: string; score_pct: number; test_name: string }) => ({
    ...t,
    cutoff_delta: t.score_pct > 0 ? Math.round((t.score_pct / 100 * 200) - latestCutoff) : null,
  }));

  return {
    score_trend: scoreTrendWithCutoff,
    subject_accuracy,
    weakest_topics,
    strongest_topics,
    tests_count: testsCount,
    avg_score_pct: Math.round(avgScorePct * 10) / 10,
    best_score_pct: Math.round(bestScorePct * 10) / 10,
    recommendation,
    cutoff_reference: latestCutoff,
  };
}

export async function getTopicMockHistory(userId: string, topicId: string): Promise<MockTopicHistory> {
  // Get topic name
  const { data: topic } = await supabase
    .from('topics')
    .select('name')
    .eq('id', topicId)
    .single();

  // Get current accuracy
  const { data: accuracy } = await supabase
    .from('mock_topic_accuracy')
    .select('accuracy, trend')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  // Get per-test history
  const { data: questions } = await supabase
    .from('mock_questions')
    .select('is_correct, mock_tests!inner(test_date)')
    .eq('topic_id', topicId)
    .eq('mock_tests.user_id', userId)
    .order('mock_tests(test_date)', { ascending: true });

  // Group by test date
  const dateMap = new Map<string, { questions: number; correct: number }>();
  for (const q of (questions || []) as unknown as MockQuestionWithTest[]) {
    const date = q.mock_tests?.test_date;
    if (!date) continue;
    const entry = dateMap.get(date) || { questions: 0, correct: 0 };
    entry.questions++;
    if (q.is_correct) entry.correct++;
    dateMap.set(date, entry);
  }

  const history = Array.from(dateMap.entries()).map(([test_date, data]) => ({
    test_date,
    questions: data.questions,
    correct: data.correct,
    accuracy: data.questions > 0 ? data.correct / data.questions : 0,
  }));

  return {
    topic_id: topicId,
    topic_name: topic?.name || 'Unknown',
    current_accuracy: accuracy?.accuracy || 0,
    trend: accuracy?.trend || 'stable',
    history,
  };
}

export async function getMockTests(userId: string, limit = 20): Promise<MockTest[]> {
  const { data, error } = await supabase
    .from('mock_tests')
    .select('*')
    .eq('user_id', userId)
    .order('test_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as MockTest[];
}

export async function importMockCSV(userId: string, csvContent: string): Promise<MockCSVResult> {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return { imported: 0, errors: [{ row: 0, message: 'CSV must have a header row and at least one data row' }] };
  }

  // Skip header
  const dataLines = lines.slice(1);
  const errors: Array<{ row: number; message: string }> = [];
  let imported = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    const cols = line.split(',').map((c) => c.trim());
    if (cols.length < 4) {
      errors.push({ row: i + 2, message: 'Expected at least 4 columns: date,subject,score,max_score' });
      continue;
    }

    const [dateStr, subject, scoreStr, maxScoreStr] = cols;
    const score = parseFloat(scoreStr);
    const maxScore = parseFloat(maxScoreStr);

    if (!dateStr || isNaN(score) || isNaN(maxScore) || maxScore <= 0) {
      errors.push({ row: i + 2, message: 'Invalid data: check date, score, and max_score values' });
      continue;
    }

    // Derive questions from score (approximate: score = correct*2 - incorrect*0.66)
    // Simplify: total_questions = max_score / 2
    const totalQuestions = Math.round(maxScore / 2);
    const correct = Math.max(0, Math.round(score / 2));
    const incorrect = Math.max(0, totalQuestions - correct);

    try {
      await createMockTest(userId, {
        test_name: subject || 'CSV Import',
        test_date: dateStr,
        total_questions: totalQuestions,
        correct,
        incorrect,
      });
      imported++;
    } catch (e) {
      errors.push({ row: i + 2, message: `Import failed: ${(e as Error).message}` });
    }
  }

  return { imported, errors };
}
