import { FastifyInstance } from 'fastify';
import { getPyqStats, getTopicPyqDetail } from '../services/pyq.js';

export async function pyqRoutes(app: FastifyInstance) {
  app.get('/api/pyq-stats', async (request, reply) => {
    const result = await getPyqStats(request.userId);
    return reply.status(200).send(result);
  });

  app.get<{
    Params: { topicId: string };
  }>('/api/pyq/:topicId', async (request, reply) => {
    const result = await getTopicPyqDetail(request.params.topicId);
    return reply.status(200).send(result);
  });
}
