import { FastifyInstance } from 'fastify';
import { getBurnoutData, activateRecoveryMode, exitRecoveryMode } from '../services/burnout.js';

export async function burnoutRoutes(app: FastifyInstance) {
  app.get('/api/burnout', async (request, reply) => {
    const result = await getBurnoutData(request.userId);
    return reply.status(200).send(result);
  });

  app.post('/api/burnout/recovery/start', async (request, reply) => {
    const result = await activateRecoveryMode(request.userId);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: { reason?: string };
  }>('/api/burnout/recovery/end', async (request, reply) => {
    const reason = request.body?.reason || 'manual';
    const result = await exitRecoveryMode(request.userId, reason);
    return reply.status(200).send(result);
  });
}
