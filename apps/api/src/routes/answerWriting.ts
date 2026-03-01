import { FastifyInstance } from 'fastify';
import { getTemplatesForTopic, submitAnswer, getAnswerHistory, getAnswerStats } from '../services/answerWriting.js';

export async function answerWritingRoutes(app: FastifyInstance) {
  app.get<{
    Params: { topicId: string };
  }>('/api/answers/templates/:topicId', async (request, reply) => {
    const result = await getTemplatesForTopic(request.params.topicId);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: {
      template_id: string; topic_id: string; word_count?: number; time_taken_minutes?: number;
      score_structure?: number; score_intro?: number; score_examples?: number;
      score_analysis?: number; score_conclusion?: number; notes?: string;
    };
  }>('/api/answers/submit', async (request, reply) => {
    const result = await submitAnswer(request.userId, request.body);
    return reply.status(200).send(result);
  });

  app.get<{
    Querystring: { topicId?: string };
  }>('/api/answers/history', async (request, reply) => {
    const result = await getAnswerHistory(request.userId, request.query.topicId);
    return reply.status(200).send(result);
  });

  app.get('/api/answers/stats', async (request, reply) => {
    const result = await getAnswerStats(request.userId);
    return reply.status(200).send(result);
  });
}
