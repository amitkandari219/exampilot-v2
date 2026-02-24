import { FastifyInstance } from 'fastify';
import { generateDailyPlan, completePlanItem, deferPlanItem, regeneratePlan } from '../services/planner.js';
import { processEndOfDay } from '../services/velocity.js';

export async function plannerRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { date?: string };
  }>('/api/daily-plan', async (request, reply) => {
    const date = (request.query as any).date || new Date().toISOString().split('T')[0];
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

      // Trigger end-of-day processing
      const today = new Date().toISOString().split('T')[0];
      await processEndOfDay(request.userId, today).catch(() => {});

      return reply.status(200).send(result);
    }

    if (status === 'deferred') {
      const result = await deferPlanItem(request.userId, request.params.itemId);
      return reply.status(200).send(result);
    }

    if (status === 'skipped') {
      const { supabase } = await import('../lib/supabase.js');
      await supabase
        .from('daily_plan_items')
        .update({ status: 'skipped' })
        .eq('id', request.params.itemId);
      return reply.status(200).send({ status: 'skipped' });
    }

    return reply.status(400).send({ error: 'Invalid status' });
  });

  app.post<{
    Body: { date?: string; hours?: number };
  }>('/api/daily-plan/regenerate', async (request, reply) => {
    const date = request.body?.date || new Date().toISOString().split('T')[0];
    const result = await regeneratePlan(request.userId, date, request.body?.hours);
    return reply.status(200).send(result);
  });
}
