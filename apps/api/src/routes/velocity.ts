import { FastifyInstance } from 'fastify';
import { calculateVelocity, getVelocityDashboard, getVelocityHistory, getBufferDetails } from '../services/velocity.js';

export async function velocityRoutes(app: FastifyInstance) {
  app.get('/api/velocity', async (request, reply) => {
    const result = await getVelocityDashboard(request.userId);
    return reply.status(200).send(result);
  });

  app.get<{
    Querystring: { days?: string };
  }>('/api/velocity/history', async (request, reply) => {
    const days = parseInt(request.query.days || '30', 10);
    const result = await getVelocityHistory(request.userId, days);
    return reply.status(200).send(result);
  });

  app.post('/api/velocity/recalculate', async (request, reply) => {
    const result = await calculateVelocity(request.userId);
    return reply.status(200).send(result);
  });

  app.get('/api/buffer', async (request, reply) => {
    const result = await getBufferDetails(request.userId);
    return reply.status(200).send(result);
  });
}
