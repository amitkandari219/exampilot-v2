import { FastifyInstance } from 'fastify';
import {
  getRecalibrationStatus,
  getRecalibrationHistory,
  runRecalibration,
  setAutoRecalibrate,
} from '../services/recalibration.js';

export async function recalibrationRoutes(app: FastifyInstance) {
  app.get('/api/recalibration', async (request, reply) => {
    const result = await getRecalibrationStatus(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/recalibration/history', async (request, reply) => {
    const { limit } = request.query as { limit?: string };
    const result = await getRecalibrationHistory(request.userId, limit ? parseInt(limit, 10) : 20);
    return reply.status(200).send(result);
  });

  app.post('/api/recalibration/trigger', async (request, reply) => {
    const result = await runRecalibration(request.userId, 'manual');
    return reply.status(200).send(result);
  });

  app.post('/api/recalibration/auto', async (request, reply) => {
    const { enabled } = request.body as { enabled: boolean };
    await setAutoRecalibrate(request.userId, enabled);
    return reply.status(200).send({ auto_recalibrate: enabled });
  });
}
