import { FastifyInstance } from 'fastify';
import {
  getRecalibrationStatus,
  getRecalibrationHistory,
  runRecalibration,
  setAutoRecalibrate,
} from '../services/recalibration.js';
import {
  evaluateCascadeStrategies,
  applyCascadeStrategy,
  getCascadeHistory,
} from '../services/strategyCascade.js';

export async function recalibrationRoutes(app: FastifyInstance) {
  // GET /api/recalibration — returns auto-recalibration status + cascade strategies
  app.get('/api/recalibration', async (request, reply) => {
    const [status, cascade] = await Promise.all([
      getRecalibrationStatus(request.userId),
      evaluateCascadeStrategies(request.userId),
    ]);

    return reply.status(200).send({
      ...status,
      cascade,
    });
  });

  app.get('/api/recalibration/history', async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const result = await getRecalibrationHistory(request.userId, limit ? parseInt(limit, 10) : 20);
    return reply.status(200).send(result);
  });

  // Manual trigger for auto-recalibration (param tuning)
  app.post('/api/recalibration/trigger', async (request, reply) => {
    const result = await runRecalibration(request.userId, 'manual');
    return reply.status(200).send(result);
  });

  app.post('/api/recalibration/auto', async (request, reply) => {
    const { enabled } = request.body as { enabled: boolean };
    await setAutoRecalibrate(request.userId, enabled);
    return reply.status(200).send({ auto_recalibrate: enabled });
  });

  // POST /api/recalibration/apply — apply a cascade strategy
  app.post<{
    Body: { strategy: string };
  }>('/api/recalibration/apply', async (request, reply) => {
    const { strategy } = request.body;

    if (!strategy) {
      return reply.status(400).send({ error: 'strategy is required' });
    }

    const validStrategies = ['absorb', 'consume_buffers', 'increase_hours', 'reduce_scope'];
    if (!validStrategies.includes(strategy)) {
      return reply.status(400).send({ error: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}` });
    }

    const result = await applyCascadeStrategy(request.userId, strategy);
    return reply.status(200).send(result);
  });

  // GET /api/recalibration/cascade/history — cascade event history
  app.get('/api/recalibration/cascade/history', async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const result = await getCascadeHistory(request.userId, limit ? parseInt(limit, 10) : 10);
    return reply.status(200).send(result);
  });
}
