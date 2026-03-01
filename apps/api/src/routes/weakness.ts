import { FastifyInstance } from 'fastify';
import { calculateHealthScores, getWeaknessOverview, getTopicHealth, getHealthTrend, getRadarInsights, getTopicUrgency, getDiminishingReturns } from '../services/weakness.js';

export async function weaknessRoutes(app: FastifyInstance) {
  app.get('/api/weakness', async (request, reply) => {
    const result = await getWeaknessOverview(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/weakness/overview', async (request, reply) => {
    const result = await getWeaknessOverview(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/weakness/insights', async (request, reply) => {
    const result = await getRadarInsights(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/weakness/topic/:topicId', async (request, reply) => {
    const { topicId } = request.params as { topicId: string };
    const result = await getTopicHealth(request.userId, topicId);
    return reply.status(200).send(result);
  });

  app.get('/api/weakness/topic/:topicId/trend', async (request, reply) => {
    const { topicId } = request.params as { topicId: string };
    const { days } = request.query as { days?: string };
    const result = await getHealthTrend(request.userId, topicId, days ? parseInt(days, 10) : 30);
    return reply.status(200).send(result);
  });

  app.post('/api/weakness/recalculate', async (request, reply) => {
    const result = await calculateHealthScores(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/weakness/urgency', async (request, reply) => {
    const result = await getTopicUrgency(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/weakness/diminishing-returns', async (request, reply) => {
    const result = await getDiminishingReturns(request.userId);
    return reply.status(200).send(result);
  });
}
