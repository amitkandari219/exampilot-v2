import { FastifyInstance } from 'fastify';
import { logCA, getCAStats, getCASubjectGaps } from '../services/currentAffairs.js';

export async function currentAffairsRoutes(app: FastifyInstance) {
  app.post('/api/ca/log', async (request, reply) => {
    const body = request.body as {
      hours_spent: number;
      completed: boolean;
      notes?: string;
      subject_ids?: string[];
      source?: 'personal' | 'workplace';
    };
    const result = await logCA(request.userId, body);
    return reply.status(200).send(result);
  });

  app.get('/api/ca/stats', async (request, reply) => {
    const { month } = request.query as { month?: string };
    const result = await getCAStats(request.userId, month);
    return reply.status(200).send(result);
  });

  app.get('/api/ca/subject-gaps', async (request, reply) => {
    const result = await getCASubjectGaps(request.userId);
    return reply.status(200).send(result);
  });
}
