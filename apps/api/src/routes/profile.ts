import { FastifyInstance } from 'fastify';
import { getProfile, updateProfile } from '../services/profile.js';

export async function profileRoutes(app: FastifyInstance) {
  app.get('/api/profile', async (request, reply) => {
    const result = await getProfile(request.userId);
    return reply.status(200).send(result);
  });

  app.patch('/api/profile', async (request, reply) => {
    const body = request.body as { name?: string; exam_date?: string; avatar_url?: string };
    const result = await updateProfile(request.userId, body);
    return reply.status(200).send(result);
  });
}
