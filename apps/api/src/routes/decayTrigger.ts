import { FastifyInstance } from 'fastify';
import { recalculateAllConfidence, getConfidenceOverviewEnhanced, getTopicForgettingCurve } from '../services/decayTrigger.js';

export async function decayTriggerRoutes(app: FastifyInstance) {
  // POST /api/decay/recalculate — manual or cron-triggered
  app.post('/api/decay/recalculate', async (request, reply) => {
    const result = await recalculateAllConfidence(request.userId);
    return reply.status(200).send(result);
  });

  // GET /api/confidence/overview — enhanced with per-subject + distribution
  app.get('/api/confidence/overview', async (request, reply) => {
    const result = await getConfidenceOverviewEnhanced(request.userId);
    return reply.status(200).send(result);
  });

  // GET /api/confidence/topic/:topicId/curve — projected forgetting curve
  app.get<{
    Params: { topicId: string };
  }>('/api/confidence/topic/:topicId/curve', async (request, reply) => {
    const result = await getTopicForgettingCurve(request.userId, request.params.topicId);
    return reply.status(200).send(result);
  });
}
