import { FastifyInstance } from 'fastify';
import {
  createMockTest,
  getMockTests,
  getMockAnalytics,
  getTopicMockHistory,
} from '../services/mockTest.js';

export async function mockTestRoutes(app: FastifyInstance) {
  app.post('/api/mocks', async (request, reply) => {
    const body = request.body as any;

    if (!body.test_name || !body.total_questions || body.total_questions <= 0) {
      return reply.status(400).send({ error: 'test_name and total_questions (> 0) are required' });
    }

    const correct = body.correct || 0;
    const incorrect = body.incorrect || 0;
    if (correct + incorrect > body.total_questions) {
      return reply.status(400).send({ error: 'correct + incorrect cannot exceed total_questions' });
    }

    const result = await createMockTest(request.userId, body);
    return reply.status(201).send(result);
  });

  app.get('/api/mocks', async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const result = await getMockTests(request.userId, limit ? parseInt(limit, 10) : 20);
    return reply.status(200).send(result);
  });

  app.get('/api/mocks/analytics', async (request, reply) => {
    const result = await getMockAnalytics(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/mocks/topic/:topicId/history', async (request, reply) => {
    const { topicId } = request.params as { topicId: string };
    const result = await getTopicMockHistory(request.userId, topicId);
    return reply.status(200).send(result);
  });
}
