import { FastifyInstance } from 'fastify';
import {
  createMockTest,
  getMockTests,
  getMockAnalytics,
  getTopicMockHistory,
  importMockCSV,
} from '../services/mockTest.js';

export async function mockTestRoutes(app: FastifyInstance) {
  app.post<{
    Body: { test_name: string; total_questions: number; correct?: number; incorrect?: number; [key: string]: unknown };
  }>('/api/mocks', async (request, reply) => {
    const { test_name, total_questions, correct = 0, incorrect = 0 } = request.body;

    if (!test_name || !total_questions || total_questions <= 0) {
      return reply.status(400).send({ error: 'test_name and total_questions (> 0) are required' });
    }

    if (correct + incorrect > total_questions) {
      return reply.status(400).send({ error: 'correct + incorrect cannot exceed total_questions' });
    }

    const result = await createMockTest(request.userId, { ...request.body, correct, incorrect });
    return reply.status(201).send(result);
  });

  app.get<{
    Querystring: { limit?: string };
  }>('/api/mocks', async (request, reply) => {
    const result = await getMockTests(request.userId, request.query.limit ? parseInt(request.query.limit, 10) : 20);
    return reply.status(200).send(result);
  });

  app.get('/api/mocks/analytics', async (request, reply) => {
    const result = await getMockAnalytics(request.userId);
    return reply.status(200).send(result);
  });

  app.get<{
    Params: { topicId: string };
  }>('/api/mocks/topic/:topicId/history', async (request, reply) => {
    const result = await getTopicMockHistory(request.userId, request.params.topicId);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: { csv: string };
  }>('/api/mocks/import-csv', async (request, reply) => {
    const { csv } = request.body;

    if (!csv || typeof csv !== 'string') {
      return reply.status(400).send({ error: 'csv string is required in request body' });
    }

    const result = await importMockCSV(request.userId, csv);
    return reply.status(200).send(result);
  });
}
