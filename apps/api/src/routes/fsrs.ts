import { FastifyInstance } from 'fastify';
import { recordReview, batchRecalculateConfidence, getRevisionsDue, getConfidenceOverview } from '../services/fsrs.js';

export async function fsrsRoutes(app: FastifyInstance) {
  app.post<{
    Params: { topicId: string };
    Body: { rating: number };
  }>('/api/fsrs/review/:topicId', async (request, reply) => {
    const { rating } = request.body;

    if (!rating || rating < 1 || rating > 4) {
      return reply.status(400).send({ error: 'Rating must be between 1 and 4' });
    }

    const result = await recordReview(request.userId, request.params.topicId, rating);
    return reply.status(200).send(result);
  });

  app.post('/api/fsrs/recalculate', async (request, reply) => {
    await batchRecalculateConfidence(request.userId);
    return reply.status(200).send({ success: true });
  });

  app.get<{
    Querystring: { date?: string };
  }>('/api/revisions', async (request, reply) => {
    const date = (request.query as any).date || new Date().toISOString().split('T')[0];
    const result = await getRevisionsDue(request.userId, date);
    return reply.status(200).send(result);
  });

  app.get('/api/confidence/overview', async (request, reply) => {
    const result = await getConfidenceOverview(request.userId);
    return reply.status(200).send(result);
  });
}
