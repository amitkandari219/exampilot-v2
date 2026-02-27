import { FastifyInstance } from 'fastify';
import { runDailyMaintenance } from '../services/cron.js';

export async function cronRoutes(app: FastifyInstance) {
  // POST /api/cron/daily-maintenance — trigger daily maintenance batch job
  // Protected by a secret header in production (not auth middleware)
  app.post<{
    Headers: { 'x-cron-secret'?: string };
  }>('/api/cron/daily-maintenance', async (request, reply) => {
    const cronSecret = request.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && cronSecret !== expectedSecret) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const result = await runDailyMaintenance();
    return reply.status(200).send(result);
  });
}
