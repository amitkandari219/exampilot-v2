import { FastifyInstance } from 'fastify';
import { getMicroMockQuestions, getActiveRecallQuestions, submitQuizAttempt, getQuizHistory } from '../services/quiz.js';

export async function quizRoutes(app: FastifyInstance) {
  // T4-3: Get micro-mock questions for a topic
  app.get<{
    Params: { topicId: string };
  }>('/api/quiz/micro-mock/:topicId', async (request, reply) => {
    const result = await getMicroMockQuestions(request.params.topicId);
    return reply.status(200).send(result);
  });

  // T4-12: Get active recall prompts for a topic
  app.get<{
    Params: { topicId: string };
  }>('/api/quiz/recall/:topicId', async (request, reply) => {
    const result = await getActiveRecallQuestions(request.params.topicId);
    return reply.status(200).send(result);
  });

  // Submit quiz attempt
  app.post<{
    Body: {
      quiz_type: 'micro_mock' | 'active_recall';
      topic_id: string;
      answers: Array<{ question_id: string; selected_option: string }>;
      time_taken_seconds?: number;
    };
  }>('/api/quiz/submit', async (request, reply) => {
    const result = await submitQuizAttempt(request.userId, request.body);
    return reply.status(200).send(result);
  });

  // Quiz history
  app.get<{
    Querystring: { topicId?: string };
  }>('/api/quiz/history', async (request, reply) => {
    const result = await getQuizHistory(request.userId, request.query.topicId);
    return reply.status(200).send(result);
  });
}
