import { FastifyInstance } from 'fastify';
import { generateDailyPlan, completePlanItem, deferPlanItem, skipPlanItem, regeneratePlan } from '../services/planner.js';
import { getResumePoint, getMicroSessionPlan } from '../services/planActions.js';
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

  app.get('/api/daily-plan/resume-point', async (request, reply) => {
    const result = await getResumePoint(request.userId);
    return reply.status(200).send(result);
  });

  app.get<{
    Querystring: { minutes?: string };
  }>('/api/daily-plan/micro', async (request, reply) => {
    const minutes = parseInt(request.query.minutes || '15', 10);
    const result = await getMicroSessionPlan(request.userId, minutes);
    return reply.status(200).send(result);
  });
}
