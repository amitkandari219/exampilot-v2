import { FastifyInstance } from 'fastify';
import { generateDailyPlan, completePlanItem, deferPlanItem, skipPlanItem, regeneratePlan } from '../services/planner.js';
import { todayString } from '../utils/dateUtils.js';

export async function plannerRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { date?: string };
  }>('/api/daily-plan', async (request, reply) => {
    const date = request.query.date || todayString();
    const result = await generateDailyPlan(request.userId, date);
    return reply.status(200).send(result);
  });

  app.patch<{
    Params: { itemId: string };
    Body: { status: string; actual_hours?: number };
  }>('/api/daily-plan/items/:itemId', async (request, reply) => {
    const { status, actual_hours } = request.body;

    if (status === 'completed') {
      const result = await completePlanItem(request.userId, request.params.itemId, actual_hours || 0);
      return reply.status(200).send(result);
    }

    if (status === 'deferred') {
      const result = await deferPlanItem(request.userId, request.params.itemId);
      return reply.status(200).send(result);
    }

    if (status === 'skipped') {
      const result = await skipPlanItem(request.userId, request.params.itemId);
      return reply.status(200).send(result);
    }

    return reply.status(400).send({ error: 'Invalid status' });
  });

  app.post<{
    Body: { date?: string; hours?: number };
  }>('/api/daily-plan/regenerate', async (request, reply) => {
    const date = request.body?.date || todayString();
    const result = await regeneratePlan(request.userId, date, request.body?.hours);
    return reply.status(200).send(result);
  });
}
