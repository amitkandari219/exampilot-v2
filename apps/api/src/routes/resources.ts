import { FastifyInstance } from 'fastify';
import { getResources, getResourcesForTopic, getReadingProgress, updateReadingProgress } from '../services/resources.js';

export async function resourceRoutes(app: FastifyInstance) {
  app.get('/api/resources', async (request, reply) => {
    const result = await getResources();
    return reply.status(200).send(result);
  });

  app.get<{
    Params: { topicId: string };
  }>('/api/resources/topic/:topicId', async (request, reply) => {
    const result = await getResourcesForTopic(request.params.topicId);
    return reply.status(200).send(result);
  });

  app.get('/api/reading-progress', async (request, reply) => {
    const result = await getReadingProgress(request.userId);
    return reply.status(200).send(result);
  });

  app.post<{
    Params: { resourceId: string };
    Body: { pages_read?: number; total_pages?: number; notes?: string };
  }>('/api/reading-progress/:resourceId', async (request, reply) => {
    const result = await updateReadingProgress(request.userId, request.params.resourceId, request.body);
    return reply.status(200).send(result);
  });
}
