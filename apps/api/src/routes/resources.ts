import { FastifyInstance } from 'fastify';
import { getTopicResources } from '../services/resources.js';

export async function resourceRoutes(app: FastifyInstance) {
  app.get<{ Params: { topicId: string } }>('/api/topics/:topicId/resources', async (request) => {
    return getTopicResources(request.params.topicId);
  });
}
