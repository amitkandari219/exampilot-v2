import { FastifyInstance } from 'fastify';
import { getWeekPlan } from '../services/weekPlan.js';

export async function weekPlanRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { week?: string };
  }>('/api/weekplan', async (request) => {
    const weekOffset = request.query.week === 'next' ? 1 : 0;
    return getWeekPlan(request.userId, weekOffset);
  });
}
