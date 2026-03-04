import { FastifyInstance } from 'fastify';
import { getRecentEvents } from '../services/systemEvents.js';

export async function systemEventsRoutes(app: FastifyInstance) {
  app.get('/api/system-events', async (request) => {
    const { limit } = request.query as { limit?: string };
    return getRecentEvents(request.userId, limit ? parseInt(limit, 10) : 20);
  });
}
