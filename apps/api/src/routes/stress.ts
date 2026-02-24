import { FastifyInstance } from 'fastify';
import { calculateStress } from '../services/stress.js';

export async function stressRoutes(app: FastifyInstance) {
  app.get('/api/stress', async (request, reply) => {
    const result = await calculateStress(request.userId);
    return reply.status(200).send(result);
  });
}
