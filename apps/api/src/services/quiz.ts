import { supabase } from '../lib/supabase.js';
import { appEvents } from './events.js';

// ── T4-3: Micro-mock trigger (5 questions after topic completion) ──
// ── T4-12: Active recall prompts (3 rapid-fire questions) ──

const MICRO_MOCK_COUNT = 5;
const ACTIVE_RECALL_COUNT = 3;

interface QuizQuestion {
  id: string;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  difficulty: string;
  question_type: string;
}

export async function getMicroMockQuestions(topicId: string): Promise<{ questions: QuizQuestion[]; topic_id: string }> {
  const { data } = await supabase
    .from('pyq_questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, difficulty, question_type')
    .eq('topic_id', topicId)
    .limit(MICRO_MOCK_COUNT * 3); // fetch more to allow randomization

  const questions = shuffleArray(data || []).slice(0, MICRO_MOCK_COUNT) as QuizQuestion[];
  return { questions, topic_id: topicId };
}

export async function getActiveRecallQuestions(topicId: string): Promise<{ questions: QuizQuestion[]; topic_id: string }> {
  // Prefer conceptual/analytical questions for recall
  const { data } = await supabase
    .from('pyq_questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, difficulty, question_type')
    .eq('topic_id', topicId)
    .in('question_type', ['conceptual', 'analytical', 'factual'])
    .limit(ACTIVE_RECALL_COUNT * 3);

  const questions = shuffleArray(data || []).slice(0, ACTIVE_RECALL_COUNT) as QuizQuestion[];
  return { questions, topic_id: topicId };
}

interface QuizAnswer {
  question_id: string;
  selected_option: string;
}

export async function submitQuizAttempt(
  userId: string,
  body: { quiz_type: 'micro_mock' | 'active_recall'; topic_id: string; answers: QuizAnswer[]; time_taken_seconds?: number },
) {
  // Look up correct answers
  const questionIds = body.answers.map((a) => a.question_id);
  const { data: questions } = await supabase
    .from('pyq_questions')
    .select('id, correct_option')
    .in('id', questionIds);

  const correctMap = new Map((questions || []).map((q) => [q.id, q.correct_option]));

  let correct = 0;
  const graded = body.answers.map((a) => {
    const isCorrect = correctMap.get(a.question_id) === a.selected_option;
    if (isCorrect) correct++;
    return { question_id: a.question_id, selected_option: a.selected_option, is_correct: isCorrect };
  });

  const accuracy = body.answers.length > 0 ? Math.round((correct / body.answers.length) * 100) : 0;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      quiz_type: body.quiz_type,
      topic_id: body.topic_id,
      total_questions: body.answers.length,
      correct,
      accuracy,
      time_taken_seconds: body.time_taken_seconds,
      questions: graded,
    })
    .select()
    .single();

  if (error) throw error;

  appEvents.emit('xp:award', { userId, triggerType: 'mock_completion', topicId: body.topic_id });

  return { id: data.id, correct, total: body.answers.length, accuracy, results: graded };
}

export async function getQuizHistory(userId: string, topicId?: string) {
  let query = supabase
    .from('quiz_attempts')
    .select('id, quiz_type, topic_id, total_questions, correct, accuracy, time_taken_seconds, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (topicId) query = query.eq('topic_id', topicId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
