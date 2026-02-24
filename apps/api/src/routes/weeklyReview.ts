import { FastifyInstance } from 'fastify';
import {
  getWeeklyReview,
  getWeeklyReviewHistory,
  generateWeeklyReview,
} from '../services/weeklyReview.js';

export async function weeklyReviewRoutes(app: FastifyInstance) {
  app.get('/api/weekly-review', async (request, reply) => {
    const { weekEnd } = request.query as { weekEnd?: string };
    const result = await getWeeklyReview(request.userId, weekEnd);
    return reply.status(200).send(result);
  });

  app.get('/api/weekly-review/history', async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const result = await getWeeklyReviewHistory(request.userId, limit ? parseInt(limit, 10) : 8);
    return reply.status(200).send(result);
  });

  app.post('/api/weekly-review/generate', async (request, reply) => {
    const { weekEnd } = request.body as { weekEnd?: string };
    const result = await generateWeeklyReview(request.userId, weekEnd);
    return reply.status(200).send(result);
  });
}
