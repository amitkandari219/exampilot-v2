import { FastifyInstance } from 'fastify';
import { getActiveAlerts } from '../services/alerts.js';

export async function alertRoutes(app: FastifyInstance) {
  app.get('/api/alerts', async (request) => {
    return getActiveAlerts(request.userId);
  });
}
