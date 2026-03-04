import { FastifyInstance } from 'fastify';
import { createQuickLog, getQuickLogs } from '../services/quicklog.js';
import type { QuickLogPayload } from '../types/index.js';

export async function quicklogRoutes(app: FastifyInstance) {
  app.post('/api/quicklog', async (request, reply) => {
    const body = request.body as QuickLogPayload;
    const result = await createQuickLog(request.userId, body);
    return reply.status(201).send(result);
  });

  app.get('/api/quicklog', async (request, reply) => {
    const { date } = request.query as { date?: string };
    const result = await getQuickLogs(request.userId, date);
    return reply.status(200).send(result);
  });
}
