import { FastifyInstance } from 'fastify';
import { calculateStress, updateWorkPressure } from '../services/stress.js';

export async function stressRoutes(app: FastifyInstance) {
  app.get('/api/stress', async (request, reply) => {
    const result = await calculateStress(request.userId);
    return reply.status(200).send(result);
  });

  app.post<{
    Body: { level: number };
  }>('/api/stress/work-pressure', async (request, reply) => {
    const result = await updateWorkPressure(request.userId, request.body.level);
    return reply.status(200).send(result);
  });
}
