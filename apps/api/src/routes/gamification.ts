import { FastifyInstance } from 'fastify';
import {
  getGamificationProfile,
  getBadges,
  getXPHistory,
} from '../services/gamification.js';

export async function gamificationRoutes(app: FastifyInstance) {
  app.get('/api/gamification', async (request, reply) => {
    const result = await getGamificationProfile(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/gamification/badges', async (request, reply) => {
    const result = await getBadges(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/gamification/xp-history', async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const result = await getXPHistory(request.userId, limit ? parseInt(limit, 10) : 50);
    return reply.status(200).send(result);
  });
}
