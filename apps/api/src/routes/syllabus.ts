import { FastifyInstance } from 'fastify';
import { getSyllabusTree, getUserProgress, updateTopicProgress } from '../services/syllabus.js';

export async function syllabusRoutes(app: FastifyInstance) {
  app.get('/api/syllabus', async (request, reply) => {
    const result = await getSyllabusTree();
    return reply.status(200).send(result);
  });

  app.get('/api/syllabus/progress', async (request, reply) => {
    const result = await getUserProgress(request.userId);
    return reply.status(200).send(result);
  });

  app.post<{
    Params: { topicId: string };
    Body: { status?: string; actual_hours_spent?: number; confidence_score?: number; notes?: string };
  }>('/api/syllabus/progress/:topicId', async (request, reply) => {
    const result = await updateTopicProgress(request.userId, request.params.topicId, request.body as any);
    return reply.status(200).send(result);
  });
}
